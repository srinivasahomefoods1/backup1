-- 1. profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  phone text,
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','staff')
  ) OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE POLICY "own profile readable" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());

CREATE TRIGGER t_profiles BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- prevent self role escalation
CREATE OR REPLACE FUNCTION public.guard_profile_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER t_profiles_role BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.guard_profile_role();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', 'customer')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.profiles (id, email, role)
SELECT u.id, u.email,
  CASE WHEN EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = u.id AND r.role IN ('admin','staff'))
       THEN 'admin' ELSE 'customer' END
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

-- 2. audit logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read audit" ON public.audit_logs FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "admins write audit" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (public.is_admin());

-- 3. payments hardening
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS paid_at timestamptz;
CREATE UNIQUE INDEX IF NOT EXISTS payments_utr_unique
  ON public.payments (lower(btrim(upi_transaction_id)))
  WHERE upi_transaction_id IS NOT NULL AND btrim(upi_transaction_id) <> '';
CREATE INDEX IF NOT EXISTS payments_status_idx ON public.payments (status);
CREATE INDEX IF NOT EXISTS payments_order_idx ON public.payments (order_id);
CREATE INDEX IF NOT EXISTS orders_number_idx ON public.orders (order_number);
CREATE INDEX IF NOT EXISTS orders_phone_idx ON public.orders (customer_phone);
CREATE INDEX IF NOT EXISTS orders_created_idx ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders (status);

-- 4. atomic admin payment verification
CREATE OR REPLACE FUNCTION public.verify_payment(_payment_id uuid, _approve boolean, _reason text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_old jsonb;
  v_order uuid;
  v_new jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not authorised';
  END IF;

  SELECT to_jsonb(p), p.order_id INTO v_old, v_order FROM public.payments p WHERE p.id = _payment_id;
  IF v_order IS NULL THEN RAISE EXCEPTION 'Payment not found'; END IF;

  UPDATE public.payments SET
    status = CASE WHEN _approve THEN 'PAID' ELSE 'REJECTED' END,
    paid_at = CASE WHEN _approve THEN now() ELSE NULL END,
    verified_by = auth.uid(),
    verified_at = now(),
    rejection_reason = CASE WHEN _approve THEN NULL ELSE _reason END
  WHERE id = _payment_id
  RETURNING to_jsonb(payments.*) INTO v_new;

  UPDATE public.orders SET
    payment_status = CASE WHEN _approve THEN 'PAID' ELSE 'REJECTED' END,
    status = CASE WHEN _approve AND status IN ('NEW','PAYMENT_PENDING','PAYMENT_VERIFICATION') THEN 'CONFIRMED' ELSE status END
  WHERE id = v_order;

  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, old_value, new_value)
  VALUES (auth.uid(), CASE WHEN _approve THEN 'payment.marked_paid' ELSE 'payment.rejected' END,
          'payment', _payment_id, v_old, v_new);

  RETURN v_new;
END; $$;
REVOKE ALL ON FUNCTION public.verify_payment(uuid, boolean, text) FROM public;
GRANT EXECUTE ON FUNCTION public.verify_payment(uuid, boolean, text) TO authenticated;

-- 5. settings the admin can edit
INSERT INTO public.app_settings (key, value, is_public) VALUES
  ('business_name', 'Srinivasa Home Foods', true),
  ('business_phone', '', true),
  ('business_email', '', true),
  ('business_address', '', true),
  ('whatsapp_number', '', true),
  ('upi_id', '', true),
  ('upi_display_name', 'Srinivasa Home Foods', true),
  ('upi_qr_url', '', true),
  ('payment_instructions', 'Pay the exact amount using any UPI app, then enter your UTR / transaction reference below.', true),
  ('upi_enabled', 'true', true),
  ('min_order_amount', '0', true),
  ('max_order_amount', '', true)
ON CONFLICT (key) DO NOTHING;
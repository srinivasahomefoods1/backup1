
CREATE TYPE public.app_role AS ENUM ('admin','staff','user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin','staff')
  );
$$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE,
  name text NOT NULL,
  description text,
  image_url text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  slug text UNIQUE,
  name text NOT NULL,
  description text,
  image_url text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX products_category_idx ON public.products(category_id);

CREATE TABLE public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_name text NOT NULL,
  weight text,
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  stock_quantity integer NOT NULL DEFAULT 0,
  is_available boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX product_variants_product_idx ON public.product_variants(product_id);

GRANT SELECT ON public.categories, public.products, public.product_variants TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories, public.products, public.product_variants TO authenticated;
GRANT ALL ON public.categories, public.products, public.product_variants TO service_role;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read categories" ON public.categories FOR SELECT TO anon, authenticated USING (is_active OR public.is_admin());
CREATE POLICY "admins manage categories" ON public.categories FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "public read products" ON public.products FOR SELECT TO anon, authenticated USING (is_active OR public.is_admin());
CREATE POLICY "admins manage products" ON public.products FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "public read variants" ON public.product_variants FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage variants" ON public.product_variants FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  whatsapp_number text UNIQUE,
  name text,
  email text,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  pincode text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage customers" ON public.customers FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','converted','abandoned')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX carts_customer_idx ON public.carts(customer_id, status);

CREATE TABLE public.cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(10,2) NOT NULL,
  total_price numeric(10,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX cart_items_cart_idx ON public.cart_items(cart_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.carts, public.cart_items TO authenticated;
GRANT ALL ON public.carts, public.cart_items TO service_role;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage carts" ON public.carts FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admins manage cart items" ON public.cart_items FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  source text NOT NULL DEFAULT 'website' CHECK (source IN ('website','whatsapp')),
  status text NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW','PAYMENT_PENDING','PAYMENT_VERIFICATION','CONFIRMED','PREPARING','READY','OUT_FOR_DELIVERY','DELIVERED','CANCELLED')),
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  delivery_charge numeric(10,2) NOT NULL DEFAULT 0,
  discount numeric(10,2) NOT NULL DEFAULT 0,
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  customer_name text,
  customer_phone text,
  customer_email text,
  delivery_address text,
  city text,
  state text,
  pincode text,
  notes text,
  payment_status text NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING','SUBMITTED','PAID','REJECTED','REFUNDED')),
  payment_method text CHECK (payment_method IN ('UPI','COD')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX orders_created_idx ON public.orders(created_at DESC);
CREATE INDEX orders_source_idx ON public.orders(source, status);

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  variant_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(10,2) NOT NULL,
  total_price numeric(10,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX order_items_order_idx ON public.order_items(order_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.orders, public.order_items TO authenticated;
GRANT ALL ON public.orders, public.order_items TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage orders" ON public.orders FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admins manage order items" ON public.order_items FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('UPI','COD')),
  amount numeric(10,2) NOT NULL,
  upi_id text,
  upi_transaction_id text,
  payment_screenshot_url text,
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','SUBMITTED','PAID','REJECTED','REFUNDED')),
  gateway_provider text,
  gateway_payment_id text,
  gateway_payload jsonb,
  verified_by uuid,
  verified_at timestamptz,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX payments_order_idx ON public.payments(order_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage payments" ON public.payments FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.whatsapp_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.customers(id) ON DELETE CASCADE,
  whatsapp_number text NOT NULL,
  current_state text NOT NULL DEFAULT 'WELCOME',
  current_category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  current_product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  current_variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  current_order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX whatsapp_sessions_number_idx ON public.whatsapp_sessions(whatsapp_number);

CREATE TABLE public.whatsapp_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  whatsapp_number text NOT NULL,
  session_id uuid REFERENCES public.whatsapp_sessions(id) ON DELETE SET NULL,
  direction text NOT NULL CHECK (direction IN ('incoming','outgoing')),
  message_type text NOT NULL DEFAULT 'text',
  message_text text,
  media_url text,
  whatsapp_message_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX whatsapp_messages_number_idx ON public.whatsapp_messages(whatsapp_number, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.whatsapp_sessions, public.whatsapp_messages TO authenticated;
GRANT ALL ON public.whatsapp_sessions, public.whatsapp_messages TO service_role;
ALTER TABLE public.whatsapp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage wa sessions" ON public.whatsapp_sessions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admins manage wa messages" ON public.whatsapp_messages FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.order_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status text NOT NULL,
  channel text NOT NULL DEFAULT 'whatsapp',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (order_id, status, channel)
);
GRANT SELECT, INSERT ON public.order_notifications TO authenticated;
GRANT ALL ON public.order_notifications TO service_role;
ALTER TABLE public.order_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read notifications" ON public.order_notifications FOR SELECT TO authenticated USING (public.is_admin());

CREATE TABLE public.app_settings (
  key text PRIMARY KEY,
  value text,
  is_public boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.app_settings TO authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public settings readable" ON public.app_settings FOR SELECT TO anon, authenticated USING (is_public OR public.is_admin());
CREATE POLICY "admins manage settings" ON public.app_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

INSERT INTO public.app_settings (key, value, is_public) VALUES
  ('business_name','Srinivasa Home Foods', true),
  ('business_upi_id','srinivasahomefoods@upi', true),
  ('upi_qr_url','', true),
  ('support_phone','+91 63036 49148', true),
  ('delivery_charge','50', true),
  ('payment_instructions','Pay using the UPI ID or QR above, then send the payment screenshot and your UPI transaction reference here.', true),
  ('whatsapp_phone_number_id','', false),
  ('whatsapp_business_account_id','', false),
  ('whatsapp_api_version','v21.0', false);

CREATE TRIGGER t_categories BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_products BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_variants BEFORE UPDATE ON public.product_variants FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_customers BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_carts BEFORE UPDATE ON public.carts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_cart_items BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_orders BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_payments BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_wa_sessions BEFORE UPDATE ON public.whatsapp_sessions FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE SEQUENCE public.order_number_seq START 1025;
CREATE OR REPLACE FUNCTION public.next_order_number()
RETURNS text LANGUAGE sql VOLATILE SET search_path = public AS $$
  SELECT 'SHF' || nextval('public.order_number_seq')::text;
$$;
GRANT EXECUTE ON FUNCTION public.next_order_number() TO authenticated, service_role;

CREATE POLICY "admins read payment screenshots" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'payment-screenshots' AND public.is_admin());

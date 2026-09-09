import { createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Adds a role check on top of the Supabase session check: the caller must be
 * an admin (profiles.role = 'admin' or a user_roles admin/staff row).
 * Never trust a role read from the browser — this runs on the server.
 */
export const requireAdmin = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ next, context }) => {
    const { data, error } = await context.supabase.rpc("is_admin");
    if (error || data !== true) {
      throw new Error("Forbidden: admin access required");
    }
    return next();
  });

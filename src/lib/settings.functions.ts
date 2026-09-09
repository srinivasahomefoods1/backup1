import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";

export type SettingsMap = Record<string, string>;

const QR_BUCKET = "payment-assets";

/** Signed URL for a stored QR image; pass-through for absolute URLs. */
async function resolveQr(
  admin: { storage: { from: (b: string) => { createSignedUrl: (p: string, n: number) => Promise<{ data: { signedUrl: string } | null }> } } },
  value: string | undefined,
) {
  if (!value) return "";
  if (/^https?:\/\//.test(value)) return value;
  const { data } = await admin.storage.from(QR_BUCKET).createSignedUrl(value, 60 * 60);
  return data?.signedUrl ?? "";
}

/** Public settings the checkout needs (business + UPI details). */
export const getCheckoutSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("app_settings")
    .select("key, value")
    .eq("is_public", true);
  if (error) throw new Error(error.message);
  const map: SettingsMap = {};
  for (const row of data ?? []) map[row.key] = row.value ?? "";
  map["upi_qr_signed_url"] = await resolveQr(supabaseAdmin, map["upi_qr_url"]);
  return map;
});

export const getAllSettings = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("app_settings").select("key, value");
    if (error) throw new Error(error.message);
    const map: SettingsMap = {};
    for (const row of data ?? []) map[row.key] = row.value ?? "";
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    map["upi_qr_signed_url"] = await resolveQr(supabaseAdmin, map["upi_qr_url"]);
    return map;
  });

export const updateSettings = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: unknown) =>
    z.object({ values: z.record(z.string(), z.string()) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const entries = Object.entries(data.values);
    const { data: before } = await context.supabase
      .from("app_settings")
      .select("key, value")
      .in(
        "key",
        entries.map(([k]) => k),
      );
    for (const [key, value] of entries) {
      const { error } = await context.supabase
        .from("app_settings")
        .upsert({ key, value, is_public: true }, { onConflict: "key" });
      if (error) throw new Error(error.message);
    }
    await context.supabase.from("audit_logs").insert({
      user_id: context.userId,
      action: "settings.updated",
      entity_type: "app_settings",
      old_value: (before ?? []) as never,
      new_value: data.values as never,
    });
    return { ok: true };
  });

/** Upload / replace the UPI QR image (stored privately, served signed). */
export const uploadUpiQr = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((input: unknown) =>
    z
      .object({
        fileName: z.string().min(1).max(200),
        contentType: z.string().regex(/^image\/(png|jpeg|jpg|webp)$/),
        base64: z.string().min(10).max(8_000_000),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const bytes = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));
    if (bytes.byteLength > 5 * 1024 * 1024) throw new Error("Image must be under 5 MB");
    const path = `upi-qr/${Date.now()}-${data.fileName.replace(/[^\w.-]/g, "_")}`;
    const { error } = await supabaseAdmin.storage
      .from(QR_BUCKET)
      .upload(path, bytes, { contentType: data.contentType, upsert: true });
    if (error) throw new Error(error.message);
    const { error: setErr } = await supabaseAdmin
      .from("app_settings")
      .upsert({ key: "upi_qr_url", value: path, is_public: true }, { onConflict: "key" });
    if (setErr) throw new Error(setErr.message);
    await context.supabase.from("audit_logs").insert({
      user_id: context.userId,
      action: "settings.upi_qr_uploaded",
      entity_type: "app_settings",
      new_value: { upi_qr_url: path } as never,
    });
    const { data: signed } = await supabaseAdmin.storage
      .from(QR_BUCKET)
      .createSignedUrl(path, 60 * 60);
    return { path, url: signed?.signedUrl ?? "" };
  });

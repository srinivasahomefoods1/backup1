import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ORDER_STATUSES = [
  "NEW",
  "CONFIRMED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const listOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("orders")
      .select(
        "id, order_number, source, status, payment_status, payment_method, total_amount, customer_name, customer_phone, delivery_address, notes, created_at, order_items(id, product_name, variant_name, quantity, unit_price, total_price), payments(id, payment_method, amount, upi_transaction_id, status, payment_screenshot_url, created_at)",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ orderId: z.string().uuid(), status: z.enum(ORDER_STATUSES) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.orderId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const reviewPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        paymentId: z.string().uuid(),
        orderId: z.string().uuid(),
        approve: z.boolean(),
        reason: z.string().max(300).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("payments")
      .update({
        status: data.approve ? "VERIFIED" : "REJECTED",
        verified_by: context.userId,
        verified_at: new Date().toISOString(),
        rejection_reason: data.approve ? null : (data.reason ?? "Payment could not be verified"),
      })
      .eq("id", data.paymentId);
    if (error) throw new Error(error.message);

    const { error: orderErr } = await context.supabase
      .from("orders")
      .update({
        payment_status: data.approve ? "PAID" : "FAILED",
        ...(data.approve ? { status: "CONFIRMED" } : {}),
      })
      .eq("id", data.orderId);
    if (orderErr) throw new Error(orderErr.message);
    return { ok: true };
  });

export const getAdminSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("orders")
      .select("status, payment_status, total_amount, source");
    if (error) throw new Error(error.message);
    const rows = data ?? [];
    return {
      total: rows.length,
      revenue: rows
        .filter((r) => r.payment_status === "PAID")
        .reduce((s, r) => s + Number(r.total_amount), 0),
      pendingPayments: rows.filter((r) => r.payment_status === "AWAITING_VERIFICATION").length,
      newOrders: rows.filter((r) => r.status === "NEW").length,
      whatsappOrders: rows.filter((r) => r.source === "whatsapp").length,
    };
  });

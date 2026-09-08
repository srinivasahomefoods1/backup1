import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const lineSchema = z.object({
  slug: z.string().min(1).max(80),
  size: z.string().min(1).max(20),
  qty: z.number().int().min(1).max(50),
});

const orderSchema = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().min(6).max(20),
  email: z.string().email().max(160).optional().or(z.literal("")),
  address: z.string().min(4).max(600),
  notes: z.string().max(1000).optional().or(z.literal("")),
  paymentMethod: z.enum(["phonepe", "gpay", "upi", "cod"]),
  paymentReference: z.string().max(60).optional().or(z.literal("")),
  items: z.array(lineSchema).min(1).max(50),
});

export type PlaceOrderInput = z.infer<typeof orderSchema>;

/**
 * Saves a website order into the shared database (same tables the WhatsApp
 * ordering flow and the admin dashboard use). Prices are always recomputed
 * server-side from product_variants — client totals are never trusted.
 */
export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => orderSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const slugs = [...new Set(data.items.map((i) => i.slug))];
    const { data: rows, error: prodErr } = await supabaseAdmin
      .from("products")
      .select("id, name, slug, product_variants(id, variant_name, price)")
      .in("slug", slugs);
    if (prodErr) throw new Error(prodErr.message);

    const items = data.items.map((line) => {
      const product = rows?.find((p) => p.slug === line.slug);
      const variant = product?.product_variants?.find((v) => v.variant_name === line.size);
      if (!product || !variant) throw new Error(`Item unavailable: ${line.slug} ${line.size}`);
      const unit = Number(variant.price);
      return {
        product_id: product.id,
        variant_id: variant.id,
        product_name: product.name,
        variant_name: variant.variant_name,
        quantity: line.qty,
        unit_price: unit,
        total_price: unit * line.qty,
      };
    });

    const subtotal = items.reduce((s, i) => s + i.total_price, 0);

    // Reuse an existing customer record for this phone number when we have one.
    const phone = data.phone.replace(/\D/g, "").slice(-10);
    const { data: existing } = await supabaseAdmin
      .from("customers")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();

    let customerId = existing?.id ?? null;
    if (!customerId) {
      const { data: created, error: custErr } = await supabaseAdmin
        .from("customers")
        .insert({
          name: data.name,
          phone,
          email: data.email || null,
          address_line1: data.address,
        })
        .select("id")
        .single();
      if (custErr) throw new Error(custErr.message);
      customerId = created.id;
    }

    const { data: numberRow, error: numErr } = await supabaseAdmin.rpc("next_order_number");
    if (numErr) throw new Error(numErr.message);
    const orderNumber = String(numberRow);

    const isCod = data.paymentMethod === "cod";
    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: customerId,
        source: "website",
        status: "NEW",
        subtotal,
        total_amount: subtotal,
        customer_name: data.name,
        customer_phone: phone,
        customer_email: data.email || null,
        delivery_address: data.address,
        notes: data.notes || null,
        payment_method: isCod ? "COD" : "UPI",
        payment_status: isCod ? "PENDING" : "AWAITING_VERIFICATION",
      })
      .select("id, order_number")
      .single();
    if (orderErr) throw new Error(orderErr.message);

    const { error: itemsErr } = await supabaseAdmin
      .from("order_items")
      .insert(items.map((i) => ({ ...i, order_id: order.id })));
    if (itemsErr) throw new Error(itemsErr.message);

    if (!isCod) {
      await supabaseAdmin.from("payments").insert({
        order_id: order.id,
        customer_id: customerId,
        payment_method: data.paymentMethod,
        amount: subtotal,
        upi_transaction_id: data.paymentReference || null,
        status: "PENDING",
      });
    }

    return { orderNumber: order.order_number, total: subtotal };
  });

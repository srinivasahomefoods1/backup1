import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import {
  getAdminSummary,
  listOrders,
  reviewPayment,
  updateOrderStatus,
  type OrderStatus,
} from "@/lib/admin.functions";
import { inr } from "@/lib/cart";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Order Dashboard | Srinivasa Home Foods" },
      {
        name: "description",
        content:
          "Track website and WhatsApp orders, verify UPI payments and update delivery status for Srinivasa Home Foods.",
      },
      { property: "og:title", content: "Order Dashboard | Srinivasa Home Foods" },
      {
        property: "og:description",
        content: "Internal dashboard for orders, payments and WhatsApp enquiries.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

const STATUSES: OrderStatus[] = [
  "NEW",
  "CONFIRMED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

function AdminPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetchOrders = useServerFn(listOrders);
  const fetchSummary = useServerFn(getAdminSummary);
  const setStatus = useServerFn(updateOrderStatus);
  const decidePayment = useServerFn(reviewPayment);
  const [busy, setBusy] = useState<string | null>(null);

  const orders = useQuery({ queryKey: ["admin-orders"], queryFn: () => fetchOrders() });
  const summary = useQuery({ queryKey: ["admin-summary"], queryFn: () => fetchSummary() });

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["admin-orders"] });
    void qc.invalidateQueries({ queryKey: ["admin-summary"] });
  };

  if (orders.error) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Dashboard unavailable</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your account is signed in but does not have staff access yet. Ask an administrator to add
          you as staff.
        </p>
      </main>
    );
  }

  const cards = [
    { label: "Orders", value: summary.data?.total ?? 0 },
    { label: "New", value: summary.data?.newOrders ?? 0 },
    { label: "Payments to verify", value: summary.data?.pendingPayments ?? 0 },
    { label: "From WhatsApp", value: summary.data?.whatsappOrders ?? 0 },
    { label: "Paid revenue", value: inr(summary.data?.revenue ?? 0) },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl">Order dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Website and WhatsApp orders in one place.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refresh}>
            Refresh
          </Button>
          <Button
            variant="ghost"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/" });
            }}
          >
            Sign out
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-sm border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">{c.label}</p>
            <p className="mt-2 font-display text-2xl">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 space-y-4">
        {orders.isLoading && <p className="text-sm text-muted-foreground">Loading orders…</p>}
        {orders.data?.length === 0 && (
          <p className="text-sm text-muted-foreground">No orders yet.</p>
        )}
        {orders.data?.map((o) => {
          const payment = o.payments?.[0];
          return (
            <article key={o.id} className="rounded-sm border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl">
                    {o.order_number}{" "}
                    <span className="text-sm text-muted-foreground">
                      · {new Date(o.created_at).toLocaleString("en-IN")}
                    </span>
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {o.customer_name} · {o.customer_phone}
                  </p>
                  <p className="text-xs text-muted-foreground">{o.delivery_address}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{o.source}</Badge>
                  <Badge variant={o.payment_status === "PAID" ? "default" : "outline"}>
                    {o.payment_status}
                  </Badge>
                  <Select
                    value={o.status}
                    onValueChange={async (v) => {
                      setBusy(o.id);
                      try {
                        await setStatus({ data: { orderId: o.id, status: v as OrderStatus } });
                        toast.success(`${o.order_number} → ${v}`);
                        refresh();
                      } catch {
                        toast.error("Could not update status");
                      } finally {
                        setBusy(null);
                      }
                    }}
                    disabled={busy === o.id}
                  >
                    <SelectTrigger className="w-[190px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s.replaceAll("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
                <ul className="space-y-1 text-sm">
                  {o.order_items?.map((i) => (
                    <li key={i.id} className="flex justify-between gap-3">
                      <span>
                        {i.product_name}{" "}
                        <span className="text-muted-foreground">
                          · {i.variant_name} × {i.quantity}
                        </span>
                      </span>
                      <span className="tabular-nums">{inr(Number(i.total_price))}</span>
                    </li>
                  ))}
                  <li className="flex justify-between border-t border-border pt-2 font-medium">
                    <span>Total</span>
                    <span className="tabular-nums">{inr(Number(o.total_amount))}</span>
                  </li>
                </ul>

                <div className="rounded-sm bg-secondary/30 p-4 text-sm">
                  <p className="font-medium">Payment</p>
                  <p className="text-muted-foreground">
                    {o.payment_method ?? "—"}
                    {payment?.upi_transaction_id ? ` · ref ${payment.upi_transaction_id}` : ""}
                  </p>
                  {payment && payment.status === "PENDING" && (
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        onClick={async () => {
                          await decidePayment({
                            data: { paymentId: payment.id, orderId: o.id, approve: true },
                          });
                          toast.success("Payment verified");
                          refresh();
                        }}
                      >
                        Verify
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          await decidePayment({
                            data: { paymentId: payment.id, orderId: o.id, approve: false },
                          });
                          toast.message("Payment rejected");
                          refresh();
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                  {payment && payment.status !== "PENDING" && (
                    <p className="mt-2 text-xs uppercase tracking-wide">{payment.status}</p>
                  )}
                  {o.notes && <p className="mt-3 text-xs text-muted-foreground">Note: {o.notes}</p>}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}

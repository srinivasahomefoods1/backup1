import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, Loader2, ShoppingBag, Smartphone, Wallet } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { CONTACT, UPI, products } from "@/data/products";
import { inr, useCart } from "@/lib/cart";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout | Srinivasa Home Foods" },
      {
        name: "description",
        content:
          "Confirm your Srinivasa Home Foods order — share your delivery details and pay with PhonePe, Google Pay, any UPI app or cash on delivery.",
      },
      { property: "og:title", content: "Checkout | Srinivasa Home Foods" },
      {
        property: "og:description",
        content: "Place your order for homemade podulu, snacks and sweets and pay via UPI or cash.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Checkout,
});

type PayMethod = "phonepe" | "gpay" | "upi" | "cod";
type PayStatus = "idle" | "awaiting" | "verifying" | "failed";

const METHODS: { id: PayMethod; label: string; hint: string }[] = [
  { id: "phonepe", label: "PhonePe", hint: "Pay instantly via UPI" },
  { id: "gpay", label: "Google Pay", hint: "Pay instantly via UPI" },
  { id: "upi", label: "Any UPI app", hint: "Paytm, BHIM, bank apps" },
  { id: "cod", label: "Cash on delivery", hint: "Pay when it arrives" },
];

interface Placed {
  ref: string;
  name: string;
  total: number;
  method: PayMethod;
  txn: string;
  receipt: ReceiptData;
}


function upiLink(method: PayMethod, amount: number, note: string) {
  const params = new URLSearchParams({
    pa: UPI.id,
    pn: UPI.payeeName,
    am: amount.toFixed(2),
    cu: "INR",
    tn: note,
  }).toString();
  if (method === "phonepe") return `phonepe://pay?${params}`;
  if (method === "gpay") return `tez://upi/pay?${params}`;
  return `upi://pay?${params}`;
}

function Checkout() {
  const { lines, total, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", address: "", notes: "" });
  const [method, setMethod] = useState<PayMethod>("phonepe");
  const [status, setStatus] = useState<PayStatus>("idle");
  const [txn, setTxn] = useState("");
  const [placed, setPlaced] = useState<Placed | null>(null);

  const detailed = lines.flatMap((l) => {
    const prod = products.find((p) => p.id === l.id);
    return prod ? [{ ...l, prod }] : [];
  });

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const finalise = (ref: string, txnRef: string) => {
    const body = detailed
      .map((l) => `• ${l.prod.name} — ${l.size} x${l.qty} = ${inr(l.prod.prices[l.size] * l.qty)}`)
      .join("\n");
    const methodLabel = METHODS.find((m) => m.id === method)!.label;
    const text = `New order ${ref}\n\n${body}\n\nTotal: ${inr(total)}\nPayment: ${methodLabel}${
      txnRef ? ` (UPI ref ${txnRef})` : " — to be collected"
    }\n\nName: ${form.name}\nPhone: ${form.phone}\nAddress: ${form.address}${
      form.notes ? `\nNotes: ${form.notes}` : ""
    }`;
    window.open(
      `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener",
    );
    setPlaced({ ref, name: form.name, total, method, txn: txnRef });
    clear();
    toast.success("Order confirmed — we'll be in touch shortly");
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, "").slice(-10))) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    const ref = `SHF-${Date.now().toString(36).toUpperCase().slice(-6)}`;

    if (method === "cod") {
      finalise(ref, "");
      return;
    }

    // UPI: open the payment app, then wait for the customer to confirm status.
    setStatus("awaiting");
    const link = upiLink(method, total, `Order ${ref}`);
    window.location.href = link;
    (window as unknown as { __shfRef?: string }).__shfRef = ref;
  };

  const confirmPaid = () => {
    if (txn.trim().length < 6) {
      toast.error("Enter the UPI transaction / UTR reference from your payment app");
      return;
    }
    setStatus("verifying");
    const ref =
      (window as unknown as { __shfRef?: string }).__shfRef ??
      `SHF-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    window.setTimeout(() => finalise(ref, txn.trim()), 900);
  };

  if (placed) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-20">
        <Reveal>
          <div className="rounded-sm border border-border bg-card p-8 text-center">
            <CheckCircle2 className="mx-auto size-14 text-primary" />
            <h1 className="mt-4 font-display text-3xl">Thank you, {placed.name}!</h1>
            <p className="mt-2 text-muted-foreground">
              Order <span className="font-medium text-foreground">{placed.ref}</span> for{" "}
              <span className="font-medium text-foreground">{inr(placed.total)}</span> is confirmed.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {placed.method === "cod"
                ? "Payment: cash on delivery — please keep the exact amount ready."
                : `Payment: ${METHODS.find((m) => m.id === placed.method)!.label} · reference ${placed.txn} (we'll verify and confirm on WhatsApp).`}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link to="/menu">Continue shopping</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/contact">Contact us</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </main>
    );
  }

  if (detailed.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-24 text-center">
        <ShoppingBag className="mx-auto size-12 text-muted-foreground" />
        <h1 className="mt-4 font-display text-3xl">Your basket is empty</h1>
        <p className="mt-2 text-muted-foreground">Add a few favourites and come back here.</p>
        <Button asChild className="mt-6">
          <Link to="/menu">Browse the menu</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <Reveal>
        <h1 className="font-display text-4xl">Checkout</h1>
        <p className="mt-2 text-muted-foreground">
          Tell us where to deliver and choose how you'd like to pay.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <form onSubmit={submit} className="space-y-5 rounded-sm border border-border bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full name *</Label>
            <Input
              id="name"
              required
              value={form.name}
              onChange={(e) => set("name")(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone number *</Label>
            <Input
              id="phone"
              required
              inputMode="tel"
              value={form.phone}
              onChange={(e) => set("phone")(e.target.value)}
              placeholder="10-digit mobile number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Delivery address *</Label>
            <Textarea
              id="address"
              required
              rows={4}
              value={form.address}
              onChange={(e) => set("address")(e.target.value)}
              placeholder="House / street, area, city, pincode"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Order notes (optional)</Label>
            <Textarea
              id="notes"
              rows={3}
              value={form.notes}
              onChange={(e) => set("notes")(e.target.value)}
              placeholder="Spice level, gift packing, delivery date…"
            />
          </div>

          <Separator />

          <fieldset className="space-y-3">
            <legend className="font-display text-xl">Payment method</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {METHODS.map((m) => {
                const active = method === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setMethod(m.id);
                      setStatus("idle");
                    }}
                    className={`flex items-start gap-3 rounded-sm border p-3 text-left transition-colors ${
                      active
                        ? "border-gold bg-gold/10"
                        : "border-border bg-background hover:border-gold/50"
                    }`}
                    aria-pressed={active}
                  >
                    {m.id === "cod" ? (
                      <Wallet className="mt-0.5 size-5 text-primary" />
                    ) : (
                      <Smartphone className="mt-0.5 size-5 text-primary" />
                    )}
                    <span>
                      <span className="block text-sm font-medium">{m.label}</span>
                      <span className="block text-xs text-muted-foreground">{m.hint}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            {method !== "cod" && (
              <p className="text-xs text-muted-foreground">
                You'll pay {inr(total)} to <span className="font-medium">{UPI.id}</span>. On desktop,
                open your UPI app and pay to this ID, then enter the reference below.
              </p>
            )}
          </fieldset>

          {status === "idle" && (
            <Button type="submit" size="lg" className="w-full">
              {method === "cod" ? `Place order · ${inr(total)}` : `Pay ${inr(total)} & place order`}
            </Button>
          )}

          {status !== "idle" && method !== "cod" && (
            <div className="space-y-3 rounded-sm border border-gold/40 bg-gold/5 p-4">
              <div className="flex items-center gap-2 text-sm">
                {status === "verifying" ? (
                  <Loader2 className="size-4 animate-spin text-primary" />
                ) : (
                  <AlertCircle className="size-4 text-primary" />
                )}
                <span>
                  {status === "verifying"
                    ? "Verifying your payment…"
                    : status === "failed"
                      ? "Payment not completed. You can retry or switch to cash on delivery."
                      : "Waiting for payment confirmation."}
                </span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="txn">UPI transaction / UTR reference</Label>
                <Input
                  id="txn"
                  value={txn}
                  onChange={(e) => setTxn(e.target.value)}
                  placeholder="e.g. 4321987654321"
                  disabled={status === "verifying"}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={confirmPaid} disabled={status === "verifying"}>
                  I've paid — confirm order
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={status === "verifying"}
                  onClick={() => {
                    window.location.href = upiLink(method, total, "Srinivasa Home Foods order");
                  }}
                >
                  Reopen payment app
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={status === "verifying"}
                  onClick={() => {
                    setStatus("failed");
                    setMethod("cod");
                    toast.message("Switched to cash on delivery");
                  }}
                >
                  Payment failed
                </Button>
              </div>
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground">
            UPI payments are verified manually against your reference before we start cooking.
          </p>
        </form>

        <aside className="h-fit rounded-sm border border-border bg-secondary/30 p-6">
          <h2 className="font-display text-2xl">Order summary</h2>
          <div className="mt-4 space-y-3">
            {detailed.map((l) => (
              <div key={`${l.id}-${l.size}`} className="flex justify-between gap-3 text-sm">
                <span>
                  {l.prod.name}
                  <span className="text-muted-foreground">
                    {" "}
                    · {l.size} × {l.qty}
                  </span>
                </span>
                <span className="tabular-nums">{inr(l.prod.prices[l.size] * l.qty)}</span>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-display text-2xl">{inr(total)}</span>
          </div>
          <Button
            variant="ghost"
            className="mt-4 w-full"
            type="button"
            onClick={() => navigate({ to: "/menu" })}
          >
            Add more items
          </Button>
        </aside>
      </div>
    </main>
  );
}

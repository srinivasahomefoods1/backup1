import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { CONTACT, products } from "@/data/products";
import { inr, useCart } from "@/lib/cart";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout | Srinivasa Home Foods" },
      {
        name: "description",
        content:
          "Confirm your Srinivasa Home Foods order — share your name, delivery address and phone number and we'll confirm on WhatsApp.",
      },
      { property: "og:title", content: "Checkout | Srinivasa Home Foods" },
      {
        property: "og:description",
        content: "Place your order for homemade podulu, snacks and sweets in a few simple steps.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Checkout,
});

interface Placed {
  ref: string;
  name: string;
  total: number;
}

function Checkout() {
  const { lines, total, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", phone: "", address: "", notes: "" });
  const [sending, setSending] = useState(false);
  const [placed, setPlaced] = useState<Placed | null>(null);

  const detailed = lines.flatMap((l) => {
    const prod = products.find((p) => p.id === l.id);
    return prod ? [{ ...l, prod }] : [];
  });

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\D/g, "").slice(-10))) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    setSending(true);
    const ref = `SHF-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    const body = detailed
      .map((l) => `• ${l.prod.name} — ${l.size} x${l.qty} = ${inr(l.prod.prices[l.size] * l.qty)}`)
      .join("\n");
    const text = `New order ${ref}\n\n${body}\n\nTotal: ${inr(total)}\n\nName: ${form.name}\nPhone: ${form.phone}\nAddress: ${form.address}${form.notes ? `\nNotes: ${form.notes}` : ""}`;

    window.setTimeout(() => {
      window.open(
        `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`,
        "_blank",
        "noopener",
      );
      setPlaced({ ref, name: form.name, total });
      clear();
      setSending(false);
      toast.success("Order placed — we'll confirm shortly");
    }, 500);
  };

  if (placed) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-20">
        <Reveal>
          <div className="rounded-sm border border-border bg-card p-8 text-center">
            <CheckCircle2 className="mx-auto size-14 text-primary" />
            <h1 className="mt-4 font-display text-3xl">Thank you, {placed.name}!</h1>
            <p className="mt-2 text-muted-foreground">
              Your order <span className="font-medium text-foreground">{placed.ref}</span> for{" "}
              <span className="font-medium text-foreground">{inr(placed.total)}</span> has been
              submitted. We'll call or WhatsApp you on your number to confirm freshness, packing and
              delivery.
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
          Tell us where to deliver. We confirm every order personally before cooking.
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
          <Button type="submit" size="lg" className="w-full" disabled={sending}>
            {sending ? "Placing order…" : `Confirm order · ${inr(total)}`}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Payment is collected on confirmation — no card details needed here.
          </p>
        </form>

        <aside className="h-fit rounded-sm border border-border bg-secondary/30 p-6">
          <h2 className="font-display text-2xl">Order summary</h2>
          <div className="mt-4 space-y-3">
            {detailed.map((l) => (
              <div key={`${l.id}-${l.size}`} className="flex justify-between gap-3 text-sm">
                <span>
                  {l.prod.name}
                  <span className="text-muted-foreground"> · {l.size} × {l.qty}</span>
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

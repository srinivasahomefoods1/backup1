import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, MessageCircle, ShoppingBag } from "lucide-react";
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
import { placeOrder as placeOrderFn } from "@/lib/orders.functions";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout | Srinivasa Home Foods" },
      {
        name: "description",
        content:
          "Confirm your Srinivasa Home Foods order and send your complete order details to WhatsApp.",
      },
      { property: "og:title", content: "Checkout | Srinivasa Home Foods" },
      {
        property: "og:description",
        content: "Place your order through WhatsApp and complete payment with our team.",
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
  const placeOrder = useServerFn(placeOrderFn);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<Placed | null>(null);

  const detailed = lines.flatMap((l) => {
    const prod = products.find((p) => p.id === l.id);
    return prod ? [{ ...l, prod }] : [];
  });

  const set = (k: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();

    const phone = form.phone.replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    if (detailed.length === 0) {
      toast.error("Your basket is empty");
      return;
    }

    setSubmitting(true);

    // The database order is created before WhatsApp opens, so the admin
    // dashboard has the order even if the customer closes WhatsApp.
    const fallbackRef = `SHF-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    let orderNumber = fallbackRef;
    let serverTotal = total;

    try {
      const saved = await placeOrder({
        data: {
          name: form.name.trim(),
          phone,
          email: form.email.trim(),
          address: form.address.trim(),
          notes: form.notes.trim(),
          paymentMethod: "upi",
          paymentReference: "",
          items: detailed.map((l) => ({
            slug: l.prod.id,
            size: l.size,
            qty: l.qty,
          })),
        },
      });

      orderNumber = saved.orderNumber;
      serverTotal = saved.total;
    } catch (err) {
      console.error(err);
      toast.error(
        "We could not save the online order record, but you can still send the order to WhatsApp.",
      );
    }

    const body = detailed
      .map(
        (l) =>
          `• ${l.prod.name} — ${l.size} x${l.qty} = ${inr(
            l.prod.prices[l.size] * l.qty,
          )}`,
      )
      .join("\n");

    const text = `Hello Srinivasa Home Foods,

I would like to place an order.

Order ID: ${orderNumber}

Customer Details:
Name: ${form.name.trim()}
Phone: ${phone}${form.email.trim() ? `\nEmail: ${form.email.trim()}` : ""}

Delivery Address:
${form.address.trim()}

Order Items:
${body}

Total Amount: ${inr(serverTotal)}

Payment: I will complete the payment through WhatsApp after receiving your payment details.${
      form.notes.trim() ? `\n\nOrder Notes:\n${form.notes.trim()}` : ""
    }

Please confirm my order and share the payment details.`;

    const whatsappUrl = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(
      text,
    )}`;

    // Open WhatsApp after the order has been saved.
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    setPlaced({
      ref: orderNumber,
      name: form.name.trim(),
      total: serverTotal,
    });
    clear();
    setSubmitting(false);
    toast.success("Order details are ready in WhatsApp");
  };

  if (placed) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-20">
        <Reveal>
          <div className="rounded-sm border border-border bg-card p-8 text-center">
            <CheckCircle2 className="mx-auto size-14 text-primary" />
            <h1 className="mt-4 font-display text-3xl">
              Order sent to WhatsApp
            </h1>
            <p className="mt-2 text-muted-foreground">
              Thank you, {placed.name}. Your order{" "}
              <span className="font-medium text-foreground">{placed.ref}</span>{" "}
              for{" "}
              <span className="font-medium text-foreground">
                {inr(placed.total)}
              </span>{" "}
              has been created.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              Please send the pre-filled WhatsApp message. We will share the
              payment details there, verify your payment, and confirm the order.
            </p>

            <Button
              className="mt-6"
              onClick={() => {
                const text = `Hello Srinivasa Home Foods, I am following up on order ${placed.ref}. Please share the payment details.`;
                window.open(
                  `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`,
                  "_blank",
                  "noopener,noreferrer",
                );
              }}
            >
              <MessageCircle className="size-4" />
              Open WhatsApp
            </Button>

            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Button asChild variant="ghost">
                <Link to="/menu">Continue shopping</Link>
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate({ to: "/contact" })}
              >
                Contact us
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
        <p className="mt-2 text-muted-foreground">
          Add a few favourites and come back here.
        </p>
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
          Enter your delivery details. We will send the complete order to
          WhatsApp, where payment can be completed with our team.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <form
          onSubmit={submit}
          className="space-y-5 rounded-sm border border-border bg-card p-6"
        >
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
            <Label htmlFor="email">Email (optional)</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => set("email")(e.target.value)}
              placeholder="you@example.com"
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
              placeholder="Delivery instructions, gift packing, etc."
            />
          </div>

          <Separator />

          <div className="rounded-sm border border-border bg-secondary/30 p-4">
            <p className="font-medium">Payment through WhatsApp</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Do not pay on this website. After you send the order on WhatsApp,
              we will share the UPI payment details and confirm your order after
              verifying the payment.
            </p>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={submitting}
          >
            <MessageCircle className="size-5" />
            {submitting ? "Preparing your order…" : "Order through WhatsApp"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Your order details, customer information and total amount will be
            included in the WhatsApp message.
          </p>
        </form>

        <aside className="h-fit rounded-sm border border-border bg-secondary/30 p-6">
          <h2 className="font-display text-2xl">Order summary</h2>

          <div className="mt-4 space-y-3">
            {detailed.map((l) => (
              <div
                key={`${l.id}-${l.size}`}
                className="flex justify-between gap-3 text-sm"
              >
                <span>
                  {l.prod.name}
                  <span className="text-muted-foreground">
                    {" "}
                    · {l.size} × {l.qty}
                  </span>
                </span>
                <span className="tabular-nums">
                  {inr(l.prod.prices[l.size] * l.qty)}
                </span>
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

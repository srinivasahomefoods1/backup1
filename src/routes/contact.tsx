import { useServerFn } from "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { submitEnquiry } from "@/lib/enquiry.functions";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CONTACT, categories } from "@/data/products";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Enquiry | Srinivasa Home Foods" },
      {
        name: "description",
        content:
          "Call, WhatsApp or send an enquiry to Srinivasa Home Foods for homemade podulu, snacks and sweets — bulk and festival orders welcome.",
      },
      { property: "og:title", content: "Contact & Enquiry | Srinivasa Home Foods" },
      {
        property: "og:description",
        content: "Reach Srinivasa Home Foods for orders, bulk enquiries and delivery details.",
      },
    ],
  }),
  component: Contact,
});

function Contact() {
  const [interest, setInterest] = useState("");
  const [sending, setSending] = useState(false);
  const send = useServerFn(submitEnquiry);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setSending(true);
    try {
      const res = await send({
        data: {
          name: String(fd.get("name") || ""),
          phone: String(fd.get("phone") || ""),
          email: String(fd.get("email") || ""),
          interest: categories.find((c) => c.id === interest)?.label ?? interest,
          message: String(fd.get("message") || ""),
          source: "Contact page",
        },
      });
      form.reset();
      setInterest("");
      toast.success(`Enquiry ${res.enquiryId} received — we'll call you back shortly.`);
    } catch {
      const text = `Enquiry from ${fd.get("name")} (${fd.get("phone")}): ${fd.get("message")}`;
      toast.error("Couldn't save your enquiry — opening WhatsApp instead.");
      window.open(`https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`, "_blank");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <Reveal>
        <p className="rule-ornament text-xs uppercase tracking-[0.4em] text-spice">Say hello</p>
        <h1 className="mt-4 text-center text-5xl md:text-6xl">Contact &amp; Enquiry</h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
          Tell us what you'd like and how much — we'll confirm price, packing and delivery the same
          day.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
        <Reveal className="space-y-4">
          {[
            { icon: Phone, label: "Phone", value: CONTACT.phone, href: `tel:${CONTACT.phoneHref}` },
            {
              icon: MessageCircle,
              label: "WhatsApp",
              value: CONTACT.phone,
              href: `https://wa.me/${CONTACT.whatsapp}`,
            },
            { icon: Mail, label: "Email", value: CONTACT.email, href: `mailto:${CONTACT.email}` },
            { icon: MapPin, label: "Kitchen", value: CONTACT.address },
            { icon: Clock, label: "Hours", value: CONTACT.hours },
          ].map((c) => (
            <div key={c.label} className="flex gap-4 rounded-sm border border-border bg-card p-5">
              <c.icon className="mt-1 size-5 shrink-0 text-spice" />
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  {c.label}
                </p>
                {c.href ? (
                  <a
                    href={c.href}
                    target={c.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener"
                    className="font-display text-lg transition-colors hover:text-spice"
                  >
                    {c.value}
                  </a>
                ) : (
                  <p className="font-display text-lg">{c.value}</p>
                )}
              </div>
            </div>
          ))}
        </Reveal>

        <Reveal delay={120}>
          <form
            onSubmit={onSubmit}
            className="space-y-5 rounded-sm border border-border bg-card p-7"
          >
            <h2 className="font-display text-2xl">Send an enquiry</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Your name</Label>
                <Input id="name" name="name" required placeholder="Lakshmi" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  pattern="[0-9+ ]{8,15}"
                  placeholder="98765 43210"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (optional)</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interest">Interested in</Label>
              <Select value={interest} onValueChange={setInterest}>
                <SelectTrigger id="interest">
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="bulk">Bulk / festival order</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                name="message"
                rows={5}
                required
                placeholder="I'd like 1kg karivepaku podi and 500g sunnundalu delivered to Kukatpally..."
              />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={sending}>
              {sending ? "Sending…" : "Send enquiry"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Prefer to talk? Call {CONTACT.phone} between 9 AM and 8 PM.
            </p>
          </form>
        </Reveal>
      </div>
    </div>
  );
}

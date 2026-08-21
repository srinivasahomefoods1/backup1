import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { products, CONTACT } from "@/data/products";
import { inr, useCart } from "@/lib/cart";

export function CartSheet() {
  const { lines, open, setOpen, setQty, remove, clear, total } = useCart();

  const detailed = lines.flatMap((l) => {
    const prod = products.find((p) => p.id === l.id);
    return prod ? [{ ...l, prod }] : [];
  });

  const orderOnWhatsApp = () => {
    const body = detailed
      .map((l) => `${l.prod.name} — ${l.size} x${l.qty} = ${inr(l.prod.prices[l.size] * l.qty)}`)
      .join("\n");
    const text = `Hello Srinivasa Home Foods, I'd like to order:\n\n${body}\n\nTotal: ${inr(total)}`;
    window.open(
      `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener",
    );
    toast.success("Order summary opened in WhatsApp");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl">Your basket</SheetTitle>
          <SheetDescription>
            Send the basket over WhatsApp and we'll confirm freshness &amp; delivery.
          </SheetDescription>
        </SheetHeader>

        {detailed.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Nothing added yet.</p>
            <Button asChild variant="secondary" onClick={() => setOpen(false)}>
              <Link to="/menu">Browse the menu</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-4">
              {detailed.map((l) => (
                <div key={`${l.id}-${l.size}`} className="flex gap-3 rounded-sm border border-border bg-card p-3">
                  <div className="flex-1">
                    <p className="font-display text-base leading-tight">{l.prod.name}</p>
                    <p className="text-xs text-muted-foreground">{l.size} pack</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-7"
                        onClick={() => setQty(l.id, l.size, l.qty - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus className="size-3" />
                      </Button>
                      <span className="w-6 text-center text-sm tabular-nums">{l.qty}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="size-7"
                        onClick={() => setQty(l.id, l.size, l.qty + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus className="size-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <span className="font-display text-lg">{inr(l.prod.prices[l.size] * l.qty)}</span>
                    <button
                      onClick={() => remove(l.id, l.size)}
                      className="text-muted-foreground transition-colors hover:text-destructive"
                      aria-label={`Remove ${l.prod.name}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t border-border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estimated total</span>
                <span className="font-display text-2xl">{inr(total)}</span>
              </div>
              <Separator />
              <Button className="w-full" size="lg" onClick={orderOnWhatsApp}>
                Place order on WhatsApp
              </Button>
              <Button variant="ghost" className="w-full" onClick={clear}>
                Clear basket
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

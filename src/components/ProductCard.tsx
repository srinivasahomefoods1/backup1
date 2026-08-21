import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SIZES, imageFor, type Product, type Size } from "@/data/products";
import { inr, useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const [size, setSize] = useState<Size>("250g");
  const { add, setOpen } = useCart();

  return (
    <article className="lift group flex flex-col overflow-hidden rounded-sm border border-border bg-card">
      <div className="relative h-44 overflow-hidden">
        <img
          src={imageFor(product.category)}
          alt={product.name}
          loading="lazy"
          width={1024}
          height={768}
          className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-sm bg-background/90 px-2 py-1 text-[0.6rem] uppercase tracking-[0.2em] text-primary">
          {product.category === "podi" ? "Podi" : product.category === "snacks" ? "Snack" : "Sweet"}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-xl leading-tight">{product.name}</h3>
        {product.telugu && <p className="text-sm text-muted-foreground">{product.telugu}</p>}
        {product.note && <p className="text-xs text-muted-foreground">({product.note})</p>}

        <div className="mt-4 flex gap-1.5">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={cn(
                "flex-1 rounded-sm border px-2 py-1.5 text-xs transition-colors",
                size === s
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary/50",
              )}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="font-display text-2xl text-spice">{inr(product.prices[size])}</span>
          <Button
            size="sm"
            className="bg-gold text-accent-foreground shadow hover:bg-gold/90"
            onClick={() => {
              add(product.id, size);
              setOpen(true);
              toast.success(`${product.name} (${size}) added`);
            }}
          >
            Add
          </Button>
        </div>
      </div>
    </article>
  );
}

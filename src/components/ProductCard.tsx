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
    <article className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-md md:rounded-sm">
      {/* Product image */}
      <div className="relative h-40 overflow-hidden bg-muted sm:h-44">
        <img
          src={product.image ?? imageFor(product.category)}
          alt={product.name}
          loading="lazy"
          width={1024}
          height={768}
          className="size-full object-contain transition-transform duration-500 group-hover:scale-105"
        />

        <span className="absolute left-2.5 top-2.5 rounded-full bg-background/90 px-2 py-1 text-[0.55rem] font-medium uppercase tracking-[0.15em] text-primary backdrop-blur-sm sm:left-3 sm:top-3 sm:rounded-sm sm:text-[0.6rem] sm:tracking-[0.2em]">
          {product.category === "podi"
            ? "Podi"
            : product.category === "snacks"
              ? "Snack"
              : "Sweet"}
        </span>
      </div>

      {/* Product information */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-5">
        <h3 className="font-display text-lg leading-tight sm:text-xl">
          {product.name}
        </h3>

        {product.telugu && (
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            {product.telugu}
          </p>
        )}

        {product.note && (
          <p className="mt-0.5 text-[0.68rem] text-muted-foreground sm:text-xs">
            ({product.note})
          </p>
        )}

        {/* Pack sizes */}
        <div className="mt-3 grid grid-cols-3 gap-1 sm:mt-4 sm:gap-1.5">
          {SIZES.map((s) => (
            <button
              key={s}
              onClick={() => setSize(s)}
              className={cn(
                "min-h-8 rounded-md border px-1 text-[0.68rem] transition-colors sm:rounded-sm sm:px-2 sm:py-1.5 sm:text-xs",
                size === s
                  ? "border-gold bg-gold font-medium text-accent-foreground"
                  : "border-border text-muted-foreground hover:border-gold/50 hover:text-foreground",
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Price + Add button */}
        <div className="mt-3 flex items-center justify-between gap-2 sm:mt-4">
          <span className="font-display text-xl text-spice sm:text-2xl">
            {inr(product.prices[size])}
          </span>

          <Button
            size="sm"
            className="h-9 rounded-full bg-gold px-4 text-sm font-semibold text-accent-foreground shadow-sm hover:bg-gold/90 sm:rounded-sm"
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
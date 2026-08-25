import { createFileRoute, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { SIZES, categories, products, type Category } from "@/data/products";
import { inr } from "@/lib/cart";
import { cn } from "@/lib/utils";

const menuSearchSchema = z.object({
  cat: fallback(z.string(), "all").default("all"),
});

export const Route = createFileRoute("/menu")({
  validateSearch: zodValidator(menuSearchSchema),
  head: () => {
    const title = "Menu & Price List | Srinivasa Home Foods";
    const desc =
      "Full price list of Srinivasa Home Foods: karivepaku, vellulli, kandi and idli karam podi, murukulu, chegodilu, sakinalu, sunnundalu and more in 250g, 500g and 1kg packs.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  component: MenuPage,
});

const FILTERS: { id: "all" | Category; label: string }[] = [
  { id: "all", label: "All" },
  { id: "podi", label: "Podulu" },
  { id: "snacks", label: "Savoury Snacks" },
  { id: "sweets", label: "Sweets" },
];

function MenuPage() {
  const { cat } = Route.useSearch();
  const active = (categories.some((c) => c.id === cat) ? cat : "all") as
    | "all"
    | Category;
  const isAll = active === "all";
  const visibleCategories = isAll ? categories : categories.filter((c) => c.id === active);

  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <Reveal>
        <p className="rule-ornament text-xs uppercase tracking-[0.4em] text-spice">
          Homemade podulu, snacks & sweets
        </p>
        <h1 className="mt-4 text-center text-5xl md:text-6xl">Our Menu</h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
          Pure ingredients · Traditional taste · Homemade with love. Choose a pack size and add it
          to your basket — we confirm every order personally.
        </p>
      </Reveal>

      {/* Category filter bar */}
      <Reveal delay={80}>
        <div className="sticky top-[4.5rem] z-20 mt-10 flex flex-wrap justify-center gap-2 rounded-sm border border-border bg-card/95 p-2 backdrop-blur">
          {FILTERS.map((f) => (
            <Link
              key={f.id}
              from="/menu"
              search={(prev) => ({ ...prev, cat: f.id })}
              className={cn(
                "rounded-sm px-5 py-2 text-sm uppercase tracking-[0.15em] transition-colors",
                active === f.id
                  ? "bg-gold text-accent-foreground"
                  : "text-muted-foreground hover:border-gold/50 hover:text-foreground",
              )}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </Reveal>

      {/* Category landing banner when filtered */}
      {!isAll &&
        (() => {
          const cat = categories.find((c) => c.id === active)!;
          const items = products.filter((p) => p.category === active);
          return (
            <Reveal className="mt-10">
              <section className="relative isolate overflow-hidden rounded-sm border border-border">
                <img
                  src={cat.image}
                  alt={cat.label}
                  loading="lazy"
                  width={1024}
                  height={500}
                  className="h-56 w-full object-cover sm:h-64"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-deep/90 via-deep/65 to-deep/30" />
                <div className="relative flex h-full items-end p-6 sm:p-8">
                  <div className="text-background">
                    <p className="text-xs uppercase tracking-[0.3em] text-gold">
                      {items.length} varieties
                    </p>
                    <h2 className="mt-2 font-display text-4xl">{cat.label}</h2>
                    <p className="mt-2 max-w-md text-sm text-background/80">{cat.blurb}</p>
                  </div>
                </div>
              </section>
            </Reveal>
          );
        })()}

      {visibleCategories.map((cat) => {
        const items = products.filter((p) => p.category === cat.id);
        return (
          <section key={cat.id} id={cat.id} className="scroll-mt-32 pt-12 first:pt-10">
            {isAll && (
              <Reveal>
                <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
                  <div>
                    <h2 className="text-3xl">{cat.label}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{cat.blurb}</p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.3em] text-spice">
                    {items.length} varieties
                  </span>
                </div>
              </Reveal>
            )}

            <div className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", isAll ? "mt-8" : "mt-8")}>
              {items.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 90}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </section>
        );
      })}

      {/* When a category filter is active, hide the full price table for focus */}
      {isAll && (
        <Reveal className="mt-24">
          <h2 className="text-center text-3xl">Complete price list</h2>
          <div className="mt-8 overflow-x-auto rounded-sm border border-border">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="surface-deep">
                <tr>
                  <th className="px-4 py-3 font-display text-base font-normal">Item</th>
                  {SIZES.map((s) => (
                    <th key={s} className="px-4 py-3 text-right font-display text-base font-normal">
                      {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p, i) => (
                  <tr key={p.id} className={i % 2 ? "bg-secondary/40" : "bg-card"}>
                    <td className="px-4 py-3">
                      <span className="font-medium">{p.name}</span>
                      {p.telugu && (
                        <span className="ml-2 text-muted-foreground">{p.telugu}</span>
                      )}
                    </td>
                    {SIZES.map((s) => (
                      <td key={s} className="px-4 py-3 text-right tabular-nums text-spice">
                        {inr(p.prices[s])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            ★ Note: rates may vary slightly based on seasonal ingredient prices.
          </p>
        </Reveal>
      )}

      {/* CTA back when filtered */}
      {!isAll && (
        <Reveal className="mt-16 text-center">
          <Button asChild variant="outline">
            <Link to="/menu" search={(prev) => ({ ...prev, cat: "all" })}>
              View the full menu
            </Link>
          </Button>
        </Reveal>
      )}
    </div>
  );
}

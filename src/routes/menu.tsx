import { createFileRoute } from "@tanstack/react-router";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { SIZES, categories, products } from "@/data/products";
import { inr } from "@/lib/cart";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu & Price List | Srinivasa Home Foods" },
      {
        name: "description",
        content:
          "Full price list of Srinivasa Home Foods: karivepaku, vellulli, kandi and idli karam podi, murukulu, chegodilu, sakinalu, sunnundalu and more in 250g, 500g and 1kg packs.",
      },
      { property: "og:title", content: "Menu & Price List | Srinivasa Home Foods" },
      {
        property: "og:description",
        content: "Homemade podulu, snacks and sweets with 250g, 500g and 1kg pricing.",
      },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-16">
      <Reveal>
        <p className="rule-ornament text-xs uppercase tracking-[0.4em] text-spice">
          Homemade podulu, snacks &amp; sweets
        </p>
        <h1 className="mt-4 text-center text-5xl md:text-6xl">Our Menu</h1>
        <p className="mx-auto mt-4 max-w-xl text-center text-muted-foreground">
          Pure ingredients · Traditional taste · Homemade with love. Choose a pack size and add it
          to your basket — we confirm every order personally.
        </p>
      </Reveal>

      {categories.map((cat) => {
        const items = products.filter((p) => p.category === cat.id);
        return (
          <section key={cat.id} id={cat.id} className="scroll-mt-24 pt-20">
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

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 90}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          </section>
        );
      })}

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
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Leaf, ShieldCheck, Truck } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import kitchenImg from "@/assets/kitchen.jpg";
import giftCombosImg from "@/assets/gift-combos.jpg";
import festivalSpecialsImg from "@/assets/festival-specials.jpg";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { categories, products } from "@/data/products";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Srinivasa Home Foods — Homemade Podulu, Snacks & Sweets" },
      {
        name: "description",
        content:
          "Freshly ground Andhra podulu, crisp savoury snacks and jaggery sweets, made at home in small batches. No preservatives, no added colours. Order online.",
      },
      { property: "og:title", content: "Srinivasa Home Foods — Homemade Podulu, Snacks & Sweets" },
      {
        property: "og:description",
        content: "Traditional Andhra podulu, snacks and sweets made fresh in small batches.",
      },
    ],
  }),
  component: Home,
});

const promises = [
  { icon: Leaf, title: "100% Homemade", body: "Cooked in a family kitchen, never a factory line." },
  { icon: ShieldCheck, title: "No Preservatives", body: "Zero added colours or shelf-life chemicals." },
  { icon: Truck, title: "Hygienic Packing", body: "Sealed food-grade packs, safe delivery available." },
];

const shopCategories = [
  {
    label: "Traditional Savoury",
    href: "/menu",
    hash: "snacks",
    image: categories.find((c) => c.id === "snacks")!.image,
    blurb: "Crisp Andhra teatime snacks",
  },
  {
    label: "Sweets",
    href: "/menu",
    hash: "sweets",
    image: categories.find((c) => c.id === "sweets")!.image,
    blurb: "Jaggery-sweetened festive treats",
  },
  {
    label: "Podulu",
    href: "/menu",
    hash: "podi",
    image: categories.find((c) => c.id === "podi")!.image,
    blurb: "Stone-ground spice powders",
  },
  {
    label: "Gift Combos",
    href: "/contact",
    hash: undefined,
    image: giftCombosImg,
    blurb: "Curated hampers for every occasion",
  },
  {
    label: "Festival Specials",
    href: "/contact",
    hash: undefined,
    image: festivalSpecialsImg,
    blurb: "Seasonal specials for the celebrations",
  },
];

function Home() {
  const featured = ["karivepaku-podi", "vellulli-podi", "sunnundalu", "murukulu"]
    .map((id) => products.find((p) => p.id === id)!)
    .filter(Boolean);

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImg}
          alt="Freshly ground South Indian spice powders in brass bowls"
          width={1920}
          height={1088}
          className="animate-slow-zoom absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-deep/95 via-deep/80 to-deep/25" />
        <div className="relative mx-auto flex min-h-[85vh] max-w-6xl flex-col justify-center px-5 py-24">
          <p className="animate-rise text-xs uppercase tracking-[0.5em] text-gold">
            Since our grandmother's kitchen
          </p>
          <h1
            className="animate-rise mt-5 text-6xl leading-[0.95] text-background sm:text-7xl md:text-8xl"
            style={{ animationDelay: "120ms" }}
          >
            Srinivasa
            <span className="mt-3 block text-lg uppercase tracking-[0.35em] text-gold sm:text-2xl">
              Home Foods
            </span>
          </h1>
          <p
            className="animate-rise mt-7 max-w-lg text-base text-background/80"
            style={{ animationDelay: "240ms" }}
          >
            Homemade podulu, crisp snacks and jaggery sweets — roasted, ground and packed in small
            batches for authentic taste and honest quality.
          </p>
          <div
            className="animate-rise mt-9 flex flex-wrap gap-3"
            style={{ animationDelay: "360ms" }}
          >
            <Button asChild size="lg">
              <Link to="/menu">
                View the menu <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-gold/60 bg-transparent text-background hover:bg-background hover:text-primary">
              <Link to="/contact">Send an enquiry</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-14">
        <Reveal>
          <p className="rule-ornament text-xs uppercase tracking-[0.4em] text-spice">
            Browse our kitchen
          </p>
          <h2 className="mt-4 text-center text-4xl md:text-5xl">Shop by Category</h2>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shopCategories.map((c, i) => (
            <Reveal key={c.label} delay={i * 90}>
              <Link
                to={c.href}
                {...(c.hash ? { hash: c.hash } : {})}
                className="lift group relative block h-72 overflow-hidden rounded-sm border border-border"
              >
                <img
                  src={c.image}
                  alt={c.label}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/35 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-background">
                  <h3 className="font-display text-2xl">{c.label}</h3>
                  <p className="mt-1 text-sm text-background/75">{c.blurb}</p>
                  <span className="mt-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold">
                    Explore <ArrowRight className="size-3" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {promises.map((p, i) => (
            <Reveal key={p.title} delay={i * 100}>
              <div className="flex h-full items-start gap-4 rounded-sm border border-border bg-card p-6">
                <p.icon className="mt-1 size-6 text-spice" />
                <div>
                  <h3 className="font-display text-lg">{p.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8">
        <Reveal>
          <p className="rule-ornament text-xs uppercase tracking-[0.4em] text-spice">
            What we make
          </p>
          <h2 className="mt-4 text-center text-4xl md:text-5xl">Three kitchens, one recipe book</h2>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {categories.map((c, i) => (
            <Reveal key={c.id} delay={i * 120}>
              <Link
                to="/menu"
                hash={c.id}
                className="lift group relative block h-80 overflow-hidden rounded-sm"
              >
                <img
                  src={c.image}
                  alt={c.label}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-background">
                  <h3 className="font-display text-2xl">{c.label}</h3>
                  <p className="mt-1 text-sm text-background/75">{c.blurb}</p>
                  <span className="mt-3 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-gold">
                    See prices <ArrowRight className="size-3" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-5">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <Reveal>
            <img
              src={kitchenImg}
              alt="Hands grinding spices in a traditional stone mortar"
              loading="lazy"
              width={1024}
              height={1024}
              className="h-[26rem] w-full rounded-sm object-cover"
            />
          </Reveal>
          <Reveal delay={120}>
            <p className="text-xs uppercase tracking-[0.4em] text-spice">SMALL AND LARGE BATCH PRODUCTIONS</p>
            <h2 className="mt-4 text-4xl leading-tight">
              Freshly prepared for authentic taste &amp; quality
            </h2>
            <p className="mt-5 text-muted-foreground">
              Every podi is dry-roasted to order and ground the same week it reaches you. Snacks are
              fried in clean groundnut oil, and our sweets use natural jaggery instead of refined
              sugar wherever the recipe allows.
            </p>
            <ul className="mt-6 space-y-2 text-sm">
              {[
                "Pure ingredients sourced from trusted local mills",
                "Made to order — nothing sits on a shelf",
                "Bulk orders for functions and festivals welcome",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold" />
                  {t}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8">
              <Link to="/about">Our story</Link>
            </Button>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <Reveal>
          <p className="rule-ornament text-xs uppercase tracking-[0.4em] text-spice">
            Family favourites
          </p>
          <h2 className="mt-4 text-center text-4xl">Most ordered this season</h2>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p, i) => (
            <Reveal key={p.id} delay={i * 90}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Button asChild variant="secondary" size="lg">
            <Link to="/menu">See all 21 items</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

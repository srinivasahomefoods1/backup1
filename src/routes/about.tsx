import { createFileRoute, Link } from "@tanstack/react-router";
import kitchenImg from "@/assets/kitchen.jpg";
import podiImg from "@/assets/podi.jpg";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story | Srinivasa Home Foods" },
      {
        name: "description",
        content:
          "How Srinivasa Home Foods makes traditional Andhra podulu, snacks and sweets — roasted, ground and packed by hand in small home batches.",
      },
      { property: "og:title", content: "Our Story | Srinivasa Home Foods" },
      {
        property: "og:description",
        content: "A family kitchen making Andhra podulu, snacks and sweets the traditional way.",
      },
    ],
  }),
  component: About,
});

const steps = [
  { n: "01", t: "Sourcing", d: "Chillies, dals and jaggery picked from mills we have used for years." },
  { n: "02", t: "Slow roasting", d: "Each ingredient roasted separately on low flame for depth of flavour." },
  { n: "03", t: "Stone grinding", d: "Ground coarse or fine exactly as each podi recipe demands." },
  { n: "04", t: "Sealed packing", d: "Cooled fully, then packed in food-grade sealed pouches." },
];

function About() {
  return (
    <div>
      <section className="surface-deep">
        <div className="mx-auto max-w-4xl px-5 py-24 text-center">
          <p className="text-xs uppercase tracking-[0.45em] text-gold">Our story</p>
          <h1 className="mt-5 text-5xl md:text-6xl">Homemade with love, since day one</h1>
          <p className="mx-auto mt-6 max-w-2xl text-primary-foreground/80">
            Srinivasa Home Foods began with a single karivepaku podi ground for neighbours who kept
            asking for "just one more packet". Today the recipes are the same, the kitchen is the
            same, and every batch is still tasted before it leaves the house.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-10 md:grid-cols-2">
          <Reveal>
            <img
              src={podiImg}
              alt="Freshly ground podi in a wooden bowl"
              loading="lazy"
              width={1024}
              height={768}
              className="h-96 w-full rounded-sm object-cover"
            />
          </Reveal>
          <Reveal delay={120} className="self-center">
            <h2 className="text-4xl leading-tight">No shortcuts in the recipe</h2>
            <p className="mt-5 text-muted-foreground">
              We do not use preservatives, artificial colours or flavour enhancers. What gives our
              podi its colour is chilli and turmeric; what makes our sweets sweet is jaggery. That
              is also why every batch tastes a little like a home kitchen, not a packet.
            </p>
            <p className="mt-4 text-muted-foreground">
              Orders for weddings, festivals and office gifting are prepared to schedule so they
              reach you at their freshest.
            </p>
            <Button asChild className="mt-8">
              <Link to="/contact">Talk to us</Link>
            </Button>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <Reveal>
          <p className="rule-ornament text-xs uppercase tracking-[0.4em] text-spice">
            From kitchen to kitchen
          </p>
          <h2 className="mt-4 text-center text-4xl">How each batch is made</h2>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 100}>
              <div className="lift h-full rounded-sm border border-border bg-card p-6">
                <span className="font-display text-3xl text-gold">{s.n}</span>
                <h3 className="mt-3 font-display text-xl">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-4">
        <Reveal>
          <img
            src={kitchenImg}
            alt="Traditional stone mortar grinding in a home kitchen"
            loading="lazy"
            width={1024}
            height={1024}
            className="h-80 w-full rounded-sm object-cover object-center"
          />
        </Reveal>
      </section>
    </div>
  );
}

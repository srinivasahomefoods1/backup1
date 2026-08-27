import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { CONTACT } from "@/data/products";
import logoAsset from "@/assets/srinivasa-logo.png.asset.json";

export function SiteFooter() {
  return (
    <footer className="surface-deep mt-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-3">
        <div>
          <img
            src={logoAsset.url}
            alt="Srinivasa Home Foods logo"
            width={96}
            height={96}
            className="size-24 rounded-full bg-white object-contain p-1 shadow-sm"
          />
          <p className="mt-4 font-display text-3xl">Srinivasa</p>
          <p className="text-[0.68rem] uppercase tracking-[0.42em] text-gold">Home Foods</p>
          <p className="mt-4 max-w-xs text-sm text-primary-foreground/75">
            Podulu, snacks and sweets made in small batches — pure ingredients, traditional taste,
            no preservatives or added colours.
          </p>
        </div>

        <div className="space-y-3 text-sm text-primary-foreground/80">
          <p className="font-display text-lg text-gold">Reach us</p>
          <a href={`tel:${CONTACT.phoneHref}`} className="flex items-center gap-2 hover:text-gold">
            <Phone className="size-4" /> {CONTACT.phone}
          </a>
          <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2 hover:text-gold">
            <Mail className="size-4" /> {CONTACT.email}
          </a>
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0" /> {CONTACT.address}
          </p>
          <p className="text-primary-foreground/60">{CONTACT.hours}</p>
        </div>

        <div className="space-y-3 text-sm">
          <p className="font-display text-lg text-gold">Explore</p>
          {[
            { to: "/menu", label: "Full menu & prices" },
            { to: "/about", label: "Our story" },
            { to: "/contact", label: "Enquiry form" },
          ].map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="block text-primary-foreground/80 transition-colors hover:text-gold"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="border-t border-primary-foreground/15 py-5 text-center text-xs text-primary-foreground/60">
        Rates may vary slightly based on seasonal ingredient prices. © {new Date().getFullYear()}{" "}
        Srinivasa Home Foods.
      </div>
    </footer>
  );
}

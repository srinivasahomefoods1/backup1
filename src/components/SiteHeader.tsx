import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";
import logoAsset from "@/assets/srinivasa-logo.png.asset.json";

const nav = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/about", label: "Our Story" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { count, setOpen } = useCart();
  const [mobile, setMobile] = useState(false);

  const closeMobile = () => setMobile(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:h-18 sm:px-5">
        {/* Logo */}
        <Link
          to="/"
          className="group flex min-w-0 items-center gap-2.5 sm:gap-3"
          onClick={closeMobile}
        >
          <img
            src={logoAsset.url}
            alt="Srinivasa Home Foods logo"
            width={44}
            height={44}
            className="size-10 shrink-0 rounded-full bg-white object-contain p-0.5 shadow-sm sm:size-11"
          />

          <span className="flex min-w-0 flex-col leading-none">
            <span className="truncate font-display text-lg tracking-wide text-primary sm:text-2xl">
              Srinivasa
            </span>
            <span className="text-[0.52rem] uppercase tracking-[0.3em] text-spice sm:text-[0.62rem] sm:tracking-[0.42em]">
              Home Foods
            </span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="relative text-sm uppercase tracking-[0.16em] text-foreground/75 transition-colors hover:text-primary after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-gold after:transition-all after:duration-300 hover:after:w-full"
              activeProps={{
                className:
                  "relative text-sm uppercase tracking-[0.16em] text-primary after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:bg-gold",
              }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            className="relative h-9 gap-1.5 px-3 sm:h-10 sm:gap-2 sm:px-4"
            onClick={() => setOpen(true)}
          >
            <ShoppingBag className="size-4" />
            <span className="hidden sm:inline">Basket</span>

            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-spice text-[0.65rem] font-semibold text-primary-foreground">
                {count}
              </span>
            )}
          </Button>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="size-9 md:hidden"
            onClick={() => setMobile((v) => !v)}
            aria-label={mobile ? "Close navigation" : "Open navigation"}
            aria-expanded={mobile}
          >
            {mobile ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile navigation */}
      <div
        className={cn(
          "overflow-hidden border-t border-border/60 bg-background transition-[max-height,opacity] duration-300 md:hidden",
          mobile
            ? "max-h-72 opacity-100"
            : "max-h-0 opacity-0",
        )}
      >
        <nav className="grid grid-cols-2 gap-2 p-3">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={closeMobile}
              className="rounded-md border border-border/70 bg-card px-4 py-3 text-center text-xs font-medium uppercase tracking-[0.14em] text-foreground/80 transition-colors active:bg-secondary"
              activeProps={{
                className:
                  "rounded-md border border-gold bg-gold px-4 py-3 text-center text-xs font-medium uppercase tracking-[0.14em] text-accent-foreground",
              }}
              activeOptions={{ exact: n.to === "/" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
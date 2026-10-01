import { Link } from "@tanstack/react-router";
import { Home, Menu, MoreHorizontal, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/menu", label: "Menu", icon: Menu },
] as const;

export function MobileBottomNav() {
  const { count, setOpen } = useCart();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_18px_rgba(0,0,0,0.08)] backdrop-blur md:hidden">
      <div className="mx-auto grid h-16 max-w-md grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors"
              activeProps={{
                className:
                  "flex flex-col items-center justify-center gap-1 text-primary",
              }}
            >
              <Icon className="size-5" />
              <span className="text-[0.65rem] font-medium">{item.label}</span>
            </Link>
          );
        })}

        <Button
          variant="ghost"
          className="relative h-full flex-col gap-1 rounded-none text-muted-foreground hover:bg-transparent hover:text-primary"
          onClick={() => setOpen(true)}
          aria-label="Open basket"
        >
          <ShoppingBag className="size-5" />
          <span className="text-[0.65rem] font-medium">Cart</span>

          {count > 0 && (
            <span className="absolute left-1/2 top-2 ml-2 flex size-4 -translate-x-1/2 items-center justify-center rounded-full bg-spice text-[0.55rem] font-semibold text-primary-foreground">
              {count}
            </span>
          )}
        </Button>

        <Link
          to="/about"
          className="flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors"
          activeProps={{
            className:
              "flex flex-col items-center justify-center gap-1 text-primary",
          }}
        >
          <MoreHorizontal className="size-5" />
          <span className="text-[0.65rem] font-medium">More</span>
        </Link>
      </div>
    </nav>
  );
}
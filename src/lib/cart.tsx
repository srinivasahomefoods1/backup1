import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { products, type Size } from "@/data/products";

export interface CartLine {
  id: string;
  size: Size;
  qty: number;
}

interface CartCtx {
  lines: CartLine[];
  add: (id: string, size: Size, qty?: number) => void;
  setQty: (id: string, size: Size, qty: number) => void;
  remove: (id: string, size: Size) => void;
  clear: () => void;
  count: number;
  total: number;
  open: boolean;
  setOpen: (v: boolean) => void;
}

// Keep a single context instance across hot-reloads so provider/consumer never
// end up bound to two different module copies.
const g = globalThis as unknown as { __shfCartCtx?: React.Context<CartCtx | null> };
const Ctx = (g.__shfCartCtx ??= createContext<CartCtx | null>(null));
const KEY = "shf-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines]);

  const add = useCallback((id: string, size: Size, qty = 1) => {
    setLines((prev) => {
      const i = prev.findIndex((l) => l.id === id && l.size === size);
      if (i === -1) return [...prev, { id, size, qty }];
      const next = [...prev];
      const cur = prev[i]!;
      next[i] = { ...cur, qty: cur.qty + qty };
      return next;
    });
  }, []);

  const setQty = useCallback((id: string, size: Size, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => !(l.id === id && l.size === size))
        : prev.map((l) => (l.id === id && l.size === size ? { ...l, qty } : l)),
    );
  }, []);

  const remove = useCallback((id: string, size: Size) => {
    setLines((prev) => prev.filter((l) => !(l.id === id && l.size === size)));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const { count, total } = useMemo(() => {
    let count = 0;
    let total = 0;
    for (const l of lines) {
      const prod = products.find((p) => p.id === l.id);
      if (!prod) continue;
      count += l.qty;
      total += prod.prices[l.size] * l.qty;
    }
    return { count, total };
  }, [lines]);

  return (
    <Ctx.Provider value={{ lines, add, setQty, remove, clear, count, total, open, setOpen }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

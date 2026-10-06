"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  quantity: number;
  stock: number;
  merchantId: string;
  merchantName: string;
  imageUrl: string | null;
  categorySlug?: string | null;
  emoji?: string;
};

type Ctx = {
  items: CartItem[];
  count: number;
  subtotalCents: number;
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  ready: boolean;
};

const CartContext = createContext<Ctx | null>(null);
const KEY = "snlrich_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, ready]);

  const add = useCallback<Ctx["add"]>((item, qty = 1) => {
    setItems((cur) => {
      const found = cur.find((i) => i.productId === item.productId);
      if (found) {
        return cur.map((i) =>
          i.productId === item.productId ? { ...i, ...item, quantity: Math.min(item.stock, i.quantity + qty) } : i,
        );
      }
      return [...cur, { ...item, quantity: Math.min(item.stock, qty) }];
    });
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setItems((cur) =>
      cur.map((i) => (i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(i.stock, qty)) } : i)),
    );
  }, []);
  const remove = useCallback((productId: string) => setItems((c) => c.filter((i) => i.productId !== productId)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<Ctx>(
    () => ({
      items,
      count: items.reduce((s, i) => s + i.quantity, 0),
      subtotalCents: items.reduce((s, i) => s + i.quantity * i.priceCents, 0),
      add,
      setQty,
      remove,
      clear,
      ready,
    }),
    [items, add, setQty, remove, clear, ready],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

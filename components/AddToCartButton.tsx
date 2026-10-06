"use client";

import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import { useCart, type CartItem } from "./CartProvider";

export function AddToCartButton({
  item,
  variant = "icon",
  qty = 1,
}: {
  item: Omit<CartItem, "quantity">;
  variant?: "icon" | "full";
  qty?: number;
}) {
  const { add } = useCart();
  const [done, setDone] = useState(false);
  const soldOut = item.stock <= 0;

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    if (soldOut) return;
    add(item, qty);
    setDone(true);
    setTimeout(() => setDone(false), 1200);
  }

  if (variant === "full") {
    return (
      <button onClick={onClick} disabled={soldOut} className="btn btn-primary w-full sm:w-auto">
        {done ? <Check size={16} /> : <ShoppingCart size={16} />}
        {soldOut ? "Out of stock" : done ? "Added!" : "Add to cart"}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      disabled={soldOut}
      aria-label="Add to cart"
      className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-navy-800 hover:bg-navy-800 hover:text-white disabled:opacity-40"
    >
      {done ? <Check size={15} /> : <ShoppingCart size={15} />}
    </button>
  );
}

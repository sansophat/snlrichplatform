"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./CartProvider";

export function CartLink() {
  const { count, ready } = useCart();
  return (
    <Link href="/cart" className="relative flex flex-col items-center gap-0.5 text-[11px] text-slate-600 hover:text-navy-800">
      <ShoppingCart size={20} />
      <span>Cart</span>
      {ready && count > 0 && (
        <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-navy-800 px-1 text-[10px] font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}

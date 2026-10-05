import React from 'react';
import {
  X,
  ShieldCheck,
  Star,
  MapPin,
  Calendar,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { Merchant, Product } from '../types';
import { ProductCard } from './ProductCard';

interface MerchantStoreModalProps {
  merchant: Merchant | null;
  products: Product[];
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  wishlist: string[];
  onToggleWishlist: (product: Product) => void;
}

export const MerchantStoreModal: React.FC<MerchantStoreModalProps> = ({
  merchant,
  products,
  onClose,
  onAddToCart,
  onQuickView,
  wishlist,
  onToggleWishlist,
}) => {
  if (!merchant) return null;

  const merchantProducts = products.filter((p) => p.merchantId === merchant.id);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Merchant Hero Banner */}
        <div className="relative h-44 sm:h-52 bg-slate-900 overflow-hidden">
          <img
            src={merchant.coverImage}
            alt={merchant.name}
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Top Badge */}
          <div className="absolute top-4 left-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-xs text-xs font-bold text-slate-900 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>SNL Verified Merchant Partner</span>
            </span>
          </div>

          {/* Bottom Banner Content */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-1 shadow-xl border-2 border-white overflow-hidden shrink-0">
                <img
                  src={merchant.logo}
                  alt={merchant.name}
                  className="w-full h-full object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="text-white">
                <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight leading-tight">
                  {merchant.name}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1">
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <strong className="text-white">{merchant.rating}</strong> ({merchant.reviewCount})
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{merchant.location}</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Partner since {merchant.joinedDate}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Cashback Rate Pill */}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[11px] text-slate-300">Partner Rewards</span>
              <span className="px-3 py-1 rounded-xl bg-emerald-500 text-white font-extrabold text-sm shadow-md">
                {merchant.cashbackRate}% Instant Cashback
              </span>
            </div>
          </div>
        </div>

        {/* Storefront Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* About Merchant */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              {merchant.description}
            </p>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 shrink-0">
              <div className="text-center">
                <span className="text-slate-400 block text-[10px]">Total Sold</span>
                <span className="font-bold text-slate-900">{merchant.totalSales.toLocaleString()}+</span>
              </div>
              <div className="text-center">
                <span className="text-slate-400 block text-[10px]">Multiplier</span>
                <span className="font-bold text-amber-700">{merchant.pointsMultiplier}x Pts</span>
              </div>
            </div>
          </div>

          {/* Products from this Merchant */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-blue-600" />
                <span>Storefront Catalog ({merchantProducts.length} items)</span>
              </h3>
            </div>

            {merchantProducts.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No items listed currently for this merchant.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {merchantProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onAddToCart={onAddToCart}
                    onQuickView={onQuickView}
                    isWishlisted={wishlist.includes(p.id)}
                    onToggleWishlist={onToggleWishlist}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

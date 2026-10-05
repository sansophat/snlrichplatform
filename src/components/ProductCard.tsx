import React, { useState } from 'react';
import {
  Star,
  ShoppingBag,
  Heart,
  ShieldCheck,
  Coins,
  Eye,
  Check,
  Sparkles,
} from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onQuickView,
  isWishlisted,
  onToggleWishlist,
}) => {
  const [isAdded, setIsAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1400);
  };

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-blue-300 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden transform hover:-translate-y-1">
      {/* Top Image Showcase */}
      <div
        onClick={() => onQuickView(product)}
        className="relative w-full pt-[95%] bg-[#F8F9FA] cursor-pointer overflow-hidden select-none"
      >
        <img
          src={product.image}
          alt={product.title}
          className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-108 transition-transform duration-500 ease-out"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Floating Cashback Badge with subtle glassmorphism */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
          <span className="text-[10px] font-black bg-emerald-600/95 backdrop-blur-xs text-white px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-emerald-200" />
            <span>${product.cashbackAmount.toFixed(2)} Back</span>
          </span>

          {discountPercent > 0 && (
            <span className="text-[9px] font-extrabold bg-rose-500 text-white px-1.5 py-0.2 rounded-md shadow-2xs">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Wishlist Button with Heart Pop */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
            isWishlisted
              ? 'bg-rose-50 text-rose-600 scale-110 shadow-sm'
              : 'bg-white/90 backdrop-blur-xs text-slate-400 hover:text-rose-500 hover:bg-white hover:scale-110 shadow-xs'
          }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart
            className={`w-4 h-4 transition-transform active:scale-75 ${
              isWishlisted ? 'fill-current' : ''
            }`}
          />
        </button>

        {/* Hover Quick-View Action Pill */}
        <div className="absolute inset-x-3 bottom-3 flex justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 z-10 pointer-events-none group-hover:pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="w-full py-1.5 rounded-xl bg-white/95 hover:bg-white text-slate-900 font-bold text-[11px] shadow-md border border-slate-200/80 flex items-center justify-center gap-1.5 backdrop-blur-md cursor-pointer transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Merchant Attribution */}
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 mb-1">
            <span className="truncate hover:text-blue-600 transition-colors">
              {product.merchantName}
            </span>
            <ShieldCheck className="w-3 h-3 text-blue-500 shrink-0" />
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onQuickView(product)}
            className="text-xs sm:text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1 cursor-pointer leading-snug"
            title={product.title}
          >
            {product.title}
          </h3>

          {/* Points Reward Kicker */}
          <div className="flex items-center gap-1 text-[11px] text-amber-800 font-bold mt-1">
            <Coins className="w-3 h-3 text-amber-500 shrink-0" />
            <span>Earn +{product.pointsEarned} SNL pts</span>
          </div>
        </div>

        {/* Bottom Price & Add to Cart Row */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-black text-slate-900 tabular-nums">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-slate-400 line-through tabular-nums">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Star Rating */}
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="font-bold text-slate-700">{product.rating}</span>
              <span className="text-[10px] text-slate-400">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Interactive Cart Button with Check State */}
          <button
            onClick={handleAdd}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md active:scale-90 ${
              isAdded
                ? 'bg-emerald-600 text-white scale-105'
                : 'border border-slate-200 hover:border-[#0B1B3D] bg-white hover:bg-[#0B1B3D] text-slate-700 hover:text-white'
            }`}
            title={isAdded ? 'Added to Cart' : 'Add to Cart'}
          >
            {isAdded ? (
              <Check className="w-4 h-4 animate-in zoom-in" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

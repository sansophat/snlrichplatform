import React, { useState } from 'react';
import {
  X,
  Star,
  ShoppingBag,
  ShieldCheck,
  Coins,
  Truck,
  RotateCcw,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onOpenMerchantStore: (merchantId: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onOpenMerchantStore,
}) => {
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100/80 hover:bg-slate-200 text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Image Showcase */}
          <div className="p-8 bg-slate-50 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-200">
            <div className="relative w-full aspect-square max-w-[340px]">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-0 left-0 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-xs">
                ${product.cashbackAmount.toFixed(2)} Instant Cashback
              </span>
            </div>
          </div>

          {/* Right Column: Details & Actions */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              {/* Merchant Banner Link */}
              <div
                onClick={() => {
                  onClose();
                  onOpenMerchantStore(product.merchantId);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200/80 text-blue-700 text-xs font-bold cursor-pointer transition-colors"
              >
                <span>Merchant: {product.merchantName}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <ExternalLink className="w-3 h-3 text-blue-500 ml-0.5" />
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-display leading-snug">
                {product.title}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(product.rating)
                          ? 'fill-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-slate-800">{product.rating}</span>
                <span>·</span>
                <span>{product.reviewsCount} customer reviews</span>
              </div>

              {/* Price & Discounts */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-slate-400 line-through tabular-nums">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
                {product.originalPrice && (
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                    Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </span>
                )}
              </div>

              {/* SNL Rewards Perks Pill */}
              <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                  <Coins className="w-4 h-4 text-amber-600" />
                  <span>Earn +{product.pointsEarned} SNL Points</span>
                </div>
                <span className="text-emerald-700 font-extrabold">
                  +${product.cashbackAmount.toFixed(2)} Cashback
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed">
                {product.description}
              </p>

              {/* Specifications */}
              {product.specs && (
                <div className="pt-2 border-t border-slate-100 text-xs">
                  <span className="font-bold text-slate-800 block mb-1.5">
                    Specifications
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-slate-600">
                    {Object.entries(product.specs).map(([key, val]) => (
                      <div key={key} className="bg-slate-50 p-1.5 rounded-lg">
                        <span className="text-[10px] text-slate-400 block">{key}</span>
                        <span className="font-semibold text-slate-800">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-slate-300 rounded-xl p-1 bg-slate-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-7 h-7 flex items-center justify-center font-bold text-slate-600 hover:bg-white rounded-lg transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-slate-900 tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-7 h-7 flex items-center justify-center font-bold text-slate-600 hover:bg-white rounded-lg transition-colors"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => {
                    onAddToCart(product, quantity);
                    onClose();
                  }}
                  className="flex-1 py-3 px-5 rounded-xl bg-[#0B1B3D] hover:bg-[#152a5a] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart · ${(product.price * quantity).toFixed(2)}</span>
                </button>
              </div>

              {/* Reassurance */}
              <div className="flex items-center justify-around text-[11px] text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-blue-500" />
                  <span>Ships in 24h</span>
                </span>
                <span className="flex items-center gap-1">
                  <RotateCcw className="w-3.5 h-3.5 text-blue-500" />
                  <span>30-Day Free Returns</span>
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>SNL Authenticity Guarantee</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

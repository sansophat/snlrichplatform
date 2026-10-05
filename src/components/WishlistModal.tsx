import React from 'react';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Product } from '../types';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistIds: string[];
  products: Product[];
  onAddToCart: (product: Product) => void;
  onRemoveFromWishlist: (productId: string) => void;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  wishlistIds,
  products,
  onAddToCart,
  onRemoveFromWishlist,
}) => {
  if (!isOpen) return null;

  const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        <div className="bg-[#0B1B3D] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
            <h2 className="text-base font-bold font-display">
              Saved to Wishlist ({wishlistedProducts.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto divide-y divide-slate-100">
          {wishlistedProducts.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              <Heart className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p>Your wishlist is empty. Tap the heart on any product to save it.</p>
            </div>
          ) : (
            wishlistedProducts.map((p) => (
              <div key={p.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-12 h-12 object-contain bg-slate-50 rounded-lg p-1 border border-slate-200"
                  />
                  <div>
                    <span className="text-[10px] text-slate-400 block">{p.merchantName}</span>
                    <h4 className="font-bold text-slate-900">{p.title}</h4>
                    <span className="font-black text-slate-800 tabular-nums">
                      ${p.price.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onAddToCart(p);
                      onRemoveFromWishlist(p.id);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#0B1B3D] text-white font-bold text-xs flex items-center gap-1 hover:bg-slate-800 transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                  <button
                    onClick={() => onRemoveFromWishlist(p.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

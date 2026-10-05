import React from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Coins,
  ShieldCheck,
  Gift,
} from 'lucide-react';
import { CartItem, UserWallet, RegisteredUser } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  currentUser: RegisteredUser | null;
  wallet: UserWallet | null;
  pointsToRedeem: number;
  setPointsToRedeem: (pts: number) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
  onOpenAuthModal?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  currentUser,
  wallet,
  pointsToRedeem,
  setPointsToRedeem,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onOpenAuthModal,
}) => {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const availablePoints = wallet?.pointsBalance || 0;
  const pointsRate = wallet?.pointsValueRate || 100;
  const multiplier = wallet?.tierMultiplier || 1.0;

  const maxPointsApplicable = Math.min(
    availablePoints,
    Math.floor(subtotal * 100)
  );

  const pointsDiscount = pointsToRedeem / pointsRate;
  const shippingFee = subtotal >= 50 || subtotal === 0 ? 0 : 4.99;
  const grandTotal = Math.max(0, subtotal - pointsDiscount + shippingFee);

  const totalCashbackToEarn = cartItems.reduce(
    (sum, item) => sum + item.product.cashbackAmount * item.quantity,
    0
  );

  const totalPointsToEarn = cartItems.reduce(
    (sum, item) => sum + Math.round(item.product.pointsEarned * multiplier * item.quantity),
    0
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#0B1B3D]" />
              <h2 className="text-base font-bold text-slate-900 font-display">
                Your Shopping Cart
              </h2>
              <span className="text-xs bg-slate-200 font-bold px-2 py-0.5 rounded-full text-slate-700">
                {cartItems.reduce((acc, i) => acc + i.quantity, 0)}
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-slate-100">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">
                  Your cart is empty
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mb-6">
                  Browse products from our verified multi-merchants and earn instant cashback on every item.
                </p>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl bg-[#0B1B3D] text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-3.5 py-3 items-center"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-16 rounded-xl bg-slate-50 p-1 border border-slate-200/80 shrink-0 overflow-hidden">
                      <img
                        src={item.product.image}
                        alt={item.product.title}
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <span className="truncate">{item.product.merchantName}</span>
                        <ShieldCheck className="w-2.5 h-2.5 text-blue-500 shrink-0" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 truncate">
                        {item.product.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-extrabold text-slate-900 tabular-nums">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                        <span className="text-[10px] text-emerald-600 font-semibold">
                          +${(item.product.cashbackAmount * item.quantity).toFixed(2)} back
                        </span>
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50 shrink-0">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        className="p-1 hover:bg-white rounded text-slate-600 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-slate-800 tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        className="p-1 hover:bg-white rounded text-slate-600 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Drawer Footer / Rewards & Checkout */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-4">
              {/* SNL Points Redemption Module */}
              <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <Coins className="w-4 h-4 text-amber-600" />
                    <span>Redeem SNL Points</span>
                  </div>
                  <span className="text-[11px] font-semibold text-amber-800">
                    {currentUser
                      ? `Avail: ${availablePoints} pts ($${(availablePoints / 100).toFixed(2)})`
                      : 'Sign in to use points'}
                  </span>
                </div>

                {currentUser ? (
                  <div className="space-y-1">
                    <input
                      type="range"
                      min={0}
                      max={maxPointsApplicable}
                      step={50}
                      value={pointsToRedeem}
                      onChange={(e) => setPointsToRedeem(Number(e.target.value))}
                      className="w-full h-1.5 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                    />
                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-600">
                      <span>Using: {pointsToRedeem} pts</span>
                      <span className="text-emerald-700 font-bold">
                        -${pointsDiscount.toFixed(2)} off
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">
                      Earn +{totalPointsToEarn} pts as registered member
                    </span>
                    {onOpenAuthModal && (
                      <button
                        onClick={onOpenAuthModal}
                        className="text-[11px] font-bold text-blue-700 hover:underline cursor-pointer"
                      >
                        Sign In / Register
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Order Cashback & Points Reward Forecast */}
              <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/70 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-emerald-900 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Rewards on this order:</span>
                </div>
                <div className="flex items-center gap-2 font-bold">
                  <span className="text-emerald-700 tabular-nums">
                    +${totalCashbackToEarn.toFixed(2)} Cashback
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-amber-700 tabular-nums">
                    +{totalPointsToEarn} pts
                  </span>
                </div>
              </div>

              {/* Totals Summary */}
              <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800 tabular-nums">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                {pointsDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>SNL Points Discount</span>
                    <span className="tabular-nums">-${pointsDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="font-semibold text-slate-800">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-600">FREE</span>
                    ) : (
                      `$${shippingFee.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span className="tabular-nums">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Proceed to Checkout Button */}
              <button
                onClick={onProceedToCheckout}
                className="w-full py-3.5 px-4 rounded-xl bg-[#0B1B3D] hover:bg-[#152a5a] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all duration-200 cursor-pointer active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

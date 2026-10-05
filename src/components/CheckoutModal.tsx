import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CreditCard,
  Wallet,
  Truck,
  CheckCircle2,
  Sparkles,
  Coins,
  ArrowRight,
  LogIn,
} from 'lucide-react';
import { CartItem, UserWallet, Order, RegisteredUser } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  currentUser: RegisteredUser | null;
  wallet: UserWallet | null;
  pointsToRedeem: number;
  onOrderPlaced: (order: Order) => void;
  onOpenAuthModal?: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  currentUser,
  wallet,
  pointsToRedeem,
  onOrderPlaced,
  onOpenAuthModal,
}) => {
  const [formData, setFormData] = useState({
    fullName: currentUser?.name || 'Guest Customer',
    phone: '+1 (555) 234-8900',
    street: '742 Evergreen Terrace',
    city: 'San Francisco',
    postalCode: '94107',
    country: 'United States',
  });

  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card' | 'paypal' | 'cod'>(
    currentUser && (wallet?.cashbackBalance || 0) > 0 ? 'wallet' : 'card'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const pointsRate = wallet?.pointsValueRate || 100;
  const pointsDiscount = pointsToRedeem / pointsRate;
  const shippingFee = subtotal >= 50 || subtotal === 0 ? 0 : 4.99;
  const grandTotal = Math.max(0, subtotal - pointsDiscount + shippingFee);

  const cashbackEarned = cartItems.reduce(
    (sum, item) => sum + item.product.cashbackAmount * item.quantity,
    0
  );

  const multiplier = wallet?.tierMultiplier || 1.0;
  const pointsEarned = cartItems.reduce(
    (sum, item) => sum + Math.round(item.product.pointsEarned * multiplier * item.quantity),
    0
  );

  const handlePlaceOrder = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const newOrder: Order = {
        id: `ORD-SNL-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString().split('T')[0],
        items: [...cartItems],
        subtotal,
        pointsDiscount,
        pointsRedeemed: pointsToRedeem,
        shippingFee,
        total: grandTotal,
        cashbackEarned,
        pointsEarned,
        status: 'Processing',
        shippingAddress: { ...formData },
        paymentMethod:
          paymentMethod === 'wallet'
            ? 'SNL RICH Wallet Balance'
            : paymentMethod === 'card'
            ? 'Credit Card (••4242)'
            : paymentMethod === 'paypal'
            ? 'PayPal Express'
            : 'Cash on Delivery (COD)',
      };

      setCompletedOrder(newOrder);
      setIsProcessing(false);
      onOrderPlaced(newOrder);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#0B1B3D] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold font-display">
              SNL RICH Secure Multi-Merchant Checkout
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {completedOrder ? (
          /* Order Confirmation View */
          <div className="p-6 sm:p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                Order Confirmed!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Order reference{' '}
                <span className="font-bold text-[#0B1B3D]">{completedOrder.id}</span>
              </p>
            </div>

            {/* Celebratory Rewards Credit Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-emerald-50 to-amber-50 border border-emerald-200 text-left">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Rewards Credited to your Account:</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                  <span className="text-[11px] text-slate-500 block">Cashback Earned</span>
                  <span className="text-lg font-black text-emerald-600 tabular-nums">
                    +${completedOrder.cashbackEarned.toFixed(2)}
                  </span>
                </div>
                <div className="bg-white/80 p-2.5 rounded-xl border border-amber-100">
                  <span className="text-[11px] text-slate-500 block">SNL Points Earned</span>
                  <span className="text-lg font-black text-amber-600 tabular-nums">
                    +{completedOrder.pointsEarned} pts
                  </span>
                </div>
              </div>
            </div>

            {/* Receipt Summary */}
            <div className="bg-slate-50 rounded-2xl p-4 text-left text-xs space-y-2 border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Items Ordered:</span>
                <span className="font-bold text-slate-900">
                  {completedOrder.items.length} items from {new Set(completedOrder.items.map(i => i.product.merchantName)).size} verified merchants
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping To:</span>
                <span className="text-slate-800 font-medium">
                  {completedOrder.shippingAddress.street}, {completedOrder.shippingAddress.city}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Method:</span>
                <span className="text-slate-800 font-medium">{completedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold pt-2 border-t border-slate-200 text-sm">
                <span>Total Paid:</span>
                <span className="text-blue-900 font-black tabular-nums">
                  ${completedOrder.total.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-[#0B1B3D] text-white font-bold text-sm hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Guest Banner if not signed in */}
            {!currentUser && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-amber-900 block">
                    Checking out as Guest
                  </span>
                  <span className="text-amber-800 text-[11px]">
                    Sign in to track points and apply wallet balances.
                  </span>
                </div>
                {onOpenAuthModal && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAuthModal();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#0B1B3D] text-white font-bold text-xs hover:bg-slate-800 transition-colors flex items-center gap-1 shrink-0"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            )}

            {/* Step 1: Shipping Address */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-600" />
                <span>1. Shipping Destination</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-600 font-medium mb-1">Street Address</label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>2. Select Payment Method</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Option 1: SNL Wallet (only if user logged in & balance > 0) */}
                {currentUser && (wallet?.cashbackBalance || 0) > 0 && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wallet')}
                    className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      paymentMethod === 'wallet'
                        ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">
                        SNL Cashback Wallet
                      </span>
                      <span className="text-[11px] text-emerald-700 font-semibold tabular-nums">
                        Balance: ${(wallet?.cashbackBalance || 0).toFixed(2)}
                      </span>
                    </div>
                  </button>
                )}

                {/* Option 2: Credit Card */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Credit / Debit Card</span>
                    <span className="text-[11px] text-slate-500">Visa, Mastercard, Amex</span>
                  </div>
                </button>

                {/* Option 3: Cash on Delivery */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">Cash on Delivery</span>
                    <span className="text-[11px] text-slate-500">Pay when order arrives</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Step 3: Breakdown & Rewards */}
            <div className="bg-slate-50 rounded-2xl p-4 text-xs space-y-2 border border-slate-200">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({cartItems.length} items)</span>
                <span className="tabular-nums font-semibold text-slate-800">${subtotal.toFixed(2)}</span>
              </div>
              {pointsDiscount > 0 && (
                <div className="flex justify-between text-amber-700 font-semibold">
                  <span>SNL Points Discount ({pointsToRedeem} pts)</span>
                  <span className="tabular-nums">-${pointsDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-slate-800">
                  {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t border-slate-200">
                <span>Total Due</span>
                <span className="text-[#0B1B3D] text-base tabular-nums">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="w-full py-3.5 px-4 rounded-xl bg-[#0B1B3D] hover:bg-[#152a5a] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Securing Order...</span>
              ) : (
                <>
                  <span>Complete Order & Claim ${cashbackEarned.toFixed(2)} Cashback</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

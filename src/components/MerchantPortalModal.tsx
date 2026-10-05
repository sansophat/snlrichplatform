import React, { useState } from 'react';
import {
  X,
  Store,
  Plus,
  Package,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  CheckCircle,
  Clock,
  Layers,
  ShieldAlert,
  LogIn,
} from 'lucide-react';
import { Merchant, Product, RegisteredUser } from '../types';

interface MerchantPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchants: Merchant[];
  products: Product[];
  currentUser: RegisteredUser | null;
  onAddProduct: (newProduct: Product) => void;
  onOpenAdminPanel?: () => void;
  onOpenAuthModal?: () => void;
}

export const MerchantPortalModal: React.FC<MerchantPortalModalProps> = ({
  isOpen,
  onClose,
  merchants,
  products,
  currentUser,
  onAddProduct,
  onOpenAdminPanel,
  onOpenAuthModal,
}) => {
  const [selectedMerchantId, setSelectedMerchantId] = useState(
    currentUser?.merchantId || merchants[0]?.id || 'm1'
  );
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'add_product' | 'orders'>('dashboard');

  // Form State for Add Product
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Electronics');
  const [formPrice, setFormPrice] = useState('');
  const [formStock, setFormStock] = useState('50');
  const [formCashbackRate, setFormCashbackRate] = useState('10');
  const [formImage, setFormImage] = useState('https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80');
  const [formDescription, setFormDescription] = useState('');
  const [productAddedSuccess, setProductAddedSuccess] = useState(false);

  if (!isOpen) return null;

  const isAuthorizedMerchantOrAdmin =
    currentUser?.role === 'merchant' || currentUser?.role === 'admin';

  const currentMerchant =
    merchants.find((m) => m.id === selectedMerchantId) || merchants[0];
  const merchantProducts = products.filter(
    (p) => p.merchantId === currentMerchant?.id
  );

  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(formPrice);
    if (!formTitle || isNaN(priceNum) || priceNum <= 0 || !currentMerchant) return;

    const cashbackPct = parseFloat(formCashbackRate) || 10;
    const cashbackVal = (priceNum * cashbackPct) / 100;
    const points = Math.round(priceNum);

    const newProd: Product = {
      id: `p_custom_${Date.now()}`,
      title: formTitle,
      category: formCategory,
      price: priceNum,
      rating: 5.0,
      reviewsCount: 1,
      merchantId: currentMerchant.id,
      merchantName: currentMerchant.name,
      image: formImage,
      description: formDescription || 'Premium verified merchant merchandise on SNL RICH.',
      pointsEarned: points,
      cashbackAmount: cashbackVal,
      stock: parseInt(formStock) || 25,
      inStock: true,
      tags: [formCategory, 'Merchant Featured'],
    };

    onAddProduct(newProd);
    setProductAddedSuccess(true);
    setFormTitle('');
    setFormPrice('');
    setFormDescription('');
    setTimeout(() => {
      setProductAddedSuccess(false);
      setActiveTab('inventory');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Navy Header */}
        <div className="bg-[#0B1B3D] text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-display">
                  SNL RICH Merchant Partner Center
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Seller Portal
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Manage inventory, live cashback offers, and order fulfillment across the platform
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice for Guests or Customers */}
        {!isAuthorizedMerchantOrAdmin ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-bold text-slate-900">
                Merchant Accounts Are Created by Admin Only
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                To guarantee authenticity and protect consumers, merchant accounts on SNL RICH cannot be self-registered. Only platform administrators can onboard and authorize new merchant partners.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {onOpenAdminPanel && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAdminPanel();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0B1B3D] text-white font-bold text-xs hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>Open Admin Panel (Create Merchant)</span>
                </button>
              )}

              {onOpenAuthModal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAuthModal();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4 text-blue-600" />
                  <span>Sign In with Merchant Credentials</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Merchant Selector & Tabs */}
            <div className="bg-slate-100 p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Active Merchant Switcher */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Managing Merchant:</span>
                <select
                  value={selectedMerchantId}
                  onChange={(e) => setSelectedMerchantId(e.target.value)}
                  className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
                >
                  {merchants.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Analytics
                </button>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                    activeTab === 'inventory'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Inventory ({merchantProducts.length})
                </button>
                <button
                  onClick={() => setActiveTab('add_product')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                    activeTab === 'add_product'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {/* Body Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Tab 1: Dashboard Analytics */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* Stat Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] text-slate-500 block font-medium">Today's Sales (GMV)</span>
                      <span className="text-xl font-black text-slate-900 tabular-nums">$3,840.50</span>
                      <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">+14.2% vs yesterday</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200">
                      <span className="text-[11px] text-emerald-800 block font-medium">Net Payout (92%)</span>
                      <span className="text-xl font-black text-emerald-700 tabular-nums">$3,533.26</span>
                      <span className="text-[10px] text-slate-500 font-medium block mt-0.5">8% Platform Take</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200">
                      <span className="text-[11px] text-blue-800 block font-medium">Units Dispatched</span>
                      <span className="text-xl font-black text-blue-700 tabular-nums">48 orders</span>
                      <span className="text-[10px] text-blue-600 font-bold block mt-0.5">Avg Rating: 4.9★</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200">
                      <span className="text-[11px] text-amber-800 block font-medium">Cashback Funded</span>
                      <span className="text-xl font-black text-amber-700 tabular-nums">
                        {currentMerchant.cashbackRate}%
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium block mt-0.5">Draws high-value shoppers</span>
                    </div>
                  </div>

                  {/* Commission & Settlement Overview */}
                  <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50 text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>Merchant Settlement Agreement</span>
                      <span className="text-emerald-700">Verified Partner Tier 1</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      SNL RICH settles multi-merchant payouts every 48 hours directly to your merchant account. Platform takes a transparent 8% commission on fulfilled transactions, covering payment gateway fees, fraud liability, and hosting.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 2: Inventory */}
              {activeTab === 'inventory' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Active Products for {currentMerchant.name}
                    </h3>
                    <span className="text-xs text-slate-500">
                      {merchantProducts.length} items in marketplace catalog
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-white overflow-hidden text-xs">
                    {merchantProducts.map((p) => (
                      <div key={p.id} className="p-3.5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.title}
                            className="w-12 h-12 object-contain bg-slate-50 p-1 rounded-lg border border-slate-100 shrink-0"
                          />
                          <div>
                            <h4 className="font-bold text-slate-900">{p.title}</h4>
                            <div className="flex items-center gap-2 text-slate-500 text-[11px] mt-0.5">
                              <span>{p.category}</span>
                              <span>·</span>
                              <span>Stock: {p.stock} units</span>
                              <span>·</span>
                              <span className="text-emerald-600 font-semibold">
                                ${p.cashbackAmount.toFixed(2)} Cashback
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-black text-slate-900 text-sm block tabular-nums">
                            ${p.price.toFixed(2)}
                          </span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Add New Product Form */}
              {activeTab === 'add_product' && (
                <form onSubmit={handleSubmitProduct} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 text-xs">
                    <h4 className="font-bold text-blue-900">List a New Product on SNL RICH</h4>
                    <p className="text-blue-700 mt-0.5">
                      Your product will be instantly indexed and available with automatic cashback calculations for shoppers.
                    </p>
                  </div>

                  {productAddedSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Product published successfully to SNL RICH marketplace!</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Product Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ultra-Light Carbon Fiber Sunglasses"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Category</label>
                      <select
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                      >
                        <option value="Electronics">Electronics</option>
                        <option value="Women's Fashion">Women's Fashion</option>
                        <option value="Men's Fashion">Men's Fashion</option>
                        <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                        <option value="Home & Living">Home & Living</option>
                        <option value="Sports & Outdoors">Sports & Outdoors</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Price ($USD)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        step="0.01"
                        placeholder="e.g. 59.99"
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Initial Stock Count</label>
                      <input
                        type="number"
                        min="1"
                        value={formStock}
                        onChange={(e) => setFormStock(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Cashback Offer (%)</label>
                      <input
                        type="number"
                        min="5"
                        max="30"
                        value={formCashbackRate}
                        onChange={(e) => setFormCashbackRate(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Product Image URL</label>
                      <input
                        type="url"
                        value={formImage}
                        onChange={(e) => setFormImage(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 font-bold mb-1">Product Description</label>
                      <textarea
                        rows={2}
                        placeholder="Describe craftsmanship, materials, and warranty..."
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#0B1B3D] hover:bg-[#152a5a] text-white font-bold text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
                  >
                    Publish Product to SNL RICH Marketplace
                  </button>
                </form>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

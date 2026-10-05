import React, { useState } from 'react';
import {
  X,
  Store,
  Users,
  Package,
  DollarSign,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Coins,
  Settings,
  Search,
  Filter,
  LayoutDashboard,
  Palette,
  Sliders,
  Phone,
  Tag,
  ShieldCheck,
  Flame,
  Clock,
  Sparkles,
  ArrowRight,
  LogOut,
  Building,
  PlusCircle,
  ShoppingBag,
  ExternalLink,
  Edit3,
  TrendingUp,
  Receipt,
  Mail,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { SnlLogo } from './SnlLogo';
import {
  Merchant,
  Product,
  RegisteredUser,
  WithdrawalRequest,
  PlatformConfig,
  Order,
} from '../types';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchants: Merchant[];
  products: Product[];
  users: RegisteredUser[];
  withdrawals: WithdrawalRequest[];
  orders: Order[];
  platformConfig: PlatformConfig;
  onCreateMerchant: (newMerchant: Merchant) => void;
  onUpdateMerchant: (updatedMerchant: Merchant) => void;
  onUpdateMerchantStatus: (merchantId: string, status: 'active' | 'suspended') => void;
  onDeleteMerchantWithCascade: (merchantId: string) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateProductStock: (productId: string, newStock: number) => void;
  onUpdateProductPrice: (productId: string, newPrice: number) => void;
  onAddProduct: (newProduct: Product) => void;
  onUpdateUserStatus: (userId: string, status: 'active' | 'suspended') => void;
  onAdjustUserPoints: (userId: string, deltaPoints: number) => void;
  onAdjustUserCashback: (userId: string, deltaCashback: number) => void;
  onProcessWithdrawal: (withdrawalId: string, status: 'approved' | 'rejected') => void;
  onUpdateOrderStatus: (orderId: string, status: 'Processing' | 'Shipped' | 'Delivered') => void;
  onUpdatePlatformConfig: (config: PlatformConfig) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  merchants,
  products,
  users,
  withdrawals,
  orders,
  platformConfig,
  onCreateMerchant,
  onUpdateMerchant,
  onUpdateMerchantStatus,
  onDeleteMerchantWithCascade,
  onDeleteProduct,
  onUpdateProductStock,
  onUpdateProductPrice,
  onAddProduct,
  onUpdateUserStatus,
  onAdjustUserPoints,
  onAdjustUserCashback,
  onProcessWithdrawal,
  onUpdateOrderStatus,
  onUpdatePlatformConfig,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'dashboard'
    | 'merchants'
    | 'create_merchant'
    | 'products'
    | 'orders'
    | 'users'
    | 'withdrawals'
    | 'branding'
    | 'settings'
  >('dashboard');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [merchantStatusFilter, setMerchantStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [selectedMerchantFilter, setSelectedMerchantFilter] = useState<string>('all');

  // Merchant edit modal state
  const [editingMerchant, setEditingMerchant] = useState<Merchant | null>(null);

  // Cascading Deletion confirmation modal state
  const [confirmDeleteMerchant, setConfirmDeleteMerchant] = useState<Merchant | null>(null);

  // Form State for Admin-only Merchant Creation
  const [merchantName, setMerchantName] = useState('');
  const [merchantCategory, setMerchantCategory] = useState("Women's Fashion");
  const [merchantCashback, setMerchantCashback] = useState('12');
  const [merchantMultiplier, setMerchantMultiplier] = useState('2.0');
  const [merchantLocation, setMerchantLocation] = useState('New York, USA');
  const [merchantDescription, setMerchantDescription] = useState('');
  const [merchantOwnerEmail, setMerchantOwnerEmail] = useState('');
  const [merchantLogo, setMerchantLogo] = useState(
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=120&q=80'
  );
  const [merchantCover, setMerchantCover] = useState(
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80'
  );
  const [createSuccessMsg, setCreateSuccessMsg] = useState(false);

  // Admin Add Product Form State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProdTitle, setNewProdTitle] = useState('');
  const [newProdMerchantId, setNewProdMerchantId] = useState(merchants[0]?.id || '');
  const [newProdCategory, setNewProdCategory] = useState("Women's Fashion");
  const [newProdPrice, setNewProdPrice] = useState('89.00');
  const [newProdOrigPrice, setNewProdOrigPrice] = useState('120.00');
  const [newProdStock, setNewProdStock] = useState('25');
  const [newProdImage, setNewProdImage] = useState('https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80');
  const [newProdDesc, setNewProdDesc] = useState('');

  // Branding Settings Form State
  const [brandName, setBrandName] = useState(platformConfig.brandName);
  const [brandTagline, setBrandTagline] = useState(platformConfig.brandTagline);
  const [supportPhone, setSupportPhone] = useState(platformConfig.supportPhone);
  const [supportEmail, setSupportEmail] = useState(platformConfig.supportEmail || 'support@snlrich.com');
  const [announcementText, setAnnouncementText] = useState(platformConfig.announcementText);
  const [heroHeadline, setHeroHeadline] = useState(platformConfig.heroHeadline);
  const [heroSubhead, setHeroSubhead] = useState(platformConfig.heroSubhead);
  const [brandingSuccess, setBrandingSuccess] = useState(false);

  // Policy & Controls Settings Form State
  const [commissionRate, setCommissionRate] = useState(platformConfig.platformCommissionRate.toString());
  const [refCash, setRefCash] = useState(platformConfig.referralCashReward.toString());
  const [refPoints, setRefPoints] = useState(platformConfig.referralPointsReward.toString());
  const [welcomePoints, setWelcomePoints] = useState(platformConfig.welcomeBonusPoints.toString());
  const [pointsRate, setPointsRate] = useState(platformConfig.pointsToDollarRate.toString());
  const [minWithdrawal, setMinWithdrawal] = useState(platformConfig.minimumWithdrawalAmount.toString());
  const [allowRegistration, setAllowRegistration] = useState(platformConfig.allowCustomerRegistrations);
  const [maintenanceMode, setMaintenanceMode] = useState(platformConfig.maintenanceMode || false);
  const [enableWalletPayment, setEnableWalletPayment] = useState(platformConfig.enableWalletPayment ?? true);
  const [enableCodPayment, setEnableCodPayment] = useState(platformConfig.enableCodPayment ?? true);
  const [autoApproveProducts, setAutoApproveProducts] = useState(platformConfig.autoApproveProducts ?? true);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // User Adjustment modal state
  const [adjustingUser, setAdjustingUser] = useState<RegisteredUser | null>(null);
  const [adjustPointsDelta, setAdjustPointsDelta] = useState('200');
  const [adjustCashbackDelta, setAdjustCashbackDelta] = useState('10.00');

  if (!isOpen) return null;

  // Key Aggregated Platform Metrics
  const totalGMV = orders.reduce((acc, o) => acc + o.total, 0) + 148920.0;
  const platformCommissionEarned = (totalGMV * platformConfig.platformCommissionRate) / 100;
  const totalCashbackDistributed = 16340.5 + orders.reduce((acc, o) => acc + o.cashbackEarned, 0);
  const totalPointsCirculating = users.reduce((acc, u) => acc + u.pointsBalance, 0);
  const pendingWithdrawalCount = withdrawals.filter((w) => w.status === 'pending').length;

  // Filtered Merchants
  const filteredMerchants = merchants.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      merchantStatusFilter === 'all' || m.status === merchantStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMerchant =
      selectedMerchantFilter === 'all' || p.merchantId === selectedMerchantFilter;
    return matchesSearch && matchesMerchant;
  });

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    return (
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.referralCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Handle Merchant Creation
  const handleCreateMerchantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchantName || !merchantCategory) return;

    const slug = merchantName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const newMerchant: Merchant = {
      id: `m_${Date.now()}`,
      name: merchantName.trim(),
      slug,
      logo: merchantLogo,
      coverImage: merchantCover,
      category: merchantCategory,
      rating: 5.0,
      reviewCount: 0,
      verified: true,
      cashbackRate: parseFloat(merchantCashback) || 10,
      pointsMultiplier: parseFloat(merchantMultiplier) || 1.5,
      location: merchantLocation,
      description:
        merchantDescription ||
        'Verified multi-merchant boutique curated on SNL RICH.',
      totalSales: 0,
      joinedDate: 'Oct 2026',
      status: 'active',
      ownerEmail: merchantOwnerEmail || `${slug}@merchant.snlrich.com`,
    };

    onCreateMerchant(newMerchant);
    setCreateSuccessMsg(true);
    setMerchantName('');
    setMerchantDescription('');
    setMerchantOwnerEmail('');
    setTimeout(() => {
      setCreateSuccessMsg(false);
      setActiveTab('merchants');
    }, 1200);
  };

  // Handle Admin Add Product
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdTitle || !newProdPrice) return;
    const targetMerchant = merchants.find((m) => m.id === newProdMerchantId) || merchants[0];
    const priceNum = parseFloat(newProdPrice) || 50;
    const cbRate = targetMerchant ? targetMerchant.cashbackRate : 10;
    const ptsMult = targetMerchant ? targetMerchant.pointsMultiplier : 1.5;

    const newProd: Product = {
      id: `p_${Date.now()}`,
      title: newProdTitle.trim(),
      category: newProdCategory,
      price: priceNum,
      originalPrice: parseFloat(newProdOrigPrice) || priceNum * 1.25,
      rating: 5.0,
      reviewsCount: 1,
      merchantId: targetMerchant.id,
      merchantName: targetMerchant.name,
      image: newProdImage,
      description: newProdDesc || `${newProdTitle} provided by ${targetMerchant.name}. Premium quality guaranteed.`,
      pointsEarned: Math.round(priceNum * 2 * ptsMult),
      cashbackAmount: parseFloat(((priceNum * cbRate) / 100).toFixed(2)),
      stock: parseInt(newProdStock) || 20,
      inStock: true,
      tags: ['Verified Brand', 'Fast Shipping'],
      badge: 'NEW',
    };

    onAddProduct(newProd);
    setIsAddProductOpen(false);
    setNewProdTitle('');
    setNewProdDesc('');
  };

  // Save Branding Updates
  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePlatformConfig({
      ...platformConfig,
      brandName,
      brandTagline,
      supportPhone,
      supportEmail,
      announcementText,
      heroHeadline,
      heroSubhead,
    });
    setBrandingSuccess(true);
    setTimeout(() => setBrandingSuccess(false), 2500);
  };

  // Save Platform Policies & Controls
  const handleSavePlatformSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePlatformConfig({
      ...platformConfig,
      platformCommissionRate: parseFloat(commissionRate) || 8,
      referralCashReward: parseFloat(refCash) || 15,
      referralPointsReward: parseInt(refPoints) || 500,
      welcomeBonusPoints: parseInt(welcomePoints) || 200,
      pointsToDollarRate: parseInt(pointsRate) || 100,
      minimumWithdrawalAmount: parseFloat(minWithdrawal) || 10,
      allowCustomerRegistrations: allowRegistration,
      maintenanceMode,
      enableWalletPayment,
      enableCodPayment,
      autoApproveProducts,
    });
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 2500);
  };

  // Save Edited Merchant
  const handleSaveMerchantEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMerchant) return;
    onUpdateMerchant(editingMerchant);
    setEditingMerchant(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full h-[95vh] max-w-7xl bg-white rounded-3xl shadow-2xl flex overflow-hidden border border-slate-700/60 animate-in zoom-in-95 duration-200">
        {/* ================= LEFT SIDEBAR ================= */}
        <aside className="w-64 bg-[#0A182E] text-slate-300 flex flex-col justify-between shrink-0 border-r border-slate-800 select-none">
          {/* Top Brand & Title */}
          <div>
            <div className="p-4 border-b border-slate-800/80">
              <SnlLogo size="sm" variant="light" showTagline={false} />
              <div className="mt-2.5 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  ADMIN CONSOLE
                </span>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active
                </span>
              </div>
            </div>

            {/* Sidebar Navigation Links */}
            <div className="p-3 space-y-4 overflow-y-auto max-h-[calc(95vh-180px)] text-xs font-semibold">
              {/* Category 1: Overview */}
              <div>
                <span className="px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                  Overview
                </span>
                <nav className="space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab('dashboard');
                      setSearchTerm('');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                      activeTab === 'dashboard'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Executive Dashboard</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('orders');
                      setSearchTerm('');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                      activeTab === 'orders'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Receipt className="w-4 h-4" />
                      <span>Platform Orders</span>
                    </div>
                    <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full">
                      {orders.length}
                    </span>
                  </button>
                </nav>
              </div>

              {/* Category 2: Merchants & Catalog */}
              <div>
                <span className="px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                  Merchants & Catalog
                </span>
                <nav className="space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab('merchants');
                      setSearchTerm('');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                      activeTab === 'merchants'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Store className="w-4 h-4" />
                      <span>Merchant Hub</span>
                    </div>
                    <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full">
                      {merchants.length}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('create_merchant');
                      setSearchTerm('');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                      activeTab === 'create_merchant'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                        : 'text-amber-300 hover:bg-amber-500/10'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <PlusCircle className="w-4 h-4" />
                      <span>Onboard Merchant</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.2 rounded bg-amber-400 text-slate-950">
                      Admin
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('products');
                      setSearchTerm('');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                      activeTab === 'products'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Package className="w-4 h-4" />
                      <span>Product Catalog</span>
                    </div>
                    <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full">
                      {products.length}
                    </span>
                  </button>
                </nav>
              </div>

              {/* Category 3: Users & Rewards */}
              <div>
                <span className="px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                  Users & Rewards
                </span>
                <nav className="space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab('users');
                      setSearchTerm('');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                      activeTab === 'users'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4" />
                      <span>Customer Accounts</span>
                    </div>
                    <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full">
                      {users.length}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('withdrawals');
                      setSearchTerm('');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                      activeTab === 'withdrawals'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <DollarSign className="w-4 h-4" />
                      <span>Payout Requests</span>
                    </div>
                    {pendingWithdrawalCount > 0 && (
                      <span className="text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                        {pendingWithdrawalCount}
                      </span>
                    )}
                  </button>
                </nav>
              </div>

              {/* Category 4: System Governance & Settings */}
              <div>
                <span className="px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                  Governance & Controls
                </span>
                <nav className="space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab('branding');
                      setSearchTerm('');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                      activeTab === 'branding'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Palette className="w-4 h-4" />
                      <span>Branding & Identity</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setSearchTerm('');
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                      activeTab === 'settings'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sliders className="w-4 h-4" />
                      <span>Platform Policies</span>
                    </div>
                  </button>
                </nav>
              </div>
            </div>
          </div>

          {/* Bottom Sidebar User Info */}
          <div className="p-3 border-t border-slate-800/80 bg-slate-900/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs shrink-0">
                  AD
                </div>
                <div className="min-w-0 truncate">
                  <span className="text-xs font-bold text-white block truncate">
                    Platform Admin
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono truncate block">
                    admin@snlrich.com
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title="Exit to Storefront"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* ================= MAIN CONTENT PANE ================= */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
          {/* Header Bar */}
          <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <h2 className="text-base font-bold text-slate-900 font-display truncate">
                {activeTab === 'dashboard' && 'Executive Analytics & Performance'}
                {activeTab === 'orders' && 'Multi-Merchant Orders & Transactions'}
                {activeTab === 'merchants' && 'Merchant Partner Storefronts'}
                {activeTab === 'create_merchant' && 'Onboard New Verified Merchant'}
                {activeTab === 'products' && 'Marketplace Product Inventory'}
                {activeTab === 'users' && 'Customer Loyalty & User Accounts'}
                {activeTab === 'withdrawals' && 'Cashback Payout Authorizations'}
                {activeTab === 'branding' && 'Brand Assets & Marketplace Identity'}
                {activeTab === 'settings' && 'Platform Policies & Financial Controls'}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {/* Search Bar for data tables */}
              {['merchants', 'products', 'users'].includes(activeTab) && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-48 sm:w-64 pl-8 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 bg-slate-50"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ×
                    </button>
                  )}
                </div>
              )}

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                title="Close Admin Panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Tab Views Scroll Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* 1. EXECUTIVE DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Metric Cards Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                      <span>Total Marketplace GMV</span>
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-xl font-bold font-display text-slate-900">
                      ${totalGMV.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                      <span>+14.8% vs last month</span>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                      <span>SNL Commission ({platformConfig.platformCommissionRate}%)</span>
                      <DollarSign className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-xl font-bold font-display text-blue-700">
                      ${platformCommissionEarned.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">Platform net earnings</div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                      <span>Cashback Distributed</span>
                      <Coins className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-xl font-bold font-display text-amber-600">
                      ${totalCashbackDistributed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {totalPointsCirculating.toLocaleString()} circulating points
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                      <span>Active Verified Merchants</span>
                      <Store className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="text-xl font-bold font-display text-purple-700">
                      {merchants.length} Brands
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {products.length} catalog items across {users.length} users
                    </div>
                  </div>
                </div>

                {/* Quick Action Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0B1B3D] to-[#1a3672] text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">Administrative Management Hub</h3>
                      <p className="text-xs text-slate-300">
                        Authoritative control over multi-merchant stores, live product pricing, cashback disbursement, and branding.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('create_merchant')}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Onboard Merchant</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('settings')}
                      className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Platform Policies
                    </button>
                  </div>
                </div>

                {/* Merchants Performance & Recent Orders split */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Merchants Leaderboard */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-slate-900">
                        Top Merchant Stores by Sales
                      </h3>
                      <button
                        onClick={() => setActiveTab('merchants')}
                        className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        View All
                      </button>
                    </div>

                    <div className="space-y-3">
                      {merchants.slice(0, 5).map((m, idx) => {
                        const mProducts = products.filter((p) => p.merchantId === m.id);
                        return (
                          <div
                            key={m.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-slate-400 w-4">
                                #{idx + 1}
                              </span>
                              <img
                                src={m.logo}
                                alt={m.name}
                                className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                              />
                              <div>
                                <span className="font-bold text-slate-900 text-xs block">
                                  {m.name}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {m.category} · {mProducts.length} items
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="font-bold text-xs text-slate-900 block">
                                ${((idx + 1) * 8420).toLocaleString()}
                              </span>
                              <span className="text-[10px] text-emerald-600 font-bold">
                                {m.cashbackRate}% cashback
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recent Platform Orders Preview */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-slate-900">
                        Recent Platform Orders ({orders.length})
                      </h3>
                      <button
                        onClick={() => setActiveTab('orders')}
                        className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Manage Orders
                      </button>
                    </div>

                    <div className="space-y-3">
                      {orders.slice(0, 4).map((ord) => (
                        <div
                          key={ord.id}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{ord.id}</span>
                              <span
                                className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                                  ord.status === 'Delivered'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : ord.status === 'Shipped'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {ord.status}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 mt-0.5 block">
                              {ord.shippingAddress.fullName} · {ord.items.length} item(s)
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="font-bold text-slate-900 block">
                              ${ord.total.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-amber-600 font-bold">
                              +${ord.cashbackEarned.toFixed(2)} CB
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. MERCHANT HUB (With Cascading Product Deletion) */}
            {activeTab === 'merchants' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Merchant Storefronts ({filteredMerchants.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Deleting any merchant cascades and permanently purges all its products from the marketplace, carts, and wishlists.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={merchantStatusFilter}
                      onChange={(e) => setMerchantStatusFilter(e.target.value as any)}
                      className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none"
                    >
                      <option value="all">All Statuses</option>
                      <option value="active">Active Only</option>
                      <option value="suspended">Suspended</option>
                    </select>

                    <button
                      onClick={() => setActiveTab('create_merchant')}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0B1B3D] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer hover:bg-slate-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Onboard Merchant</span>
                    </button>
                  </div>
                </div>

                {/* Merchants Table */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white text-xs shadow-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                      <tr>
                        <th className="p-3.5">Merchant Brand</th>
                        <th className="p-3.5">Category</th>
                        <th className="p-3.5">Products</th>
                        <th className="p-3.5">Cashback Rate</th>
                        <th className="p-3.5">Multiplier</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredMerchants.map((m) => {
                        const merchantProducts = products.filter(
                          (p) =>
                            p.merchantId === m.id ||
                            p.merchantSlug === m.slug ||
                            p.merchantName.toLowerCase() === m.name.toLowerCase()
                        );
                        return (
                          <tr key={m.id} className="hover:bg-slate-50/70">
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                <img
                                  src={m.logo}
                                  alt={m.name}
                                  className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                                />
                                <div>
                                  <span className="font-bold text-slate-900 block flex items-center gap-1">
                                    {m.name}
                                    {m.verified && (
                                      <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                                    )}
                                  </span>
                                  <span className="text-[10px] text-slate-400">{m.location}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-3.5 text-slate-700 font-medium">{m.category}</td>
                            <td className="p-3.5 font-bold text-slate-800">
                              <button
                                onClick={() => {
                                  setSelectedMerchantFilter(m.id);
                                  setActiveTab('products');
                                }}
                                className="text-blue-600 hover:underline cursor-pointer"
                              >
                                {merchantProducts.length} items
                              </button>
                            </td>
                            <td className="p-3.5 font-extrabold text-emerald-700">{m.cashbackRate}%</td>
                            <td className="p-3.5 font-extrabold text-amber-700">{m.pointsMultiplier}x</td>
                            <td className="p-3.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  m.status === 'active'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {m.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                onClick={() => setEditingMerchant(m)}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors cursor-pointer"
                                title="Edit Merchant"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() =>
                                  onUpdateMerchantStatus(
                                    m.id,
                                    m.status === 'active' ? 'suspended' : 'active'
                                  )
                                }
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                                  m.status === 'active'
                                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                                }`}
                              >
                                {m.status === 'active' ? 'Suspend' : 'Activate'}
                              </button>

                              <button
                                onClick={() => setConfirmDeleteMerchant(m)}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold transition-colors cursor-pointer"
                                title="Delete merchant and purge all products"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Cascading Deletion Confirmation Modal */}
                {confirmDeleteMerchant && (
                  <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
                      <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6" />
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          Confirm Merchant & Products Purge?
                        </h3>
                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                          Are you sure you want to permanently delete{' '}
                          <strong className="text-slate-900 font-bold">{confirmDeleteMerchant.name}</strong>?
                        </p>

                        {/* Explicit details of cascading items */}
                        <div className="mt-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-2">
                          <div className="font-bold flex items-center gap-1.5 text-rose-800">
                            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>Cascading Permanent Deletion Notice</span>
                          </div>
                          <p className="text-[11px] text-slate-700 leading-normal">
                            All{' '}
                            <strong>
                              {
                                products.filter(
                                  (p) =>
                                    p.merchantId === confirmDeleteMerchant.id ||
                                    p.merchantSlug === confirmDeleteMerchant.slug ||
                                    p.merchantName.toLowerCase() === confirmDeleteMerchant.name.toLowerCase()
                                ).length
                              }
                            </strong>{' '}
                            products published by this merchant will be permanently purged from the marketplace catalog.
                          </p>
                          <p className="text-[11px] text-slate-700 leading-normal">
                            Any existing items from this merchant in active customer shopping carts or wishlists will also be automatically removed.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteMerchant(null)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteMerchantWithCascade(confirmDeleteMerchant.id);
                            setConfirmDeleteMerchant(null);
                          }}
                          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                        >
                          Delete Merchant & Purge All Products
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Edit Merchant Details Modal */}
                {editingMerchant && (
                  <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
                    <form
                      onSubmit={handleSaveMerchantEdit}
                      className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 text-xs"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="text-sm font-bold text-slate-900">
                          Edit Merchant: {editingMerchant.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() => setEditingMerchant(null)}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Brand Name</label>
                          <input
                            type="text"
                            value={editingMerchant.name}
                            onChange={(e) =>
                              setEditingMerchant({ ...editingMerchant, name: e.target.value })
                            }
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Category</label>
                          <input
                            type="text"
                            value={editingMerchant.category}
                            onChange={(e) =>
                              setEditingMerchant({ ...editingMerchant, category: e.target.value })
                            }
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Cashback Rate (%)</label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={editingMerchant.cashbackRate}
                            onChange={(e) =>
                              setEditingMerchant({
                                ...editingMerchant,
                                cashbackRate: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Points Multiplier (x)</label>
                          <input
                            type="number"
                            step="0.1"
                            min="1"
                            max="5"
                            value={editingMerchant.pointsMultiplier}
                            onChange={(e) =>
                              setEditingMerchant({
                                ...editingMerchant,
                                pointsMultiplier: parseFloat(e.target.value) || 1,
                              })
                            }
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-slate-700 font-bold mb-1">Location</label>
                          <input
                            type="text"
                            value={editingMerchant.location}
                            onChange={(e) =>
                              setEditingMerchant({ ...editingMerchant, location: e.target.value })
                            }
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-slate-700 font-bold mb-1">Merchant Description</label>
                          <textarea
                            rows={2}
                            value={editingMerchant.description}
                            onChange={(e) =>
                              setEditingMerchant({ ...editingMerchant, description: e.target.value })
                            }
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setEditingMerchant(null)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* 3. ONBOARD MERCHANT FORM (Admin Exclusive) */}
            {activeTab === 'create_merchant' && (
              <form
                onSubmit={handleCreateMerchantSubmit}
                className="space-y-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs"
              >
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <span className="font-bold block">Admin-Exclusive Multi-Merchant Provisioning</span>
                  <span>
                    Only administrators can authorize and create verified merchant stores on SNL RICH. Guests can register as customers, while merchants must be onboarded here.
                  </span>
                </div>

                {createSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Merchant created successfully and provisioned to marketplace!</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Merchant Business Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Atelier Milan Fine Jewelry"
                      value={merchantName}
                      onChange={(e) => setMerchantName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Primary Category</label>
                    <select
                      value={merchantCategory}
                      onChange={(e) => setMerchantCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                    >
                      <option value="Women's Fashion">Women's Fashion</option>
                      <option value="Men's Fashion">Men's Fashion</option>
                      <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Home & Living">Home & Living</option>
                      <option value="Sports & Outdoors">Sports & Outdoors</option>
                      <option value="Automotive">Automotive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Agreed Cashback Rate (%)</label>
                    <input
                      type="number"
                      min="5"
                      max="30"
                      value={merchantCashback}
                      onChange={(e) => setMerchantCashback(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Points Multiplier (e.g. 1.5x, 2.0x)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="5.0"
                      value={merchantMultiplier}
                      onChange={(e) => setMerchantMultiplier(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Merchant Location</label>
                    <input
                      type="text"
                      value={merchantLocation}
                      onChange={(e) => setMerchantLocation(e.target.value)}
                      placeholder="e.g. Paris, France"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Merchant Contact Email</label>
                    <input
                      type="email"
                      value={merchantOwnerEmail}
                      onChange={(e) => setMerchantOwnerEmail(e.target.value)}
                      placeholder="e.g. contact@merchantbrand.com"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Logo URL</label>
                    <input
                      type="url"
                      value={merchantLogo}
                      onChange={(e) => setMerchantLogo(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Cover Image URL</label>
                    <input
                      type="url"
                      value={merchantCover}
                      onChange={(e) => setMerchantCover(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">Merchant Bio & Craftsmanship</label>
                    <textarea
                      rows={2}
                      value={merchantDescription}
                      onChange={(e) => setMerchantDescription(e.target.value)}
                      placeholder="Describe craftsmanship, shipping policies, warranty..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#0B1B3D] hover:bg-[#152a5a] text-white font-bold text-xs sm:text-sm shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>Create & Authorize Verified Merchant Store</span>
                </button>
              </form>
            )}

            {/* 4. PRODUCTS & CATALOG */}
            {activeTab === 'products' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Product Catalog ({filteredProducts.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Manage marketplace inventory, pricing, stock levels, and rewards attribution.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedMerchantFilter}
                      onChange={(e) => setSelectedMerchantFilter(e.target.value)}
                      className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none"
                    >
                      <option value="all">All Merchants</option>
                      {merchants.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => setIsAddProductOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#0B1B3D] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer hover:bg-slate-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Product</span>
                    </button>
                  </div>
                </div>

                {/* Add Product Modal */}
                {isAddProductOpen && (
                  <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
                    <form
                      onSubmit={handleAddProductSubmit}
                      className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 text-xs"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="text-sm font-bold text-slate-900">Publish New Product to Catalog</h3>
                        <button
                          type="button"
                          onClick={() => setIsAddProductOpen(false)}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                          <label className="block text-slate-700 font-bold mb-1">Product Title</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Classic Silk Button-Down Shirt"
                            value={newProdTitle}
                            onChange={(e) => setNewProdTitle(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Assign Merchant</label>
                          <select
                            value={newProdMerchantId}
                            onChange={(e) => setNewProdMerchantId(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                          >
                            {merchants.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Category</label>
                          <select
                            value={newProdCategory}
                            onChange={(e) => setNewProdCategory(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                          >
                            <option value="Women's Fashion">Women's Fashion</option>
                            <option value="Men's Fashion">Men's Fashion</option>
                            <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Home & Living">Home & Living</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Price ($USD)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="1"
                            required
                            value={newProdPrice}
                            onChange={(e) => setNewProdPrice(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Stock Units</label>
                          <input
                            type="number"
                            min="0"
                            value={newProdStock}
                            onChange={(e) => setNewProdStock(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-slate-700 font-bold mb-1">Image URL</label>
                          <input
                            type="url"
                            value={newProdImage}
                            onChange={(e) => setNewProdImage(e.target.value)}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-slate-700 font-bold mb-1">Description</label>
                          <textarea
                            rows={2}
                            value={newProdDesc}
                            onChange={(e) => setNewProdDesc(e.target.value)}
                            placeholder="Product materials, fit, dimensions..."
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setIsAddProductOpen(false)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-[#0B1B3D] text-white font-bold text-xs shadow-xs cursor-pointer"
                        >
                          Publish to Catalog
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white text-xs shadow-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                      <tr>
                        <th className="p-3.5">Product</th>
                        <th className="p-3.5">Merchant</th>
                        <th className="p-3.5">Price</th>
                        <th className="p-3.5">Stock</th>
                        <th className="p-3.5">Cashback</th>
                        <th className="p-3.5">Points</th>
                        <th className="p-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/70">
                          <td className="p-3.5 font-bold text-slate-900">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={p.image}
                                alt={p.title}
                                className="w-9 h-9 rounded-lg object-contain bg-slate-50 border border-slate-200 shrink-0"
                              />
                              <div>
                                <span className="truncate max-w-[200px] block">{p.title}</span>
                                <span className="text-[10px] text-slate-400 font-normal">{p.category}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 text-slate-700 font-medium">{p.merchantName}</td>
                          <td className="p-3.5 font-bold text-slate-900 tabular-nums">
                            <input
                              type="number"
                              step="0.01"
                              value={p.price}
                              onChange={(e) =>
                                onUpdateProductPrice(p.id, parseFloat(e.target.value) || 0)
                              }
                              className="w-20 px-1.5 py-0.5 border border-slate-300 rounded text-center text-xs font-semibold"
                            />
                          </td>
                          <td className="p-3.5">
                            <input
                              type="number"
                              min="0"
                              value={p.stock}
                              onChange={(e) =>
                                onUpdateProductStock(p.id, parseInt(e.target.value) || 0)
                              }
                              className="w-16 px-1.5 py-0.5 border border-slate-300 rounded text-center text-xs font-semibold"
                            />
                          </td>
                          <td className="p-3.5 text-emerald-700 font-bold tabular-nums">
                            ${p.cashbackAmount.toFixed(2)}
                          </td>
                          <td className="p-3.5 text-amber-700 font-bold tabular-nums">
                            +{p.pointsEarned} pts
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => onDeleteProduct(p.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 5. PLATFORM ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Multi-Merchant Orders & Transactions ({orders.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Live audit of completed customer orders, payments, rewards, and dispatch status
                    </p>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white text-xs shadow-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                      <tr>
                        <th className="p-3.5">Order ID & Date</th>
                        <th className="p-3.5">Customer & Destination</th>
                        <th className="p-3.5">Items & Merchants</th>
                        <th className="p-3.5">Total & Payment</th>
                        <th className="p-3.5">Cashback / Points</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Manage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-slate-50/70">
                          <td className="p-3.5">
                            <span className="font-bold text-slate-900 block font-mono">{ord.id}</span>
                            <span className="text-[10px] text-slate-400">{ord.date}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-slate-900 block">{ord.shippingAddress.fullName}</span>
                            <span className="text-[10px] text-slate-500">
                              {ord.shippingAddress.city}, {ord.shippingAddress.country}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-slate-800 block">
                              {ord.items.length} item(s)
                            </span>
                            <span className="text-[10px] text-slate-500 truncate max-w-[180px] block">
                              {ord.items.map((i) => i.product.title).join(', ')}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-slate-900 block text-sm">
                              ${ord.total.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-slate-500">{ord.paymentMethod}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="text-emerald-700 font-bold block">
                              +${ord.cashbackEarned.toFixed(2)} CB
                            </span>
                            <span className="text-amber-700 font-bold text-[10px]">
                              +{ord.pointsEarned} pts
                            </span>
                          </td>
                          <td className="p-3.5">
                            <select
                              value={ord.status}
                              onChange={(e) =>
                                onUpdateOrderStatus(ord.id, e.target.value as any)
                              }
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                                ord.status === 'Delivered'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : ord.status === 'Shipped'
                                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                          </td>
                          <td className="p-3.5 text-right font-mono text-[10px] text-slate-400">
                            {ord.shippingAddress.phone}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 6. CUSTOMERS & USERS */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900">
                    Registered Customers & Accounts ({filteredUsers.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Manage customer loyalty points, cashback balances, referral codes, and security suspensions
                  </p>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white text-xs shadow-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                      <tr>
                        <th className="p-3.5">Customer</th>
                        <th className="p-3.5">Role & Tier</th>
                        <th className="p-3.5">Points</th>
                        <th className="p-3.5">Cashback</th>
                        <th className="p-3.5">Referral Code</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Manage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/70">
                          <td className="p-3.5">
                            <span className="font-bold text-slate-900 block">{u.name}</span>
                            <span className="text-[10px] text-slate-400">{u.email}</span>
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  u.role === 'admin'
                                    ? 'bg-amber-100 text-amber-900'
                                    : u.role === 'merchant'
                                    ? 'bg-blue-100 text-blue-900'
                                    : 'bg-slate-100 text-slate-800'
                                }`}
                              >
                                {u.role}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                {u.tier}
                              </span>
                            </div>
                          </td>
                          <td className="p-3.5 font-bold text-amber-700 tabular-nums">
                            {u.pointsBalance.toLocaleString()} pts
                          </td>
                          <td className="p-3.5 font-bold text-emerald-700 tabular-nums">
                            ${u.cashbackBalance.toFixed(2)}
                          </td>
                          <td className="p-3.5 font-mono text-[11px] text-slate-600 font-bold">
                            {u.referralCode}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                u.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {u.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => setAdjustingUser(u)}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg font-bold text-[10px] border border-amber-200 cursor-pointer"
                            >
                              Adjust Funds
                            </button>
                            {u.role !== 'admin' && (
                              <button
                                onClick={() =>
                                  onUpdateUserStatus(
                                    u.id,
                                    u.status === 'active' ? 'suspended' : 'active'
                                  )
                                }
                                className={`px-2.5 py-1 rounded-lg font-bold text-[10px] border cursor-pointer ${
                                  u.status === 'active'
                                    ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                }`}
                              >
                                {u.status === 'active' ? 'Suspend' : 'Activate'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Adjust User Balance Modal */}
                {adjustingUser && (
                  <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95 text-xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h3 className="text-sm font-bold text-slate-900">
                          Adjust Balances: {adjustingUser.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() => setAdjustingUser(null)}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">
                            Add Points (+pts)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={adjustPointsDelta}
                              onChange={(e) => setAdjustPointsDelta(e.target.value)}
                              className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                onAdjustUserPoints(adjustingUser.id, parseInt(adjustPointsDelta) || 0);
                                setAdjustingUser(null);
                              }}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl cursor-pointer"
                            >
                              Apply
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">
                            Add Cashback (+$USD)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.01"
                              value={adjustCashbackDelta}
                              onChange={(e) => setAdjustCashbackDelta(e.target.value)}
                              className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                onAdjustUserCashback(adjustingUser.id, parseFloat(adjustCashbackDelta) || 0);
                                setAdjustingUser(null);
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
                            >
                              Credit
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 7. PAYOUT WITHDRAWALS */}
            {activeTab === 'withdrawals' && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900">
                    Customer Cashback Withdrawal Authorizations ({withdrawals.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Disburse approved cashback to customer PayPal or bank routing numbers
                  </p>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white text-xs shadow-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                      <tr>
                        <th className="p-3.5">Customer</th>
                        <th className="p-3.5">Amount</th>
                        <th className="p-3.5">Method</th>
                        <th className="p-3.5">Account / Wire</th>
                        <th className="p-3.5">Date</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Decision</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {withdrawals.map((w) => (
                        <tr key={w.id} className="hover:bg-slate-50/70">
                          <td className="p-3.5 font-bold text-slate-900">{w.userName}</td>
                          <td className="p-3.5 font-black text-emerald-700 tabular-nums">
                            ${w.amount.toFixed(2)}
                          </td>
                          <td className="p-3.5 text-slate-700">{w.paymentMethod}</td>
                          <td className="p-3.5 font-mono text-[11px] text-slate-600">
                            {w.accountDetails}
                          </td>
                          <td className="p-3.5 text-slate-400">{w.date}</td>
                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                w.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : w.status === 'rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {w.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right space-x-1.5">
                            {w.status === 'pending' ? (
                              <>
                                <button
                                  onClick={() => onProcessWithdrawal(w.id, 'approved')}
                                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => onProcessWithdrawal(w.id, 'rejected')}
                                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-medium">Settled</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 8. BRANDING & IDENTITY CONTROLS */}
            {activeTab === 'branding' && (
              <form
                onSubmit={handleSaveBranding}
                className="space-y-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs text-xs"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Platform Branding & Copy Management
                  </h3>
                  <p className="text-xs text-slate-500">
                    Control how the SNL RICH marketplace looks to all customers and partners
                  </p>
                </div>

                {brandingSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Branding settings updated across header, hero slider, and footer!</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Platform Brand Wordmark</label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Brand Tagline / Subtitle</label>
                    <input
                      type="text"
                      value={brandTagline}
                      onChange={(e) => setBrandTagline(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Customer Support Phone</label>
                    <input
                      type="text"
                      value={supportPhone}
                      onChange={(e) => setSupportPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Support Email Address</label>
                    <input
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">Top Announcement Ribbon</label>
                    <input
                      type="text"
                      value={announcementText}
                      onChange={(e) => setAnnouncementText(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">Hero Banner Main Headline</label>
                    <input
                      type="text"
                      value={heroHeadline}
                      onChange={(e) => setHeroHeadline(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-bold text-sm focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">Hero Banner Sub-Headline</label>
                    <textarea
                      rows={2}
                      value={heroSubhead}
                      onChange={(e) => setHeroSubhead(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#0B1B3D] hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  Publish Branding Updates
                </button>
              </form>
            )}

            {/* 9. PLATFORM & MONETARY POLICIES */}
            {activeTab === 'settings' && (
              <form
                onSubmit={handleSavePlatformSettings}
                className="space-y-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs text-xs"
              >
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Platform Monetary, Policy & Advanced Controls
                  </h3>
                  <p className="text-xs text-slate-500">
                    Adjust commission fee take, referral rewards, points ratios, and marketplace checkout rules
                  </p>
                </div>

                {settingsSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Platform policies and controls saved successfully!</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Platform Commission Fee (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Fee retained by SNL RICH on multi-merchant gross sales
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Referral Cash Bonus ($USD)</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={refCash}
                      onChange={(e) => setRefCash(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      Cash credited to user wallet when referred friend orders
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Referral Points Bonus (pts)</label>
                    <input
                      type="number"
                      min="50"
                      max="5000"
                      value={refPoints}
                      onChange={(e) => setRefPoints(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Customer Welcome Gift (pts)</label>
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      value={welcomePoints}
                      onChange={(e) => setWelcomePoints(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Points to Dollar Redemption Rate</label>
                    <input
                      type="number"
                      min="10"
                      max="500"
                      value={pointsRate}
                      onChange={(e) => setPointsRate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">
                      e.g. 100 points = $1.00 USD discount in cart
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Minimum Cashback Withdrawal ($USD)</label>
                    <input
                      type="number"
                      min="5"
                      max="100"
                      value={minWithdrawal}
                      onChange={(e) => setMinWithdrawal(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  {/* Toggle Controls */}
                  <div className="col-span-1 sm:col-span-2 pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={allowRegistration}
                        onChange={(e) => setAllowRegistration(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-slate-900 font-bold block">Allow Public Customer Registration</span>
                        <span className="text-[10px] text-slate-500">
                          Enables new shoppers to register customer accounts
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableWalletPayment}
                        onChange={(e) => setEnableWalletPayment(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-slate-900 font-bold block">Enable SNL Cashback Wallet at Checkout</span>
                        <span className="text-[10px] text-slate-500">
                          Permits customers to pay using their accumulated cashback
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enableCodPayment}
                        onChange={(e) => setEnableCodPayment(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-slate-900 font-bold block">Enable Cash on Delivery (COD)</span>
                        <span className="text-[10px] text-slate-500">
                          Allows buyers to pay upon physical parcel receipt
                        </span>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoApproveProducts}
                        onChange={(e) => setAutoApproveProducts(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-slate-900 font-bold block">Auto-Approve Partner Products</span>
                        <span className="text-[10px] text-slate-500">
                          Directly publish merchant items without manual review
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#0B1B3D] hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  Save Platform Policy Updates
                </button>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

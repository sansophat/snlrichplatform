import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle,
  AlertCircle,
  Tag,
  Store,
  Coins,
  Share2,
  ShieldAlert,
  LogIn,
  UserCheck,
  Flame,
  Clock,
  ArrowUpDown,
  RotateCcw,
  SlidersHorizontal,
  Zap,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  INITIAL_MERCHANTS,
  INITIAL_PRODUCTS,
  INITIAL_USERS,
  INITIAL_CASHBACK_TRANSACTIONS,
  INITIAL_REFERRALS,
  INITIAL_WITHDRAWAL_REQUESTS,
  INITIAL_PLATFORM_CONFIG,
  INITIAL_ORDERS,
} from './data/mockData';
import {
  Product,
  CartItem,
  UserWallet,
  Order,
  CashbackTransaction,
  RegisteredUser,
  Merchant,
  WithdrawalRequest,
  PlatformConfig,
} from './types';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CategoryBrowser } from './components/CategoryBrowser';
import { ProductCard } from './components/ProductCard';
import { PromoBanners } from './components/PromoBanners';
import { FeaturedCollections } from './components/FeaturedCollections';
import { TrustBar } from './components/TrustBar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CashbackPointsModal } from './components/CashbackPointsModal';
import { ReferralModal } from './components/ReferralModal';
import { MerchantStoreModal } from './components/MerchantStoreModal';
import { MerchantPortalModal } from './components/MerchantPortalModal';
import { WishlistModal } from './components/WishlistModal';
import { MerchantsDirectory } from './components/MerchantsDirectory';
import { AuthModal } from './components/AuthModal';
import { AdminPanelModal } from './components/AdminPanelModal';

export default function App() {
  // 1. Current Session State (starts as GUEST - no automatic login)
  const [currentUser, setCurrentUser] = useState<RegisteredUser | null>(null);

  // 2. Platform Core Registry State
  const [merchants, setMerchants] = useState<Merchant[]>(INITIAL_MERCHANTS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [users, setUsers] = useState<RegisteredUser[]>(INITIAL_USERS);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(INITIAL_WITHDRAWAL_REQUESTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [platformConfig, setPlatformConfig] = useState<PlatformConfig>(INITIAL_PLATFORM_CONFIG);
  const [transactions, setTransactions] = useState<CashbackTransaction[]>(
    INITIAL_CASHBACK_TRANSACTIONS
  );
  const [referrals] = useState(INITIAL_REFERRALS);

  // 3. User Wallet (computed dynamically based on currentUser)
  const wallet = useMemo<UserWallet | null>(() => {
    if (!currentUser) return null;
    return {
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      userRole: currentUser.role,
      pointsBalance: currentUser.pointsBalance,
      pointsValueRate: platformConfig.pointsToDollarRate,
      tier: currentUser.tier,
      tierMultiplier:
        currentUser.tier === 'Platinum'
          ? 3.0
          : currentUser.tier === 'Gold'
          ? 2.0
          : currentUser.tier === 'Silver'
          ? 1.5
          : 1.0,
      cashbackBalance: currentUser.cashbackBalance,
      pendingCashback: 14.2,
      lifetimeCashback: currentUser.cashbackBalance + 120.0,
      referralCode: currentUser.referralCode,
      referralCount: 8,
      referralEarnings: 120.0,
      claimedDailyRewardToday: false,
    };
  }, [currentUser, platformConfig]);

  // 4. Cart & Wishlist State
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { product: INITIAL_PRODUCTS[0], quantity: 1 },
    { product: INITIAL_PRODUCTS[4], quantity: 1 },
  ]);
  const [wishlistIds, setWishlistIds] = useState<string[]>(['p2', 'p7']);
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);

  // 5. Navigation & Search & Filter State
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeNavTab, setActiveNavTab] = useState<string>('shop');
  const [quickFilter, setQuickFilter] = useState<'all' | 'high_cashback' | 'electronics' | 'fashion' | 'home' | 'under50'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc' | 'rating' | 'cashback'>('featured');

  // Flash drops live countdown timer
  const [flashTime, setFlashTime] = useState({ hours: 4, minutes: 28, seconds: 45 });
  useEffect(() => {
    const timer = setInterval(() => {
      setFlashTime((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 6. Modals Visibility State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [isMerchantPortalOpen, setIsMerchantPortalOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [activeStoreMerchantId, setActiveStoreMerchantId] = useState<string | null>(null);

  // 7. Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Auth Operations
  const handleLoginSuccess = (user: RegisteredUser) => {
    setCurrentUser(user);
    showToast(`Welcome back, ${user.name}!`);
  };

  const handleRegisterSuccess = (newUser: RegisteredUser) => {
    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    showToast(`Account created! Welcome, ${newUser.name}. 200 welcome points added to your balance.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setPointsToRedeem(0);
    showToast('Signed out successfully.');
  };

  // Protected Actions Enforcement
  const handleOpenReferral = () => {
    if (!currentUser) {
      showToast('Referral program is for registered members. Please sign in or register.');
      setAuthModalMode('register');
      setIsAuthModalOpen(true);
    } else {
      setIsReferralModalOpen(true);
    }
  };

  const handleOpenWalletModal = () => {
    if (!currentUser) {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
    } else {
      setIsWalletModalOpen(true);
    }
  };

  // Cart Management
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`Added "${product.title}" to cart! Earn +${product.pointsEarned * quantity} pts & $${(product.cashbackAmount * quantity).toFixed(2)} cashback.`);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Wishlist Toggle
  const handleToggleWishlist = (product: Product) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(product.id);
      if (exists) {
        showToast(`Removed from wishlist`);
        return prev.filter((id) => id !== product.id);
      } else {
        showToast(`Saved "${product.title}" to wishlist!`);
        return [...prev, product.id];
      }
    });
  };

  // Points & Daily Reward
  const handleClaimDailyReward = () => {
    if (!currentUser) {
      setIsWalletModalOpen(false);
      setIsAuthModalOpen(true);
      return;
    }
    setCurrentUser((prev) =>
      prev ? { ...prev, pointsBalance: prev.pointsBalance + 50 } : null
    );
    showToast('🎉 Daily check-in claimed! +50 SNL Points added to your balance.');
  };

  // Withdraw Cashback Request
  const handleWithdrawCashback = (amount: number) => {
    if (!currentUser) return;
    setCurrentUser((prev) =>
      prev ? { ...prev, cashbackBalance: Math.max(0, prev.cashbackBalance - amount) } : null
    );
    const newReq: WithdrawalRequest = {
      id: `wd_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      amount,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'PayPal / Bank Wire',
      accountDetails: currentUser.email,
      status: 'pending',
    };
    setWithdrawals((prev) => [newReq, ...prev]);
    showToast(`Withdrawal of $${amount.toFixed(2)} submitted for admin processing.`);
  };

  // Order Placed Action
  const handleOrderPlaced = (order: Order) => {
    // Add to orders list for admin inspection
    setOrders((prev) => [order, ...prev]);

    if (currentUser) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              pointsBalance: prev.pointsBalance - order.pointsRedeemed + order.pointsEarned,
              cashbackBalance: prev.cashbackBalance + order.cashbackEarned,
            }
          : null
      );
    }

    const newTx: CashbackTransaction = {
      id: `cb_${Date.now()}`,
      date: order.date,
      merchantName: order.items[0]?.product.merchantName || 'SNL RICH Merchant',
      orderId: order.id,
      purchaseAmount: order.total,
      cashbackAmount: order.cashbackEarned,
      pointsAwarded: order.pointsEarned,
      status: 'available',
    };
    setTransactions((prev) => [newTx, ...prev]);

    setCartItems([]);
    setPointsToRedeem(0);
    setIsCartOpen(false);
  };

  const handleUpdateOrderStatus = (
    orderId: string,
    status: 'Processing' | 'Shipped' | 'Delivered'
  ) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    showToast(`Order ${orderId} updated to status: ${status}.`);
  };

  // Merchant Portal & Creation Handlers
  const handleAddMerchantProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
    showToast(`Product "${newProduct.title}" published to marketplace catalog!`);
  };

  // Admin Management Handlers
  const handleCreateMerchant = (newMerchant: Merchant) => {
    setMerchants((prev) => [newMerchant, ...prev]);
    showToast(`Merchant "${newMerchant.name}" successfully created by admin!`);
  };

  const handleUpdateMerchant = (updatedMerchant: Merchant) => {
    setMerchants((prev) =>
      prev.map((m) => (m.id === updatedMerchant.id ? updatedMerchant : m))
    );
    setProducts((prev) =>
      prev.map((p) =>
        p.merchantId === updatedMerchant.id
          ? {
              ...p,
              merchantName: updatedMerchant.name,
              cashbackAmount: parseFloat(
                ((p.price * updatedMerchant.cashbackRate) / 100).toFixed(2)
              ),
              pointsEarned: Math.round(p.price * 2 * updatedMerchant.pointsMultiplier),
            }
          : p
      )
    );
    showToast(`Merchant "${updatedMerchant.name}" settings updated.`);
  };

  const handleUpdateMerchantStatus = (merchantId: string, status: 'active' | 'suspended') => {
    setMerchants((prev) =>
      prev.map((m) => (m.id === merchantId ? { ...m, status } : m))
    );
    showToast(`Merchant status updated to ${status}.`);
  };

  // Cascading Deletion Handler: deletes merchant AND all related products, cart items, wishlists, and open storefront modals
  const handleDeleteMerchantWithCascade = (merchantId: string) => {
    const merchantToDelete = merchants.find((m) => m.id === merchantId);
    const merchantName = merchantToDelete ? merchantToDelete.name : 'Merchant';
    const merchantSlug = merchantToDelete?.slug;

    // 1. Identify all products belonging to this merchant
    const deletedProductIds = new Set(
      products
        .filter(
          (p) =>
            p.merchantId === merchantId ||
            (merchantSlug && p.merchantSlug === merchantSlug) ||
            p.merchantName.toLowerCase() === merchantName.toLowerCase()
        )
        .map((p) => p.id)
    );

    const removedProductCount = deletedProductIds.size;

    // 2. Remove merchant from merchants list
    setMerchants((prev) => prev.filter((m) => m.id !== merchantId));

    // 3. Purge all related products from marketplace catalog
    setProducts((prev) => prev.filter((p) => !deletedProductIds.has(p.id)));

    // 4. Purge related products from shopping cart
    setCartItems((prev) =>
      prev.filter(
        (item) =>
          !deletedProductIds.has(item.product.id) &&
          item.product.merchantId !== merchantId &&
          (!merchantSlug || item.product.merchantSlug !== merchantSlug)
      )
    );

    // 5. Purge related products from wishlists
    setWishlistIds((prev) => prev.filter((id) => !deletedProductIds.has(id)));

    // 6. Close store view or quick view modal if currently viewing this merchant or its product
    if (activeStoreMerchantId === merchantId) {
      setActiveStoreMerchantId(null);
    }
    if (quickViewProduct && deletedProductIds.has(quickViewProduct.id)) {
      setQuickViewProduct(null);
    }

    showToast(
      `Merchant "${merchantName}" deleted along with ${removedProductCount} associated products and cart/wishlist records.`
    );
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
    setWishlistIds((prev) => prev.filter((id) => id !== productId));
    if (quickViewProduct?.id === productId) {
      setQuickViewProduct(null);
    }
    showToast('Product removed from catalog.');
  };

  const handleUpdateProductStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
    );
  };

  const handleUpdateProductPrice = (productId: string, newPrice: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const merchant = merchants.find((m) => m.id === p.merchantId);
        const cbRate = merchant ? merchant.cashbackRate : 10;
        const ptsMult = merchant ? merchant.pointsMultiplier : 1.5;
        return {
          ...p,
          price: newPrice,
          cashbackAmount: parseFloat(((newPrice * cbRate) / 100).toFixed(2)),
          pointsEarned: Math.round(newPrice * 2 * ptsMult),
        };
      })
    );
    showToast('Product price and cashback calculation updated.');
  };

  const handleUpdateUserStatus = (userId: string, status: 'active' | 'suspended') => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status } : u))
    );
    showToast(`User account status updated to ${status}.`);
  };

  const handleAdjustUserPoints = (userId: string, deltaPoints: number) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, pointsBalance: u.pointsBalance + deltaPoints } : u
      )
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) =>
        prev ? { ...prev, pointsBalance: prev.pointsBalance + deltaPoints } : null
      );
    }
    showToast(`Adjusted user points by +${deltaPoints} pts.`);
  };

  const handleAdjustUserCashback = (userId: string, deltaCashback: number) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, cashbackBalance: u.cashbackBalance + deltaCashback } : u
      )
    );
    if (currentUser?.id === userId) {
      setCurrentUser((prev) =>
        prev ? { ...prev, cashbackBalance: prev.cashbackBalance + deltaCashback } : null
      );
    }
    showToast(`Adjusted user cashback by +$${deltaCashback.toFixed(2)}.`);
  };

  const handleProcessWithdrawal = (withdrawalId: string, status: 'approved' | 'rejected') => {
    setWithdrawals((prev) =>
      prev.map((w) => (w.id === withdrawalId ? { ...w, status } : w))
    );
    showToast(`Withdrawal request ${status}.`);
  };

  const handleUpdatePlatformConfig = (newConfig: PlatformConfig) => {
    setPlatformConfig(newConfig);
    showToast('Platform configuration and policies updated.');
  };

  const handleOpenAdminPanel = () => {
    if (currentUser?.role === 'admin') {
      setIsAdminPanelOpen(true);
    } else {
      showToast('Please sign in with administrator credentials to access the console.');
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
    }
  };

  // Filtered & Sorted Products Logic
  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter((p) => {
      // Category filter
      const matchesCategory =
        selectedCategory === 'all' ||
        p.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        (selectedCategory === 'Top Offers' && p.originalPrice) ||
        (selectedCategory === 'Gift Cards' && p.title.toLowerCase().includes('card'));

      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Tab filter
      if (activeNavTab === 'deals') {
        return matchesCategory && matchesSearch && !!p.originalPrice;
      }

      // Quick Segment Filter
      if (quickFilter === 'high_cashback') {
        const rate = (p.cashbackAmount / p.price) * 100;
        return matchesCategory && matchesSearch && rate >= 10;
      }
      if (quickFilter === 'electronics') {
        return matchesCategory && matchesSearch && p.category === 'Electronics';
      }
      if (quickFilter === 'fashion') {
        return matchesCategory && matchesSearch && p.category.includes('Fashion');
      }
      if (quickFilter === 'home') {
        return matchesCategory && matchesSearch && p.category === 'Home & Living';
      }
      if (quickFilter === 'under50') {
        return matchesCategory && matchesSearch && p.price <= 50;
      }

      return matchesCategory && matchesSearch;
    });

    // Sorting
    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'cashback') {
      result.sort((a, b) => b.cashbackAmount - a.cashbackAmount);
    }

    return result;
  }, [products, selectedCategory, searchQuery, activeNavTab, quickFilter, sortBy]);

  const activeStoreMerchant = useMemo(() => {
    return merchants.find((m) => m.id === activeStoreMerchantId) || null;
  }, [merchants, activeStoreMerchantId]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#1E293B]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B1B3D] text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs font-semibold animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Top Header & Navigation Ribbon */}
      <Navbar
        currentUser={currentUser}
        wallet={wallet}
        platformConfig={platformConfig}
        cartCount={cartItems.reduce((acc, i) => acc + i.quantity, 0)}
        wishlistCount={wishlistIds.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWallet={handleOpenWalletModal}
        onOpenReferral={handleOpenReferral}
        onOpenMerchantPortal={() => setIsMerchantPortalOpen(true)}
        onOpenAdminPanel={handleOpenAdminPanel}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenAuthModal={(mode = 'login') => {
          setAuthModalMode(mode);
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setActiveNavTab('shop');
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeNavTab={activeNavTab}
        setActiveNavTab={setActiveNavTab}
      />

      {/* Maintenance Mode Banner (if toggled on by admin) */}
      {platformConfig.maintenanceMode && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold text-center border-b border-amber-600">
          ⚠️ Maintenance Mode Active: Marketplace catalog is running in evaluation mode.
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {/* VIEW 1: Verified Merchants Directory Tab */}
        {activeNavTab === 'merchants' ? (
          <MerchantsDirectory
            merchants={merchants}
            onOpenStore={(merchantId) => setActiveStoreMerchantId(merchantId)}
            supportPhone={platformConfig.supportPhone}
            supportEmail={platformConfig.supportEmail}
          />
        ) : (
          /* VIEW 2: Default Marketplace Home View (Exact UI/UX from image.png) */
          <>
            {/* Hero Banner with Multi-Slide Luxury Carousel */}
            <HeroBanner
              platformConfig={platformConfig}
              onShopNow={() => {
                const el = document.getElementById('trending');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onExploreMerchants={() => setActiveNavTab('merchants')}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
            />

            {/* Browse By Categories (Circular Categories with warm cream circles) */}
            <CategoryBrowser
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
            />

            {/* Flash Drops Promotional Ticker Strip */}
            <div className="max-w-7xl mx-auto px-4 sm:px-8 mb-4">
              <div className="rounded-2xl bg-gradient-to-r from-[#0B1B3D] via-[#162B5B] to-[#0B1B3D] p-3 sm:p-4 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-700/80">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm animate-pulse">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black tracking-wide text-amber-300 uppercase">
                        LIMITED TIME FLASH DROPS
                      </span>
                      <span className="text-[10px] bg-red-600 text-white font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                        Active Now
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      Earn an extra +5% instant cashback across verified electronics & luxury fashion
                    </p>
                  </div>
                </div>

                {/* Live Countdown Clock */}
                <div className="flex items-center gap-2 self-start sm:self-auto bg-black/30 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-mono font-bold text-amber-300">
                  <Clock className="w-3.5 h-3.5 text-slate-300" />
                  <span>Ends in:</span>
                  <span className="bg-white/10 px-1.5 py-0.5 rounded text-white tabular-nums">
                    0{flashTime.hours}h
                  </span>
                  <span>:</span>
                  <span className="bg-white/10 px-1.5 py-0.5 rounded text-white tabular-nums">
                    {flashTime.minutes < 10 ? `0${flashTime.minutes}` : flashTime.minutes}m
                  </span>
                  <span>:</span>
                  <span className="bg-white/10 px-1.5 py-0.5 rounded text-amber-400 tabular-nums">
                    {flashTime.seconds < 10 ? `0${flashTime.seconds}` : flashTime.seconds}s
                  </span>
                </div>
              </div>
            </div>

            {/* Trending Right Now Section with Interactive Filters & Professional Animation */}
            <section id="trending" className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
              {/* Section Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-blue-600 mb-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>CURATED MULTI-MERCHANT SELECTION</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display flex items-center gap-2">
                    <span>Trending Right Now</span>
                    <Sparkles className="w-6 h-6 text-amber-500 animate-spin-slow" />
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Top picks that everyone is loving this week across all verified merchants.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Sorting Dropdown */}
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 shadow-2xs">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-500">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="featured">Featured Picks</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="rating">Top Rated</option>
                      <option value="cashback">Highest Cashback</option>
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setQuickFilter('all');
                    }}
                    className="text-xs sm:text-sm font-bold text-[#0B1B3D] hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer py-1"
                  >
                    <span>View All Catalog</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Filter Tabs Bar */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 mb-6 text-xs">
                <button
                  onClick={() => setQuickFilter('all')}
                  className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    quickFilter === 'all'
                      ? 'bg-[#0B1B3D] text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>All Trending ({filteredAndSortedProducts.length})</span>
                </button>

                <button
                  onClick={() => setQuickFilter('high_cashback')}
                  className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    quickFilter === 'high_cashback'
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>High Cashback (10%+)</span>
                </button>

                <button
                  onClick={() => setQuickFilter('electronics')}
                  className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                    quickFilter === 'electronics'
                      ? 'bg-[#0B1B3D] text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  Electronics & Audio
                </button>

                <button
                  onClick={() => setQuickFilter('fashion')}
                  className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                    quickFilter === 'fashion'
                      ? 'bg-[#0B1B3D] text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  Designer Fashion
                </button>

                <button
                  onClick={() => setQuickFilter('home')}
                  className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                    quickFilter === 'home'
                      ? 'bg-[#0B1B3D] text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  Home & Living
                </button>

                <button
                  onClick={() => setQuickFilter('under50')}
                  className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                    quickFilter === 'under50'
                      ? 'bg-[#0B1B3D] text-white shadow-sm'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  Under $50 Budget
                </button>
              </div>

              {/* Active Filter Pill if filter applied */}
              {selectedCategory !== 'all' && (
                <div className="mb-4 flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-medium">Category filter:</span>
                  <span className="bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full border border-blue-200 flex items-center gap-1.5 shadow-2xs">
                    <span>{selectedCategory}</span>
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className="hover:text-blue-900 font-extrabold cursor-pointer ml-1"
                    >
                      ×
                    </button>
                  </span>
                </div>
              )}

              {/* Animated Product Grid */}
              {filteredAndSortedProducts.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 my-4 space-y-3">
                  <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
                  <h3 className="text-base font-bold text-slate-800">
                    No products found matching your filter
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try clearing your search keyword or switching category tabs to see more items.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSearchQuery('');
                      setQuickFilter('all');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#0B1B3D] text-white text-xs font-bold hover:bg-slate-800 transition-colors inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset All Filters</span>
                  </button>
                </div>
              ) : (
                <motion.div
                  layout
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5"
                >
                  <AnimatePresence>
                    {filteredAndSortedProducts.map((product) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        key={product.id}
                      >
                        <ProductCard
                          product={product}
                          onAddToCart={handleAddToCart}
                          onQuickView={(p) => setQuickViewProduct(p)}
                          isWishlisted={wishlistIds.includes(product.id)}
                          onToggleWishlist={handleToggleWishlist}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </section>

            {/* Dual Promotional Banners (Summer Sale + New Arrivals) */}
            <PromoBanners
              onShopSale={() => {
                setActiveNavTab('deals');
                const el = document.getElementById('trending');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onExploreNew={() => {
                setSelectedCategory('all');
                setQuickFilter('all');
                const el = document.getElementById('featured-collections');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Featured Collections Curated Cards */}
            <div id="featured-collections">
              <FeaturedCollections
                onSelectCollection={(catName) => {
                  setSelectedCategory(catName);
                  const el = document.getElementById('trending');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            </div>
          </>
        )}
      </main>

      {/* Trust Value Props Bar (Deep Navy bar matching screenshot) */}
      <TrustBar />

      {/* Rich Footer with SNL RICH Branding & Trademark */}
      <Footer
        platformConfig={platformConfig}
        onOpenMerchantPortal={() => setIsMerchantPortalOpen(true)}
        onOpenReferral={handleOpenReferral}
        onOpenWallet={handleOpenWalletModal}
        onOpenAdminPanel={handleOpenAdminPanel}
      />

      {/* MODALS & DRAWERS */}
      {/* 1. Auth Popup (Sign In / Customer Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        registeredUsers={users}
        onLoginSuccess={handleLoginSuccess}
        onRegisterSuccess={handleRegisterSuccess}
      />

      {/* 2. Admin Panel (Full Management Control) */}
      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        merchants={merchants}
        products={products}
        users={users}
        withdrawals={withdrawals}
        orders={orders}
        platformConfig={platformConfig}
        onCreateMerchant={handleCreateMerchant}
        onUpdateMerchant={handleUpdateMerchant}
        onUpdateMerchantStatus={handleUpdateMerchantStatus}
        onDeleteMerchantWithCascade={handleDeleteMerchantWithCascade}
        onDeleteProduct={handleDeleteProduct}
        onUpdateProductStock={handleUpdateProductStock}
        onUpdateProductPrice={handleUpdateProductPrice}
        onAddProduct={handleAddMerchantProduct}
        onUpdateUserStatus={handleUpdateUserStatus}
        onAdjustUserPoints={handleAdjustUserPoints}
        onAdjustUserCashback={handleAdjustUserCashback}
        onProcessWithdrawal={handleProcessWithdrawal}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onUpdatePlatformConfig={handleUpdatePlatformConfig}
      />

      {/* 3. Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        currentUser={currentUser}
        wallet={wallet}
        pointsToRedeem={pointsToRedeem}
        setPointsToRedeem={setPointsToRedeem}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        onOpenAuthModal={() => {
          setIsCartOpen(false);
          setAuthModalMode('login');
          setIsAuthModalOpen(true);
        }}
      />

      {/* 4. Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        currentUser={currentUser}
        wallet={wallet}
        pointsToRedeem={pointsToRedeem}
        onOrderPlaced={handleOrderPlaced}
        onOpenAuthModal={() => {
          setIsCheckoutOpen(false);
          setAuthModalMode('login');
          setIsAuthModalOpen(true);
        }}
      />

      {/* 5. Product Quick View Modal */}
      <ProductDetailModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onOpenMerchantStore={(merchantId) => {
          setActiveStoreMerchantId(merchantId);
        }}
      />

      {/* 6. Cashback & Points Hub */}
      {wallet && (
        <CashbackPointsModal
          isOpen={isWalletModalOpen}
          onClose={() => setIsWalletModalOpen(false)}
          currentUser={currentUser}
          wallet={wallet}
          transactions={transactions}
          onClaimDailyReward={handleClaimDailyReward}
          onWithdrawCashback={handleWithdrawCashback}
          onOpenAuthModal={() => {
            setIsWalletModalOpen(false);
            setAuthModalMode('login');
            setIsAuthModalOpen(true);
          }}
        />
      )}

      {/* 7. Referral Hub (Registered Users Only) */}
      <ReferralModal
        isOpen={isReferralModalOpen}
        onClose={() => setIsReferralModalOpen(false)}
        currentUser={currentUser}
        wallet={wallet}
        referrals={referrals}
        onOpenAuthModal={() => {
          setIsReferralModalOpen(false);
          setAuthModalMode('register');
          setIsAuthModalOpen(true);
        }}
      />

      {/* 8. Merchant Storefront Modal */}
      <MerchantStoreModal
        merchant={activeStoreMerchant}
        products={products}
        onClose={() => setActiveStoreMerchantId(null)}
        onAddToCart={handleAddToCart}
        onQuickView={(p) => setQuickViewProduct(p)}
        wishlist={wishlistIds}
        onToggleWishlist={handleToggleWishlist}
      />

      {/* 9. Merchant Partner Portal */}
      <MerchantPortalModal
        isOpen={isMerchantPortalOpen}
        onClose={() => setIsMerchantPortalOpen(false)}
        merchants={merchants}
        products={products}
        currentUser={currentUser}
        onAddProduct={handleAddMerchantProduct}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        onOpenAuthModal={() => {
          setAuthModalMode('login');
          setIsAuthModalOpen(true);
        }}
      />

      {/* 10. Wishlist Modal */}
      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistIds={wishlistIds}
        products={products}
        onAddToCart={handleAddToCart}
        onRemoveFromWishlist={(id) =>
          setWishlistIds((prev) => prev.filter((pId) => pId !== id))
        }
      />
    </div>
  );
}

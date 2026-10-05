import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Heart,
  ShoppingCart,
  Phone,
  ChevronDown,
  Sparkles,
  Coins,
  Share2,
  Store,
  ShieldCheck,
  User,
  ShoppingBag,
  Shirt,
  Headphones,
  Armchair,
  Activity,
  Gamepad2,
  Disc3,
  BookOpen,
  Gift,
  Flame,
  LogIn,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { SnlLogo } from './SnlLogo';
import { CATEGORIES } from '../data/mockData';
import { RegisteredUser, UserWallet, PlatformConfig } from '../types';

interface NavbarProps {
  currentUser: RegisteredUser | null;
  wallet: UserWallet | null;
  platformConfig?: PlatformConfig;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWallet: () => void;
  onOpenReferral: () => void;
  onOpenMerchantPortal: () => void;
  onOpenAdminPanel: () => void;
  onOpenWishlist: () => void;
  onOpenAuthModal: (mode?: 'login' | 'register') => void;
  onLogout: () => void;
  onSelectCategory: (categoryName: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  wallet,
  platformConfig,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenWallet,
  onOpenReferral,
  onOpenMerchantPortal,
  onOpenAdminPanel,
  onOpenWishlist,
  onOpenAuthModal,
  onLogout,
  onSelectCategory,
  searchQuery,
  setSearchQuery,
  activeNavTab,
  setActiveNavTab,
}) => {
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [selectedSearchCat, setSelectedSearchCat] = useState('All Categories');
  const [isSearchCatDropdownOpen, setIsSearchCatDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsCategoryMenuOpen(false);
        setIsSearchCatDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'fashion':
        return <ShoppingBag className="w-4 h-4 text-slate-500" />;
      case 'men':
        return <Shirt className="w-4 h-4 text-slate-500" />;
      case 'beauty':
        return <Sparkles className="w-4 h-4 text-slate-500" />;
      case 'electronics':
        return <Headphones className="w-4 h-4 text-slate-500" />;
      case 'home':
        return <Armchair className="w-4 h-4 text-slate-500" />;
      case 'sports':
        return <Activity className="w-4 h-4 text-slate-500" />;
      case 'toys':
        return <Gamepad2 className="w-4 h-4 text-slate-500" />;
      case 'automotive':
        return <Disc3 className="w-4 h-4 text-slate-500" />;
      case 'books':
        return <BookOpen className="w-4 h-4 text-slate-500" />;
      case 'offers':
        return <Flame className="w-4 h-4 text-amber-500" />;
      case 'giftcards':
        return <Gift className="w-4 h-4 text-blue-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs">
      {/* Top Utility Announcement Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-8 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{platformConfig?.brandName || 'SNL RICH'} Rewards:</span>
            </span>
            <span className="text-slate-300 hidden sm:inline">
              {platformConfig?.announcementText ||
                'Earn 5%–15% instant cashback + up to 3x points across verified merchants'}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            {platformConfig?.supportPhone && (
              <span className="hidden md:flex items-center gap-1 text-slate-400">
                <Phone className="w-3 h-3 text-slate-500" />
                <span>{platformConfig.supportPhone}</span>
              </span>
            )}

            {/* Referral Link */}
            <button
              onClick={onOpenReferral}
              className="text-amber-300 hover:text-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Share2 className="w-3 h-3" />
              <span>
                Refer Friends & Earn ${platformConfig?.referralCashReward || 15}
              </span>
            </button>
            <span className="text-slate-700">|</span>

            {/* Merchant Portal */}
            <button
              onClick={onOpenMerchantPortal}
              className="text-slate-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Store className="w-3 h-3 text-blue-400" />
              <span>Merchant Center</span>
            </button>

            {/* Admin Management Link */}
            <span className="text-slate-700">|</span>
            {currentUser?.role === 'admin' ? (
              <button
                onClick={onOpenAdminPanel}
                className="text-amber-300 hover:text-amber-200 transition-colors flex items-center gap-1.5 font-bold cursor-pointer bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/25"
                title="Open Administrator Console"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin Console</span>
              </button>
            ) : (
              <button
                onClick={onOpenAdminPanel}
                className="text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                title="Administrator Access (Sign in required)"
              >
                <ShieldAlert className="w-3 h-3 text-slate-500" />
                <span>Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Brand & Search Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 sm:gap-6">
        {/* Brand Wordmark & Trademark Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setActiveNavTab('shop')}
        >
          <SnlLogo size="md" showTagline={true} />
        </div>

        {/* Central Search Bar with Category Filter */}
        <div className="flex-1 max-w-2xl hidden md:block">
          <div className="relative flex items-center rounded-full border border-slate-300 focus-within:border-[#0B1B3D] focus-within:ring-2 focus-within:ring-[#0B1B3D]/10 bg-slate-50 transition-all overflow-visible shadow-xs">
            {/* Category Dropdown inside search */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSearchCatDropdownOpen(!isSearchCatDropdownOpen)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 border-r border-slate-200 whitespace-nowrap focus:outline-none cursor-pointer"
              >
                <span className="max-w-[110px] truncate">{selectedSearchCat}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isSearchCatDropdownOpen && (
                <div className="absolute left-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div
                    onClick={() => {
                      setSelectedSearchCat('All Categories');
                      onSelectCategory('all');
                      setIsSearchCatDropdownOpen(false);
                    }}
                    className="px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-100 cursor-pointer font-medium"
                  >
                    All Categories
                  </div>
                  {CATEGORIES.slice(1).map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setSelectedSearchCat(cat.name);
                        onSelectCategory(cat.name);
                        setIsSearchCatDropdownOpen(false);
                      }}
                      className="px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-100 cursor-pointer flex items-center justify-between"
                    >
                      <span>{cat.name}</span>
                      <span className="text-[11px] text-slate-400">{cat.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Text Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products, verified merchants..."
              className="w-full bg-transparent px-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
            />

            {/* Dark Navy Search Button */}
            <button
              type="button"
              className="mr-1.5 w-9 h-9 rounded-full bg-[#0B1B3D] hover:bg-[#152a5a] text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Action Icons & Wallet */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Points & Cashback Interactive Widget */}
          <button
            onClick={onOpenWallet}
            className="flex items-center gap-2.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 rounded-xl transition-all shadow-xs group text-left cursor-pointer"
            title="View Points & Cashback Balance"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs group-hover:scale-105 transition-transform">
              <Coins className="w-4 h-4" />
            </div>
            <div className="hidden lg:flex flex-col leading-tight">
              {currentUser && wallet ? (
                <>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-900 tabular-nums">
                      {wallet.pointsBalance.toLocaleString()} pts
                    </span>
                    <span className="text-[10px] bg-amber-200/70 text-amber-800 font-semibold px-1 rounded">
                      {wallet.tier}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 tabular-nums">
                    ${wallet.cashbackBalance.toFixed(2)} Cashback
                  </span>
                </>
              ) : (
                <>
                  <span className="text-xs font-bold text-slate-900">
                    Earn Rewards
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700">
                    Up to 15% Back
                  </span>
                </>
              )}
            </div>
          </button>

          {/* Wishlist */}
          <button
            onClick={onOpenWishlist}
            className="relative p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors flex flex-col items-center cursor-pointer"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            <span className="hidden sm:inline text-[11px] font-medium text-slate-600 mt-0.5">
              Wishlist
            </span>
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-2 sm:right-3 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Shopping Bag / Cart */}
          <button
            onClick={onOpenCart}
            className="relative p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors flex flex-col items-center cursor-pointer"
            title="Shopping Cart"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-slate-800" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 bg-[#0B1B3D] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline text-[11px] font-medium text-slate-600 mt-0.5">
              Cart
            </span>
          </button>

          {/* USER AUTH STATUS / LOGIN BUTTON */}
          {currentUser ? (
            /* Logged in User Profile Dropdown */
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex flex-col text-right leading-tight hidden xl:block">
                  <span className="text-xs font-bold text-slate-900 truncate max-w-[100px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] font-semibold text-blue-600 uppercase">
                    {currentUser.role}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {/* User Menu Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      {currentUser.name}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate">
                      {currentUser.email}
                    </span>
                    <span className="mt-1 inline-block text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-md uppercase">
                      Role: {currentUser.role}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      onOpenWallet();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-xs text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Coins className="w-4 h-4 text-amber-500" />
                    <span>My Points & Cashback</span>
                  </button>

                  <button
                    onClick={() => {
                      onOpenReferral();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-xs text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4 text-emerald-500" />
                    <span>Refer Friends ($15 bonus)</span>
                  </button>

                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => {
                        onOpenAdminPanel();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-xs text-left text-amber-900 font-bold hover:bg-amber-50 flex items-center gap-2"
                    >
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      <span>Admin Management Panel</span>
                    </button>
                  )}

                  {currentUser.role === 'merchant' && (
                    <button
                      onClick={() => {
                        onOpenMerchantPortal();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-xs text-left text-blue-900 font-bold hover:bg-blue-50 flex items-center gap-2"
                    >
                      <Store className="w-4 h-4 text-blue-600" />
                      <span>Merchant Center</span>
                    </button>
                  )}

                  <div className="border-t border-slate-100 my-1 pt-1">
                    <button
                      onClick={() => {
                        onLogout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-xs text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Guest State: Sign In / Register Button */
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuthModal('login')}
                className="px-4 py-2 rounded-xl bg-[#0B1B3D] hover:bg-[#152a5a] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => onOpenAuthModal('register')}
                className="hidden sm:inline-flex px-3.5 py-2 rounded-xl border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Secondary Navy Navigation Ribbon (Matches image.png) */}
      <div className="bg-[#0B1B3D] text-white relative" ref={menuRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between h-13">
          {/* Left "Shop by Categories" Button */}
          <div className="relative">
            <button
              onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
              className="flex items-center gap-3 bg-white text-[#0B1B3D] font-bold text-xs sm:text-sm px-4 py-2.5 rounded-t-xl hover:bg-slate-50 transition-colors shadow-sm select-none cursor-pointer"
            >
              <div className="flex flex-col gap-0.5">
                <span className="w-3.5 h-0.5 bg-[#0B1B3D] rounded-full"></span>
                <span className="w-3.5 h-0.5 bg-[#0B1B3D] rounded-full"></span>
                <span className="w-2.5 h-0.5 bg-[#0B1B3D] rounded-full"></span>
              </div>
              <span>Shop by Categories</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isCategoryMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown Flyout Menu matching reference screenshot */}
            {isCategoryMenuOpen && (
              <div className="absolute top-full left-0 w-64 bg-white text-slate-800 rounded-b-xl shadow-2xl border-x border-b border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {CATEGORIES.slice(1).map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      onSelectCategory(category.name);
                      setIsCategoryMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-left hover:bg-slate-100 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {getCategoryIcon(category.id)}
                      <span className="font-medium text-slate-700 group-hover:text-slate-900">
                        {category.name}
                      </span>
                    </div>
                    <span className="text-slate-400 group-hover:text-slate-700 text-xs">›</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Center Clean Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold tracking-wide text-slate-200">
            <button
              onClick={() => setActiveNavTab('shop')}
              className={`hover:text-white transition-colors cursor-pointer py-1 ${
                activeNavTab === 'shop' ? 'text-white border-b-2 border-white' : ''
              }`}
            >
              Shop
            </button>
            <button
              onClick={() => setActiveNavTab('deals')}
              className={`hover:text-white transition-colors cursor-pointer py-1 flex items-center gap-1 ${
                activeNavTab === 'deals' ? 'text-amber-400 font-bold border-b-2 border-amber-400' : ''
              }`}
            >
              <span>Deals</span>
              <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.2 rounded-full uppercase tracking-wider font-extrabold">
                Hot
              </span>
            </button>
            <button
              onClick={() => setActiveNavTab('merchants')}
              className={`hover:text-white transition-colors cursor-pointer py-1 ${
                activeNavTab === 'merchants' ? 'text-white border-b-2 border-white' : ''
              }`}
            >
              Verified Merchants
            </button>
            <button
              onClick={onOpenWallet}
              className="hover:text-white transition-colors cursor-pointer py-1 flex items-center gap-1 text-amber-300"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Points & Cashback</span>
            </button>
            <button
              onClick={onOpenReferral}
              className="hover:text-white transition-colors cursor-pointer py-1 flex items-center gap-1 text-emerald-300"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Referral & Earn</span>
            </button>
            <button
              onClick={() => setActiveNavTab('inspiration')}
              className={`hover:text-white transition-colors cursor-pointer py-1 ${
                activeNavTab === 'inspiration' ? 'text-white border-b-2 border-white' : ''
              }`}
            >
              Inspiration
            </button>
          </nav>

          {/* Right Phone Support */}
          <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Support:</span>
            <span className="font-semibold text-white">(123) 456-7890</span>
          </div>
        </div>
      </div>
    </header>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Coins,
  Store,
  Tag,
  Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PlatformConfig } from '../types';

interface HeroBannerProps {
  onShopNow: () => void;
  onExploreMerchants: () => void;
  onSelectCategory?: (category: string) => void;
  platformConfig?: PlatformConfig;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onShopNow,
  onExploreMerchants,
  onSelectCategory,
  platformConfig,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);

  const slides = [
    {
      id: 'fashion',
      kicker: 'NEW COLLECTION · VERIFIED DESIGNER',
      title: platformConfig?.heroHeadline || 'Upgrade Your Lifestyle Today',
      description:
        platformConfig?.heroSubhead ||
        'Find the latest trends, top verified merchant brands and exclusive cashback all in one place on SNL RICH.',
      ctaPrimary: 'Shop Now',
      ctaSecondary: 'Explore 120+ Merchants',
      badgeText: '12% Cashback',
      merchantName: 'Aura Luxe & Co.',
      merchantCategory: "Women's Fashion",
      image: '/src/assets/images/hero_fashion_lifestyle_1791175102942.jpg',
      statLabel: 'European Silk & Tailoring',
      tagColor: 'text-amber-400',
      actionCategory: "Women's Fashion",
    },
    {
      id: 'electronics',
      kicker: 'NOVATECH GEAR · SPATIAL AUDIO & WEARABLES',
      title: 'Precision Tech. Multiplied Rewards.',
      description:
        'Explore Active Noise Cancelling headphones, AMOLED edge-to-edge GPS smartwatches, and earn up to 3x points on every purchase.',
      ctaPrimary: 'Explore Tech Drops',
      ctaSecondary: 'View Multipliers',
      badgeText: '10% Cashback + 2x Pts',
      merchantName: 'NovaTech Gear',
      merchantCategory: 'Electronics & Audio',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
      statLabel: 'Hi-Res Bluetooth 5.3',
      tagColor: 'text-sky-400',
      actionCategory: 'Electronics',
    },
    {
      id: 'home',
      kicker: 'ZENITH HOME · SCANDINAVIAN INTERIORS',
      title: 'Transform Your Living Sanctuary',
      description:
        'Curated minimalist stoneware decor, ambient linen lighting, and architectural jewel-toned furniture crafted for peaceful living.',
      ctaPrimary: 'Discover Home Collection',
      ctaSecondary: 'Browse All Brands',
      badgeText: '8% Instant Cashback',
      merchantName: 'Zenith Home & Living',
      merchantCategory: 'Home & Interiors',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80',
      statLabel: 'Architectural Digest Style',
      tagColor: 'text-emerald-400',
      actionCategory: 'Home & Living',
    },
  ];

  // Auto slide with progress bar
  useEffect(() => {
    if (isHovered) return;

    const intervalTime = 50; // update progress every 50ms
    const totalDuration = 6000; // 6 seconds per slide
    const increment = (intervalTime / totalDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveSlide((curr) => (curr + 1) % slides.length);
          return 0;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isHovered, slides.length]);

  const goToSlide = (idx: number) => {
    setActiveSlide(idx);
    setProgress(0);
  };

  const handleNext = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setProgress(0);
  };

  const current = slides[activeSlide];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-4 pb-6">
      {/* Main Luxury Hero Frame */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative rounded-3xl bg-[#0B1B3D] text-white overflow-hidden shadow-2xl min-h-[480px] md:min-h-[520px] flex items-center border border-slate-800"
      >
        {/* Background Atmospheric Lighting & Geometry */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-600/25 via-sky-500/10 to-transparent rounded-full blur-3xl -translate-y-16 translate-x-24 pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-indigo-900/30 rounded-full blur-2xl pointer-events-none" />

        {/* Decorative Golden / Deep Navy Arch (Matches reference image.png) */}
        <div className="absolute right-8 lg:right-24 bottom-0 w-[320px] md:w-[440px] h-[420px] md:h-[480px] border-2 border-amber-500/25 rounded-t-full hidden md:block pointer-events-none" />
        <div className="absolute right-14 lg:right-32 bottom-0 w-[280px] md:w-[380px] h-[380px] md:h-[430px] bg-[#0E244E]/80 rounded-t-full hidden md:block pointer-events-none" />

        {/* Slide Content with AnimatePresence */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="relative z-10 w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-center px-6 sm:px-12 py-10 md:py-14"
          >
            {/* Left Column: Typography & Action Buttons */}
            <div className="md:col-span-7 flex flex-col items-start max-w-xl">
              {/* Kicker with live indicator */}
              <div className="flex items-center gap-2 mb-3.5">
                <span className={`text-[11px] font-extrabold tracking-widest uppercase ${current.tagColor}`}>
                  {current.kicker}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="text-[11px] font-semibold text-slate-300">
                  Official SNL RICH Store
                </span>
              </div>

              {/* Title with Balanced Wrap */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight font-display mb-4 text-balance">
                {current.title}
              </h1>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-300 font-normal leading-relaxed mb-8 max-w-lg">
                {current.description}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 mb-8">
                <button
                  onClick={() => {
                    if (onSelectCategory && current.actionCategory) {
                      onSelectCategory(current.actionCategory);
                    }
                    onShopNow();
                  }}
                  className="px-6 py-3.5 rounded-xl bg-[#F4EDE4] hover:bg-white text-[#0B1B3D] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer active:scale-95 group"
                >
                  <span>{current.ctaPrimary}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={onExploreMerchants}
                  className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all duration-200 cursor-pointer flex items-center gap-2 backdrop-blur-xs"
                >
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span>{current.ctaSecondary}</span>
                </button>
              </div>

              {/* Value Proof Badges */}
              <div className="flex items-center gap-5 pt-4 border-t border-slate-700/60 text-xs text-slate-300 font-medium">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Instant Cashback</span>
                </div>
                <span className="text-slate-600">·</span>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>100 pts = $1 off</span>
                </div>
                <span className="text-slate-600">·</span>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Buyer Protection</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Asset & Floating Merchant Badge */}
            <div className="md:col-span-5 relative flex items-center justify-center md:justify-end">
              <div className="relative w-full max-w-[340px] md:max-w-[420px]">
                {/* Product Frame with Glow */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-800/90 bg-slate-900 group">
                  <img
                    src={current.image}
                    alt={current.title}
                    className="w-full h-auto object-cover object-center max-h-[380px] md:max-h-[440px] transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1B3D]/80 via-transparent to-transparent pointer-events-none" />

                  {/* Top Badge */}
                  <span className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md text-amber-300 border border-amber-500/30 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                    <Tag className="w-3 h-3 text-amber-400" />
                    <span>{current.statLabel}</span>
                  </span>
                </div>

                {/* Floating Verified Merchant Badge (Matches image.png) */}
                <div className="absolute -bottom-3 -left-3 sm:-left-6 bg-white/95 backdrop-blur-md text-slate-800 p-3.5 rounded-2xl shadow-2xl border border-slate-200/90 flex items-center gap-3 animate-in fade-in duration-300">
                  <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs sm:text-sm shadow-md shrink-0">
                    {current.badgeText.includes('%') ? current.badgeText.split(' ')[0] : '12%'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-black text-slate-900">
                        {current.merchantName}
                      </span>
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    </div>
                    <span className="text-[11px] text-emerald-700 font-bold block">
                      {current.badgeText}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {current.merchantCategory}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Previous / Next Arrows */}
        <button
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleNext}
          aria-label="Next Slide"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/30 hover:bg-black/60 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Bottom Carousel Navigation Controls */}
        <div className="absolute bottom-4 left-6 sm:left-12 z-20 flex items-center gap-3">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => goToSlide(idx)}
              className="flex items-center gap-1.5 cursor-pointer py-1 group/btn"
              aria-label={`Go to slide ${idx + 1}`}
            >
              <div
                className={`h-2 rounded-full transition-all duration-300 overflow-hidden ${
                  activeSlide === idx ? 'w-10 bg-white/30' : 'w-2 bg-white/20 group-hover/btn:bg-white/40'
                }`}
              >
                {activeSlide === idx && (
                  <div
                    className="h-full bg-white rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                )}
              </div>
              <span
                className={`text-[10px] font-mono font-bold hidden sm:inline ${
                  activeSlide === idx ? 'text-white' : 'text-slate-400 group-hover/btn:text-slate-200'
                }`}
              >
                0{idx + 1}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Trust & Live Market Perks Strip below Hero */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
            <Coins className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <span className="font-bold text-slate-900 block text-[11px] sm:text-xs">
              Instant Point Multipliers
            </span>
            <span className="text-[10px] text-slate-500">Up to 3x on verified stores</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <span className="font-bold text-slate-900 block text-[11px] sm:text-xs">
              5% - 15% Instant Cashback
            </span>
            <span className="text-[10px] text-slate-500">Credited to wallet on purchase</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center shrink-0">
            <Store className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <span className="font-bold text-slate-900 block text-[11px] sm:text-xs">
              120+ Vetted Merchants
            </span>
            <span className="text-[10px] text-slate-500">Direct from authorized brands</span>
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <span className="font-bold text-slate-900 block text-[11px] sm:text-xs">
              SNL Buyer Shield
            </span>
            <span className="text-[10px] text-slate-500">30-day money-back guarantee</span>
          </div>
        </div>
      </div>
    </section>
  );
};

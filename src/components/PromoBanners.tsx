import React from 'react';
import { ArrowRight, Sparkles, Tag, Flame, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface PromoBannersProps {
  onShopSale: () => void;
  onExploreNew: () => void;
}

export const PromoBanners: React.FC<PromoBannersProps> = ({
  onShopSale,
  onExploreNew,
}) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Banner: Summer Sale (Sky Blue theme matching image.png) */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.25 }}
          className="relative rounded-3xl bg-gradient-to-br from-[#E2EDF8] to-[#D5E5F5] p-6 sm:p-8 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex items-center justify-between min-h-[210px] sm:min-h-[230px] border border-blue-200/60 group"
        >
          {/* Text Content */}
          <div className="relative z-10 max-w-[55%] flex flex-col items-start">
            <span className="text-[11px] font-black uppercase tracking-widest text-blue-700 flex items-center gap-1.5 mb-1 bg-white/70 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-2xs">
              <Tag className="w-3 h-3 text-blue-600" />
              <span>SUMMER SALE</span>
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight font-display mb-2 text-balance">
              Up To 50% Off On Bestsellers
            </h3>
            <p className="text-[11px] text-slate-600 font-medium mb-4 hidden sm:block">
              Enjoy verified merchant discounts plus up to 12% instant cashback.
            </p>
            <button
              onClick={onShopSale}
              className="px-5 py-2.5 rounded-xl bg-[#0B1B3D] hover:bg-[#192f61] text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer group-hover:scale-105 active:scale-95"
            >
              <span>Shop Sale</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Right Product Image with Hover Float */}
          <div className="relative w-44 sm:w-56 h-36 sm:h-44 shrink-0 -mr-4 sm:-mr-2">
            <img
              src="/src/assets/images/promo_summer_accessories_1791175113814.jpg"
              alt="Summer Sale Bestsellers"
              className="w-full h-full object-cover rounded-2xl shadow-md rotate-2 group-hover:rotate-0 group-hover:scale-105 transition-all duration-500 ease-out"
              referrerPolicy="no-referrer"
            />
          </div>
        </motion.div>

        {/* Right Banner: New Arrivals (Warm Stone/Beige theme matching image.png) */}
        <motion.div
          whileHover={{ y: -3 }}
          transition={{ duration: 0.25 }}
          className="relative rounded-3xl bg-gradient-to-br from-[#F6EFE5] to-[#EFE4D6] p-6 sm:p-8 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex items-center justify-between min-h-[210px] sm:min-h-[230px] border border-amber-200/60 group"
        >
          {/* Text Content */}
          <div className="relative z-10 max-w-[55%] flex flex-col items-start">
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-900 flex items-center gap-1.5 mb-1 bg-white/70 backdrop-blur-xs px-2.5 py-0.5 rounded-full shadow-2xs">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>NEW ARRIVALS</span>
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight font-display mb-2 text-balance">
              Fresh Finds You'll Love
            </h3>
            <p className="text-[11px] text-slate-600 font-medium mb-4 hidden sm:block">
              Next-generation lifestyle apparel and curated home sanctuary drops.
            </p>
            <button
              onClick={onExploreNew}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border border-slate-300/80 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer group-hover:scale-105 active:scale-95"
            >
              <span>Explore Now</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Right Product Image with Hover Float */}
          <div className="relative w-44 sm:w-56 h-36 sm:h-44 shrink-0 -mr-4 sm:-mr-2">
            <img
              src="/src/assets/images/promo_lifestyle_sneakers_1791175127434.jpg"
              alt="Fresh New Arrivals"
              className="w-full h-full object-cover rounded-2xl shadow-md -rotate-2 group-hover:rotate-0 group-hover:scale-105 transition-all duration-500 ease-out"
              referrerPolicy="no-referrer"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

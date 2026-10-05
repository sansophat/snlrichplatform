import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { BROWSE_CATEGORIES } from '../data/mockData';

interface CategoryBrowserProps {
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
}

export const CategoryBrowser: React.FC<CategoryBrowserProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
      {/* Centered Heading matching reference screenshot */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase tracking-widest mb-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Curated Multi-Merchant Hub</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
          Browse By Categories
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Explore handpicked collections for every part of your life.
        </p>
      </div>

      {/* Relative wrapper with slide controls */}
      <div className="relative group">
        {/* Scroll Left Button */}
        <button
          onClick={() => handleScroll('left')}
          className="absolute -left-3.5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-slate-200/90 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer hover:scale-105 active:scale-95"
          aria-label="Previous categories"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Circular Category Row */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-6 sm:gap-8 overflow-x-auto scrollbar-none py-3 px-2 scroll-smooth justify-start md:justify-center"
        >
          {BROWSE_CATEGORIES.map((cat, idx) => {
            const isSelected =
              selectedCategory.toLowerCase() === cat.name.toLowerCase() ||
              selectedCategory.toLowerCase() === cat.query.toLowerCase();

            return (
              <motion.button
                key={idx}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectCategory(cat.query)}
                className="flex flex-col items-center gap-2.5 shrink-0 group/item cursor-pointer focus:outline-none"
              >
                {/* Circular Container with soft warm background matching screenshot */}
                <div
                  className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full p-2 flex items-center justify-center transition-all duration-300 relative ${
                    isSelected
                      ? 'bg-amber-100 ring-4 ring-[#0B1B3D] shadow-lg scale-105'
                      : 'bg-[#F4EDE4] hover:bg-[#EAE0D2] shadow-xs group-hover/item:shadow-md'
                  }`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-white/70 shadow-inner">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-full group-hover/item:scale-110 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Active Indicator Pin */}
                  {isSelected && (
                    <span className="absolute -bottom-1 w-3 h-3 bg-[#0B1B3D] rounded-full border-2 border-white shadow-xs"></span>
                  )}
                </div>

                {/* Category Label & Item Count */}
                <div className="text-center">
                  <span
                    className={`text-xs font-bold tracking-tight block transition-colors ${
                      isSelected ? 'text-[#0B1B3D]' : 'text-slate-800 group-hover/item:text-blue-700'
                    }`}
                  >
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium block">
                    {cat.count}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Scroll Right Button */}
        <button
          onClick={() => handleScroll('right')}
          className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-slate-200/90 flex items-center justify-center text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer hover:scale-105 active:scale-95"
          aria-label="Next categories"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};

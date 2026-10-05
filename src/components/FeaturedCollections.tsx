import React from 'react';
import { ArrowRight } from 'lucide-react';

interface FeaturedCollectionsProps {
  onSelectCollection: (name: string) => void;
}

export const FeaturedCollections: React.FC<FeaturedCollectionsProps> = ({
  onSelectCollection,
}) => {
  const collections = [
    {
      title: 'Elegant Outfits',
      subtitle: 'Step into style',
      image: '/src/assets/images/hero_fashion_lifestyle_1791175102942.jpg',
      category: "Women's Fashion",
      bgTone: 'bg-[#F9F5F0]',
    },
    {
      title: 'Skincare Essentials',
      subtitle: 'Glow every day',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80',
      category: 'Beauty & Personal Care',
      bgTone: 'bg-[#FDF6F0]',
    },
    {
      title: 'Gaming Accessories',
      subtitle: 'Level up your game',
      image: 'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=400&q=80',
      category: 'Electronics',
      bgTone: 'bg-[#EBF3FB]',
    },
    {
      title: 'Modern Living',
      subtitle: 'Make your space more beautiful',
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=400&q=80',
      category: 'Home & Living',
      bgTone: 'bg-[#F5F5F3]',
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-display">
            Featured Collections
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Carefully curated collections just for you.
          </p>
        </div>

        <button
          onClick={() => onSelectCollection('all')}
          className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>View All</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4 Horizontal Curated Cards matching reference */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {collections.map((item, idx) => (
          <div
            key={idx}
            onClick={() => onSelectCollection(item.category)}
            className={`rounded-2xl ${item.bgTone} p-4 sm:p-5 flex items-center justify-between border border-slate-200/60 hover:shadow-md hover:border-slate-300 transition-all duration-300 cursor-pointer group`}
          >
            {/* Text details */}
            <div className="flex-1 pr-3">
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {item.subtitle}
              </p>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 group-hover:text-blue-600 mt-3 transition-colors">
                <span>Explore</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>

            {/* Thumbnail */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-white shadow-2xs group-hover:scale-105 transition-transform">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

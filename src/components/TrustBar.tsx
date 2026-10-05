import React from 'react';
import { Truck, RotateCcw, ShieldCheck, Headphones } from 'lucide-react';

export const TrustBar: React.FC = () => {
  const perks = [
    {
      icon: <Truck className="w-5 h-5 text-sky-400" />,
      title: 'Free Shipping',
      subtitle: 'On orders over $50',
    },
    {
      icon: <RotateCcw className="w-5 h-5 text-sky-400" />,
      title: 'Easy Returns',
      subtitle: 'Within 30 days',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-sky-400" />,
      title: 'Secure Payments',
      subtitle: '100% protected',
    },
    {
      icon: <Headphones className="w-5 h-5 text-sky-400" />,
      title: '24/7 Support',
      subtitle: "We're here to help",
    },
  ];

  return (
    <div className="bg-[#0B1B3D] text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {perks.map((perk, idx) => (
            <div key={idx} className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                {perk.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  {perk.title}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {perk.subtitle}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

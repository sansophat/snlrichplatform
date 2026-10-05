import React from 'react';
import { ShieldCheck, Star, MapPin, ArrowRight, Mail, Phone } from 'lucide-react';
import { Merchant } from '../types';

interface MerchantsDirectoryProps {
  merchants: Merchant[];
  onOpenStore: (merchantId: string) => void;
  supportPhone?: string;
  supportEmail?: string;
}

export const MerchantsDirectory: React.FC<MerchantsDirectoryProps> = ({
  merchants,
  onOpenStore,
  supportPhone = '(123) 456-7890',
  supportEmail = 'admin@snlrich.com',
}) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10 space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-blue-600 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>VERIFIED MULTI-MERCHANT NETWORK</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
            Shop Verified Brands & Earn Maximum Cashback
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Every merchant in our ecosystem is vetted for authentic products, guaranteed warranty, and verified instant cashback settlement.
          </p>
        </div>

        {/* Admin Direct Contact Notice (No self-serve become merchant button) */}
        <div className="flex flex-col sm:items-end text-left sm:text-right bg-slate-50 border border-slate-200 p-3.5 rounded-2xl shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Merchant Onboarding Notice</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 max-w-xs leading-normal">
            Merchants are authorized exclusively by platform administration. Contact admin directly to apply:
          </p>
          <div className="flex items-center gap-3 mt-1.5 text-xs font-semibold text-blue-700">
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{supportEmail}</span>
            </span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{supportPhone}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Merchants Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {merchants.map((merchant) => (
          <div
            key={merchant.id}
            onClick={() => onOpenStore(merchant.id)}
            className="group bg-white rounded-2xl border border-slate-200 hover:border-slate-300 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer"
          >
            {/* Cover Image */}
            <div className="relative h-28 bg-slate-800 overflow-hidden">
              <img
                src={merchant.coverImage}
                alt={merchant.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className="absolute top-2.5 right-2.5 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                {merchant.cashbackRate}% Cashback
              </span>
            </div>

            {/* Merchant Details */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="relative -mt-9 mb-2 flex items-end justify-between">
                  <div className="w-12 h-12 rounded-xl bg-white p-0.5 shadow-md border border-slate-200 overflow-hidden">
                    <img
                      src={merchant.logo}
                      alt={merchant.name}
                      className="w-full h-full object-cover rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-bold">
                    {merchant.pointsMultiplier}x Points
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {merchant.name}
                  </h3>
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span className="font-bold text-slate-700">{merchant.rating}</span>
                  </div>
                  <span>·</span>
                  <div className="flex items-center gap-0.5 text-slate-400 text-[11px]">
                    <MapPin className="w-3 h-3" />
                    <span>{merchant.location}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                  {merchant.description}
                </p>
              </div>

              {/* Card Footer */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  {merchant.totalSales.toLocaleString()} sales
                </span>
                <span className="text-blue-600 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  <span>Visit Store</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

import React from 'react';
import { SnlLogo } from './SnlLogo';
import { ShieldCheck, Mail, ArrowRight, Heart, ShieldAlert } from 'lucide-react';
import { PlatformConfig } from '../types';

interface FooterProps {
  onOpenMerchantPortal: () => void;
  onOpenReferral: () => void;
  onOpenWallet: () => void;
  onOpenAdminPanel?: () => void;
  platformConfig?: PlatformConfig;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenMerchantPortal,
  onOpenReferral,
  onOpenWallet,
  onOpenAdminPanel,
  platformConfig,
}) => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-900 pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand Info */}
          <div className="md:col-span-4 flex flex-col items-start">
            <SnlLogo size="lg" variant="light" showTagline={true} />
            <p className="text-slate-400 text-xs leading-relaxed mt-4 max-w-sm">
              SNL RICH® is the premier multi-merchant marketplace delivering verified luxury brands, consumer electronics, fashion, and home lifestyle with integrated instant cashback, points multipliers, and peer-to-peer affiliate rewards.
            </p>
            <div className="flex items-center gap-2 mt-4 text-[11px] text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Certified Multi-Merchant Partner Ecosystem</span>
            </div>
          </div>

          {/* Customer Service */}
          <div className="md:col-span-2 flex flex-col gap-2.5">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1 font-display">
              Shopping
            </h4>
            <a href="#trending" className="hover:text-white transition-colors">Trending Products</a>
            <a href="#deals" className="hover:text-white transition-colors">Daily Flash Drops</a>
            <a href="#categories" className="hover:text-white transition-colors">Category Catalog</a>
            <a href="#merchants" className="hover:text-white transition-colors">Verified Brands</a>
            <a href="#shipping" className="hover:text-white transition-colors">Delivery & Tracking</a>
          </div>

          {/* Rewards & Programs */}
          <div className="md:col-span-3 flex flex-col gap-2.5">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1 font-display">
              Rewards & Earning
            </h4>
            <button
              onClick={onOpenWallet}
              className="text-left hover:text-white transition-colors text-amber-300"
            >
              SNL Cashback Wallet ($38.50)
            </button>
            <button
              onClick={onOpenWallet}
              className="text-left hover:text-white transition-colors text-amber-300"
            >
              Points Hub (100 pts = $1 off)
            </button>
            <button
              onClick={onOpenReferral}
              className="text-left hover:text-white transition-colors text-emerald-400"
            >
              Referral Program: Earn $15/Invite
            </button>
            <button
              onClick={onOpenMerchantPortal}
              className="text-left hover:text-white transition-colors text-blue-400"
            >
              Merchant Partner Portal
            </button>
            {onOpenAdminPanel && (
              <button
                onClick={onOpenAdminPanel}
                className="text-left hover:text-white transition-colors text-amber-400 flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldAlert className="w-3 h-3 text-amber-400" />
                <span>Executive Admin Console</span>
              </button>
            )}
          </div>

          {/* Newsletter */}
          <div className="md:col-span-3 flex flex-col items-start">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 font-display">
              Insider Drops & Perks
            </h4>
            <p className="text-slate-400 text-xs leading-normal mb-3">
              Receive exclusive 15% cashback flash sales and 500 bonus points upon signup.
            </p>
            <div className="w-full flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1 focus-within:border-blue-500">
              <Mail className="w-4 h-4 text-slate-500 ml-2.5 shrink-0" />
              <input
                type="email"
                placeholder="Enter email address"
                className="w-full bg-transparent px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <span>Join</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} SNL RICH®. All rights reserved. SNL RICH and the geometric diamond emblem are registered trademarks.
          </div>
          <div className="flex items-center gap-4">
            <a href="#privacy" className="hover:text-slate-400">Privacy Policy</a>
            <span>·</span>
            <a href="#terms" className="hover:text-slate-400">Terms of Service</a>
            <span>·</span>
            <a href="#merchants" className="hover:text-slate-400">Merchant Agreement</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

import React, { useState } from 'react';
import {
  X,
  Coins,
  Wallet,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle,
  Gift,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { UserWallet, CashbackTransaction, RegisteredUser } from '../types';

interface CashbackPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: RegisteredUser | null;
  wallet: UserWallet;
  transactions: CashbackTransaction[];
  onClaimDailyReward: () => void;
  onWithdrawCashback: (amount: number) => void;
  onOpenAuthModal?: () => void;
}

export const CashbackPointsModal: React.FC<CashbackPointsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  wallet,
  transactions,
  onClaimDailyReward,
  onWithdrawCashback,
  onOpenAuthModal,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'points' | 'cashback' | 'history'>('overview');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  if (!isOpen) return null;

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }
    const val = parseFloat(withdrawAmount);
    if (val > 0 && val <= wallet.cashbackBalance) {
      onWithdrawCashback(val);
      setWithdrawSuccess(true);
      setWithdrawAmount('');
      setTimeout(() => setWithdrawSuccess(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        {/* Navy Header */}
        <div className="bg-[#0B1B3D] text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-sm">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display">
                SNL RICH Rewards & Cashback Hub
              </h2>
              <p className="text-xs text-slate-300">
                {currentUser
                  ? `Member: ${currentUser.name} · ${currentUser.tier} Tier`
                  : 'Guest Shopper · Sign in to redeem & withdraw'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-2 bg-slate-100 border-b border-slate-200 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('points')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'points'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            Points ({wallet.pointsBalance})
          </button>
          <button
            onClick={() => setActiveTab('cashback')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'cashback'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            Cashback Wallet (${wallet.cashbackBalance.toFixed(2)})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'hover:text-slate-900'
            }`}
          >
            Activity
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Daily Check-in Card */}
              <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-4 sm:p-5 text-white shadow-md flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Daily Streak Reward</h3>
                    <p className="text-xs text-amber-100">
                      Check in daily to claim 50 free SNL points.
                    </p>
                  </div>
                </div>

                <button
                  onClick={onClaimDailyReward}
                  disabled={wallet.claimedDailyRewardToday}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                    wallet.claimedDailyRewardToday
                      ? 'bg-white/30 text-white cursor-not-allowed'
                      : 'bg-white text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  {wallet.claimedDailyRewardToday ? 'Claimed Today ✓' : 'Claim +50 pts'}
                </button>
              </div>

              {/* Balances Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Points Card */}
                <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4">
                  <div className="flex items-center justify-between text-amber-800 text-xs font-semibold mb-2">
                    <span className="flex items-center gap-1.5">
                      <Coins className="w-4 h-4 text-amber-600" />
                      <span>SNL Points Balance</span>
                    </span>
                    <span className="bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {wallet.tier} (2.0x)
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 tabular-nums">
                    {wallet.pointsBalance.toLocaleString()} <span className="text-xs font-medium text-slate-500">pts</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Worth <span className="font-bold text-amber-700">${(wallet.pointsBalance / 100).toFixed(2)}</span> in instant checkout discount.
                  </p>
                </div>

                {/* Cashback Card */}
                <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4">
                  <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold mb-2">
                    <span className="flex items-center gap-1.5">
                      <Wallet className="w-4 h-4 text-emerald-600" />
                      <span>Available Cashback</span>
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Pending: ${wallet.pendingCashback.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-emerald-700 tabular-nums">
                    ${wallet.cashbackBalance.toFixed(2)}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Lifetime earned: <span className="font-bold text-slate-800">${wallet.lifetimeCashback.toFixed(2)}</span>
                  </p>
                </div>
              </div>

              {/* How it works */}
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-xs space-y-2.5">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>How SNL RICH Rewards Work</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-600">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                    <strong className="block text-slate-900 font-bold mb-0.5">1. Shop Any Merchant</strong>
                    Earn 5%–15% instant cashback on all verified multi-merchants.
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                    <strong className="block text-slate-900 font-bold mb-0.5">2. Earn 2x Points</strong>
                    Earn 100 points for every $50 spent, redeemable directly in cart.
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                    <strong className="block text-slate-900 font-bold mb-0.5">3. Withdraw or Spend</strong>
                    Transfer cashback to your bank or spend it toward your next order.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Points */}
          {activeTab === 'points' && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                    Current Points Balance
                  </span>
                  <span className="text-3xl font-black text-slate-900 tabular-nums">
                    {wallet.pointsBalance.toLocaleString()} pts
                  </span>
                  <span className="text-xs text-slate-600 block mt-1">
                    Redemption Rate: 100 points = $1.00 USD at checkout
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-amber-200 text-center">
                  <span className="text-[11px] text-slate-500 font-medium block">
                    Gold Tier Multiplier
                  </span>
                  <span className="text-lg font-black text-amber-600">2.0x Points</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-800">Ways to Earn Points:</h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white">
                  <div className="p-3 flex justify-between items-center">
                    <span>Make a purchase with verified merchant</span>
                    <span className="font-bold text-amber-700">1–3 pts per $1 spent</span>
                  </div>
                  <div className="p-3 flex justify-between items-center">
                    <span>Refer a friend who makes their first purchase</span>
                    <span className="font-bold text-emerald-700">+500 bonus pts</span>
                  </div>
                  <div className="p-3 flex justify-between items-center">
                    <span>Leave a verified product review with photo</span>
                    <span className="font-bold text-blue-700">+25 pts</span>
                  </div>
                  <div className="p-3 flex justify-between items-center">
                    <span>Daily Platform Check-in</span>
                    <span className="font-bold text-amber-700">+50 pts daily</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Cashback Wallet & Withdrawal */}
          {activeTab === 'cashback' && (
            <div className="space-y-5">
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                  Available for Immediate Withdrawal
                </span>
                <span className="text-3xl font-black text-emerald-700 tabular-nums">
                  ${wallet.cashbackBalance.toFixed(2)}
                </span>
                <p className="text-xs text-slate-600 mt-1">
                  Pending return window verification: <span className="font-semibold">${wallet.pendingCashback.toFixed(2)}</span>
                </p>
              </div>

              {/* Withdrawal Form */}
              <form onSubmit={handleWithdraw} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                  <span>Withdraw to PayPal / Bank Account</span>
                </h4>

                {withdrawSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Withdrawal request submitted! Funds will arrive within 24 hours.</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-600">
                    Amount to withdraw ($USD)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="5"
                      max={wallet.cashbackBalance}
                      step="0.01"
                      placeholder="e.g. 25.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(wallet.cashbackBalance.toString())}
                      className="px-3 py-2 text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl"
                    >
                      Max
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > wallet.cashbackBalance}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Withdraw Funds to Linked Account
                </button>
              </form>
            </div>
          )}

          {/* Tab 4: History */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Recent Rewards Activity
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl bg-white overflow-hidden text-xs">
                {transactions.map((tx) => (
                  <div key={tx.id} className="p-3.5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{tx.merchantName}</span>
                        <span className="text-[10px] text-slate-400">({tx.orderId})</span>
                      </div>
                      <span className="text-[11px] text-slate-500">{tx.date}</span>
                    </div>

                    <div className="text-right">
                      <div className="font-extrabold text-emerald-600 tabular-nums">
                        +${tx.cashbackAmount.toFixed(2)} cashback
                      </div>
                      <div className="text-[11px] text-amber-700 font-semibold tabular-nums">
                        +{tx.pointsAwarded} pts
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

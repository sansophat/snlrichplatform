"use client";

import { useState, useActionState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { money, dateFmt } from "@/lib/format";
import { REWARDS } from "@/lib/config";
import { redeemPointsToCashAction } from "@/app/actions/wallet";
import { submitDepositRequestAction } from "@/app/actions/bank";
import type { FormState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { ImageUploader } from "@/components/ImageUploader";
import {
  Wallet,
  Coins,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRightLeft,
  PlusCircle,
  ShoppingBag,
  Sparkles,
  Lock,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  QrCode,
  Building,
  Copy,
  Check,
  ExternalLink,
  Eye,
  FileText,
  XCircle,
  Smartphone,
} from "lucide-react";

type PlatformBank = {
  id: string;
  bankName: string;
  bankCode: string | null;
  accountName: string;
  accountNumber: string;
  currency: string;
  qrImageUrl: string | null;
  logoUrl: string | null;
  instructions: string | null;
  active: boolean;
};

type DepositRequest = {
  id: string;
  bankId: string | null;
  bankName: string;
  accountNumber: string | null;
  amountCents: number;
  currency: string;
  receiptUrl: string | null;
  reference: string | null;
  notes: string | null;
  status: string;
  adminNotes: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
};

export function WalletManager({
  user,
  transactions,
  banks,
  depositRequests,
}: {
  user: {
    id: string;
    name: string;
    email: string;
    points: number;
    walletCents: number;
    kycStatus: string;
    referralCode: string;
  };
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    reason: string;
    note: string;
    createdAt: Date;
  }>;
  banks: PlatformBank[];
  depositRequests: DepositRequest[];
}) {
  const isVerified = user.kycStatus === "VERIFIED" || user.kycStatus === "BYPASSED";
  const [activeTab, setActiveTab] = useState<"topup" | "deposits" | "redeem" | "stores">("topup");
  const [txFilter, setTxFilter] = useState<"ALL" | "CASH" | "POINTS">("ALL");

  // State for points redemption form
  const [pointsToConvert, setPointsToConvert] = useState<number>(
    user.points >= 500 ? 500 : user.points >= 100 ? user.points : 0
  );
  const [redeemState, redeemAction] = useActionState<FormState, FormData>(
    redeemPointsToCashAction,
    undefined
  );

  // Cambodia Bank selection for Deposit
  const [selectedBankId, setSelectedBankId] = useState<string>(
    banks.length > 0 ? banks[0].id : ""
  );
  const [depositAmount, setDepositAmount] = useState<number>(50);
  const [receiptUrl, setReceiptUrl] = useState<string>("");
  const [copiedAccount, setCopiedAccount] = useState<boolean>(false);
  const [selectedSlipModal, setSelectedSlipModal] = useState<string | null>(null);

  const [depositState, depositAction] = useActionState<FormState, FormData>(
    submitDepositRequestAction,
    undefined
  );

  const selectedBank = banks.find((b) => b.id === selectedBankId) || banks[0];

  const filteredTx = transactions.filter((t) => {
    if (txFilter === "ALL") return true;
    return t.type === txFilter;
  });

  const convertedValue = (pointsToConvert * REWARDS.POINT_VALUE_CENTS) / 100;

  function handleCopyAccount(accNum: string) {
    navigator.clipboard.writeText(accNum);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Top Banner: Digital Wallet Card & Status */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Digital Wallet Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-navy-950 via-navy-900 to-navy-800 p-6 text-white shadow-xl border border-navy-800 lg:col-span-2">
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-500/15 blur-2xl" />
          <div className="pointer-events-none absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-emerald-500/15 blur-2xl" />

          <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400 text-navy-950 font-black text-xs shadow-sm">
                  SNL
                </span>
                <span className="font-bold tracking-widest text-xs uppercase text-slate-300">
                  Digital Pass & Wallet
                </span>
              </div>
              {isVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-400/30 backdrop-blur-xs">
                  <ShieldCheck size={14} /> KYC Verified
                </span>
              ) : (
                <Link
                  href="/account/kyc"
                  className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-400/30 backdrop-blur-xs hover:bg-amber-500/30 transition"
                >
                  <Lock size={12} /> Verification Needed →
                </Link>
              )}
            </div>

            {/* Balances */}
            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <div>
                <span className="text-xs font-medium text-slate-400">Available Wallet Cash</span>
                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-0.5">
                  {money(user.walletCents)}
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold">
                  Valid for instant checkout across all stores
                </span>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-400">Reward Points</span>
                <div className="text-3xl sm:text-4xl font-black text-amber-300 tracking-tight mt-0.5">
                  {user.points.toLocaleString()} <span className="text-sm font-semibold text-slate-300">pts</span>
                </div>
                <span className="text-[11px] text-sand-300">
                  Redeemable value: <b>{money(user.points * REWARDS.POINT_VALUE_CENTS)}</b>
                </span>
              </div>
            </div>

            {/* Card Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-slate-400">
              <span className="font-semibold text-white">{user.name}</span>
              <span className="font-mono tracking-wider">CODE: {user.referralCode}</span>
            </div>
          </div>
        </div>

        {/* Quick Summary Card */}
        <div className="card p-6 border border-slate-200/90 flex flex-col justify-between space-y-4 shadow-sm bg-gradient-to-b from-slate-50/60 to-white">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Store Buying Power
            </span>
            <div className="text-2xl font-black text-navy-900">
              {money(user.walletCents + user.points * REWARDS.POINT_VALUE_CENTS)}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Combined cash balance and points value accepted for instant orders on any merchant store.
            </p>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100">
            <Link
              href="/shop"
              className="btn btn-primary btn-sm w-full flex items-center justify-center gap-2 font-bold shadow-xs"
            >
              <ShoppingBag size={14} /> Buy From Any Store
            </Link>
            <button
              onClick={() => setActiveTab("topup")}
              className="btn btn-outline btn-sm w-full flex items-center justify-center gap-1.5 text-xs font-semibold"
            >
              <PlusCircle size={14} className="text-emerald-600" /> Deposit with Cambodia KHQR
            </button>
          </div>
        </div>
      </div>

      {/* Verification Notice Banner if not verified */}
      {!isVerified && (
        <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 border border-amber-200 text-xs text-amber-900 shadow-xs">
          <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-sm">Identity Verification (KYC) Required</span>
            <p className="text-amber-800 leading-relaxed">
              To use your wallet balance for store purchases or convert points into cash, platform security requires an approved KYC verification. Please upload your national ID or passport to unlock store payments.
            </p>
            <div className="pt-1">
              <Link
                href="/account/kyc"
                className="btn btn-secondary btn-sm !py-1 !px-3 font-semibold text-xs"
              >
                Complete KYC Verification Now →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Action Center Tabs */}
      <div className="card p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex items-center gap-1.5 rounded-2xl bg-slate-100 p-1 text-xs font-semibold overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab("topup")}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2 transition-all ${
              activeTab === "topup"
                ? "bg-white text-navy-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-navy-900"
            }`}
          >
            <QrCode size={14} className="text-red-600" /> Cambodia Banks & KHQR Deposit
          </button>
          <button
            onClick={() => setActiveTab("deposits")}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2 transition-all ${
              activeTab === "deposits"
                ? "bg-white text-navy-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-navy-900"
            }`}
          >
            <Clock size={14} className="text-blue-600" />
            Deposit History
            {depositRequests.length > 0 && (
              <span className="rounded-full bg-slate-200 px-1.5 py-0.2 text-[10px] text-slate-700">
                {depositRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("redeem")}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2 transition-all ${
              activeTab === "redeem"
                ? "bg-white text-navy-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-navy-900"
            }`}
          >
            <ArrowRightLeft size={14} className="text-amber-600" /> Convert Points to Cash
          </button>
          <button
            onClick={() => setActiveTab("stores")}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2 transition-all ${
              activeTab === "stores"
                ? "bg-white text-navy-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-navy-900"
            }`}
          >
            <ShoppingBag size={14} /> Store Buying Rules
          </button>
        </div>

        {/* TAB 1: Cambodia Banks & KHQR Deposit */}
        {activeTab === "topup" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-red-700">
                  KHQR SUPPORTED
                </span>
                <h3 className="text-lg font-bold text-navy-900">
                  Top Up Wallet with Cambodia Banks & KHQR
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Select your preferred bank (ABA Bank, Wing, ACLEDA, Bakong), scan the scannable KHQR code, and upload your payment slip for fast automated verification.
              </p>
            </div>

            {depositState?.error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3.5 text-xs font-medium text-red-700 border border-red-200">
                <AlertCircle size={16} className="shrink-0" />
                <span>{depositState.error}</span>
              </div>
            )}
            {depositState?.ok && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800 border border-emerald-200">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{depositState.ok}</span>
              </div>
            )}

            {banks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center bg-slate-50">
                <Building className="mx-auto h-10 w-10 text-slate-400" />
                <h4 className="mt-2 text-sm font-bold text-navy-900">No active bank accounts configured</h4>
                <p className="text-xs text-slate-500 mt-1">
                  The admin has not added Cambodia deposit accounts yet. Please contact support.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-12">
                {/* Left Column: Bank Selection & KHQR Display (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Bank selector pills */}
                  <div>
                    <label className="label text-xs">Step 1: Choose Bank / KHQR Payment Channel</label>
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5">
                      {banks.map((b) => {
                        const isSelected = selectedBank?.id === b.id;
                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setSelectedBankId(b.id)}
                            className={`group relative flex items-center gap-3 rounded-2xl border p-3 text-left transition-all duration-200 ${
                              isSelected
                                ? "border-navy-900 bg-white ring-2 ring-navy-900 shadow-md"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-1 flex items-center justify-center">
                              {b.logoUrl ? (
                                <Image
                                  src={b.logoUrl}
                                  alt={b.bankName}
                                  width={36}
                                  height={36}
                                  className="h-full w-full object-contain"
                                />
                              ) : (
                                <Building className="h-5 w-5 text-slate-400" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-navy-900 text-xs truncate">
                                {b.bankName}
                              </div>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {b.currency} Account
                              </span>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="h-4 w-4 text-navy-900 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Selected Bank Details Card & Scannable KHQR */}
                  {selectedBank && (
                    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-5 shadow-sm space-y-4">
                      {/* KHQR Header Banner */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-600 text-white font-black text-xs shadow-xs">
                            KHQR
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-navy-900">{selectedBank.bankName}</h4>
                            <span className="text-[10px] text-slate-500 font-medium">
                              National Bank of Cambodia Standard
                            </span>
                          </div>
                        </div>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                          Instant Scan
                        </span>
                      </div>

                      {/* Interactive Scannable KHQR Box with Laser Animation */}
                      <div className="flex flex-col sm:flex-row items-center gap-5 pt-1">
                        <div className="relative group shrink-0">
                          {selectedBank.qrImageUrl ? (
                            <div className="relative h-48 w-48 overflow-hidden rounded-2xl border-2 border-red-500/20 bg-white p-3 shadow-md">
                              <Image
                                src={selectedBank.qrImageUrl}
                                alt="KHQR Code"
                                width={180}
                                height={180}
                                className="h-full w-full object-contain"
                              />
                              {/* Laser scanning line animation */}
                              <div className="pointer-events-none absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_8px_#d80027] animate-scan" />
                            </div>
                          ) : (
                            <div className="flex h-48 w-48 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
                              <QrCode className="h-10 w-10 text-slate-400" />
                              <span className="mt-2 text-xs font-semibold text-slate-500">
                                Manual Transfer Mode
                              </span>
                            </div>
                          )}
                          <div className="mt-2 text-center">
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500">
                              <Smartphone size={12} className="text-red-600" /> Scan via any banking app
                            </span>
                          </div>
                        </div>

                        {/* Account Details Copy Table */}
                        <div className="min-w-0 flex-1 space-y-2.5 text-xs w-full">
                          <div className="rounded-2xl bg-white p-3.5 border border-slate-100 shadow-2xs space-y-2">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Account Holder
                              </span>
                              <div className="font-bold text-navy-900 text-sm">
                                {selectedBank.accountName}
                              </div>
                            </div>

                            <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  Account Number / ID
                                </span>
                                <div className="font-mono font-black text-navy-900 text-base">
                                  {selectedBank.accountNumber}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopyAccount(selectedBank.accountNumber)}
                                className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-navy-900 hover:bg-slate-200 transition-colors shadow-2xs"
                              >
                                {copiedAccount ? (
                                  <>
                                    <Check size={14} className="text-emerald-600" /> Copied!
                                  </>
                                ) : (
                                  <>
                                    <Copy size={14} /> Copy
                                  </>
                                )}
                              </button>
                            </div>

                            <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
                              <span className="text-slate-500 text-[11px]">Accepted Currency:</span>
                              <span className="font-bold text-navy-900">
                                {selectedBank.currency} ($)
                              </span>
                            </div>
                          </div>

                          {selectedBank.instructions && (
                            <p className="rounded-xl bg-blue-50/70 p-3 text-[11px] text-blue-900 border border-blue-100/80 leading-relaxed">
                              💡 <b>Note:</b> {selectedBank.instructions}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Deposit Form (5 cols) */}
                <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
                  <div>
                    <h4 className="text-base font-bold text-navy-900">Step 2: Submit Deposit & Slip</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Upload proof of transfer to expedite instant wallet crediting.
                    </p>
                  </div>

                  <form action={depositAction} className="space-y-4">
                    <input type="hidden" name="bankId" value={selectedBank?.id || ""} />

                    {/* Deposit Amount */}
                    <div>
                      <label className="label text-xs">Deposit Amount ($ USD) *</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                          $
                        </span>
                        <input
                          type="number"
                          name="amount"
                          min={1}
                          max={5000}
                          step={1}
                          required
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(Math.max(1, parseFloat(e.target.value) || 0))}
                          className="input text-sm font-bold !pl-8"
                        />
                      </div>
                    </div>

                    {/* Quick Presets */}
                    <div className="flex items-center gap-1.5 flex-wrap text-xs">
                      <span className="text-[11px] text-slate-400">Presets:</span>
                      {[10, 25, 50, 100, 250, 500].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setDepositAmount(amt)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
                            depositAmount === amt
                              ? "bg-navy-900 text-white"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>

                    {/* Receipt Slip Image Uploader */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
                      <label className="label text-xs font-bold text-navy-900 flex items-center gap-1.5">
                        <FileText size={14} className="text-red-600" />
                        Transfer Receipt / Slip Screenshot *
                      </label>
                      <ImageUploader
                        name="receiptUrl"
                        defaultValue={receiptUrl}
                        aspect="banner"
                        helpText="Upload receipt screenshot from your bank app (ABA, Wing, ACLEDA)"
                      />
                    </div>

                    {/* Reference & Notes */}
                    <div>
                      <label className="label text-xs">Bank Transaction ID / Ref # (Optional)</label>
                      <input
                        type="text"
                        name="reference"
                        placeholder="e.g. ABA-9823482 or TRN123456"
                        className="input text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="label text-xs">Remark / Note (Optional)</label>
                      <input
                        type="text"
                        name="notes"
                        placeholder="e.g. Deposit for store order or top-up"
                        className="input text-xs"
                      />
                    </div>

                    <SubmitButton
                      className="btn btn-primary btn-sm w-full font-bold shadow-md py-3 text-sm"
                      pendingText="Submitting Deposit…"
                    >
                      Submit Deposit of ${depositAmount}
                    </SubmitButton>

                    <p className="text-center text-[11px] text-slate-400">
                      ⚡ Approved deposits are instantly added to your digital wallet balance.
                    </p>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Deposit Request History */}
        {activeTab === "deposits" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-bold text-navy-900">Your Deposit Requests</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Track status of your Cambodia bank transfer and KHQR deposits.
              </p>
            </div>

            {depositRequests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center bg-slate-50">
                <Clock className="mx-auto h-10 w-10 text-slate-300" />
                <h4 className="mt-2 text-sm font-bold text-navy-900">No deposit submissions yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Use the Cambodia Banks & KHQR Deposit tab to transfer funds and submit your first deposit receipt.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("topup")}
                  className="mt-4 btn btn-primary btn-sm text-xs font-bold"
                >
                  Make a Deposit Now
                </button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 bg-slate-50 font-bold uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="py-3 px-4">Bank / Channel</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Receipt Slip</th>
                        <th className="py-3 px-4">Reference</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {depositRequests.map((req) => (
                        <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4 font-bold text-navy-900">
                            {req.bankName}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-black text-sm text-emerald-600">
                              +{money(req.amountCents)}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-1 uppercase">
                              {req.currency}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {req.receiptUrl ? (
                              <button
                                type="button"
                                onClick={() => setSelectedSlipModal(req.receiptUrl)}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-bold text-navy-900 hover:bg-slate-100"
                              >
                                <Eye size={12} /> View Slip
                              </button>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">No slip</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px]">
                            {req.reference || <span className="text-slate-400 font-sans">—</span>}
                          </td>
                          <td className="py-3 px-4">
                            {req.status === "PENDING" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200">
                                <Clock size={12} className="animate-spin text-amber-600" /> Pending Review
                              </span>
                            )}
                            {req.status === "APPROVED" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                                <CheckCircle2 size={12} className="text-emerald-600" /> Credited
                              </span>
                            )}
                            {req.status === "REJECTED" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-800 border border-red-200">
                                <XCircle size={12} className="text-red-600" /> Rejected
                              </span>
                            )}
                            {req.adminNotes && (
                              <div className="text-[10px] text-slate-500 mt-1">
                                {req.adminNotes}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                            {new Date(req.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Convert Points to Cash */}
        {activeTab === "redeem" && (
          <div className="space-y-4 max-w-xl animate-in fade-in duration-200">
            <div>
              <h3 className="text-base font-bold text-navy-900">
                Redeem Reward Points to Wallet Cash
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Convert your earned loyalty points into cash deposited straight into your SNLRICH wallet (100 pts = $1.00 cash).
              </p>
            </div>

            {redeemState?.error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200">
                <AlertCircle size={15} className="shrink-0" />
                <span>{redeemState.error}</span>
              </div>
            )}
            {redeemState?.ok && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-800 border border-emerald-200">
                <CheckCircle2 size={15} className="shrink-0" />
                <span>{redeemState.ok}</span>
              </div>
            )}

            <form action={redeemAction} className="space-y-4">
              <div>
                <label className="label text-xs">Points to Redeem</label>
                <div className="relative">
                  <input
                    type="number"
                    name="points"
                    min={100}
                    max={user.points}
                    step={10}
                    value={pointsToConvert}
                    onChange={(e) => setPointsToConvert(Math.max(0, parseInt(e.target.value) || 0))}
                    className="input text-sm font-mono font-bold pr-16"
                    disabled={!isVerified || user.points < 100}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    PTS
                  </span>
                </div>
              </div>

              {/* Quick Select Buttons */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-slate-400">Quick amounts:</span>
                {[100, 250, 500, 1000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    disabled={!isVerified || user.points < amt}
                    onClick={() => setPointsToConvert(amt)}
                    className="rounded-lg bg-slate-100 px-2.5 py-1 font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-40"
                  >
                    {amt} pts (${(amt / 100).toFixed(2)})
                  </button>
                ))}
                {user.points >= 100 && (
                  <button
                    type="button"
                    disabled={!isVerified}
                    onClick={() => setPointsToConvert(user.points)}
                    className="rounded-lg bg-navy-100 px-2.5 py-1 font-bold text-navy-800 hover:bg-navy-200"
                  >
                    All ({user.points.toLocaleString()} pts)
                  </button>
                )}
              </div>

              {/* Conversion Calculator Box */}
              <div className="rounded-xl bg-emerald-50/70 p-4 border border-emerald-200/80 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500">You are converting:</span>
                  <div className="font-bold text-navy-900 text-sm">
                    {pointsToConvert.toLocaleString()} points
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Wallet cash credit:</span>
                  <div className="font-black text-emerald-700 text-base">
                    +{money(Math.round(convertedValue * 100))}
                  </div>
                </div>
              </div>

              <SubmitButton
                disabled={!isVerified || user.points < 100 || pointsToConvert < 100}
                className="btn btn-primary btn-sm w-full font-bold shadow-md"
                pendingText="Converting Points…"
              >
                {!isVerified
                  ? "KYC Verification Required to Redeem"
                  : user.points < 100
                  ? "Minimum 100 Points Required"
                  : `Redeem ${pointsToConvert.toLocaleString()} Pts for ${money(Math.round(convertedValue * 100))}`}
              </SubmitButton>
            </form>
          </div>
        )}

        {/* TAB 4: Store Payment Rules */}
        {activeTab === "stores" && (
          <div className="space-y-4 text-xs text-slate-600 leading-relaxed max-w-2xl animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-navy-900">
              Universal Store Buying Rules
            </h3>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4 space-y-1.5 bg-slate-50/60">
                <div className="flex items-center gap-2 font-bold text-navy-900">
                  <Wallet size={16} className="text-emerald-600" />
                  <span>100% Wallet Payment</span>
                </div>
                <p>
                  Pay the full order amount (goods + shipping) directly with your wallet balance across any store without entering credit card details.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 space-y-1.5 bg-slate-50/60">
                <div className="flex items-center gap-2 font-bold text-navy-900">
                  <Coins size={16} className="text-amber-600" />
                  <span>Direct Points Checkout</span>
                </div>
                <p>
                  Use your loyalty points to pay 100% of any merchant order directly at checkout (100 pts = $1.00 store credit).
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 space-y-1.5 bg-slate-50/60">
                <div className="flex items-center gap-2 font-bold text-navy-900">
                  <ArrowRightLeft size={16} className="text-indigo-600" />
                  <span>Mixed Credits + Card/COD</span>
                </div>
                <p>
                  Combine points discounts and wallet cash with regular payment methods (Card, Cash on Delivery, or Bank Transfer) on any order.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 space-y-1.5 bg-slate-50/60">
                <div className="flex items-center gap-2 font-bold text-navy-900">
                  <ShieldCheck size={16} className="text-blue-600" />
                  <span>KYC Verified Protection</span>
                </div>
                <p>
                  Balances and point conversions are protected by verified KYC checks for secure e-commerce compliance.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Slip Full View Modal */}
      {selectedSlipModal && (
        <div
          onClick={() => setSelectedSlipModal(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm cursor-zoom-out animate-in fade-in duration-150"
        >
          <div className="relative max-h-[90vh] max-w-xl overflow-hidden rounded-2xl bg-white p-2 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedSlipModal(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/90"
            >
              ✕
            </button>
            <div className="relative h-[70vh] w-[80vw] max-w-lg">
              <Image
                src={selectedSlipModal}
                alt="Receipt Slip"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Transactions Ledger */}
      <div className="card p-6 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-navy-900">Wallet & Points Activity</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete historical ledger of deposits, conversions, purchases, and rewards.
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            <button
              onClick={() => setTxFilter("ALL")}
              className={`rounded-lg px-3 py-1 transition ${
                txFilter === "ALL" ? "bg-white text-navy-900 shadow-xs font-bold" : "text-slate-600"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTxFilter("CASH")}
              className={`rounded-lg px-3 py-1 transition ${
                txFilter === "CASH" ? "bg-white text-navy-900 shadow-xs font-bold" : "text-slate-600"
              }`}
            >
              Wallet Cash
            </button>
            <button
              onClick={() => setTxFilter("POINTS")}
              className={`rounded-lg px-3 py-1 transition ${
                txFilter === "POINTS" ? "bg-white text-navy-900 shadow-xs font-bold" : "text-slate-600"
              }`}
            >
              Points
            </button>
          </div>
        </div>

        {filteredTx.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
            No transactions found for the selected filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTx.map((t) => {
              const isPositive = t.amount > 0;
              const isCash = t.type === "CASH";

              return (
                <div
                  key={t.id}
                  className="flex items-center justify-between py-3 text-xs first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-xl shrink-0 ${
                        isPositive
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {isPositive ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div>
                      <div className="font-bold text-navy-900 flex items-center gap-1.5">
                        <span>{t.reason}</span>
                        <span className="rounded bg-slate-100 px-1 py-0.2 text-[9px] font-bold text-slate-500 uppercase">
                          {t.type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {dateFmt(t.createdAt)} {t.note ? `· ${t.note}` : ""}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-black text-sm ${
                        isPositive ? "text-emerald-600" : "text-slate-900"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {isCash ? money(t.amount) : `${t.amount.toLocaleString()} pts`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

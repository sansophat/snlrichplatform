"use client";

import { useState, useTransition } from "react";
import { savePlatformBankAction, togglePlatformBankAction, deletePlatformBankAction } from "@/app/actions/bank";
import { ImageUploader } from "@/components/ImageUploader";
import { Plus, Edit2, Trash2, CheckCircle2, XCircle, QrCode, Building, ExternalLink, Sparkles, Copy, Check } from "lucide-react";
import Image from "next/image";

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
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    deposits: number;
  };
};

const CAMBODIA_PRESETS = [
  {
    name: "ABA Bank (KHQR)",
    code: "ABA",
    currency: "USD",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/ABA_Bank_logo.svg/320px-ABA_Bank_logo.svg.png",
    instructions: "Scan KHQR via ABA Mobile or any Bakong bank. Transfer the exact amount and upload your payment slip.",
  },
  {
    name: "Bakong KHQR (Universal)",
    code: "BAKONG",
    currency: "USD",
    logoUrl: "https://bakong.nbc.gov.kh/images/bakong-logo-en.png",
    instructions: "Universal KHQR code accepted by 40+ banks & financial institutions across Cambodia.",
  },
  {
    name: "ACLEDA Bank Plc.",
    code: "ACLEDA",
    currency: "USD",
    logoUrl: "https://www.acledabank.com.kh/kh/assets/layout/images/logo.png",
    instructions: "Transfer to ACLEDA account or scan via ACLEDA Mobile. Write your username in payment note.",
  },
  {
    name: "Wing Bank (Cambodia)",
    code: "WING",
    currency: "USD",
    logoUrl: "https://www.wingmoney.com/wp-content/themes/wing-theme/assets/images/logo-green.svg",
    instructions: "Pay via Wing Bank App or transfer from any Wing Agent nationwide.",
  },
  {
    name: "Canadia Bank",
    code: "CANADIA",
    currency: "USD",
    logoUrl: "https://www.canadiabank.com.kh/assets/images/logo-blue.png",
    instructions: "Transfer via Canadia Bank App or OTC counter deposit.",
  },
];

export function BankManagerClient({ banks }: { banks: PlatformBank[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<PlatformBank | null>(null);
  const [isPending, startTransition] = useTransition();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states
  const [bankName, setBankName] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [qrImageUrl, setQrImageUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [instructions, setInstructions] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [active, setActive] = useState(true);
  const [formMsg, setFormMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  function openCreate() {
    setSelectedBank(null);
    setBankName("");
    setBankCode("");
    setAccountName("");
    setAccountNumber("");
    setCurrency("USD");
    setQrImageUrl("");
    setLogoUrl("");
    setInstructions("");
    setDisplayOrder(banks.length + 1);
    setActive(true);
    setFormMsg(null);
    setModalOpen(true);
  }

  function openEdit(b: PlatformBank) {
    setSelectedBank(b);
    setBankName(b.bankName);
    setBankCode(b.bankCode || "");
    setAccountName(b.accountName);
    setAccountNumber(b.accountNumber);
    setCurrency(b.currency || "USD");
    setQrImageUrl(b.qrImageUrl || "");
    setLogoUrl(b.logoUrl || "");
    setInstructions(b.instructions || "");
    setDisplayOrder(b.displayOrder || 0);
    setActive(b.active);
    setFormMsg(null);
    setModalOpen(true);
  }

  function applyPreset(preset: typeof CAMBODIA_PRESETS[number]) {
    setBankName(preset.name);
    setBankCode(preset.code);
    setCurrency(preset.currency);
    setLogoUrl(preset.logoUrl);
    setInstructions(preset.instructions);
    if (!accountName) setAccountName("SNL PLATFORM");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormMsg(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await savePlatformBankAction({}, fd);
      if (res?.error) {
        setFormMsg({ type: "err", text: res.error });
      } else {
        setFormMsg({ type: "ok", text: res?.ok || "Saved successfully!" });
        setTimeout(() => {
          setModalOpen(false);
        }, 900);
      }
    });
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-navy-900">Configured Cambodia Banks & KHQR</h2>
          <p className="text-xs text-slate-500">
            Active banks will appear directly in customer/merchant deposit screens and checkout.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="btn-primary inline-flex items-center gap-2 text-sm shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Add Cambodia Bank / KHQR
        </button>
      </div>

      {/* Grid of Bank Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {banks.map((bank) => {
          const isAba = bank.bankCode === "ABA";
          const isBakong = bank.bankCode === "BAKONG";
          const isWing = bank.bankCode === "WING";
          const isAcleda = bank.bankCode === "ACLEDA";

          const badgeBg = isAba
            ? "bg-[#004f71]/10 text-[#004f71] border-[#004f71]/20"
            : isBakong
            ? "bg-[#ce1126]/10 text-[#ce1126] border-[#ce1126]/20"
            : isWing
            ? "bg-[#78be20]/10 text-[#548a12] border-[#78be20]/20"
            : isAcleda
            ? "bg-[#1b365d]/10 text-[#1b365d] border-[#1b365d]/20"
            : "bg-slate-100 text-slate-700 border-slate-200";

          return (
            <div
              key={bank.id}
              className={`relative flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-xs transition-all duration-200 hover:shadow-md ${
                bank.active ? "border-slate-200" : "border-slate-200/60 opacity-60 bg-slate-50/50"
              }`}
            >
              <div>
                {/* Header: Logo, Name & Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-1 flex items-center justify-center">
                      {bank.logoUrl ? (
                        <Image
                          src={bank.logoUrl}
                          alt={bank.bankName}
                          width={48}
                          height={48}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <Building className="h-6 w-6 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-navy-900 leading-tight">{bank.bankName}</h3>
                        {bank.bankCode && (
                          <span className={`rounded-md border px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${badgeBg}`}>
                            {bank.bankCode}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">Currency: {bank.currency}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      startTransition(async () => {
                        await togglePlatformBankAction(bank.id);
                      });
                    }}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold transition-colors ${
                      bank.active
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200"
                    }`}
                  >
                    {bank.active ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Active
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 text-slate-400" /> Disabled
                      </>
                    )}
                  </button>
                </div>

                {/* Account Details Box */}
                <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs space-y-1.5 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Account Name:</span>
                    <span className="font-semibold text-navy-900 text-right">{bank.accountName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Account Number:</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono font-bold text-navy-900">{bank.accountNumber}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(bank.accountNumber, bank.id)}
                        className="rounded p-0.5 text-slate-400 hover:text-navy-900 hover:bg-white"
                        title="Copy account number"
                      >
                        {copiedId === bank.id ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                  {bank.instructions && (
                    <p className="pt-1 text-[11px] text-slate-500 italic line-clamp-2">
                      &ldquo;{bank.instructions}&rdquo;
                    </p>
                  )}
                </div>

                {/* KHQR Preview */}
                {bank.qrImageUrl && (
                  <div className="mt-3 flex items-center gap-3 rounded-lg border border-dashed border-slate-200 p-2 bg-white">
                    <div className="relative h-12 w-12 shrink-0 rounded border border-slate-100 overflow-hidden bg-slate-50 flex items-center justify-center">
                      <Image
                        src={bank.qrImageUrl}
                        alt="KHQR"
                        width={48}
                        height={48}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-navy-900">
                        <QrCode className="h-3.5 w-3.5 text-red-600" />
                        KHQR Code Ready
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">Customers can scan directly</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <span className="text-[11px] text-slate-400">
                  {bank._count?.deposits ?? 0} deposits processed
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(bank)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    <Edit2 className="h-3 w-3" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete ${bank.bankName}?`)) {
                        startTransition(async () => {
                          await deletePlatformBankAction(bank.id);
                        });
                      }
                    }}
                    className="inline-flex items-center rounded-lg border border-red-200 p-1 text-red-600 hover:bg-red-50"
                    title="Delete Bank"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {banks.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-white">
            <Building className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-3 text-base font-bold text-navy-900">No Cambodia Banks configured</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              Add your ABA Bank, Wing, ACLEDA, or Bakong KHQR details so customers and merchants can make top-ups.
            </p>
            <button
              type="button"
              onClick={openCreate}
              className="mt-4 btn-primary inline-flex items-center gap-2 text-xs"
            >
              <Plus className="h-4 w-4" /> Add First Bank
            </button>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-navy-900">
                  {selectedBank ? "Edit Cambodia Bank / KHQR" : "Add Cambodia Bank / KHQR"}
                </h3>
                <p className="text-xs text-slate-500">
                  Configure Cambodia payment details and scannable KHQR code.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Quick Presets */}
            {!selectedBank && (
              <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                  Quick Autofill Cambodia Presets:
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {CAMBODIA_PRESETS.map((p) => (
                    <button
                      key={p.code}
                      type="button"
                      onClick={() => applyPreset(p)}
                      className="rounded-lg border border-blue-200 bg-white px-2.5 py-1 text-xs font-medium text-blue-800 shadow-2xs hover:bg-blue-100 hover:border-blue-300 transition-colors"
                    >
                      + {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {formMsg && (
              <div
                className={`mt-4 rounded-xl p-3 text-xs font-semibold ${
                  formMsg.type === "ok"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {formMsg.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {selectedBank && <input type="hidden" name="id" value={selectedBank.id} />}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Bank / Method Name *</label>
                  <input
                    type="text"
                    name="bankName"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. ABA Bank (KHQR)"
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Bank Code / Tag</label>
                  <input
                    type="text"
                    name="bankCode"
                    value={bankCode}
                    onChange={(e) => setBankCode(e.target.value)}
                    placeholder="e.g. ABA, WING, BAKONG, ACLEDA"
                    className="input uppercase"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Account Holder Name *</label>
                  <input
                    type="text"
                    name="accountName"
                    required
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="e.g. SNL PLATFORM CO., LTD"
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Account Number / Bakong ID *</label>
                  <input
                    type="text"
                    name="accountNumber"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. 001 889 999 or user@bkng"
                    className="input font-mono"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Currency</label>
                  <select
                    name="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="input"
                  >
                    <option value="USD">USD ($ - US Dollar)</option>
                    <option value="KHR">KHR (៛ - Khmer Riel)</option>
                  </select>
                </div>

                <div>
                  <label className="label">Display Order</label>
                  <input
                    type="number"
                    name="displayOrder"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                    className="input"
                  />
                </div>
              </div>

              {/* KHQR Image Uploader */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-red-600" />
                  <div>
                    <h4 className="text-xs font-bold text-navy-900">KHQR Code / QR Image Upload</h4>
                    <p className="text-[11px] text-slate-500">
                      Upload your official KHQR code screenshot or generated QR image. Customers will scan this to pay.
                    </p>
                  </div>
                </div>
                <ImageUploader
                  name="qrImageUrl"
                  defaultValue={qrImageUrl}
                  aspect="square"
                  helpText="Upload PNG, JPG or WebP KHQR code image (Square recommended)"
                />
              </div>

              {/* Bank Logo Uploader */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="text-xs font-bold text-navy-900">Bank Logo Image</h4>
                    <p className="text-[11px] text-slate-500">
                      Upload the bank branding logo to display on checkout and deposit cards.
                    </p>
                  </div>
                </div>
                <ImageUploader
                  name="logoUrl"
                  defaultValue={logoUrl}
                  aspect="avatar"
                  helpText="Upload bank logo (e.g. ABA, Wing, Bakong logo)"
                />
              </div>

              <div>
                <label className="label">Transfer Instructions & Remark Note</label>
                <textarea
                  name="instructions"
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Scan via ABA Mobile or cross-bank KHQR. Transfer exact amount and upload receipt."
                  className="input"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  value="true"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-gold-500 focus:ring-gold-500"
                />
                <label htmlFor="active" className="text-xs font-semibold text-navy-900 cursor-pointer">
                  Activate this bank immediately for customer & merchant deposits
                </label>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-primary text-xs flex items-center gap-1.5"
                >
                  {isPending ? "Saving..." : selectedBank ? "Save Changes" : "Create Platform Bank"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

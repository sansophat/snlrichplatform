"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { reviewDepositRequestAction } from "@/app/actions/bank";
import { money } from "@/lib/format";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Eye,
  FileText,
  Search,
  Filter,
  ArrowDownRight,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";

type DepositItem = {
  id: string;
  userId: string;
  bankId: string | null;
  bankName: string;
  accountNumber: string | null;
  amountCents: number;
  currency: string;
  receiptUrl: string | null;
  reference: string | null;
  notes: string | null;
  status: string; // PENDING | APPROVED | REJECTED
  adminNotes: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl: string | null;
    walletCents: number;
    kycStatus: string;
  };
  bank?: {
    bankName: string;
    bankCode: string | null;
    logoUrl: string | null;
    accountNumber: string;
  } | null;
};

export function DepositsTable({ deposits }: { deposits: DepositItem[] }) {
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [reviewModalDeposit, setReviewModalDeposit] = useState<DepositItem | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  const [resultMsg, setResultMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const filteredDeposits = deposits.filter((d) => {
    if (filter !== "ALL" && d.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = d.user.name.toLowerCase().includes(q);
      const matchEmail = d.user.email.toLowerCase().includes(q);
      const matchBank = d.bankName.toLowerCase().includes(q);
      const matchRef = d.reference?.toLowerCase().includes(q) ?? false;
      return matchName || matchEmail || matchBank || matchRef;
    }
    return true;
  });

  async function handleReviewSubmit(action: "APPROVE" | "REJECT") {
    if (!reviewModalDeposit) return;
    setResultMsg(null);

    const fd = new FormData();
    fd.append("id", reviewModalDeposit.id);
    fd.append("action", action);
    fd.append("adminNotes", adminNotes);

    startTransition(async () => {
      const res = await reviewDepositRequestAction({}, fd);
      if (res?.error) {
        setResultMsg({ type: "err", text: res.error });
      } else {
        setResultMsg({ type: "ok", text: res?.ok || "Processed successfully!" });
        setTimeout(() => {
          setReviewModalDeposit(null);
          setAdminNotes("");
        }, 800);
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Filters and search bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "All Deposits" },
            { id: "PENDING", label: "Pending Review" },
            { id: "APPROVED", label: "Approved" },
            { id: "REJECTED", label: "Rejected" },
          ].map((tab) => {
            const count =
              tab.id === "ALL"
                ? deposits.length
                : deposits.filter((d) => d.status === tab.id).length;
            const active = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  active
                    ? "bg-navy-900 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by user, bank, ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9 text-xs"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3 px-4">User / Account</th>
                <th className="py-3 px-4">Bank & KHQR</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Receipt Slip</th>
                <th className="py-3 px-4">Reference / Remark</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredDeposits.map((item) => {
                const isPendingState = item.status === "PENDING";
                const isApproved = item.status === "APPROVED";
                const isRejected = item.status === "REJECTED";

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* User */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-slate-100">
                          {item.user.avatarUrl ? (
                            <Image
                              src={item.user.avatarUrl}
                              alt={item.user.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center font-bold text-navy-800 text-xs">
                              {item.user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-navy-900">{item.user.name}</span>
                            <span className="rounded bg-slate-100 px-1 py-0.5 text-[9px] font-bold text-slate-600 uppercase">
                              {item.user.role}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400">{item.user.email}</span>
                          <div className="text-[10px] text-slate-500 font-medium">
                            Wallet: <strong className="text-navy-900">{money(item.user.walletCents)}</strong>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Bank */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-navy-900">{item.bankName}</div>
                      {item.accountNumber && (
                        <div className="font-mono text-[11px] text-slate-500">
                          {item.accountNumber}
                        </div>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4">
                      <div className="font-black text-sm text-emerald-600">
                        {money(item.amountCents)}
                      </div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {item.currency}
                      </span>
                    </td>

                    {/* Receipt Slip */}
                    <td className="py-3.5 px-4">
                      {item.receiptUrl ? (
                        <button
                          type="button"
                          onClick={() => setSelectedReceipt(item.receiptUrl)}
                          className="group relative flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs hover:border-navy-900 transition-colors"
                        >
                          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-100">
                            <Image
                              src={item.receiptUrl}
                              alt="Receipt Slip"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="text-left">
                            <span className="block text-[11px] font-bold text-navy-900 group-hover:text-blue-600 flex items-center gap-1">
                              <Eye className="h-3 w-3" /> View Slip
                            </span>
                            <span className="block text-[10px] text-slate-400">Click to expand</span>
                          </div>
                        </button>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">No receipt uploaded</span>
                      )}
                    </td>

                    {/* Reference / Note */}
                    <td className="py-3.5 px-4">
                      {item.reference ? (
                        <div className="font-mono font-bold text-slate-800 text-[11px]">
                          {item.reference}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">None</span>
                      )}
                      {item.notes && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5 line-clamp-1">
                          &ldquo;{item.notes}&rdquo;
                        </p>
                      )}
                      {item.adminNotes && (
                        <p className="text-[10px] text-blue-700 mt-1">
                          <strong>Admin:</strong> {item.adminNotes}
                        </p>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {isPendingState && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 border border-amber-200">
                          <Clock className="h-3 w-3 animate-spin text-amber-600" /> Pending Review
                        </span>
                      )}
                      {isApproved && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Approved
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-bold text-red-800 border border-red-200">
                          <XCircle className="h-3 w-3 text-red-600" /> Rejected
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {isPendingState ? (
                        <button
                          type="button"
                          onClick={() => {
                            setReviewModalDeposit(item);
                            setAdminNotes("");
                            setResultMsg(null);
                          }}
                          className="btn-primary text-xs py-1 px-3 shadow-xs"
                        >
                          Review Deposit
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setReviewModalDeposit(item);
                            setAdminNotes(item.adminNotes || "");
                            setResultMsg(null);
                          }}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 text-slate-600 hover:bg-slate-50 text-[11px] font-bold"
                        >
                          Details
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredDeposits.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <FileText className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-2 text-xs font-semibold">No deposit requests found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Dialog Modal */}
      {reviewModalDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-navy-900">
                  Review Deposit #{reviewModalDeposit.id.slice(-6)}
                </h3>
                <p className="text-xs text-slate-500">
                  Verify the transfer receipt slip and credit the customer/merchant wallet.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewModalDeposit(null)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {resultMsg && (
              <div
                className={`mt-4 rounded-xl p-3 text-xs font-semibold ${
                  resultMsg.type === "ok"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {resultMsg.text}
              </div>
            )}

            {/* Deposit Info summary */}
            <div className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-4 border border-slate-100 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">User:</span>
                <span className="font-bold text-navy-900">
                  {reviewModalDeposit.user.name} ({reviewModalDeposit.user.email})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Current Wallet Balance:</span>
                <span className="font-bold text-navy-900">
                  {money(reviewModalDeposit.user.walletCents)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-500">Deposit Amount:</span>
                <span className="text-base font-black text-emerald-600">
                  +{money(reviewModalDeposit.amountCents)} {reviewModalDeposit.currency}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Bank Channel:</span>
                <span className="font-semibold text-navy-900">{reviewModalDeposit.bankName}</span>
              </div>
              {reviewModalDeposit.reference && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Transaction Reference:</span>
                  <span className="font-mono font-bold text-navy-900">
                    {reviewModalDeposit.reference}
                  </span>
                </div>
              )}
            </div>

            {/* Receipt Preview */}
            {reviewModalDeposit.receiptUrl && (
              <div className="mt-4">
                <label className="label">Uploaded Receipt Slip</label>
                <div
                  onClick={() => setSelectedReceipt(reviewModalDeposit.receiptUrl)}
                  className="relative h-44 w-full cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 group"
                >
                  <Image
                    src={reviewModalDeposit.receiptUrl}
                    alt="Receipt Slip"
                    fill
                    className="object-contain"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-bold gap-1">
                    <Eye className="h-4 w-4" /> Click to enlarge
                  </div>
                </div>
              </div>
            )}

            {/* Admin notes input */}
            <div className="mt-4">
              <label className="label">Admin Verification Remark / Notes</label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Optional notes for user or internal audit..."
                className="input text-xs"
              />
            </div>

            {/* Buttons */}
            {reviewModalDeposit.status === "PENDING" ? (
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleReviewSubmit("REJECT")}
                  className="rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Reject Deposit
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleReviewSubmit("APPROVE")}
                  className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {isPending ? "Approving..." : `Approve & Credit ${money(reviewModalDeposit.amountCents)}`}
                </button>
              </div>
            ) : (
              <div className="mt-6 border-t border-slate-100 pt-3 text-center text-xs font-semibold text-slate-500">
                This request was already {reviewModalDeposit.status.toLowerCase()} on{" "}
                {reviewModalDeposit.reviewedAt
                  ? new Date(reviewModalDeposit.reviewedAt).toLocaleDateString()
                  : "N/A"}
                .
              </div>
            )}
          </div>
        </div>
      )}

      {/* Large Image Modal */}
      {selectedReceipt && (
        <div
          onClick={() => setSelectedReceipt(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm cursor-zoom-out animate-in fade-in duration-150"
        >
          <div className="relative max-h-[90vh] max-w-2xl overflow-hidden rounded-2xl bg-white p-2 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedReceipt(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/90"
            >
              ✕
            </button>
            <div className="relative h-[75vh] w-[85vw] max-w-xl">
              <Image
                src={selectedReceipt}
                alt="Receipt Slip Full Preview"
                fill
                className="object-contain"
              />
            </div>
            <div className="p-3 text-center text-xs text-slate-500">
              Receipt Slip Preview · Click outside to close
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

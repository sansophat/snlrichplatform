"use client";

import { useState } from "react";
import Image from "next/image";
import { dateFmt } from "@/lib/format";
import { reviewKycAction, bypassKycAction } from "@/app/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";
import {
  ShieldCheck, ShieldAlert, Clock, Check, X, Eye, FileText,
  UserCheck, AlertCircle, Ban, CheckCircle2, Search
} from "lucide-react";

type UserKycRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  kycStatus: string;
  kycDocumentType?: string | null;
  kycFullName?: string | null;
  kycIdNumber?: string | null;
  kycDocumentUrl?: string | null;
  kycDocumentBackUrl?: string | null;
  kycNotes?: string | null;
  kycSubmittedAt?: Date | null;
  kycReviewedAt?: Date | null;
  merchant?: { name: string; slug: string } | null;
};

export function KycReviewTable({ users }: { users: UserKycRow[] }) {
  const [filter, setFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [activeDoc, setActiveDoc] = useState<UserKycRow | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    const matchesFilter =
      filter === "ALL"
        ? true
        : filter === "PENDING"
        ? u.kycStatus === "PENDING"
        : filter === "VERIFIED"
        ? u.kycStatus === "VERIFIED"
        : filter === "BYPASSED"
        ? u.kycStatus === "BYPASSED"
        : filter === "REJECTED"
        ? u.kycStatus === "REJECTED"
        : filter === "NOT_SUBMITTED"
        ? u.kycStatus === "NOT_SUBMITTED" || !u.kycStatus
        : true;

    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.kycFullName && u.kycFullName.toLowerCase().includes(q)) ||
      (u.kycIdNumber && u.kycIdNumber.toLowerCase().includes(q));

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-100 p-1 text-xs font-semibold">
          {[
            { id: "ALL", label: `All (${users.length})` },
            { id: "PENDING", label: `Pending (${users.filter((u) => u.kycStatus === "PENDING").length})` },
            { id: "VERIFIED", label: `Verified (${users.filter((u) => u.kycStatus === "VERIFIED").length})` },
            { id: "BYPASSED", label: `Bypassed (${users.filter((u) => u.kycStatus === "BYPASSED").length})` },
            { id: "REJECTED", label: `Rejected (${users.filter((u) => u.kycStatus === "REJECTED").length})` },
            { id: "NOT_SUBMITTED", label: `Not Submitted (${users.filter((u) => u.kycStatus === "NOT_SUBMITTED" || !u.kycStatus).length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`rounded-lg px-3 py-1.5 transition ${
                filter === tab.id
                  ? "bg-white text-navy-900 shadow-xs"
                  : "text-slate-600 hover:text-navy-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search users or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input !py-1.5 pl-8 text-xs max-w-xs"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-x-auto border border-slate-200/90 shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-bold text-slate-600">
            <tr>
              <th className="th">User / Account</th>
              <th className="th">Role</th>
              <th className="th">Document Details</th>
              <th className="th">KYC Status</th>
              <th className="th">Submitted</th>
              <th className="th text-right">Admin Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((u) => {
              const statusTone =
                u.kycStatus === "VERIFIED"
                  ? "bg-emerald-100 text-emerald-800"
                  : u.kycStatus === "BYPASSED"
                  ? "bg-purple-100 text-purple-800"
                  : u.kycStatus === "PENDING"
                  ? "bg-blue-100 text-blue-800 font-bold animate-pulse"
                  : u.kycStatus === "REJECTED"
                  ? "bg-red-100 text-red-800"
                  : "bg-slate-100 text-slate-600";

              return (
                <tr key={u.id} className="hover:bg-slate-50/60 transition">
                  <td className="td">
                    <div className="font-semibold text-navy-900">{u.name}</div>
                    <div className="text-xs text-slate-500">{u.email}</div>
                    {u.merchant && (
                      <div className="text-[11px] font-medium text-navy-600">
                        🏪 Store: {u.merchant.name}
                      </div>
                    )}
                  </td>
                  <td className="td">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                      {u.role}
                    </span>
                  </td>
                  <td className="td">
                    {u.kycFullName || u.kycIdNumber ? (
                      <div className="space-y-0.5 text-xs">
                        <div className="font-medium text-slate-800">{u.kycFullName || "—"}</div>
                        <div className="text-slate-500 font-mono text-[11px]">
                          {u.kycDocumentType}: {u.kycIdNumber}
                        </div>
                        {(u.kycDocumentUrl || u.kycDocumentBackUrl) && (
                          <button
                            type="button"
                            onClick={() => setActiveDoc(u)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-navy-700 underline hover:text-navy-900 pt-0.5"
                          >
                            <Eye size={12} /> View Documents
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No document submitted</span>
                    )}
                  </td>
                  <td className="td">
                    <span className={`badge ${statusTone}`}>
                      {u.kycStatus || "NOT_SUBMITTED"}
                    </span>
                    {u.kycNotes && (
                      <p className="mt-1 text-[11px] text-slate-500 max-w-[180px] truncate" title={u.kycNotes}>
                        {u.kycNotes}
                      </p>
                    )}
                  </td>
                  <td className="td text-xs text-slate-500">
                    {u.kycSubmittedAt ? dateFmt(u.kycSubmittedAt) : "—"}
                  </td>
                  <td className="td text-right">
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      {/* Approve button (if pending or rejected) */}
                      {u.kycStatus !== "VERIFIED" && (
                        <form action={reviewKycAction}>
                          <input type="hidden" name="userId" value={u.id} />
                          <input type="hidden" name="status" value="VERIFIED" />
                          <input type="hidden" name="notes" value="Approved by compliance administrator" />
                          <SubmitButton className="btn btn-outline btn-sm !py-1 !px-2.5 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50" pendingText="…">
                            <Check size={12} className="mr-1" /> Approve
                          </SubmitButton>
                        </form>
                      )}

                      {/* Bypass Button (always available for admin!) */}
                      {u.kycStatus !== "BYPASSED" && (
                        <form action={bypassKycAction}>
                          <input type="hidden" name="userId" value={u.id} />
                          <SubmitButton
                            className="btn btn-outline btn-sm !py-1 !px-2.5 text-xs text-purple-700 border-purple-300 hover:bg-purple-50"
                            pendingText="…"
                            title="Bypass KYC requirement without requiring documents"
                          >
                            <ShieldCheck size={12} className="mr-1" /> Bypass KYC
                          </SubmitButton>
                        </form>
                      )}

                      {/* Reject Form Button */}
                      {u.kycStatus !== "REJECTED" && (
                        <button
                          type="button"
                          onClick={() => setRejectingId(rejectingId === u.id ? null : u.id)}
                          className="btn btn-outline btn-sm !py-1 !px-2.5 text-xs text-red-600 border-red-300 hover:bg-red-50"
                        >
                          Reject
                        </button>
                      )}
                    </div>

                    {/* Inline Rejection Reason Form */}
                    {rejectingId === u.id && (
                      <form action={reviewKycAction} className="mt-2 text-left bg-slate-50 p-2.5 rounded-lg border border-red-200">
                        <input type="hidden" name="userId" value={u.id} />
                        <input type="hidden" name="status" value="REJECTED" />
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">Rejection Reason</label>
                        <input
                          name="notes"
                          placeholder="e.g. Blurry ID, expired document..."
                          className="input !py-1 text-xs mb-1.5 w-full"
                          required
                        />
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setRejectingId(null)}
                            className="btn btn-outline btn-sm !py-0.5 !px-2 text-xs"
                          >
                            Cancel
                          </button>
                          <SubmitButton className="btn btn-danger btn-sm !py-0.5 !px-2 text-xs" pendingText="…">
                            Confirm Reject
                          </SubmitButton>
                        </div>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="td text-center text-slate-400 py-10">
                  No users found matching the selected filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Document Viewer Modal */}
      {activeDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="card max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-navy-900">
                  KYC Documents: {activeDoc.name}
                </h3>
                <p className="text-xs text-slate-500">{activeDoc.email} · {activeDoc.kycDocumentType}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveDoc(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="rounded-xl bg-slate-50 p-3 text-xs grid grid-cols-2 gap-2 text-slate-700 border border-slate-200">
                <div>Legal Name: <b>{activeDoc.kycFullName}</b></div>
                <div>ID Number: <b>{activeDoc.kycIdNumber}</b></div>
                <div>Status: <b>{activeDoc.kycStatus}</b></div>
                <div>Submitted: <b>{activeDoc.kycSubmittedAt ? dateFmt(activeDoc.kycSubmittedAt) : "—"}</b></div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {activeDoc.kycDocumentUrl ? (
                  <div>
                    <p className="text-xs font-bold text-slate-700 mb-1.5">Document Front</p>
                    <div className="relative h-56 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={activeDoc.kycDocumentUrl}
                        alt="Front ID"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <a
                      href={activeDoc.kycDocumentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block text-center text-[11px] font-semibold text-navy-700 underline"
                    >
                      Open Full Image ↗
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No front photo provided.</p>
                )}

                {activeDoc.kycDocumentBackUrl ? (
                  <div>
                    <p className="text-xs font-bold text-slate-700 mb-1.5">Document Back</p>
                    <div className="relative h-56 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={activeDoc.kycDocumentBackUrl}
                        alt="Back ID"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <a
                      href={activeDoc.kycDocumentBackUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block text-center text-[11px] font-semibold text-navy-700 underline"
                    >
                      Open Full Image ↗
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No back photo provided.</p>
                )}
              </div>

              {/* Action buttons inside modal */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <form action={reviewKycAction} onSubmit={() => setActiveDoc(null)}>
                  <input type="hidden" name="userId" value={activeDoc.id} />
                  <input type="hidden" name="status" value="VERIFIED" />
                  <SubmitButton className="btn btn-primary btn-sm !bg-emerald-600 hover:!bg-emerald-700" pendingText="…">
                    <Check size={14} className="mr-1" /> Approve KYC
                  </SubmitButton>
                </form>
                <form action={bypassKycAction} onSubmit={() => setActiveDoc(null)}>
                  <input type="hidden" name="userId" value={activeDoc.id} />
                  <SubmitButton className="btn btn-secondary btn-sm" pendingText="…">
                    <ShieldCheck size={14} className="mr-1" /> Bypass KYC
                  </SubmitButton>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

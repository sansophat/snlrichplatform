import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DepositsTable } from "./DepositsTable";
import { money } from "@/lib/format";
import { ArrowDownLeft, Clock, CheckCircle2, XCircle, Wallet } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Deposits & Top-up Approvals | SNLRICH Admin" };

export default async function AdminDepositsPage() {
  await requireAdmin();

  const deposits = await prisma.depositRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          walletCents: true,
          kycStatus: true,
        },
      },
      bank: {
        select: {
          bankName: true,
          bankCode: true,
          logoUrl: true,
          accountNumber: true,
        },
      },
    },
  });

  const pendingDeposits = deposits.filter((d) => d.status === "PENDING");
  const approvedDeposits = deposits.filter((d) => d.status === "APPROVED");
  const rejectedDeposits = deposits.filter((d) => d.status === "REJECTED");

  const pendingTotalCents = pendingDeposits.reduce((sum, d) => sum + d.amountCents, 0);
  const approvedTotalCents = approvedDeposits.reduce((sum, d) => sum + d.amountCents, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ArrowDownLeft className="h-6 w-6 text-emerald-600" />
            <h1 className="text-2xl font-bold text-navy-900">Deposits & Top-ups Queue</h1>
            {pendingDeposits.length > 0 && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 animate-pulse">
                {pendingDeposits.length} Pending
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review submitted Cambodia bank transfer slips & KHQR deposits from customers and merchants. Approving immediately credits their digital wallet.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Requests</span>
            <Wallet className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-navy-900">{deposits.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">All time submissions</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Pending Review</span>
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-amber-950">{pendingDeposits.length}</p>
          <p className="text-[11px] text-amber-800 font-semibold mt-0.5">{money(pendingTotalCents)} to review</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Total Approved</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-950">{approvedDeposits.length}</p>
          <p className="text-[11px] text-emerald-800 font-semibold mt-0.5">{money(approvedTotalCents)} credited</p>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50/60 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-red-800">Rejected</span>
            <XCircle className="h-4 w-4 text-red-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-red-950">{rejectedDeposits.length}</p>
          <p className="text-[11px] text-red-800 mt-0.5">Failed verification</p>
        </div>
      </div>

      {/* Table */}
      <DepositsTable deposits={deposits} />
    </div>
  );
}

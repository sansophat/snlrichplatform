import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { KycReviewTable } from "./KycReviewTable";
import { ShieldCheck, Users, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "KYC Compliance & Verification | SNLRICH Admin" };

export default async function AdminKycPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      merchant: { select: { name: true, slug: true } },
    },
  });

  const pendingCount = users.filter((u) => u.kycStatus === "PENDING").length;
  const verifiedCount = users.filter((u) => u.kycStatus === "VERIFIED").length;
  const bypassedCount = users.filter((u) => u.kycStatus === "BYPASSED").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-navy-900">KYC Compliance & Verification</h1>
            {pendingCount > 0 && (
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800 animate-pulse">
                {pendingCount} Pending Review
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Review submitted government ID documents for customers and store merchants, approve verified records, or bypass KYC.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Accounts</p>
          <p className="mt-1 text-2xl font-black text-navy-900">{users.length}</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Pending Review</p>
          <p className="mt-1 text-2xl font-black text-blue-950">{pendingCount}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Verified</p>
          <p className="mt-1 text-2xl font-black text-emerald-950">{verifiedCount}</p>
        </div>
        <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-4 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-purple-700">Admin Bypassed</p>
          <p className="mt-1 text-2xl font-black text-purple-950">{bypassedCount}</p>
        </div>
      </div>

      {/* Review Table Component */}
      <KycReviewTable users={users} />
    </div>
  );
}

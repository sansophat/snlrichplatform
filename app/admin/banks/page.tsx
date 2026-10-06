import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { BankManagerClient } from "./BankManagerClient";
import { Landmark, QrCode, ShieldCheck, ArrowRightLeft } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cambodia Banks & KHQR | SNLRICH Admin" };

export default async function AdminBanksPage() {
  await requireAdmin();

  const banks = await prisma.platformBank.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    include: {
      _count: {
        select: { deposits: true },
      },
    },
  });

  const activeCount = banks.filter((b) => b.active).length;
  const totalDeposits = banks.reduce((sum, b) => sum + (b._count?.deposits ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <Landmark className="h-6 w-6 text-navy-900" />
          <h1 className="text-2xl font-bold text-navy-900">Cambodia Banks & KHQR Management</h1>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Set up Cambodia payment accounts, KHQR codes (ABA Pay, Bakong, Wing, ACLEDA) with scannable QR images, logos, and account numbers. Customers and store merchants can choose from these banks when depositing funds.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Banks</span>
            <Landmark className="h-4 w-4 text-slate-400" />
          </div>
          <p className="mt-2 text-2xl font-black text-navy-900">{banks.length}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Configured Cambodia methods</p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Active Deposit Channels</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-950">{activeCount}</p>
          <p className="text-[11px] text-emerald-700 mt-0.5">Shown to users for deposits</p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Deposits Handled</span>
            <ArrowRightLeft className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-2 text-2xl font-black text-blue-950">{totalDeposits}</p>
          <p className="text-[11px] text-blue-700 mt-0.5">Customer & merchant top-ups</p>
        </div>
      </div>

      {/* Client manager */}
      <BankManagerClient banks={banks} />
    </div>
  );
}

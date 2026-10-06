import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { WalletManager } from "./WalletManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Wallet & Points · SNLRICH" };

export default async function WalletPage() {
  const user = await requireUser();

  const [transactions, banks, depositRequests] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.platformBank.findMany({
      where: { active: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    }),
    prisma.depositRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-navy-900 tracking-tight">SNLRICH Wallet & Points</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your digital shopping balance, deposit via Cambodia banks / KHQR, redeem points for cash, and buy directly from any merchant store.
        </p>
      </div>

      <WalletManager
        user={user}
        transactions={transactions}
        banks={banks}
        depositRequests={depositRequests}
      />
    </div>
  );
}

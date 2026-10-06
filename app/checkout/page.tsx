import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { CheckoutForm } from "./CheckoutForm";

export const metadata = { title: "Checkout" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await requireUser();
  const isVerified = user.kycStatus === "VERIFIED" || user.kycStatus === "BYPASSED";

  const banks = await prisma.platformBank.findMany({
    where: { active: true },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="container-x py-8">
      <h1 className="mb-6 text-2xl font-bold text-navy-900">Checkout</h1>
      <CheckoutForm
        userName={user.name}
        points={user.points}
        walletCents={user.walletCents}
        kycStatus={user.kycStatus}
        isVerified={isVerified}
        banks={banks}
      />
    </div>
  );
}

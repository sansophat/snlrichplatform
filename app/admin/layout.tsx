import { requireAdmin } from "@/lib/auth";
import { SideNav } from "@/components/Dashboard";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="container-x flex flex-col gap-8 py-8 md:flex-row">
      <SideNav
        title="Admin"
        items={[
          { href: "/admin", label: "Overview", exact: true },
          { href: "/admin/merchants", label: "Merchants" },
          { href: "/admin/products", label: "Products & Approval" },
          { href: "/admin/categories", label: "Categories" },
          { href: "/admin/users", label: "Users & rewards" },
          { href: "/admin/kyc", label: "KYC Compliance" },
          { href: "/admin/banks", label: "Cambodia Banks & KHQR" },
          { href: "/admin/deposits", label: "Deposits & Top-ups" },
          { href: "/admin/orders", label: "Orders" },
          { href: "/admin/payouts", label: "Payout Requests" },
          { href: "/admin/coupons", label: "Coupons" },
          { href: "/admin/settings", label: "Settings & Branding" },
        ]}
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

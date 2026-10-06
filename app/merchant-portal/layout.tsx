import { requireMerchant } from "@/lib/auth";
import { SideNav } from "@/components/Dashboard";

export default async function MerchantLayout({ children }: { children: React.ReactNode }) {
  const { merchant } = await requireMerchant();
  return (
    <div className="container-x flex flex-col gap-8 py-8 md:flex-row">
      <div>
        <SideNav
          title={merchant.name}
          items={[
            { href: "/merchant-portal", label: "Dashboard", exact: true },
            { href: "/merchant-portal/products", label: "Products & Stock" },
            { href: "/merchant-portal/orders", label: "Orders & Shipping" },
            { href: "/merchant-portal/payments", label: "Wallet & Payouts" },
            { href: "/merchant-portal/settings", label: "Store & Settings" },
          ]}
        />
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

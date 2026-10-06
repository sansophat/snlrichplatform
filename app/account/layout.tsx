import { requireUser } from "@/lib/auth";
import { SideNav } from "@/components/Dashboard";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  await requireUser();
  return (
    <div className="container-x flex flex-col gap-8 py-8 md:flex-row">
      <SideNav
        title="My account"
        items={[
          { href: "/account", label: "Overview", exact: true },
          { href: "/account/orders", label: "Orders" },
          { href: "/account/wallet", label: "Wallet & Points" },
          { href: "/account/rewards", label: "Points & cashback" },
          { href: "/account/referrals", label: "Refer & earn" },
          { href: "/account/wishlist", label: "Wishlist" },
          { href: "/account/profile", label: "Profile Settings" },
          { href: "/account/kyc", label: "KYC Verification" },
        ]}
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

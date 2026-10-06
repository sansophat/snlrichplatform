import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { productInclude } from "@/lib/queries";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Wishlist" };

export default async function WishlistPage() {
  const user = await requireUser();
  const items = await prisma.wishlistItem.findMany({
    where: { userId: user.id },
    include: { product: { include: productInclude } },
    orderBy: { id: "desc" },
  });
  const visible = items.filter((i) => i.product.active);
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-navy-900">Wishlist</h1>
      {visible.length === 0 ? (
        <p className="text-slate-500">Tap the heart on any product to save it here.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {visible.map((i) => <ProductCard key={i.id} product={i.product} wished />)}
        </div>
      )}
    </div>
  );
}

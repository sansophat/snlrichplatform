import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const categories = [
  { name: "Fashion", emoji: "👜" },
  { name: "Beauty & Personal Care", emoji: "💄" },
  { name: "Electronics", emoji: "🎧" },
  { name: "Home & Living", emoji: "🛋️" },
  { name: "Sports & Outdoors", emoji: "👟" },
  { name: "Toys & Games", emoji: "🧸" },
  { name: "Automotive", emoji: "🛞" },
  { name: "Books & Stationery", emoji: "📚" },
  { name: "Pet Supplies", emoji: "🐾" },
];

type P = [name: string, cat: string, price: number, compare: number | null, stock: number, desc: string, featured?: boolean];

const merchants: {
  name: string;
  email: string;
  emoji: string;
  description: string;
  pointsRate: number;
  cashbackPct: number;
  products: P[];
}[] = [
  {
    name: "Nebula Tech",
    email: "tech@snlrich.com",
    emoji: "🔌",
    description: "Everyday gadgets and audio gear from top brands.",
    pointsRate: 2,
    cashbackPct: 3,
    products: [
      ["Bluetooth Speaker", "Electronics", 49.99, 69.99, 40, "Portable 360° sound with 12-hour battery.", true],
      ["Smart Watch", "Electronics", 89.99, 119.99, 25, "Heart-rate, sleep and workout tracking with a bright AMOLED display.", true],
      ["Wireless Earbuds", "Electronics", 29.99, 49.99, 80, "Noise-reducing earbuds with a pocket charging case.", true],
      ["Over-Ear Headphones", "Electronics", 74.5, null, 30, "Studio-quality sound and plush memory-foam ear cups."],
      ["Power Bank 20000mAh", "Electronics", 34.0, 44.0, 60, "Fast-charging power bank with dual USB-C ports."],
      ["Gaming Controller", "Toys & Games", 39.99, null, 35, "Ergonomic wireless controller for PC and consoles.", true],
      ["Car Phone Mount", "Automotive", 14.99, 19.99, 100, "Magnetic dashboard mount with one-hand operation."],
      ["Dash Cam 1080p", "Automotive", 59.0, 79.0, 20, "Loop recording, night vision and G-sensor."],
    ],
  },
  {
    name: "Urban Threads",
    email: "fashion@snlrich.com",
    emoji: "👗",
    description: "Modern fashion and lifestyle essentials.",
    pointsRate: 3,
    cashbackPct: 5,
    products: [
      ["Leather Handbag", "Fashion", 79.0, 99.0, 18, "Hand-finished vegan leather tote in sunset yellow.", true],
      ["Classic Sunglasses", "Fashion", 24.99, 34.99, 70, "UV400 polarised lenses with a lightweight frame.", true],
      ["Navy Backpack", "Fashion", 34.99, null, 45, "Water-resistant 22L daypack with laptop sleeve.", true],
      ["White Sneakers", "Sports & Outdoors", 64.0, 85.0, 50, "Comfort-cushioned everyday sneakers.", true],
      ["Tailored Blazer", "Fashion", 99.0, 140.0, 12, "Soft lavender blazer with a modern slim fit."],
      ["Stainless Steel Bottle", "Sports & Outdoors", 19.99, null, 120, "Keeps drinks cold 24h or hot 12h. 750ml.", true],
      ["Yoga Mat", "Sports & Outdoors", 27.5, 35.0, 55, "Non-slip 6mm mat with carrying strap."],
      ["Running Cap", "Sports & Outdoors", 12.99, null, 90, "Breathable quick-dry cap with reflective trim."],
    ],
  },
  {
    name: "Home & Glow",
    email: "home@snlrich.com",
    emoji: "🏡",
    description: "Skincare, decor and cosy living for every room.",
    pointsRate: 2,
    cashbackPct: 4,
    products: [
      ["Skincare Trio Set", "Beauty & Personal Care", 42.0, 58.0, 35, "Cleanser, toner and daily moisturiser for glowing skin.", true],
      ["Rose Lip Tint", "Beauty & Personal Care", 11.5, null, 150, "Hydrating tint with a natural satin finish."],
      ["Modern Table Lamp", "Home & Living", 39.0, 52.0, 22, "Warm-light ceramic lamp with linen shade.", true],
      ["Velvet Armchair", "Home & Living", 189.0, 249.0, 8, "Emerald velvet accent chair with solid-wood legs."],
      ["Ceramic Plant Pot", "Home & Living", 16.0, null, 65, "Minimal matte pot with drainage tray."],
      ["Teddy Bear Plush", "Toys & Games", 18.0, 24.0, 75, "Ultra-soft 30cm teddy, perfect gift.", true],
      ["Bestseller Book Bundle", "Books & Stationery", 32.0, 48.0, 40, "Set of 4 bestselling paperbacks.", true],
      ["Dog Chew Toy Set", "Pet Supplies", 13.99, null, 85, "Durable, non-toxic chew toys for medium dogs."],
    ],
  },
];

async function main() {
  console.log("Seeding SNLRICH…");

  const adminPw = await bcrypt.hash("Admin@12345", 10);
  const userPw = await bcrypt.hash("Demo@12345", 10);

  await prisma.user.upsert({
    where: { email: "admin@snlrich.com" },
    update: {},
    create: { email: "admin@snlrich.com", name: "SNLRICH Admin", passwordHash: adminPw, role: "ADMIN", referralCode: "SNLADMIN" },
  });

  const cats: Record<string, string> = {};
  for (const c of categories) {
    const row = await prisma.category.upsert({
      where: { slug: slug(c.name) },
      update: { emoji: c.emoji, name: c.name },
      create: { name: c.name, slug: slug(c.name), emoji: c.emoji },
    });
    cats[c.name] = row.id;
  }

  for (const m of merchants) {
    const owner = await prisma.user.upsert({
      where: { email: m.email },
      update: {},
      create: {
        email: m.email,
        name: `${m.name} Owner`,
        passwordHash: userPw,
        role: "MERCHANT",
        referralCode: `SNL${slug(m.name).slice(0, 5).toUpperCase().replace(/-/g, "")}`,
      },
    });
    const merchant = await prisma.merchant.upsert({
      where: { ownerId: owner.id },
      update: {},
      create: {
        ownerId: owner.id,
        name: m.name,
        slug: slug(m.name),
        description: m.description,
        emoji: m.emoji,
        status: "ACTIVE",
        pointsRate: m.pointsRate,
        cashbackPct: m.cashbackPct,
        commissionPct: 10,
      },
    });
    const imageMap: Record<string, string> = {
      // Nebula Tech (Electronics, Toys & Games, Automotive)
      "bluetooth-speaker": "/images/bluetooth-speaker.jpg",
      "smart-watch": "/images/smart-watch.jpg",
      "wireless-earbuds": "/images/wireless-earbuds.jpg",
      "over-ear-headphones": "/images/over-ear-headphones.jpg",
      "power-bank-20000mah": "/images/power-bank-20000mah.jpg",
      "gaming-controller": "/images/gaming-controller.jpg",
      "car-phone-mount": "/images/car-phone-mount.jpg",
      "dash-cam-1080p": "/images/dash-cam-1080p.jpg",
      // Urban Threads (Fashion, Sports & Outdoors)
      "leather-handbag": "/images/leather-handbag.jpg",
      "classic-sunglasses": "/images/classic-sunglasses.jpg",
      "navy-backpack": "/images/navy-backpack.jpg",
      "white-sneakers": "/images/white-sneakers.jpg",
      "tailored-blazer": "/images/tailored-blazer.jpg",
      "stainless-steel-bottle": "/images/stainless-steel-bottle.jpg",
      "yoga-mat": "/images/yoga-mat.jpg",
      "running-cap": "/images/running-cap.jpg",
      // Home & Glow (Beauty, Home & Living, Toys, Books, Pet)
      "skincare-trio-set": "/images/skincare-trio-set.jpg",
      "rose-lip-tint": "/images/rose-lip-tint.jpg",
      "modern-table-lamp": "/images/modern-table-lamp.jpg",
      "velvet-armchair": "/images/velvet-armchair.jpg",
      "ceramic-plant-pot": "/images/ceramic-plant-pot.jpg",
      "teddy-bear-plush": "/images/teddy-bear-plush.jpg",
      "bestseller-book-bundle": "/images/bestseller-book-bundle.jpg",
      "dog-chew-toy-set": "/images/dog-chew-toy-set.jpg",
    };
    for (const [name, cat, price, compare, stock, desc, featured] of m.products) {
      const pSlug = slug(name);
      const img = imageMap[pSlug] ?? null;
      await prisma.product.upsert({
        where: { slug: pSlug },
        update: { imageUrl: img },
        create: {
          merchantId: merchant.id,
          categoryId: cats[cat],
          name,
          slug: pSlug,
          description: desc,
          priceCents: Math.round(price * 100),
          compareAtCents: compare ? Math.round(compare * 100) : null,
          stock,
          imageUrl: img,
          featured: !!featured,
        },
      });
    }
  }

  const demo = await prisma.user.upsert({
    where: { email: "demo@snlrich.com" },
    update: {},
    create: {
      email: "demo@snlrich.com",
      name: "Demo Customer",
      passwordHash: userPw,
      referralCode: "SNLDEMO1",
      points: 250,
      walletCents: 500,
    },
  });
  const hasTx = await prisma.transaction.count({ where: { userId: demo.id } });
  if (!hasTx) {
    await prisma.transaction.createMany({
      data: [
        { userId: demo.id, type: "POINTS", amount: 250, reason: "SIGNUP_BONUS", note: "Welcome bonus" },
        { userId: demo.id, type: "CASH", amount: 500, reason: "ADJUST", note: "Demo wallet credit" },
      ],
    });
  }

  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: { code: "WELCOME10", percentOff: 10, minSubtotalCents: 2000 },
  });
  await prisma.coupon.upsert({
    where: { code: "SAVE20" },
    update: {},
    create: { code: "SAVE20", percentOff: 20, minSubtotalCents: 10000, usesLeft: 100 },
  });

  console.log("Done.\n  Admin:    admin@snlrich.com / Admin@12345\n  Merchant: tech@snlrich.com / Demo@12345\n  Customer: demo@snlrich.com / Demo@12345");
}

main().finally(() => prisma.$disconnect());

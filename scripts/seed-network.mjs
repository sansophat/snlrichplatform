import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const demo = await prisma.user.findUnique({ where: { email: "demo@snlrich.com" } });
  if (!demo) {
    console.log("Demo customer not found.");
    return;
  }

  const pwHash = await bcrypt.hash("User@12345", 10);

  // Update demo customer with an avatar
  await prisma.user.update({
    where: { id: demo.id },
    data: {
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
      kycStatus: "VERIFIED",
    },
  });

  // Helper upsert with profile metadata
  async function makeMember({ email, name, avatarUrl, referralCode, referredById, referralRewarded, kycStatus, points, role = "CUSTOMER" }) {
    return prisma.user.upsert({
      where: { email },
      update: {
        referredById,
        referralRewarded,
        avatarUrl,
        kycStatus,
        points,
        role,
      },
      create: {
        email,
        name,
        passwordHash: pwHash,
        role,
        referralCode,
        referredById,
        referralRewarded,
        avatarUrl,
        kycStatus,
        points,
      },
    });
  }

  // Tier 1 (Direct to Demo Customer)
  const sophia = await makeMember({
    email: "sophia@example.com",
    name: "Sophia Martinez",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    referralCode: "SNLSOPH1",
    referredById: demo.id,
    referralRewarded: true,
    kycStatus: "VERIFIED",
    points: 1250,
  });

  const liam = await makeMember({
    email: "liam@example.com",
    name: "Liam Johnson",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    referralCode: "SNLLIAM2",
    referredById: demo.id,
    referralRewarded: true,
    kycStatus: "VERIFIED",
    points: 820,
  });

  const chloe = await makeMember({
    email: "chloe@example.com",
    name: "Chloe Bennett",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    referralCode: "SNLCHLO3",
    referredById: demo.id,
    referralRewarded: false,
    kycStatus: "PENDING",
    points: 300,
  });

  // Tier 2 (Direct to Sophia)
  const ethan = await makeMember({
    email: "ethan@example.com",
    name: "Ethan Brooks",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    referralCode: "SNLETHA4",
    referredById: sophia.id,
    referralRewarded: true,
    kycStatus: "VERIFIED",
    points: 650,
  });

  const olivia = await makeMember({
    email: "olivia@example.com",
    name: "Olivia Taylor",
    avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80",
    referralCode: "SNLOLIV5",
    referredById: sophia.id,
    referralRewarded: false,
    kycStatus: "NOT_SUBMITTED",
    points: 300,
  });

  // Tier 2 (Direct to Liam)
  const mason = await makeMember({
    email: "mason@example.com",
    name: "Mason Reed",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80",
    referralCode: "SNLMASO6",
    referredById: liam.id,
    referralRewarded: true,
    kycStatus: "VERIFIED",
    points: 450,
  });

  // Tier 3 (Direct to Ethan)
  const ava = await makeMember({
    email: "ava@example.com",
    name: "Ava Chen",
    avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
    referralCode: "SNLAVAC7",
    referredById: ethan.id,
    referralRewarded: true,
    kycStatus: "VERIFIED",
    points: 900,
  });

  const lucas = await makeMember({
    email: "lucas@example.com",
    name: "Lucas Patel",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
    referralCode: "SNLLUCA8",
    referredById: ethan.id,
    referralRewarded: false,
    kycStatus: "NOT_SUBMITTED",
    points: 300,
  });

  console.log("Seeded multi-tier downline network with avatars and KYC successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());

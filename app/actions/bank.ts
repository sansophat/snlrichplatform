"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin, requireUser } from "@/lib/auth";
import { money } from "@/lib/format";
import type { FormState } from "./auth";

/**
 * Admin: Create or update a Cambodia platform bank account / KHQR configuration
 */
export async function savePlatformBankAction(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();

  const id = String(fd.get("id") ?? "").trim();
  const bankName = String(fd.get("bankName") ?? "").trim();
  const bankCode = String(fd.get("bankCode") ?? "").trim().toUpperCase();
  const accountName = String(fd.get("accountName") ?? "").trim();
  const accountNumber = String(fd.get("accountNumber") ?? "").trim();
  const currency = String(fd.get("currency") ?? "USD").trim().toUpperCase();
  const qrImageUrl = String(fd.get("qrImageUrl") ?? "").trim();
  const logoUrl = String(fd.get("logoUrl") ?? "").trim();
  const instructions = String(fd.get("instructions") ?? "").trim();
  const displayOrder = parseInt(String(fd.get("displayOrder") ?? "0"), 10) || 0;
  const active = fd.get("active") === "true" || fd.get("active") === "on";

  if (!bankName) return { error: "Bank name is required (e.g., ABA Bank, Wing Bank)." };
  if (!accountName) return { error: "Account holder name is required." };
  if (!accountNumber) return { error: "Account number / Bakong ID is required." };

  if (id) {
    await prisma.platformBank.update({
      where: { id },
      data: {
        bankName,
        bankCode: bankCode || null,
        accountName,
        accountNumber,
        currency,
        qrImageUrl: qrImageUrl || null,
        logoUrl: logoUrl || null,
        instructions: instructions || null,
        displayOrder,
        active,
      },
    });
  } else {
    await prisma.platformBank.create({
      data: {
        bankName,
        bankCode: bankCode || null,
        accountName,
        accountNumber,
        currency,
        qrImageUrl: qrImageUrl || null,
        logoUrl: logoUrl || null,
        instructions: instructions || null,
        displayOrder,
        active,
      },
    });
  }

  revalidatePath("/admin/banks");
  revalidatePath("/account/wallet");
  revalidatePath("/checkout");

  return { ok: id ? "Bank details updated successfully!" : "New bank added successfully!" };
}

/**
 * Admin: Toggle active state of a platform bank
 */
export async function togglePlatformBankAction(bankId: string) {
  await requireAdmin();
  const bank = await prisma.platformBank.findUnique({ where: { id: bankId } });
  if (!bank) throw new Error("Bank not found");

  await prisma.platformBank.update({
    where: { id: bankId },
    data: { active: !bank.active },
  });

  revalidatePath("/admin/banks");
  revalidatePath("/account/wallet");
  revalidatePath("/checkout");
  return { success: true, active: !bank.active };
}

/**
 * Admin: Delete a platform bank
 */
export async function deletePlatformBankAction(bankId: string) {
  await requireAdmin();
  await prisma.platformBank.delete({ where: { id: bankId } });

  revalidatePath("/admin/banks");
  revalidatePath("/account/wallet");
  revalidatePath("/checkout");
  return { success: true };
}

/**
 * Customer / Merchant: Submit a deposit request with receipt slip upload & reference
 */
export async function submitDepositRequestAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();

  const bankId = String(fd.get("bankId") ?? "").trim();
  const amountStr = String(fd.get("amount") ?? "").trim();
  const amountDollars = parseFloat(amountStr);
  const receiptUrl = String(fd.get("receiptUrl") ?? "").trim();
  const reference = String(fd.get("reference") ?? "").trim();
  const notes = String(fd.get("notes") ?? "").trim();

  if (isNaN(amountDollars) || amountDollars <= 0) {
    return { error: "Please enter a valid deposit amount." };
  }

  const amountCents = Math.round(amountDollars * 100);
  if (amountCents < 100) {
    return { error: "Minimum deposit amount is $1.00." };
  }
  if (amountCents > 500000) {
    return { error: "Maximum single deposit is $5,000.00." };
  }

  let bankName = "Cambodia Bank Transfer";
  let accountNumber: string | null = null;
  let currency = "USD";

  if (bankId) {
    const bank = await prisma.platformBank.findUnique({ where: { id: bankId } });
    if (bank) {
      bankName = bank.bankName;
      accountNumber = bank.accountNumber;
      currency = bank.currency;
    }
  }

  if (!receiptUrl) {
    return { error: "Please upload your payment transfer receipt / slip screenshot." };
  }

  await prisma.depositRequest.create({
    data: {
      userId: user.id,
      bankId: bankId || null,
      bankName,
      accountNumber,
      amountCents,
      currency,
      receiptUrl,
      reference: reference || null,
      notes: notes || null,
      status: "PENDING",
    },
  });

  revalidatePath("/account/wallet");
  revalidatePath("/admin/deposits");

  return {
    ok: `Deposit request of ${money(amountCents)} submitted! Our team will verify your receipt and credit your wallet shortly.`,
  };
}

/**
 * Admin: Review deposit request (Approve & Credit Wallet or Reject)
 */
export async function reviewDepositRequestAction(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();

  const id = String(fd.get("id") ?? "").trim();
  const action = String(fd.get("action") ?? "").trim(); // APPROVE | REJECT
  const adminNotes = String(fd.get("adminNotes") ?? "").trim();

  if (!id) return { error: "Invalid deposit request ID." };

  const deposit = await prisma.depositRequest.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!deposit) return { error: "Deposit request not found." };
  if (deposit.status !== "PENDING") {
    return { error: `This deposit request has already been ${deposit.status.toLowerCase()}.` };
  }

  if (action === "APPROVE") {
    await prisma.$transaction(async (tx) => {
      // 1. Mark deposit as APPROVED
      await tx.depositRequest.update({
        where: { id },
        data: {
          status: "APPROVED",
          adminNotes: adminNotes || "Deposit approved and credited by admin.",
          reviewedAt: new Date(),
        },
      });

      // 2. Credit user wallet
      await tx.user.update({
        where: { id: deposit.userId },
        data: {
          walletCents: { increment: deposit.amountCents },
        },
      });

      // 3. Ledger transaction
      await tx.transaction.create({
        data: {
          userId: deposit.userId,
          type: "CASH",
          amount: deposit.amountCents,
          reason: "DEPOSIT",
          note: `Deposit approved via ${deposit.bankName}${deposit.reference ? ` (Ref: ${deposit.reference})` : ""}`,
        },
      });
    });

    revalidatePath("/admin/deposits");
    revalidatePath("/account/wallet");
    revalidatePath("/account", "layout");

    return { ok: `Approved deposit #${deposit.id.slice(-6)}! Credited ${money(deposit.amountCents)} to ${deposit.user.name}.` };
  } else if (action === "REJECT") {
    await prisma.depositRequest.update({
      where: { id },
      data: {
        status: "REJECTED",
        adminNotes: adminNotes || "Deposit rejected. Payment verification failed or receipt invalid.",
        reviewedAt: new Date(),
      },
    });

    revalidatePath("/admin/deposits");
    revalidatePath("/account/wallet");

    return { ok: `Deposit #${deposit.id.slice(-6)} has been rejected.` };
  }

  return { error: "Invalid action." };
}

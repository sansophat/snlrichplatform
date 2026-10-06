"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import type { FormState } from "./auth";

export async function updateCustomerProfileAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const name = String(fd.get("name") ?? "").trim();
  const phone = String(fd.get("phone") ?? "").trim();
  const address = String(fd.get("address") ?? "").trim();
  const avatarUrl = String(fd.get("avatarUrl") ?? "").trim();

  if (name.length < 2) return { error: "Please provide a valid full name." };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      phone: phone || null,
      address: address || null,
      avatarUrl: avatarUrl || null,
    },
  });

  revalidatePath("/", "layout");
  return { ok: "Profile updated successfully." };
}

export async function changePasswordAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const currentPassword = String(fd.get("currentPassword") ?? "");
  const newPassword = String(fd.get("newPassword") ?? "");
  const confirmPassword = String(fd.get("confirmPassword") ?? "");

  if (!currentPassword) return { error: "Current password is required." };
  if (newPassword.length < 8) return { error: "New password must be at least 8 characters." };
  if (newPassword !== confirmPassword) return { error: "New passwords do not match." };

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return { error: "Current password is incorrect." };

  const newHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });

  return { ok: "Password changed successfully." };
}

export async function submitKycAction(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();

  const kycFullName = String(fd.get("kycFullName") ?? "").trim();
  const kycIdNumber = String(fd.get("kycIdNumber") ?? "").trim();
  const kycDocumentType = String(fd.get("kycDocumentType") ?? "NATIONAL_ID").trim();
  const kycDocumentUrl = String(fd.get("kycDocumentUrl") ?? "").trim();
  const kycDocumentBackUrl = String(fd.get("kycDocumentBackUrl") ?? "").trim();

  if (kycFullName.length < 3) return { error: "Please enter your full legal name as shown on your ID." };
  if (!kycIdNumber) return { error: "Please enter your ID / document number." };
  if (!kycDocumentUrl) return { error: "Please upload the front photo of your identity document." };

  await prisma.user.update({
    where: { id: user.id },
    data: {
      kycFullName,
      kycIdNumber,
      kycDocumentType,
      kycDocumentUrl,
      kycDocumentBackUrl: kycDocumentBackUrl || null,
      kycStatus: "PENDING",
      kycSubmittedAt: new Date(),
    },
  });

  revalidatePath("/", "layout");
  return { ok: "KYC documents submitted successfully. Verification takes 12–24 hours." };
}

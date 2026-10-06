"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth";
import { REWARDS } from "@/lib/config";
import { randomSuffix } from "@/lib/format";

export type FormState = { error?: string; ok?: string } | undefined;

const registerSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name"),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  ref: z.string().trim().optional(),
});

export async function registerAction(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, email, password, ref } = parsed.data;

  if (await prisma.user.findUnique({ where: { email } })) {
    return { error: "An account with this email already exists." };
  }

  const cleanRef = ref?.trim().toUpperCase() || undefined;
  let referrer = null;
  if (cleanRef) {
    referrer = await prisma.user.findUnique({ where: { referralCode: cleanRef } });
    if (!referrer) {
      return { error: `Referral code "${cleanRef}" does not exist. Please check your invitation code or leave it blank.` };
    }
  }
  const bonus = referrer ? REWARDS.REFERRED_SIGNUP_BONUS : REWARDS.SIGNUP_BONUS;

  let referralCode = "";
  for (let i = 0; i < 5; i++) {
    referralCode = `SNL${randomSuffix(6).toUpperCase()}`;
    if (!(await prisma.user.findUnique({ where: { referralCode } }))) break;
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      referralCode,
      referredById: referrer?.id,
      points: bonus,
      transactions: {
        create: {
          type: "POINTS",
          amount: bonus,
          reason: referrer ? "REFERRED_BONUS" : "SIGNUP_BONUS",
          note: referrer ? `Welcome bonus (referred by ${referrer.name})` : "Welcome bonus",
        },
      },
    },
  });

  await createSession(user.id);
  redirect("/account");
}

export async function loginAction(_: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const next = String(fd.get("next") ?? "");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: "Incorrect email or password." };
  }
  await createSession(user.id);
  if (next.startsWith("/") && !next.startsWith("//")) redirect(next);
  redirect(user.role === "ADMIN" ? "/admin" : user.role === "MERCHANT" ? "/merchant-portal" : "/account");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

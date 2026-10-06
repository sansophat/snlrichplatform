import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "./db";

const COOKIE = "snlrich_session";
const MAX_AGE = 60 * 60 * 24 * 14; // 14 days

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be set in production");
  }
  return new TextEncoder().encode(s || "dev-insecure-secret-change-me");
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE !== "false",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export const getCurrentUser = cache(async () => {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    const id = String(payload.uid);
    return await prisma.user.findUnique({ where: { id }, include: { merchant: true } });
  } catch {
    return null;
  }
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/");
  return user;
}

/** Returns user + active merchant. Redirects otherwise. */
export async function requireMerchant() {
  const user = await requireUser();
  if (!user.merchant) redirect("/become-merchant");
  if (user.merchant.status !== "ACTIVE") redirect("/become-merchant");
  return { user, merchant: user.merchant };
}

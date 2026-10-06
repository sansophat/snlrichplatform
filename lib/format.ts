import { CURRENCY } from "./config";

export function money(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  return `${sign}${CURRENCY}${(Math.abs(cents) / 100).toFixed(2)}`;
}

export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "item"
  );
}

export function randomSuffix(len = 5): string {
  return Math.random().toString(36).slice(2, 2 + len);
}

export function dateFmt(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function avgRating(reviews: { rating: number }[]): number {
  if (!reviews.length) return 0;
  return Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;
}

/** Parse a decimal money string like "12.50" into cents. */
export function toCents(v: FormDataEntryValue | null): number {
  const n = parseFloat(String(v ?? "0"));
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

export const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-700",
  ACTIVE: "bg-emerald-100 text-emerald-800",
  SUSPENDED: "bg-red-100 text-red-700",
};

import {
  BookOpen, Car, Dumbbell, Gamepad2, Headphones, PawPrint, Shirt, ShoppingBag, Sofa, Sparkles,
  type LucideIcon,
} from "lucide-react";

type Theme = { icon: LucideIcon; from: string; to: string; fg: string };

const THEMES: Record<string, Theme> = {
  fashion: { icon: Shirt, from: "#fde8ef", to: "#f9c6d6", fg: "#be3a62" },
  "beauty-personal-care": { icon: Sparkles, from: "#fdeee3", to: "#f8d3bb", fg: "#c2662d" },
  electronics: { icon: Headphones, from: "#e3edfb", to: "#bcd3f3", fg: "#1d4f9c" },
  "home-living": { icon: Sofa, from: "#e5f4ec", to: "#bfe3cf", fg: "#237a50" },
  "sports-outdoors": { icon: Dumbbell, from: "#e8f0fe", to: "#c4d4fb", fg: "#3b54c9" },
  "toys-games": { icon: Gamepad2, from: "#efe7fb", to: "#d6c4f4", fg: "#6a3fc0" },
  automotive: { icon: Car, from: "#eceff3", to: "#cfd6df", fg: "#3a4658" },
  "books-stationery": { icon: BookOpen, from: "#fbf1dc", to: "#f1dca8", fg: "#9a6a0a" },
  "pet-supplies": { icon: PawPrint, from: "#fcebdc", to: "#f5cfa9", fg: "#b0601c" },
};

const DEFAULT: Theme = { icon: ShoppingBag, from: "#eef3f9", to: "#d6e1ef", fg: "#133458" };

export const CATEGORY_IMAGE_MAP: Record<string, string> = {
  fashion: "/images/categories/fashion.jpg",
  "beauty-personal-care": "/images/categories/beauty-personal-care.jpg",
  electronics: "/images/categories/electronics.jpg",
  "home-living": "/images/categories/home-living.jpg",
  "sports-outdoors": "/images/categories/sports-outdoors.jpg",
  "toys-games": "/images/categories/toys-games.svg",
  automotive: "/images/categories/automotive.svg",
  "books-stationery": "/images/categories/books-stationery.svg",
  "pet-supplies": "/images/categories/pet-supplies.svg",
};

export function getCategoryImage(slug?: string | null, customUrl?: string | null): string | null {
  if (customUrl) return customUrl;
  return (slug && CATEGORY_IMAGE_MAP[slug]) || null;
}

export function categoryTheme(slug?: string | null): Theme {
  return (slug && THEMES[slug]) || DEFAULT;
}

export function CategoryIcon({ slug, size = 20, className }: { slug?: string | null; size?: number; className?: string }) {
  const Icon = categoryTheme(slug).icon;
  return <Icon size={size} className={className} strokeWidth={1.75} />;
}

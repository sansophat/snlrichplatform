import Image from "next/image";
import { CategoryIcon, categoryTheme } from "./CategoryIcon";

/** Product artwork: photo if available, otherwise a themed gradient tile with a category icon. */
export function ProductImage({
  imageUrl,
  categorySlug,
  name,
  className = "aspect-square",
  iconSize = 56,
  priority = false,
}: {
  imageUrl?: string | null;
  categorySlug?: string | null;
  name: string;
  className?: string;
  iconSize?: number;
  priority?: boolean;
}) {
  if (imageUrl && imageUrl.startsWith("/")) {
    return (
      <div className={`relative w-full overflow-hidden bg-slate-100 ${className}`}>
        <Image
          src={imageUrl}
          alt={name}
          fill
          priority={priority}
          sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 280px"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>
    );
  }
  if (imageUrl) {
    return (
      <div className={`relative w-full overflow-hidden bg-slate-100 ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={name} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      </div>
    );
  }
  const t = categoryTheme(categorySlug);
  return (
    <div
      className={`relative flex w-full items-center justify-center overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}
      aria-label={name}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{ backgroundImage: "radial-gradient(rgba(255,255,255,.9) 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" }}
      />
      <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white/80 shadow-lg backdrop-blur transition duration-500 group-hover:scale-110" style={{ color: t.fg }}>
        <CategoryIcon slug={categorySlug} size={iconSize * 0.6} />
      </span>
    </div>
  );
}

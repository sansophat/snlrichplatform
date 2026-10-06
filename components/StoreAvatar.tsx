const PALETTES = [
  ["#1d4370", "#0a2240"],
  ["#be3a62", "#7f1f3f"],
  ["#237a50", "#124d31"],
  ["#6a3fc0", "#3f2080"],
  ["#c2662d", "#8a3f12"],
  ["#1d4f9c", "#0d2d63"],
];

export function StoreAvatar({
  name,
  logoUrl,
  size = 48,
  className = "",
}: {
  name: string;
  logoUrl?: string | null;
  size?: number;
  className?: string;
}) {
  if (logoUrl) {
    return (
      <span
        className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-md border border-slate-200/80 ${className}`}
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt={name} className="h-full w-full object-cover" />
      </span>
    );
  }

  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const [a, b] = PALETTES[h % PALETTES.length];
  const initials = name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-2xl font-extrabold text-white shadow-md ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.36, background: `linear-gradient(135deg, ${a}, ${b})` }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

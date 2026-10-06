import Link from "next/link";
import { SITE_NAME } from "@/lib/config";

export function Logo({
  light = false,
  src,
  alt = SITE_NAME,
  className = "h-9 w-auto",
}: {
  light?: boolean;
  src?: string | null;
  alt?: string;
  className?: string;
}) {
  const imageSrc = src || (light ? "/logo-light.svg" : "/logo.svg");
  return (
    <Link href="/" aria-label={alt} className="inline-flex shrink-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageSrc} alt={alt} className={className} />
    </Link>
  );
}

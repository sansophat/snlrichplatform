/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
};

export default nextConfig;

import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const font = Plus_Jakarta_Sans({ subsets: ["latin"], display: "swap", variable: "--font-sans" });

export const metadata: Metadata = {
  title: { default: "SNLRICH - Shop, Earn, Repeat", template: "%s | SNLRICH" },
  description: "Multi-merchant marketplace with points, cashback and referral rewards.",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={font.variable}>
      <body>
        <CartProvider>
          <Header />
          <main className="min-h-[60vh]">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}

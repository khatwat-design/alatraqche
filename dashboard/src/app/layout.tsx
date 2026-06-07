import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: "الأطرقجي — لوحة التحكم",
  description: "لوحة تحكم متجر الأطرقجي للسجاد والمفروشات",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}

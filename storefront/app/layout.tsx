import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getCategories } from "@/lib/api";

export const metadata: Metadata = {
  title: "الأطرقجي للسجاد والأثاث والمفروشات",
  description: "مكان يحتاجه كل بيت — نوفر كل أنواع السجاد والمفروشات والأثاث",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();

  return (
    <html lang="ar" dir="rtl">
      <body className="flex min-h-screen flex-col bg-gray-50 text-dark-900 antialiased">
        <Navbar categories={categories} />
        <main className="flex-1">{children}</main>
        <Footer categories={categories} />
      </body>
    </html>
  );
}

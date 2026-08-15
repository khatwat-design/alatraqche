"use client";

import Header from "@/components/header";
import Footer from "@/components/footer";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-6xl px-6 pb-16 pt-8">
        {children}
      </main>
      <Footer />
    </>
  );
}

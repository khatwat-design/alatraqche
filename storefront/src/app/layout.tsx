import type { Metadata } from "next";
import { Cairo, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/app-providers";
import { mergeRemoteStore } from "@/lib/merge-remote-store";
import { fetchRemoteStorePayload } from "@/lib/store-api";
import { isStandaloneStore } from "@/lib/store-mode";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const remote = isStandaloneStore() ? null : await fetchRemoteStorePayload();
  const m = mergeRemoteStore(remote);
  const title = m.metaTitle;
  const description = `${m.sloganLine1} — ${m.sloganLine2}`;
  const base = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");
  const ogImages =
    m.logoUrl.startsWith("http://") || m.logoUrl.startsWith("https://")
      ? [{ url: m.logoUrl }]
      : [{ url: "/images/logo.png", width: 512, height: 512, alt: m.storeName }];

  return {
    title,
    description,
    metadataBase: base,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "ar_IQ",
      siteName: m.storeName,
      images: ogImages,
    },
  };
}

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar-IQ" dir="rtl" suppressHydrationWarning>
      <body
        className={`${cairo.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

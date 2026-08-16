import type { Metadata } from "next";
import { Cairo, Geist_Mono } from "next/font/google";
import Script from "next/script";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const remote = isStandaloneStore() ? null : await fetchRemoteStorePayload();
  const m = mergeRemoteStore(remote);
  const ga = m.googleAnalyticsId;
  const meta = m.metaPixelId;
  const tt = m.tiktokPixelId;

  return (
    <html lang="ar-IQ" dir="rtl" suppressHydrationWarning>
      <head>
        {ga ? (
          <>
            <Script
              strategy="beforeInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
            />
            <Script id={`hdr-ga-${ga}`} strategy="beforeInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${ga}');
              `}
            </Script>
          </>
        ) : null}
        {meta ? (
          <>
            <Script id={`hdr-meta-${meta}`} strategy="beforeInteractive">
              {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${meta}');fbq('track','PageView');`}
            </Script>
            <noscript>
              <img
                height={1}
                width={1}
                style={{ display: "none" }}
                src={`https://www.facebook.com/tr?id=${meta}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>
          </>
        ) : null}
        {tt ? (
          <Script id={`hdr-tt-${tt}`} strategy="beforeInteractive">
            {`!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var a=document.createElement("script");a.type="text/javascript";a.async=!0;a.src=r+"?sdkid="+e+"&lib="+t;var s=document.getElementsByTagName("script")[0];s.parentNode.insertBefore(a,s)};}(window,document,'ttq');ttq.load('${tt}');ttq.page();`}
          </Script>
        ) : null}
      </head>
      <body
        className={`${cairo.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

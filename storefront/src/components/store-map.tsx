"use client";

import { useStoreSettings } from "@/contexts/store-settings-context";

export default function StoreMap() {
  const { store } = useStoreSettings();
  const embedSrc = store.mapEmbedUrl;
  const openInMapsHref = store.mapOpenUrl;

  return (
    <section
      className="w-full rounded-2xl border border-stone-700/70 bg-stone-900/35 p-4 md:p-5"
      aria-labelledby="store-map-heading"
    >
      <div className="grid gap-4 md:grid-cols-12 md:items-stretch md:gap-5">
        <div className="space-y-2 text-right md:col-span-4 lg:col-span-3">
          <h2
            id="store-map-heading"
            className="text-[11px] font-semibold tracking-wide text-stone-500"
          >
            موقعنا
          </h2>
          <p className="text-[11px] leading-relaxed text-stone-400 md:text-xs">
            <span className="font-medium text-amber-200/75">العنوان:</span>{" "}
            {store.addressLine}
          </p>
          <a
            href={openInMapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex text-[11px] font-medium text-amber-400/90 underline-offset-2 hover:text-amber-300 hover:underline md:text-xs"
          >
            افتح في خرائط Google
          </a>
        </div>
        <div className="relative min-h-[180px] overflow-hidden rounded-xl border border-stone-600/50 bg-stone-800/80 md:col-span-8 lg:col-span-9 md:min-h-[200px] lg:min-h-[220px]">
          <iframe
            title={`خريطة موقع ${store.storeName}`}
            src={embedSrc}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  );
}

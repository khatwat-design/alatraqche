"use client";

import { useStoreSettings } from "@/contexts/store-settings-context";

type Props = {
  variant?: "hero" | "footer";
};

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

export default function ContactBlock({ variant = "footer" }: Props) {
  const { store } = useStoreSettings();
  const isHero = variant === "hero";

  const wrap =
    "flex w-full flex-col gap-2 " +
    (isHero
      ? "items-center lg:items-start"
      : "items-stretch md:max-w-[240px] md:self-end");

  const pillBase = isHero
    ? "inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.06] px-4 py-2.5 text-[13px] font-medium text-white/90 backdrop-blur-md transition hover:border-white/[0.2] hover:bg-white/[0.1] lg:max-w-none lg:justify-start"
    : "flex w-full items-center justify-end gap-2 rounded-xl border border-stone-600 bg-stone-900/60 px-3 py-2.5 text-[12px] text-stone-200 transition hover:border-stone-500 hover:bg-stone-900/90";

  const igClass = isHero
    ? "inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-xl border border-white/15 bg-black px-4 py-2.5 text-[13px] font-medium text-white/95 transition hover:border-white/25 hover:bg-neutral-950 lg:max-w-none lg:justify-start"
    : "flex w-full items-center justify-end gap-2 rounded-xl border border-stone-600 bg-black px-3 py-2.5 text-[12px] text-stone-200 transition hover:border-stone-500 hover:bg-neutral-950";

  const socialClass = isHero ? igClass : igClass;

  return (
    <div className={isHero ? "mt-6" : "text-right"}>
      <p
        className={
          isHero
            ? "mb-3 text-center text-[11px] font-semibold text-white/45 lg:text-right"
            : "mb-2 text-[11px] font-semibold tracking-wide text-stone-500"
        }
      >
        تواصل معنا
      </p>
      <div className={wrap}>
        {store.phoneEntries.map(({ display, whatsapp }) => (
          <a
            key={display}
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className={pillBase}
            aria-label={`مراسلة واتساب ${display}`}
          >
            <WhatsAppIcon className="h-4 w-4 shrink-0 opacity-90" />
            {display}
          </a>
        ))}
        <a
          href={store.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={igClass}
          aria-label="حسابنا على إنستغرام"
        >
          <svg
            className="h-4 w-4 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
          إنستغرام
        </a>
        {store.facebookUrl ? (
          <a
            href={store.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={socialClass}
            aria-label="صفحتنا على فيسبوك"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            فيسبوك
          </a>
        ) : null}
        {store.tiktokSocialUrl ? (
          <a
            href={store.tiktokSocialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={socialClass}
            aria-label="حسابنا على تيك توك"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
            </svg>
            تيك توك
          </a>
        ) : null}
      </div>
    </div>
  );
}

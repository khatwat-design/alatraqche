"use client";

import { Amiri } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useStoreSettings } from "@/contexts/store-settings-context";
import { useEffect, useState, useCallback, useRef } from "react";
import type { BannerPayload } from "@/lib/store-settings-types";
import { useStoreEvents } from "@/lib/use-store-events";

const amiri = Amiri({
  weight: ["400", "700"],
  subsets: ["arabic"],
  display: "swap",
});

function HeroSlider({ banners }: { banners: BannerPayload[] }) {
  const [current, setCurrent] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const slides = banners.filter((b) => b.image && typeof b.image === "string" && b.image.length > 0);
  const len = slides.length;

  const start = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % len);
    }, 5000);
  }, [len]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    start();
    return stop;
  }, [start, stop]);

  const goTo = (i: number) => {
    stop();
    setCurrent(i);
    start();
  };

  const prev = () => goTo((current - 1 + len) % len);
  const next = () => goTo((current + 1) % len);

  const [offset, setOffset] = useState(0);
  useEffect(() => {
    if (containerRef.current) {
      setOffset(containerRef.current.offsetWidth * current);
    }
  }, [current]);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden bg-black"
      onMouseEnter={stop}
      onMouseLeave={start}
    >
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${offset}px)` }}
      >
        {slides.map((b, i) => {
          const slide = (
            <div key={b.id} className="relative min-w-full shrink-0 aspect-[21/9] md:aspect-[2.8/1] lg:aspect-[3.2/1]">
              <Image
                src={b.image}
                alt={b.title || "بنر"}
                fill
                className="object-cover"
                sizes="100vw"
                priority={i === 0}
                unoptimized
              />
              {b.title && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              )}
              {b.title && (
                <div className="absolute bottom-0 right-0 left-0 p-4 md:p-8 text-right">
                  <h2 className="inline-block rounded-lg bg-black/50 px-4 py-2 text-base font-bold text-white backdrop-blur-sm md:text-2xl">
                    {b.title}
                  </h2>
                </div>
              )}
            </div>
          );
          if (b.linkUrl) {
            return (
              <Link
                key={b.id}
                href={b.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block min-w-full shrink-0"
              >
                {slide}
              </Link>
            );
          }
          return <div key={b.id} className="min-w-full shrink-0">{slide}</div>;
        })}
      </div>

      {/* Arrows */}
      {len > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-black shadow-md backdrop-blur-sm transition hover:bg-white"
            aria-label="السابق"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-black shadow-md backdrop-blur-sm transition hover:bg-white"
            aria-label="التالي"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
            </svg>
          </button>
        </>
      )}

      {/* Dots + counter */}
      {len > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-3">
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={`h-2.5 rounded-full transition-all ${
                  i === current ? "w-8 bg-amber-500" : "w-2.5 bg-white/60 hover:bg-white/90"
                }`}
                aria-label={`الانتقال إلى الشريحة ${i + 1}`}
              />
            ))}
          </div>
          <span className="rounded bg-black/40 px-2 py-0.5 text-xs text-white/80">
            {current + 1} / {len}
          </span>
        </div>
      )}
    </div>
  );
}

export default function StoreHero() {
  const { store } = useStoreSettings();
  const [banners, setBanners] = useState<BannerPayload[]>([]);
  const [bannersLoaded, setBannersLoaded] = useState(false);

  const loadBanners = useCallback(async () => {
    try {
      const r = await fetch("/api/banners", { cache: "no-store" });
      const d: { banners?: BannerPayload[] } = r.ok ? await r.json() : { banners: [] };
      const valid = (Array.isArray(d.banners) ? d.banners : []).filter(
        (b) => b.image && typeof b.image === "string" && b.image.length > 0
      );
      setBanners(valid);
      setBannersLoaded(true);
    } catch {
      setBanners([]);
      setBannersLoaded(true);
    }
  }, []);

  // Initial load
  useEffect(() => { loadBanners(); }, [loadBanners]);

  // Real-time update via SSE
  useStoreEvents((type) => {
    if (type === "banners" || type === "all") loadBanners();
  });

  if (bannersLoaded && banners.length > 0) {
    const valid = banners.filter((b) => b.image && typeof b.image === "string" && b.image.length > 0);
    if (valid.length > 0) {
      return <HeroSlider banners={valid} />;
    }
  }

  const hl = store.sloganHighlightPhrase?.trim() ?? "";
  const full = store.sloganLine2;
  const idx = hl.length ? full.indexOf(hl) : -1;

  return (
    <section
      className={`${amiri.className} border-b border-stone-200/90 bg-gradient-to-b from-stone-50/80 to-white pb-12 pt-10 md:pb-14 md:pt-12`}
      aria-labelledby="store-brand"
    >
      <div className="mx-auto max-w-4xl px-4 md:max-w-5xl">
        <p
          id="store-brand"
          className="text-center text-[1.5rem] font-bold leading-tight text-black underline decoration-amber-500 decoration-[3px] underline-offset-[8px] md:text-[1.85rem] lg:text-[2.1rem]"
          lang="ar"
        >
          {store.sloganLine1}
        </p>
        <p
          id="store-slogan"
          className="text-pretty pt-4 text-center text-[1.25rem] font-medium leading-[1.75] tracking-tight text-black md:text-[1.65rem] md:leading-snug lg:text-[1.85rem]"
        >
          {idx >= 0 ? (
            <>
              {full.slice(0, idx)}
              <span className="font-semibold text-black [-webkit-box-decoration-break:clone] [box-decoration-break:clone] rounded-[0.2em] bg-gradient-to-l from-amber-200/60 via-amber-200/50 to-amber-100/55 px-[0.35em] py-[0.12em]">
                {hl}
              </span>
              {full.slice(idx + hl.length)}
            </>
          ) : (
            <>
              {full}{" "}
              <span className="font-semibold text-black [-webkit-box-decoration-break:clone] [box-decoration-break:clone] rounded-[0.2em] bg-gradient-to-l from-amber-200/60 via-amber-200/50 to-amber-100/55 px-[0.35em] py-[0.12em]">
                {hl}
              </span>
            </>
          )}
        </p>
      </div>
    </section>
  );
}

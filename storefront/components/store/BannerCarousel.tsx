"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Banner } from "@/types";

interface Props {
  banners: Banner[];
}

export function BannerCarousel({ banners }: Props) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (isPaused || banners.length <= 1) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [isPaused, banners.length, next]);

  const handleImageError = useCallback((id: number) => {
    setFailedImages((prev) => new Set(prev).add(id));
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) next();
      else prev();
    }
  };

  if (banners.length === 0) return null;

  const validBanners = banners.filter((b) => !failedImages.has(b.id));
  const displayBanners = validBanners.length > 0 ? validBanners : banners;
  const safeIndex = Math.min(current, displayBanners.length - 1);

  if (displayBanners.length === 0) return null;

  return (
    <section
      className="relative bg-dark-950"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <div className="group relative overflow-hidden rounded-2xl">
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${safeIndex * 100}%)` }}
          >
            {displayBanners.map((banner) => (
              <div key={banner.id} className="min-w-0 shrink-0 grow-0 basis-full">
                <div className="relative h-[200px] w-full bg-dark-950 md:h-[350px] lg:h-[420px]">
                  <img
                    src={banner.image}
                    alt={banner.title || "بانر"}
                    onError={() => handleImageError(banner.id)}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  {banner.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                      <h3 className="text-xl font-bold text-white drop-shadow-lg md:text-3xl">
                        {banner.title}
                      </h3>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {displayBanners.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white opacity-0 backdrop-blur-sm transition-all hover:bg-black/50 group-hover:opacity-100 md:flex"
                aria-label="السابق"
              >
                <ChevronRight size={20} />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white opacity-0 backdrop-blur-sm transition-all hover:bg-black/50 group-hover:opacity-100 md:flex"
                aria-label="التالي"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                {displayBanners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === safeIndex ? "w-6 bg-brand-500" : "w-2 bg-white/50 hover:bg-white/80"
                    }`}
                    aria-label={`البانر ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

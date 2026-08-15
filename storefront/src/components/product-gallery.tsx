"use client";

import { useState } from "react";
import Image from "next/image";

type GalleryImage = {
  url: string;
  large: string;
  thumb: string;
};

type ProductGalleryProps = {
  images: GalleryImage[];
  productName: string;
};

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (!images || images.length === 0) return null;

  const current = images[activeIndex];
  const maxThumbs = 4;

  return (
    <>
      <div className="flex min-h-[280px] flex-col items-center justify-center overflow-hidden rounded-3xl bg-stone-100 p-4 md:min-h-[380px] md:p-6">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="relative flex items-center justify-center"
        >
          <Image
            src={current.large || current.url}
            alt={`${productName} - صورة ${activeIndex + 1}`}
            width={576}
            height={1024}
            priority={activeIndex === 0}
            className="h-auto max-h-[min(70vh,720px)] w-auto max-w-full cursor-pointer object-contain transition hover:scale-[1.02]"
          />
          {images.length > 1 ? (
            <div className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
              {activeIndex + 1} / {images.length}
            </div>
          ) : null}
        </button>
        {images.length > 1 ? (
          <div className="mt-4 flex items-center gap-2">
            {images.slice(0, maxThumbs).map((img, i) => {
              const remaining = images.length - maxThumbs;
              const isLastVisible = i === maxThumbs - 1 && remaining > 0;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={`relative h-14 w-14 overflow-hidden rounded-xl border-2 transition ${
                    i === activeIndex
                      ? "border-[var(--color-primary)] ring-1 ring-[var(--color-primary)]"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img.thumb || img.url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                  {isLastVisible ? (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 text-xs font-bold text-white">
                      +{remaining}
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {lightboxOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute left-4 top-4 rounded-full bg-white/20 p-2 text-white transition hover:bg-white/40"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative flex max-h-[90vh] max-w-[90vw] items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {images.length > 1 ? (
              <button
                type="button"
                onClick={() => setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                className="absolute right-full top-1/2 -translate-y-1/2 -translate-x-2 rounded-full bg-white/20 p-2 text-white transition hover:bg-white/40"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            ) : null}
            <Image
              src={current.large || current.url}
              alt={`${productName} - صورة ${activeIndex + 1}`}
              width={1200}
              height={1600}
              className="h-auto max-h-[85vh] w-auto max-w-full rounded-2xl object-contain"
            />
            {images.length > 1 ? (
              <button
                type="button"
                onClick={() => setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                className="absolute left-full top-1/2 -translate-y-1/2 translate-x-2 rounded-full bg-white/20 p-2 text-white transition hover:bg-white/40"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : null}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
              {activeIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

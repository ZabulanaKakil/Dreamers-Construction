"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

interface ProjectGalleryProps {
  images: string[];
  alt: string;
}

export function ProjectGallery({ images, alt }: ProjectGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const current = images[active] ?? images[0];

  const go = useCallback(
    (dir: 1 | -1) => {
      setActive((a) => (a + dir + images.length) % images.length);
    },
    [images.length],
  );

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, go]);

  if (!current) return null;

  const isSvg = current.endsWith(".svg");

  return (
    <>
      <div className="ui-panel overflow-hidden">
        <button
          type="button"
          className="relative block aspect-[16/10] w-full"
          onClick={() => setLightbox(true)}
          aria-label="Open full-size gallery"
        >
          <Image
            src={current}
            alt={alt}
            fill
            className={
              isSvg
                ? "object-contain p-6 transition-transform duration-500 hover:scale-[1.02]"
                : "object-cover transition-transform duration-500 hover:scale-[1.03]"
            }
            sizes="(max-width: 1024px) 100vw, 80vw"
            priority
            unoptimized={isSvg}
          />
          <span className="absolute bottom-3 right-3 border border-border bg-background/85 px-2.5 py-1 text-[10px] uppercase tracking-wider text-foreground backdrop-blur-sm">
            Click to inspect · {active + 1}/{images.length}
          </span>
        </button>
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto border-t border-border p-2">
            {images.map((src, i) => (
              <button
                key={src + i}
                type="button"
                onClick={() => setActive(i)}
                className={`relative h-16 w-24 shrink-0 overflow-hidden border ${
                  i === active ? "border-accent" : "border-border opacity-70"
                }`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="96px"
                  unoptimized={src.endsWith(".svg")}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-background/95 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`${alt} photo gallery`}
        >
          <div className="mb-3 flex w-full max-w-6xl items-center justify-between gap-3">
            <p className="text-sm text-muted">
              {alt} · {active + 1} of {images.length}
            </p>
            <button
              type="button"
              className="rounded-[var(--radius-md)] border border-border bg-surface px-3 py-1.5 text-sm hover:border-accent"
              onClick={() => setLightbox(false)}
            >
              Close
            </button>
          </div>
          <div
            className="relative h-[min(78vh,720px)] w-full max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={current}
              alt={alt}
              fill
              className="object-contain"
              sizes="95vw"
              unoptimized={isSvg}
              priority
            />
          </div>
          {images.length > 1 && (
            <div
              className="mt-4 flex items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="rounded-[var(--radius-md)] border border-border bg-surface px-4 py-2 text-sm hover:border-accent"
                onClick={() => go(-1)}
              >
                ← Prev
              </button>
              <div className="flex max-w-[70vw] gap-1.5 overflow-x-auto">
                {images.map((src, i) => (
                  <button
                    key={`lb-${src}-${i}`}
                    type="button"
                    onClick={() => setActive(i)}
                    className={`relative h-12 w-16 shrink-0 overflow-hidden border ${
                      i === active ? "border-accent" : "border-border opacity-60"
                    }`}
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="64px"
                      unoptimized={src.endsWith(".svg")}
                    />
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="rounded-[var(--radius-md)] border border-border bg-surface px-4 py-2 text-sm hover:border-accent"
                onClick={() => go(1)}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

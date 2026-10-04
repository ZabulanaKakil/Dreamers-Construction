"use client";

import { useEffect, useState } from "react";

interface ProjectCardSlideshowProps {
  images: string[];
  alt: string;
  /** Auto-advance interval when multiple photos exist */
  intervalMs?: number;
}

/** Cover slideshow for project cards — cycles automatically when multiple photos exist. */
export function ProjectCardSlideshow({
  images,
  alt,
  intervalMs = 3200,
}: ProjectCardSlideshowProps) {
  const [index, setIndex] = useState(0);
  const count = images.length;
  const current = images[index] ?? images[0];

  useEffect(() => {
    if (count <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [count, intervalMs]);

  if (!current) return null;

  return (
    <div className="relative aspect-[16/10] overflow-hidden bg-surface-elevated">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={current}
        src={current}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {count > 1 && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
          {images.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${
                i === index ? "bg-white" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

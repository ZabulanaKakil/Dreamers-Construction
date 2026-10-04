"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Project } from "@/data/projects";
import { Reveal } from "@/components/ui/Reveal";
import {
  projectStatusBadgeClass,
  projectTypeLabelClass,
} from "@/lib/project-images";
import { projectTypeLabel } from "@/lib/project-taxonomy";
import { formatProjectStatus } from "@/lib/inventory-status";
import { MapExplorerLink } from "@/components/map/MapExplorerLink";
import { mapUrlForProject } from "@/lib/map-url";

interface ProjectCarouselProps {
  projects: Project[];
  autoPlayMs?: number;
}

export function ProjectCarousel({
  projects,
  autoPlayMs = 5500,
}: ProjectCarouselProps) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const count = projects.length;
  const current = projects[index];
  const slideMs = reduceMotion ? 0 : 0.45;
  const copyMs = reduceMotion ? 0 : 0.35;

  const go = useCallback(
    (dir: 1 | -1) => {
      setIndex((i) => (i + dir + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (paused || count <= 1) return;
    const id = window.setInterval(() => go(1), autoPlayMs);
    return () => window.clearInterval(id);
  }, [paused, count, autoPlayMs, go]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, go]);

  if (!current) return null;

  const gallery = current.images?.length
    ? current.images
    : current.coverImage
      ? [current.coverImage]
      : [];
  const cover = gallery[0] ?? "";

  return (
    <section className="section-band">
      <div className="page-shell">
        <Reveal>
          <p className="section-label">Portfolio</p>
          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold sm:text-3xl">
              Featured Projects
            </h2>
            <Link
              href="/projects"
              className="text-sm font-medium text-accent hover:underline"
            >
              View all →
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div
            className="ui-panel relative mt-10 overflow-hidden"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
          >
            <div className="grid lg:grid-cols-[1.35fr_1fr]">
              <div className="relative aspect-[16/11] lg:aspect-auto lg:min-h-[420px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.slug + cover}
                    initial={
                      reduceMotion
                        ? false
                        : { opacity: 0, scale: 1.04 }
                    }
                    animate={{ opacity: 1, scale: 1 }}
                    exit={
                      reduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, scale: 0.98 }
                    }
                    transition={{ duration: slideMs }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={cover}
                      alt={current.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      priority={index === 0}
                      unoptimized={cover.endsWith(".svg")}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-surface/40" />
                  </motion.div>
                </AnimatePresence>

                <button
                  type="button"
                  onClick={() => setLightbox(cover)}
                  className="absolute bottom-4 left-4 border border-border bg-background/80 px-3 py-1.5 text-xs uppercase tracking-wider text-foreground backdrop-blur-sm transition-colors hover:border-accent hover:text-accent"
                >
                  Expand image
                </button>
              </div>

              <div className="flex flex-col justify-between p-5 sm:p-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={
                        projectStatusBadgeClass[current.status] ??
                        projectStatusBadgeClass.upcoming
                      }
                    >
                      {formatProjectStatus(current.status)}
                    </span>
                    <span className={projectTypeLabelClass}>
                      {projectTypeLabel(current.type)}
                    </span>
                    <span className="ml-auto text-xs text-muted">
                      {index + 1} / {count}
                    </span>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={current.slug + "-copy"}
                      initial={
                        reduceMotion ? false : { opacity: 0, y: 12 }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      exit={
                        reduceMotion
                          ? { opacity: 0 }
                          : { opacity: 0, y: -8 }
                      }
                      transition={{ duration: copyMs }}
                    >
                      <h3 className="mt-5 font-[family-name:var(--font-syne)] text-2xl font-bold sm:text-3xl">
                        {current.name}
                      </h3>
                      <p className="mt-2 text-sm text-accent">{current.client}</p>
                      <p className="mt-4 text-sm leading-relaxed text-muted">
                        {current.summary}
                      </p>
                      <p className="mt-3 text-xs text-steel">{current.location}</p>

                      {current.specs && (
                        <dl className="mt-6 grid grid-cols-2 gap-3">
                          {current.specs.slice(0, 4).map((spec) => (
                            <div
                              key={spec.label}
                              className="border border-border p-3"
                            >
                              <dt className="text-[10px] uppercase tracking-wider text-muted">
                                {spec.label}
                              </dt>
                              <dd className="mt-1 text-sm font-medium">
                                {spec.value}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link
                    href={`/projects/${current.slug}`}
                    className="btn-primary text-xs"
                  >
                    View Details
                  </Link>
                  <MapExplorerLink
                    href={mapUrlForProject(current)}
                    label="Explore Map"
                    className="btn-outline text-xs"
                  />
                  <div className="ml-auto flex gap-2">
                    <CarouselBtn label="Previous" onClick={() => go(-1)}>
                      ←
                    </CarouselBtn>
                    <CarouselBtn label="Next" onClick={() => go(1)}>
                      →
                    </CarouselBtn>
                  </div>
                </div>
              </div>
            </div>

            {/* Thumbnail strip — project covers */}
            <div className="flex gap-2 overflow-x-auto border-t border-border p-3">
              {projects.map((p, i) => {
                const thumb = p.coverImage ?? p.images?.[0] ?? "";
                return (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => {
                      setIndex(i);
                    }}
                    className={`relative h-16 w-24 shrink-0 overflow-hidden border transition-all ${
                      i === index
                        ? "border-accent opacity-100"
                        : "border-border opacity-55 hover:opacity-90"
                    }`}
                    aria-label={`Show ${p.name}`}
                  >
                    <Image
                      src={thumb}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="96px"
                      unoptimized={thumb.endsWith(".svg")}
                    />
                  </button>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="h-0.5 w-full bg-border">
              <motion.div
                key={current.slug + (paused ? "-paused" : "-play")}
                className="h-full bg-accent"
                initial={{ width: "0%" }}
                animate={{ width: paused || reduceMotion ? "0%" : "100%" }}
                transition={{
                  duration: paused || reduceMotion ? 0 : autoPlayMs / 1000,
                  ease: "linear",
                }}
              />
            </div>
          </div>
        </Reveal>
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Project image"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 border border-border px-3 py-1 text-sm text-muted hover:text-foreground"
            onClick={() => setLightbox(null)}
          >
            Close
          </button>
          <div
            className="relative h-[70vh] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightbox}
              alt={current.name}
              fill
              className="object-contain"
              sizes="90vw"
              unoptimized={lightbox.endsWith(".svg")}
            />
          </div>
        </div>
      )}
    </section>
  );
}

function CarouselBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center border border-border text-sm transition-colors hover:border-accent hover:text-accent"
    >
      {children}
    </button>
  );
}

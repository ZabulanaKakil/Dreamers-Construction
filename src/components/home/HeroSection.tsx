"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { company } from "@/data/company";

const EASE = [0.22, 1, 0.36, 1] as const;

function heroItem(delay: number, reduceMotion: boolean | null) {
  if (reduceMotion) {
    return {};
  }
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, delay, ease: EASE },
  };
}

export function HeroSection({
  image,
  imageAlt,
}: {
  image?: string;
  imageAlt?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative min-h-[85svh] overflow-hidden lg:min-h-[100svh]">
      {image && (
        <motion.div
          className="absolute inset-0"
          initial={reduceMotion ? false : { scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.6, ease: EASE }}
        >
          <Image
            src={image}
            alt={imageAlt ?? ""}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-background/30 lg:bg-gradient-to-r lg:from-background lg:via-background/80 lg:to-background/10" />

      <div className="relative z-10 page-shell flex min-h-[85svh] flex-col justify-end pb-14 pt-24 lg:min-h-[100svh] lg:justify-center">
        <div className="max-w-xl">
          <motion.p className="section-label" {...heroItem(0, reduceMotion)}>
            {company.tagline}
          </motion.p>
          <motion.h1
            className="mt-4 font-[family-name:var(--font-syne)] text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
            {...heroItem(0.1, reduceMotion)}
          >
            {company.shortName}
            <span className="block text-gradient">Construction</span>
          </motion.h1>
          <motion.p
            className="mt-6 max-w-lg text-base leading-relaxed text-muted sm:text-xl"
            {...heroItem(0.2, reduceMotion)}
          >
            Civil, infrastructure, and residential construction across Bangladesh —
            delivered on time for institutional and private clients since{" "}
            {company.established}.
          </motion.p>
          <motion.div
            className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-4"
            {...heroItem(0.3, reduceMotion)}
          >
            <Link href="/projects" className="btn-primary text-center">
              View Projects
            </Link>
            <Link href="/map" className="btn-outline text-center">
              Explore the Map
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

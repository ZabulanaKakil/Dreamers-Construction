"use client";

import {
  Children,
  isValidElement,
  type ReactNode,
} from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

export type RevealVariant = "fadeUp" | "fadeLeft" | "fadeRight" | "scaleIn";

const EASE = [0.22, 1, 0.36, 1] as const;

const VARIANT_OFFSET: Record<
  RevealVariant,
  { x?: number; y?: number; scale?: number }
> = {
  fadeUp: { y: 24 },
  fadeLeft: { x: -28 },
  fadeRight: { x: 28 },
  scaleIn: { scale: 0.96, y: 8 },
};

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Motion style. Defaults to fadeUp. */
  variant?: RevealVariant;
  /** When true, animate on mount instead of whileInView (e.g. hero). */
  immediate?: boolean;
}

export function Reveal({
  children,
  className = "",
  delay = 0,
  variant = "fadeUp",
  immediate = false,
}: RevealProps) {
  const reduceMotion = useReducedMotion();
  const offset = VARIANT_OFFSET[variant];

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const initial = {
    opacity: 0,
    x: offset.x ?? 0,
    y: offset.y ?? 0,
    scale: offset.scale ?? 1,
  };
  const animate = { opacity: 1, x: 0, y: 0, scale: 1 };
  const transition = {
    duration: 0.6,
    delay,
    ease: EASE,
  };

  if (immediate) {
    return (
      <motion.div
        className={className}
        initial={initial}
        animate={animate}
        transition={transition}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, margin: "-80px" }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}

const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.06,
    },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE },
  },
};

interface RevealStaggerProps {
  children: ReactNode;
  className?: string;
  /** Cap total stagger feel; children beyond still animate with same item motion. */
  itemClassName?: string;
  /** When true, run on mount (hero). Default: whileInView. */
  immediate?: boolean;
}

/**
 * Staggers direct children into view. Each child is wrapped so list items
 * animate independently. Total delay stays short (~0.4s for typical lists).
 */
export function RevealStagger({
  children,
  className = "",
  itemClassName = "",
  immediate = false,
}: RevealStaggerProps) {
  const reduceMotion = useReducedMotion();
  const items = Children.toArray(children).filter(isValidElement);

  if (reduceMotion) {
    return (
      <div className={className}>
        {items.map((child, i) => (
          <div key={child.key ?? i} className={itemClassName}>
            {child}
          </div>
        ))}
      </div>
    );
  }

  const motionProps = immediate
    ? {
        initial: "hidden" as const,
        animate: "show" as const,
      }
    : {
        initial: "hidden" as const,
        whileInView: "show" as const,
        viewport: { once: true, margin: "-80px" as const },
      };

  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      {...motionProps}
    >
      {items.map((child, i) => (
        <motion.div
          key={child.key ?? i}
          className={itemClassName}
          variants={staggerItem}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

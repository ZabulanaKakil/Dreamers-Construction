"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export type FilterChipTone =
  | "developer"
  | "builders"
  | "design"
  | "real-estate";

interface FilterChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  /** Residences branch color — Developer / Builders / Design / Real Estate */
  tone?: FilterChipTone;
  children: ReactNode;
}

export function FilterChip({
  active = false,
  tone,
  children,
  className = "",
  type = "button",
  ...props
}: FilterChipProps) {
  return (
    <button
      type={type}
      data-tone={tone}
      className={`filter-chip shrink-0 ${active ? "filter-chip-active" : ""} ${className}`.trim()}
      aria-pressed={active}
      {...props}
    >
      {children}
    </button>
  );
}

import type { ReactNode } from "react";

interface FilterChipRowProps {
  children: ReactNode;
  className?: string;
  /** Sticky under fixed header (h-16) */
  sticky?: boolean;
  /** Stack chips in a sidebar column */
  vertical?: boolean;
}

export function FilterChipRow({
  children,
  className = "",
  sticky = false,
  vertical = false,
}: FilterChipRowProps) {
  return (
    <div
      className={`filter-chip-row flex gap-2 ${
        vertical
          ? "flex-col"
          : "overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap [&::-webkit-scrollbar]:hidden"
      } ${
        sticky
          ? "sticky top-16 z-30 -mx-4 border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
          : ""
      } ${className}`.trim()}
    >
      {children}
    </div>
  );
}

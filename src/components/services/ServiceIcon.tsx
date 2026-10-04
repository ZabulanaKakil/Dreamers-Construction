import type { ReactNode } from "react";
import type { ServiceCategory } from "@/data/services";

const paths: Record<string, ReactNode> = {
  building: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"
    />
  ),
  road: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 17l4-8 4 8M12 9l4-8 4 8M4 17h16"
    />
  ),
  channel: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 12c3-4 6-4 8 0s5 4 8 0M4 16c3-4 6-4 8 0s5 4 8 0"
    />
  ),
  interior: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 8h16M6 8V6a2 2 0 012-2h8a2 2 0 012 2v2M8 21v-8h8v8"
    />
  ),
  land: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3C8 8 4 10 4 14a8 8 0 0016 0c0-4-4-6-8-11z"
    />
  ),
  renovation: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"
    />
  ),
  bridge: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2 16h20M6 16v-4M10 16V8M14 16v-6M18 16v-3"
    />
  ),
  steel: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 20h16M6 20V8l6-4 6 4v12M10 12h4"
    />
  ),
  sports: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3a9 9 0 100 18 9 9 0 000-18zm0 0v18M3.6 9h16.8M3.6 15h16.8"
    />
  ),
  wall: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 20h18M4 20V10l8-4 8 4v10M8 20v-6h8v6"
    />
  ),
  partnership: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm12 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
    />
  ),
  residential: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 12l9-9 9 9M5 10v10h14V10"
    />
  ),
};

const categoryAccent: Record<ServiceCategory, string> = {
  developer: "text-[#0f766e] dark:text-[#2dd4bf]",
  builder: "text-[#b45309] dark:text-[#fbbf24]",
  design: "text-[#1d4ed8] dark:text-[#60a5fa]",
  construction: "text-accent",
};

interface ServiceIconProps {
  name: string;
  category?: ServiceCategory;
  className?: string;
}

export function ServiceIcon({ name, category, className = "" }: ServiceIconProps) {
  const icon = paths[name] ?? paths.building;
  const accent = category ? categoryAccent[category] : "text-accent";
  return (
    <span
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-border bg-surface ${accent} ${className}`}
      aria-hidden
    >
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        {icon}
      </svg>
    </span>
  );
}

export function categoryLabel(category: ServiceCategory): string {
  switch (category) {
    case "developer":
      return "Developer";
    case "builder":
      return "Builder";
    case "design":
      return "Design";
    default:
      return "Construction";
  }
}

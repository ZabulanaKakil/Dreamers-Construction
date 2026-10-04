import type { ReactNode } from "react";

const paths: Record<string, ReactNode> = {
  mission: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3l2.2 4.5 5 .7-3.6 3.5.9 5L12 14.8 7.5 16.7l.9-5L4.8 8.2l5-.7L12 3z"
    />
  ),
  vision: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6z"
    />
  ),
  values: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"
    />
  ),
  check: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 13l4 4L19 7"
    />
  ),
  clock: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  ),
  shield: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"
    />
  ),
  layers: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 18l9 5 9-5"
    />
  ),
  leaf: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 19c8-1 12-6 14-14-6 1-12 4-14 14zM5 19c2-4 5-7 9-9"
    />
  ),
  scale: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3v18M7 7h10M7 7l-3 6h6L7 7zM17 7l-3 6h6l-3-6z"
    />
  ),
  pin: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11zM12 11a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"
    />
  ),
  calendar: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 3v3M17 3v3M4 9h16M6 5h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z"
    />
  ),
  users: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16 19v-1a3 3 0 00-3-3H7a3 3 0 00-3 3v1M18 19v-1a3 3 0 00-2-2.8M12 11a3 3 0 100-6 3 3 0 000 6zM18 8a2.5 2.5 0 110 5"
    />
  ),
  architect: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"
    />
  ),
  engineer: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"
    />
  ),
  finance: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3v18M7 8h7a3 3 0 010 6H9a3 3 0 000 6h8"
    />
  ),
  admin: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
    />
  ),
  tech: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.75 17L9 20l.75 3M14.25 17l.75 3-.75 3M5 11h14M7 11V8a5 5 0 0110 0v3"
    />
  ),
  supervisor: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12l2 2 4-4M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"
    />
  ),
  sales: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 11l9-8 9 8M5 10v9a1 1 0 001 1h3v-5h6v5h3a1 1 0 001-1v-9"
    />
  ),
  quality: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12l2 2 4-4M12 3l2 2.5L17 6l.5 3L20 11l-2.5 2 .5 3L15 17.5 12 21l-3-3.5L6.5 16l.5-3L4 11l2.5-2L7 6l3-.5L12 3z"
    />
  ),
  workers: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 20h16M6 20V10l6-5 6 5v10M10 20v-5h4v5"
    />
  ),
  client: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 21V7a2 2 0 00-2-2H7a2 2 0 00-2 2v14M3 21h18M9 10h.01M15 10h.01M9 14h.01M15 14h.01"
    />
  ),
};

export type AboutIconName = keyof typeof paths;

interface AboutIconProps {
  name: AboutIconName;
  className?: string;
  /** md = 44px tile (default); sm = 32px for chips / inline lists */
  size?: "sm" | "md";
}

export function AboutIcon({
  name,
  className = "",
  size = "md",
}: AboutIconProps) {
  const tile =
    size === "sm"
      ? "h-8 w-8 rounded-[var(--radius-sm)]"
      : "h-11 w-11 rounded-[var(--radius-md)]";
  const glyph = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center border border-border bg-surface text-accent ${tile} ${className}`}
      aria-hidden
    >
      <svg
        className={glyph}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        {paths[name]}
      </svg>
    </span>
  );
}

const roleIconMap: Record<string, AboutIconName> = {
  Architects: "architect",
  Engineers: "engineer",
  Accountants: "finance",
  "HR & Admin": "admin",
  Technicians: "tech",
  Supervisors: "supervisor",
  "Marketing and Sales Professionals": "sales",
  "Quality Analysts": "quality",
  "Skilled & Non-Skilled Workers": "workers",
};

export function iconForTeamRole(role: string): AboutIconName {
  return roleIconMap[role] ?? "users";
}

const commitmentIcons: AboutIconName[] = [
  "clock",
  "shield",
  "layers",
  "scale",
  "leaf",
];

export function iconForCommitment(index: number): AboutIconName {
  return commitmentIcons[index % commitmentIcons.length] ?? "check";
}

import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";

interface PageHeaderProps {
  label: string;
  title: string;
  intro?: string;
  children?: ReactNode;
  delay?: number;
}

export function PageHeader({
  label,
  title,
  intro,
  children,
  delay = 0,
}: PageHeaderProps) {
  return (
    <Reveal delay={delay}>
      <p className="section-label">{label}</p>
      <h1 className="mt-2 font-[family-name:var(--font-syne)] text-3xl font-bold sm:text-4xl lg:text-[2.5rem]">
        {title}
      </h1>
      {intro ? (
        <p className="mt-4 max-w-2xl text-muted">{intro}</p>
      ) : null}
      {children}
    </Reveal>
  );
}

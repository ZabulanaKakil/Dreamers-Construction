"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  href: string;
  label?: string;
  className?: string;
  /** Use inside another link/card so navigation does not bubble. */
  nested?: boolean;
};

const defaultClass =
  "inline-block text-xs font-medium text-accent hover:underline";

export function ViewOnMapLink({
  href,
  label = "View on map →",
  className = defaultClass,
  nested = false,
}: Props) {
  const router = useRouter();

  if (nested) {
    return (
      <span
        role="link"
        tabIndex={0}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          router.push(href);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            router.push(href);
          }
        }}
        className={className}
      >
        {label}
      </span>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

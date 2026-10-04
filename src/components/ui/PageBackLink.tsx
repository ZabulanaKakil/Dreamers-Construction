import Link from "next/link";

interface PageBackLinkProps {
  href: string;
  label: string;
  className?: string;
}

/** Navigational back control — text link only, never a button. */
export function PageBackLink({ href, label, className = "" }: PageBackLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center text-sm text-muted transition-colors hover:text-accent ${className}`.trim()}
    >
      ← {label}
    </Link>
  );
}

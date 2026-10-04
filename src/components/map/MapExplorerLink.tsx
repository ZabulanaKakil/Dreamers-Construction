import Link from "next/link";

type Props = {
  href: string;
  label?: string;
  className?: string;
};

export function MapExplorerLink({
  href,
  label = "Open Full Map Explorer",
  className = "btn-outline",
}: Props) {
  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

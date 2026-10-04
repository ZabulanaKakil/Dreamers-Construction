import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="section-label">404</p>
      <h1 className="mt-4 font-[family-name:var(--font-syne)] text-4xl font-bold">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-muted">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="btn-primary">
          Back to Home
        </Link>
        <Link href="/projects" className="btn-outline">
          Browse Projects
        </Link>
      </div>
    </div>
  );
}

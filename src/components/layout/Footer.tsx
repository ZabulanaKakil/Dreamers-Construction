import Link from "next/link";
import Image from "next/image";
import { company } from "@/data/company";
import { asset } from "@/lib/asset";

const footerLinks = {
  company: [
    { href: "/projects", label: "Projects" },
    { href: "/map", label: "Project map" },
    { href: "/services", label: "Services" },
    { href: "/about", label: "About" },
  ],
  connect: [
    { href: "/contact", label: "Contact" },
    { href: "/contact?type=landowner", label: "Landowner partnership" },
    { href: "/contact?type=project", label: "Project enquiry" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto w-full px-4 py-16 sm:px-6 lg:px-8 xl:px-10">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <Image
                src={asset("/images/brand/logo.jpg")}
                alt={`${company.name} logo`}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full border border-border object-cover"
              />
              <div>
                <p className="font-[family-name:var(--font-syne)] text-2xl font-bold">
                  {company.name}
                </p>
                <p className="text-sm text-accent">{company.tagline}</p>
              </div>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
              {company.description}
            </p>
          </div>

          <div>
            <h3 className="section-label mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="section-label mb-4">Connect</h3>
            <ul className="space-y-2">
              {footerLinks.connect.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-1 text-sm text-muted">
              <p>
                <a href={company.contact.phoneHref} className="hover:text-accent">
                  {company.contact.phone}
                </a>
              </p>
              <p>
                <a href={`mailto:${company.contact.email}`} className="break-all hover:text-accent">
                  {company.contact.email}
                </a>
              </p>
              <p className="pt-2">{company.contact.address}</p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} {company.name}. All rights reserved.
          </p>
          <p className="text-xs text-muted">
            Est. {company.established} · Dhaka, Bangladesh
          </p>
        </div>
      </div>
    </footer>
  );
}

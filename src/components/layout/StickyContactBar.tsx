"use client";

import Link from "next/link";
import { company } from "@/data/company";
import { buildWaLink } from "@/lib/whatsapp";

export function StickyContactBar() {
  const waHref = buildWaLink(
    company.contact.whatsapp,
    "Hi Dreamer's — I'd like to enquire about a project.",
  );

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 lg:hidden">
      <div className="pointer-events-auto border-t border-border bg-background/95 px-3 py-2 backdrop-blur-md pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto grid max-w-lg grid-cols-3 gap-2">
          <a
            href={company.contact.phoneHref}
            className="btn-outline btn-sm inline-flex min-h-11 items-center justify-center text-xs"
          >
            Call
          </a>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline btn-sm inline-flex min-h-11 items-center justify-center text-xs"
          >
            WhatsApp
          </a>
          <Link
            href="/contact"
            className="btn-primary btn-sm inline-flex min-h-11 items-center justify-center text-xs"
          >
            Enquire
          </Link>
        </div>
      </div>
    </div>
  );
}

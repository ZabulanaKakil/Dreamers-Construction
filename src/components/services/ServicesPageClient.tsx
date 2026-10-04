"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Service, ServiceCategory } from "@/data/services";
import { ServiceIcon, categoryLabel } from "@/components/services/ServiceIcon";
import { Reveal } from "@/components/ui/Reveal";
import { FilterChip } from "@/components/ui/FilterChip";
import { FilterChipRow } from "@/components/ui/FilterChipRow";

const SECTION_META: Record<ServiceCategory, { title: string; intro: string; accent?: boolean }> = {
  developer: { title: "Developer Services", intro: "Company-led developments — land partnerships, master planning, and residential projects with units under contract.", accent: true },
  builder: { title: "Builder Services", intro: "Client-funded turnkey builds where you fund the full delivery and we manage quality, schedule, and handover.", accent: true },
  design: { title: "Design & Architecture", intro: "In-house architectural planning from concept layouts through construction-ready documentation.", accent: true },
  construction: { title: "Construction Services", intro: "Civil works, roads, canals, interior, landscaping, and commercial packages for institutional and private clients." },
};

const CATEGORY_ORDER: ServiceCategory[] = ["construction", "developer", "builder", "design"];

export type ServiceWithLinks = Service & {
  relatedProjects: { slug: string; name: string }[];
  link: { href: string; label: string };
};

const PROCESS_STEPS = [
  { step: "01", title: "Consult & scope", text: "We review your brief, site constraints, and budget model — developer, builder, or construction-only." },
  { step: "02", title: "Plan & propose", text: "Drawings, BOQ, and timeline aligned to your goals. Proposals tailored to your scope and experience." },
  { step: "03", title: "Build & coordinate", text: "Site management, procurement, and quality control with regular progress updates." },
  { step: "04", title: "Handover & support", text: "Practical completion, documentation, and aftercare for residences and institutional clients." },
];

export function ServicesPageClient({ services }: { services: ServiceWithLinks[] }) {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const visibleCategories = activeCategory === "all" ? CATEGORY_ORDER : CATEGORY_ORDER.filter((c) => c === activeCategory);

  return (
    <>
      <div className="sticky top-16 z-30 -mx-4 border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 xl:-mx-10 xl:px-10">
        <FilterChipRow>
          <FilterChip active={activeCategory === "all"} onClick={() => setActiveCategory("all")}>All</FilterChip>
          {CATEGORY_ORDER.map((cat) => (
            <FilterChip key={cat} active={activeCategory === cat} onClick={() => setActiveCategory(cat)}>{categoryLabel(cat)}</FilterChip>
          ))}
        </FilterChipRow>
      </div>

      {visibleCategories.map((category, si) => {
        const items = services.filter((s) => s.category === category);
        if (items.length === 0) return null;
        const meta = SECTION_META[category];
        return (
          <section key={category} id={`services-${category}`} className="mt-16">
            <Reveal delay={si * 0.04}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <h2 className={`font-[family-name:var(--font-syne)] text-2xl font-bold ${meta.accent ? "text-accent" : ""}`}>{meta.title}</h2>
                    <p className="mt-2 max-w-2xl text-sm text-muted">{meta.intro}</p>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">{items.length} service{items.length !== 1 ? "s" : ""}</p>
                </div>
              </Reveal>
            <div className="card-grid mt-6">
              {items.map((service, i) => {
                const expanded = expandedId === service.id;
                return (
                  <Reveal key={service.id} delay={i * 0.04}>
                    <article className={`ui-panel-interactive group h-full overflow-hidden transition-all ${expanded ? "ring-1 ring-accent/30" : ""}`}>
                      {service.image && (
                        <div className="relative aspect-[16/9] overflow-hidden border-b border-border bg-surface">
                          <Image src={service.image} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw" />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <ServiceIcon name={service.icon} category={service.category} />
                          <div className="min-w-0 flex-1">
                              <h3 className="font-[family-name:var(--font-syne)] text-base font-semibold leading-snug group-hover:text-accent sm:text-lg">{service.title}</h3>
                              <p className="mt-2 text-sm leading-relaxed text-muted">{service.description}</p>
                            </div>
                          </div>
                        {service.highlights && service.highlights.length > 0 && (
                          <ul className="mt-4 flex flex-wrap gap-2">
                            {service.highlights.map((h) => (
                              <li key={h} className="rounded-[var(--radius-md)] border border-border bg-surface px-2.5 py-1 text-xs text-muted">{h}</li>
                            ))}
                          </ul>
                        )}
                        <div className="mt-5 flex flex-wrap items-center gap-3">
                          <button type="button" onClick={() => setExpandedId(expanded ? null : service.id)} className="text-xs font-semibold uppercase tracking-wider text-accent hover:underline" aria-expanded={expanded}>
                            {expanded ? "Show less" : "Details & deliverables"}
                          </button>
                          <Link href={service.link.href} className="btn-outline btn-sm text-xs">{service.link.label}</Link>
                        </div>
                        {expanded && (
                          <div className="mt-5 border-t border-border pt-5">
                            {service.deliverables && service.deliverables.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Typical deliverables</p>
                                <ul className="mt-3 space-y-2">
                                  {service.deliverables.map((d) => (
                                    <li key={d} className="flex items-start gap-2 text-sm text-muted"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{d}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {service.relatedProjects.length > 0 && (
                              <div className="mt-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Example projects</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {service.relatedProjects.slice(0, 6).map((rp) => (
                                    <Link
                                      key={rp.slug}
                                      href={`/projects/${rp.slug}`}
                                      className="rounded-[var(--radius-md)] border border-border px-2.5 py-1 text-xs text-accent hover:border-accent/50"
                                    >
                                      {rp.name}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </section>
        );
      })}

      <Reveal delay={0.1}>
        <section className="mt-20">
          <p className="section-label">How we work</p>
          <h2 className="mt-2 font-[family-name:var(--font-syne)] text-2xl font-bold">From brief to handover</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((step, i) => (
              <Reveal key={step.step} delay={i * 0.05}>
                <div className="ui-panel h-full p-4 transition-transform hover:-translate-y-0.5">
                  <p className="font-[family-name:var(--font-syne)] text-2xl font-bold text-accent/60">{step.step}</p>
                  <h3 className="mt-3 font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="ui-panel mt-16 p-8 text-center sm:p-12">
          <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold">Have a project in mind?</h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-muted">Tell us about your site, scope, and goals. We provide bespoke, turnkey solutions with transparent collaboration.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/contact?type=project" className="btn-primary">Project Enquiry</Link>
              <Link href="/contact?type=landowner" className="btn-outline">Landowner Partnership</Link>
              <Link href="/projects" className="btn-outline">View Projects</Link>
            </div>
          </div>
      </Reveal>
    </>
  );
}


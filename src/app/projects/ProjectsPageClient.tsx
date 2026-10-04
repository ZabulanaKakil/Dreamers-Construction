"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getPublishedProjects,
  type Project,
  type ProjectPortfolio,
  type ProjectStatus,
} from "@/data/projects";
import { services } from "@/data/services";
import { Reveal } from "@/components/ui/Reveal";
import { PageHeader } from "@/components/ui/PageHeader";
import { FilterChip } from "@/components/ui/FilterChip";
import { FilterChipRow } from "@/components/ui/FilterChipRow";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { ProjectCardSlideshow } from "@/components/projects/ProjectCardSlideshow";
import { projectStatusBadgeClass, projectTypeLabelClass } from "@/lib/project-images";
import { projectTypeLabel } from "@/lib/project-taxonomy";
import { formatProjectStatus } from "@/lib/inventory-status";
import { mapUrlForProject } from "@/lib/map-url";
import { ViewOnMapLink } from "@/components/map/ViewOnMapLink";

const STATUSES: (ProjectStatus | "all")[] = ["all", "ongoing", "completed", "upcoming"];

const PORTFOLIOS: { id: ProjectPortfolio | "all"; label: string }[] = [
  { id: "all", label: "All work" },
  { id: "construction", label: "Construction" },
  { id: "residences", label: "Residential & developer" },
];

const projects = getPublishedProjects();

/** Only services that at least one published project is tagged with. */
const filterServices = services.filter((s) =>
  projects.some((p) => p.serviceIds?.includes(s.id)),
);

function parseStatus(value: string | null): ProjectStatus | "all" {
  return STATUSES.includes(value as ProjectStatus) ? (value as ProjectStatus) : "all";
}

function parsePortfolio(value: string | null): ProjectPortfolio | "all" {
  return value === "construction" || value === "residences" ? value : "all";
}

function parseService(value: string | null): string {
  return value && filterServices.some((s) => s.id === value) ? value : "all";
}

function matches(
  p: Project,
  portfolio: ProjectPortfolio | "all",
  status: ProjectStatus | "all",
  service: string,
): boolean {
  if (portfolio !== "all" && p.portfolio !== portfolio) return false;
  if (status !== "all" && p.status !== status) return false;
  if (service !== "all" && !p.serviceIds?.includes(service)) return false;
  return true;
}

export default function ProjectsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const portfolio = parsePortfolio(searchParams.get("portfolio"));
  const status = parseStatus(searchParams.get("status"));
  const service = parseService(searchParams.get("service"));
  const [filtersOpen, setFiltersOpen] = useState(false);

  const setFilters = (next: {
    portfolio?: ProjectPortfolio | "all";
    status?: ProjectStatus | "all";
    service?: string;
  }) => {
    const values = { portfolio, status, service, ...next };
    const params = new URLSearchParams();
    if (values.portfolio !== "all") params.set("portfolio", values.portfolio);
    if (values.status !== "all") params.set("status", values.status);
    if (values.service !== "all") params.set("service", values.service);
    const qs = params.toString();
    router.replace(qs ? `/projects?${qs}` : "/projects", { scroll: false });
  };

  const filtered = projects.filter((p) => matches(p, portfolio, status, service));

  const hasFilters = portfolio !== "all" || status !== "all" || service !== "all";

  const renderFilters = (layout: "sidebar" | "sheet") => {
    const vertical = layout === "sidebar";
    const chipClass = vertical ? "w-full min-h-8 justify-start text-left" : "";
    const groupClass = vertical ? "filter-sidebar-group" : "mt-5 space-y-3 first:mt-0";
    const labelClass = vertical
      ? "filter-sidebar-label"
      : "text-xs font-semibold uppercase tracking-wider text-muted";

    return (
      <>
        <div className={groupClass}>
          <p className={labelClass}>Category</p>
          <FilterChipRow vertical={vertical} className={vertical ? "mt-1.5" : ""}>
            {PORTFOLIOS.map((p) => (
              <FilterChip
                key={p.id}
                active={portfolio === p.id}
                onClick={() => setFilters({ portfolio: p.id })}
                className={chipClass}
              >
                {p.label}
              </FilterChip>
            ))}
          </FilterChipRow>
        </div>
        <div className={groupClass}>
          <p className={labelClass}>Status</p>
          <FilterChipRow vertical={vertical} className={vertical ? "mt-1.5" : ""}>
            {STATUSES.map((s) => (
              <FilterChip
                key={s}
                active={status === s}
                onClick={() => setFilters({ status: s })}
                className={chipClass}
              >
                {s === "all" ? "All" : formatProjectStatus(s)}
              </FilterChip>
            ))}
          </FilterChipRow>
        </div>
        <div className={groupClass}>
          <p className={labelClass}>Service</p>
          <FilterChipRow vertical={vertical} className={vertical ? "mt-1.5" : ""}>
            <FilterChip
              active={service === "all"}
              onClick={() => setFilters({ service: "all" })}
              className={chipClass}
            >
              All services
            </FilterChip>
            {filterServices.map((s) => (
              <FilterChip
                key={s.id}
                active={service === s.id}
                onClick={() => setFilters({ service: s.id })}
                className={chipClass}
              >
                {s.title}
              </FilterChip>
            ))}
          </FilterChipRow>
        </div>
      </>
    );
  };

  const countLabel = `${filtered.length} project${filtered.length !== 1 ? "s" : ""} found`;

  return (
    <div className="page-band">
      <div className="page-shell">
        <PageHeader
          label="Portfolio"
          title="Projects"
          intro="Civil construction, roads & bridges, canals, sports facilities, interiors, and residential developments delivered across Bangladesh."
        />

        <div className="mt-6 lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-6 xl:grid-cols-[220px_minmax(0,1fr)] xl:gap-8">
          <aside className="relative hidden lg:block">
            <div className="filter-sidebar sticky top-16 max-h-[calc(100svh-4.5rem)] overflow-y-auto overscroll-contain">
              <p className="line-clamp-2 text-[11px] leading-snug text-muted">
                Filter by category, status, and service.
              </p>
              <div className="mt-2.5 border-t border-border pt-2.5">{renderFilters("sidebar")}</div>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="flex items-center justify-between gap-3 lg:hidden">
              <p className="text-sm text-muted">{countLabel}</p>
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="btn-outline btn-sm min-h-11 shrink-0 px-4 text-xs"
              >
                Filters{hasFilters ? " •" : ""}
              </button>
            </div>

            <BottomSheet
              open={filtersOpen}
              onClose={() => setFiltersOpen(false)}
              title="Filters"
              footer={
                <button
                  type="button"
                  className="btn-primary min-h-11 w-full text-sm"
                  onClick={() => setFiltersOpen(false)}
                >
                  Show {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                </button>
              }
            >
              {renderFilters("sheet")}
            </BottomSheet>

            <p className="mt-0 hidden text-sm text-muted lg:block">{countLabel}</p>

            <div className="card-grid--with-sidebar mt-5">
              {filtered.map((project, i) => {
                const badges =
                  project.serviceLabels && project.serviceLabels.length > 0
                    ? project.serviceLabels
                    : [{ id: project.type, title: projectTypeLabel(project.type) }];
                return (
                  <Reveal key={project.slug} delay={Math.min(i, 8) * 0.05}>
                    <Link
                      href={`/projects/${project.slug}`}
                      className="ui-panel-interactive group block h-full overflow-hidden transition-transform hover:-translate-y-1"
                    >
                      <ProjectCardSlideshow images={project.images ?? []} alt={project.name} />
                      <div className="p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={
                              projectStatusBadgeClass[project.status] ??
                              projectStatusBadgeClass.upcoming
                            }
                          >
                            {formatProjectStatus(project.status)}
                          </span>
                          {badges.slice(0, 2).map((b) => (
                            <span key={b.id} className={projectTypeLabelClass}>
                              {b.title}
                            </span>
                          ))}
                        </div>
                        <h2 className="mt-3 font-[family-name:var(--font-syne)] text-lg font-semibold group-hover:text-accent">
                          {project.name}
                        </h2>
                        <p className="mt-1 text-sm text-muted">{project.client}</p>
                        {project.parentProjectSlug && (
                          <p className="mt-1 text-xs text-accent">Linked work package</p>
                        )}
                        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted/80">
                          {project.summary}
                        </p>
                        <p className="mt-4 text-xs text-steel">{project.location}</p>
                        <ViewOnMapLink
                          nested
                          href={mapUrlForProject(project)}
                          className="mt-3 inline-block text-xs font-medium text-accent hover:underline"
                        />
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="ui-panel mt-12 p-10 text-center">
                <p className="font-[family-name:var(--font-syne)] text-xl font-semibold">
                  No projects match your filters
                </p>
                <p className="mt-2 text-sm text-muted">Try a different category, status, or service.</p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    className="btn-primary btn-sm text-xs"
                    onClick={() => setFilters({ portfolio: "all", status: "all", service: "all" })}
                  >
                    Clear filters
                  </button>
                  <Link href="/contact" className="btn-outline btn-sm text-xs">
                    Contact us
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

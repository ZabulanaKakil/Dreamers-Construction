import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/data/projects";
import {
  RELATION_ROLE_LABELS,
  getRelatedWorks,
  getParentProject,
  getBuildingsForProject,
} from "@/lib/project-links";
import { projectTypeLabel } from "@/lib/project-taxonomy";
import { mapUrlForBuilding } from "@/lib/map-url";
import { PageBackLink } from "@/components/ui/PageBackLink";

export function ProjectLinksPanel({ project }: { project: Project }) {
  const parent = getParentProject(project);
  const related = getRelatedWorks(project);
  const linkedBuildings = getBuildingsForProject(project.slug);
  const parentServiceId = parent?.serviceIds?.[0];

  return (
    <div className="mt-10 space-y-8">
      {parent && (
        <div className="ui-panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Part of</p>
            <p className="mt-1 font-[family-name:var(--font-syne)] text-lg font-semibold">
              {parent.name}
            </p>
            <p className="text-sm text-muted">
              {projectTypeLabel(parent.type)} · {parent.summary}
            </p>
            <div className="mt-2">
              <PageBackLink href={`/projects/${parent.slug}`} label={parent.name} />
            </div>
          </div>
          {parentServiceId && (
            <Link
              href={`/projects?service=${parentServiceId}`}
              className="btn-outline btn-sm shrink-0 text-xs"
            >
              Browse related work
            </Link>
          )}
        </div>
      )}

      {linkedBuildings.length > 0 && (
        <section>
          <h2 className="font-[family-name:var(--font-syne)] text-xl font-semibold">
            Buildings in this project
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {linkedBuildings.map((b) => (
              <Link
                key={b.slug}
                href={mapUrlForBuilding(b)}
                className="ui-panel-interactive block p-4"
              >
                <p className="font-semibold">{b.name}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{b.summary}</p>
                <p className="mt-2 text-xs text-steel">
                  {b.address}
                  {b.flatCount ? ` · ${b.flatCount} apartment${b.flatCount !== 1 ? "s" : ""}` : ""}
                </p>
                <p className="mt-3 text-xs font-medium text-accent">View on map →</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section>
          <h2 className="font-[family-name:var(--font-syne)] text-xl font-semibold">
            Related works
          </h2>
          <p className="mt-1 text-sm text-muted">
            Interior, exterior, design, and other packages linked to this project.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {related.map(({ role, project: child }) => {
              const cover = child.coverImage ?? child.images?.[0];
              return (
                <Link
                  key={child.slug}
                  href={`/projects/${child.slug}`}
                  className="ui-panel-interactive overflow-hidden"
                >
                  {cover && (
                    <div className="relative aspect-[16/9] bg-muted/20">
                      <Image
                        src={cover}
                        alt={child.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 50vw"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                      {RELATION_ROLE_LABELS[role]}
                    </p>
                    <p className="mt-1 font-[family-name:var(--font-syne)] font-semibold">
                      {child.name}
                    </p>
                    <p className="mt-2 line-clamp-3 text-sm text-muted">{child.summary}</p>
                    <p className="mt-3 text-xs font-medium text-accent">
                      View {RELATION_ROLE_LABELS[role].toLowerCase()} work →
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

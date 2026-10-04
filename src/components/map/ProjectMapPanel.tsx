"use client";

import Link from "next/link";
import type { MapProjectFeature } from "@/data/map-projects";
import { formatProjectStatus } from "@/lib/inventory-status";
import { MapExplorerLink } from "@/components/map/MapExplorerLink";
import { mapUrlForProject } from "@/lib/map-url";

interface ProjectMapPanelProps {
  feature: MapProjectFeature | null;
  projectCount?: number;
  onClose?: () => void;
}

const statusClass: Record<string, string> = {
  completed: "project-status-badge project-status-completed",
  ongoing: "project-status-badge project-status-ongoing",
  upcoming: "project-status-badge project-status-upcoming",
};

export function ProjectMapPanel({
  feature,
  projectCount,
  onClose,
}: ProjectMapPanelProps) {
  if (!feature) {
    return (
      <div className="map-side-card ui-panel-elevated p-4">
        <p className="section-label">Projects</p>
        <h3 className="mt-2 font-[family-name:var(--font-syne)] text-lg font-semibold">
          Click a project pin
        </h3>
        <p className="mt-3 text-sm text-muted">
          Completed and ongoing works — canals, campuses, bridges, and more —
          appear as pins on the map.
          {typeof projectCount === "number" && projectCount > 0
            ? ` ${projectCount} project${projectCount === 1 ? "" : "s"} in this region.`
            : ""}
        </p>
        <Link href="/projects" className="btn-outline mt-6 inline-block w-full text-center text-xs">
          Browse All Projects
        </Link>
      </div>
    );
  }

  const { project } = feature;

  return (
    <div className="map-side-card ui-panel-elevated p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="map-side-card__title">
          <p className="section-label">{project.location}</p>
          <h3 className="mt-1 break-words font-[family-name:var(--font-syne)] text-xl font-bold">
            {project.name}
          </h3>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-muted hover:text-foreground"
            aria-label="Close"
          >
            ✕
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={statusClass[project.status] ?? statusClass.completed}>
          {formatProjectStatus(project.status)}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-muted">
          {feature.kind.replace("-", " ")}
        </span>
      </div>

      <p className="mt-3 text-sm text-muted">{project.summary}</p>

      {project.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={project.coverImage}
          alt=""
          className="mt-4 aspect-[16/10] w-full object-cover border border-border"
        />
      )}

      <div className="map-side-card__actions mt-5">
        <Link href={`/projects/${project.slug}`} className="btn-primary text-xs">
          View Project
        </Link>
        <MapExplorerLink
          href={mapUrlForProject(project)}
          label="View on map"
          className="btn-outline text-xs"
        />
        {(feature.mapsUrl || project.mapsUrl) && (
          <a
            href={feature.mapsUrl || project.mapsUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline text-xs"
          >
            Open in Maps
          </a>
        )}
        <Link href="/projects" className="btn-outline text-xs">
          All Projects
        </Link>
      </div>
    </div>
  );
}

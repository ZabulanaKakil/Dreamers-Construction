"use client";

import Link from "next/link";
import type { SectorPlotArea } from "@/data/sector-plots";
import { getRegionById, type RegionId } from "@/data/map-regions";
import { MapExplorerLink } from "@/components/map/MapExplorerLink";
import { mapUrlForRegion } from "@/lib/map-url";

const statusLabels: Record<SectorPlotArea["status"], string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
  upcoming: "Upcoming",
  ongoing: "Project Running",
  completed: "Project Completed",
};

interface SectorPlotPanelProps {
  plot: SectorPlotArea | null;
  sectorId: RegionId;
  plotCount?: number;
  onClose?: () => void;
}

export function SectorPlotPanel({
  plot,
  sectorId,
  plotCount = 0,
  onClose,
}: SectorPlotPanelProps) {
  const region = getRegionById(sectorId);

  if (plot) {
    const isProjectStatus = plot.status === "ongoing" || plot.status === "completed";

    return (
      <div className="map-side-card ui-panel-elevated p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="map-side-card__title">
            <p className="section-label">{plot.block ? `Block ${plot.block}` : "Plot"}</p>
            <h3 className="mt-1 break-words font-[family-name:var(--font-syne)] text-xl font-bold">
              Plot {plot.plotNumber}
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

        <div className="mt-4 flex flex-wrap gap-2">
          <span
            className={
              plot.status === "available"
                ? "badge badge-success"
                : plot.status === "reserved"
                  ? "badge badge-warning"
                  : plot.status === "sold"
                    ? "badge badge-danger"
                    : isProjectStatus
                      ? "badge badge-info"
                      : "badge badge-muted"
            }
          >
            {statusLabels[plot.status]}
          </span>
          {plot.size && <span className="badge badge-muted">{plot.size}</span>}
        </div>

        <p className="mt-4 text-sm leading-relaxed text-muted">{plot.summary}</p>

        <div className="map-side-card__actions mt-6">
          {plot.projectSlug && (
            <Link
              href={`/projects/${plot.projectSlug}`}
              className="btn-primary text-center text-xs"
            >
              View Project
            </Link>
          )}
          <Link href="/contact" className="btn-outline text-center text-xs">
            Ask about this plot
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="map-side-card ui-panel-elevated p-4">
      <p className="section-label">{region.label}</p>
      <h3 className="mt-2 font-[family-name:var(--font-syne)] text-lg font-semibold">
        {plotCount} highlighted plot{plotCount !== 1 ? "s" : ""}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        {region.description} Use the scroll bars and zoom slider below the map to
        navigate, or click the overview thumbnail to jump back to an area. Only
        highlighted plots are interactive.
      </p>
      {region.parentId && (
        <MapExplorerLink
          href={mapUrlForRegion(region.parentId)}
          label="View Jolshiri Overview"
          className="btn-outline mt-6 inline-block w-full text-center text-xs"
        />
      )}
    </div>
  );
}

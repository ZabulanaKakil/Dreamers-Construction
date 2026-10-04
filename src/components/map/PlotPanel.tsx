"use client";

import Link from "next/link";
import type { Plot } from "@/data/plots";
import { getRegionById } from "@/data/map-regions";
import { formatInventoryStatus, formatPlotType } from "@/lib/inventory-status";

interface PlotPanelProps {
  plot: Plot | null;
  regionDescription?: string;
  plotCount?: number;
  onClose?: () => void;
}

export function PlotPanel({
  plot,
  regionDescription,
  plotCount = 0,
  onClose,
}: PlotPanelProps) {
  if (plot) {
    return (
      <div className="map-side-card ui-panel-elevated p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="map-side-card__title">
            <p className="section-label">{formatPlotType(plot.type)}</p>
            <h3 className="mt-1 break-words font-[family-name:var(--font-syne)] text-xl font-bold">
              {plot.name}
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
                    : "badge badge-info"
            }
          >
            {formatInventoryStatus(plot.status)}
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
          <Link
            href="/contact?type=landowner"
            className="btn-outline text-center text-xs"
          >
            Enquire about this land
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="map-side-card ui-panel-elevated p-4">
      <p className="section-label">Land & plots</p>
      {plotCount === 0 ? (
        <>
          <h3 className="mt-2 font-[family-name:var(--font-syne)] text-lg font-semibold">
            Project map
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {regionDescription ??
              "Explore the map regions and zoom in to see where we have built."}{" "}
            Project pins (canals, campuses, bridges) are clickable for completed and
            ongoing works.
          </p>
        </>
      ) : (
        <>
          <h3 className="mt-2 font-[family-name:var(--font-syne)] text-lg font-semibold">
            {plotCount} plot{plotCount !== 1 ? "s" : ""} in this region
          </h3>
          <p className="mt-3 text-sm text-muted">
            Click a marker on the map to view plot details.
          </p>
        </>
      )}
    </div>
  );
}

export function PlotPanelWithRegion({
  plot,
  regionId,
  plotCount,
  onClose,
}: PlotPanelProps & { regionId: string }) {
  const region = getRegionById(regionId as Parameters<typeof getRegionById>[0]);
  return (
    <PlotPanel
      plot={plot}
      regionDescription={region.description}
      plotCount={plotCount}
      onClose={onClose}
    />
  );
}

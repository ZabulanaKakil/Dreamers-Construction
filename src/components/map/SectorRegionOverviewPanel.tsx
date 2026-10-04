"use client";

import Link from "next/link";
import type { SectorPlotArea } from "@/data/sector-plots";
import type { Building } from "@/data/buildings";
import type { MapProjectFeature } from "@/data/map-projects";
import { getRegionById, type RegionId } from "@/data/map-regions";
import { mapUrlForRegion } from "@/lib/map-url";
import { MapExplorerLink } from "@/components/map/MapExplorerLink";

interface SectorRegionOverviewPanelProps {
  sectorId: RegionId;
  plots: SectorPlotArea[];
  buildings: Building[];
  projects: MapProjectFeature[];
  onSelectPlot: (plot: SectorPlotArea) => void;
  onSelectBuilding: (building: Building) => void;
  onSelectProject: (feature: MapProjectFeature) => void;
}

export function SectorRegionOverviewPanel({
  sectorId,
  plots,
  buildings,
  projects,
  onSelectPlot,
  onSelectBuilding,
  onSelectProject,
}: SectorRegionOverviewPanelProps) {
  const region = getRegionById(sectorId);
  const total = plots.length + buildings.length + projects.length;

  return (
    <div className="map-side-card ui-panel-elevated p-4">
      <p className="section-label">{region.label}</p>
      <h3 className="mt-2 font-[family-name:var(--font-syne)] text-lg font-semibold">
        {total} listing{total !== 1 ? "s" : ""} on map
      </h3>
      <p className="mt-2 text-xs text-muted">
        {plots.length} sector plot{plots.length !== 1 ? "s" : ""} ·{" "}
        {buildings.length} house{buildings.length !== 1 ? "s" : ""} ·{" "}
        {projects.length} project{projects.length !== 1 ? "s" : ""}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Click a marker on the map for details, or browse everything in this
        region below.
      </p>

      {total > 0 && (
        <ul className="mt-4 max-h-48 space-y-2 overflow-y-auto overscroll-contain">
          {buildings.map((b) => (
            <li key={`b-${b.slug}`}>
              <button
                type="button"
                onClick={() => onSelectBuilding(b)}
                className="ui-panel w-full p-3 text-left text-sm transition-colors hover:border-accent/40"
              >
                <span className="font-medium text-foreground">House · {b.name}</span>
              </button>
            </li>
          ))}
          {plots.map((p) => (
            <li key={`p-${p.id}`}>
              <button
                type="button"
                onClick={() => onSelectPlot(p)}
                className="ui-panel w-full p-3 text-left text-sm transition-colors hover:border-accent/40"
              >
                <span className="font-medium text-foreground">
                  Plot {p.plotNumber}
                  {p.block ? ` — Block ${p.block}` : ""}
                </span>
              </button>
            </li>
          ))}
          {projects.map((f) => (
            <li key={`pr-${f.projectSlug}`}>
              <button
                type="button"
                onClick={() => onSelectProject(f)}
                className="ui-panel w-full p-3 text-left text-sm transition-colors hover:border-accent/40"
              >
                <span className="font-medium text-foreground">
                  Project · {f.shortLabel ?? f.project.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex flex-col gap-2">
        <Link href="/projects" className="btn-primary text-center text-xs">
          Browse projects
        </Link>
        {region.parentId && (
          <MapExplorerLink
            href={mapUrlForRegion(region.parentId)}
            label="View Jolshiri overview"
            className="btn-outline text-center text-xs"
          />
        )}
      </div>
    </div>
  );
}

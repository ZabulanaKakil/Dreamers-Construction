"use client";

import Image from "next/image";
import Link from "next/link";
import type { Building } from "@/data/buildings";
import { getRegionById, isValidRegionId } from "@/data/map-regions";
import { formatProjectStatus } from "@/lib/inventory-status";

interface BuildingPanelProps {
  building: Building | null;
  onClose?: () => void;
}

export function BuildingPanel({ building, onClose }: BuildingPanelProps) {
  if (!building) {
    return (
      <div className="map-side-card ui-panel-elevated p-4">
        <p className="section-label">Residential</p>
        <h3 className="mt-2 font-[family-name:var(--font-syne)] text-lg font-semibold">
          Click a building marker
        </h3>
        <p className="mt-3 text-sm text-muted">
          See the residential buildings we have delivered, or click a project pin for
          completed and ongoing works.
        </p>
        <Link
          href="/projects?portfolio=residences"
          className="btn-outline mt-6 inline-block w-full text-center text-xs"
        >
          Residential projects
        </Link>
      </div>
    );
  }

  const regionLabel = isValidRegionId(building.regionId)
    ? getRegionById(building.regionId).label
    : building.regionId;
  const cover = building.imageUrl ?? building.images?.[0];
  const flatCount = building.flatCount ?? 0;

  return (
    <div className="map-side-card ui-panel-elevated p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="map-side-card__title">
          <p className="section-label">{regionLabel}</p>
          <h3 className="mt-1 break-words font-[family-name:var(--font-syne)] text-xl font-bold">
            {building.name}
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

      {cover && (
        <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-[var(--radius-md)] border border-border">
          <Image src={cover} alt={building.name} fill className="object-cover" sizes="360px" />
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="badge badge-info">{formatProjectStatus(building.status)}</span>
        {flatCount > 0 && (
          <span className="badge badge-muted">
            {flatCount} apartment{flatCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      <p className="mt-3 text-sm text-muted">{building.summary}</p>
      <p className="mt-2 text-xs text-steel">{building.address}</p>

      <div className="map-side-card__actions mt-6">
        {building.projectSlug && (
          <Link
            href={`/projects/${building.projectSlug}`}
            className="btn-primary text-center text-xs"
          >
            View Project
          </Link>
        )}
        <Link href="/contact?type=buyer" className="btn-outline text-center text-xs">
          Enquire
        </Link>
      </div>
    </div>
  );
}

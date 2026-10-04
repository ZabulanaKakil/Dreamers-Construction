import rows from "./generated/buildings.json";
import type { RegionId } from "./map-regions";
import { isImageMapRegion } from "./map-regions";
import {
  isSectorBoundItem,
  itemMatchesMapRegion,
  normalizeRegionIds,
} from "@/lib/map-location";
import { asset } from "@/lib/asset";

export type BuildingStatus = "upcoming" | "ongoing" | "completed";
export type SaleStatus = "available" | "reserved" | "sold" | "upcoming";

export interface Building {
  slug: string;
  name: string;
  regionId: RegionId;
  /** Regions where this house appears (falls back to [regionId]) */
  mapRegionIds?: RegionId[];
  lat: number;
  lng: number;
  address: string;
  summary: string;
  description: string;
  status: BuildingStatus;
  saleStatus?: SaleStatus;
  oneLiner?: string;
  imageUrl?: string | null;
  images?: string[];
  sectorX?: number | null;
  sectorY?: number | null;
  sectorWidth?: number | null;
  sectorHeight?: number | null;
  /** Developer / builder (or other) project this building belongs to */
  projectSlug?: string | null;
  /** Number of apartments recorded for this building */
  flatCount?: number;
}

export const buildings: Building[] = (rows as unknown as Building[]).map((b) => ({
  ...b,
  imageUrl: asset(b.imageUrl),
  images: b.images?.map((src) => asset(src)),
}));

/** Slugs of buildings that contain apartments (used by the map legend). */
export const buildingSlugsWithFlats = new Set(
  buildings.filter((b) => (b.flatCount ?? 0) > 0).map((b) => b.slug),
);

function buildingRegionIds(b: Building): RegionId[] {
  const ids = normalizeRegionIds(b.mapRegionIds);
  if (ids.length > 0) return ids;
  return [b.regionId];
}

export function getBuildingBySlug(slug: string): Building | undefined {
  return buildings.find((b) => b.slug === slug);
}

export function getBuildingsByRegion(regionId: RegionId): Building[] {
  return buildings.filter((b) =>
    itemMatchesMapRegion(buildingRegionIds(b), regionId, {
      sectorBound: isSectorBoundItem(b),
    }),
  );
}

/** Geo MapLibre only — never sector-bound houses. */
export function getGeoBuildingsByRegion(regionId: RegionId): Building[] {
  if (isImageMapRegion(regionId)) return [];
  return getBuildingsByRegion(regionId).filter((b) => !isSectorBoundItem(b));
}

/** Sector image map only. */
export function getSectorBuildingsByRegion(regionId: RegionId): Building[] {
  if (!isImageMapRegion(regionId)) return [];
  return buildings.filter(
    (b) =>
      isSectorBoundItem(b) &&
      itemMatchesMapRegion(buildingRegionIds(b), regionId, { sectorBound: true }),
  );
}

import {
  getRegionById,
  isImageMapRegion,
  isValidRegionId,
  mapRegions,
  type RegionId,
} from "@/data/map-regions";

export type SectorBounds = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** True when the region uses the interactive sector (image) map. */
export function isSectorRegionId(id: string): boolean {
  return isValidRegionId(id) && isImageMapRegion(id);
}

/** First selected sector region, if any. */
export function primarySectorRegionId(
  regionIds: readonly string[] | null | undefined,
): RegionId | null {
  if (!regionIds?.length) return null;
  for (const id of regionIds) {
    if (isSectorRegionId(id)) return id as RegionId;
  }
  return null;
}

/** First selected geo (MapLibre) region, if any. */
export function primaryGeoRegionId(
  regionIds: readonly string[] | null | undefined,
  fallback: RegionId = "dhaka",
): RegionId {
  if (regionIds?.length) {
    for (const id of regionIds) {
      if (isValidRegionId(id) && !isImageMapRegion(id)) return id;
    }
  }
  return fallback;
}

/**
 * Sector-bound items must never appear as MapLibre geo pins.
 * Presence of sector % coordinates marks the item as sector-only.
 */
export function isSectorBoundItem(item: {
  sectorX?: number | null;
  sectorY?: number | null;
}): boolean {
  return (
    item.sectorX != null &&
    !Number.isNaN(Number(item.sectorX)) &&
    item.sectorY != null &&
    !Number.isNaN(Number(item.sectorY))
  );
}

export function hasValidSectorBounds(bounds: Partial<SectorBounds> | null | undefined): boolean {
  if (!bounds) return false;
  return (
    bounds.x != null &&
    !Number.isNaN(Number(bounds.x)) &&
    bounds.y != null &&
    !Number.isNaN(Number(bounds.y)) &&
    Number(bounds.width) > 0 &&
    Number(bounds.height) > 0
  );
}

export function normalizeSectorBounds(
  item: {
    sectorX?: number | null;
    sectorY?: number | null;
    sectorWidth?: number | null;
    sectorHeight?: number | null;
  } | null | undefined,
  fallback: SectorBounds = { x: 10, y: 10, width: 3, height: 3 },
): SectorBounds {
  if (!item) return fallback;
  return {
    x: item.sectorX ?? fallback.x,
    y: item.sectorY ?? fallback.y,
    width: item.sectorWidth && item.sectorWidth > 0 ? item.sectorWidth : fallback.width,
    height:
      item.sectorHeight && item.sectorHeight > 0 ? item.sectorHeight : fallback.height,
  };
}

export function normalizeRegionIds(value: unknown): RegionId[] {
  if (!Array.isArray(value)) return [];
  return value.filter((id): id is RegionId => typeof id === "string" && isValidRegionId(id));
}

/**
 * Should this item appear on a given map region view?
 * Sector-bound → only image-map regions listed in mapRegionIds.
 * Geo-bound → MapLibre regions (never image-map sector views).
 */
export function itemMatchesMapRegion(
  regionIds: readonly RegionId[],
  viewRegionId: RegionId,
  opts: { sectorBound: boolean },
): boolean {
  const ids = regionIds.length > 0 ? regionIds : [];

  if (opts.sectorBound) {
    if (!isImageMapRegion(viewRegionId)) return false;
    return ids.includes(viewRegionId);
  }

  // Never show geo items on sector image maps
  if (isImageMapRegion(viewRegionId)) return false;

  if (viewRegionId === "bangladesh") return true;

  if (ids.length === 0) return false;

  if (viewRegionId === "dhaka") {
    const dhakaChildren: RegionId[] = [
      "dhaka",
      "jolshiri",
      "jolshiri-ext",
      "mirpur-dohs",
      "narayanganj-dohs",
    ];
    return ids.some((id) => dhakaChildren.includes(id) && !isImageMapRegion(id));
  }

  return ids.includes(viewRegionId);
}

/** Child sector regions under a parent (e.g. Sector 14 under Jolshiri). */
export function childSectorRegionIds(parentId: RegionId): RegionId[] {
  return mapRegions
    .filter((r) => r.parentId === parentId)
    .map((r) => r.id);
}

/**
 * Residences inventory filtering — supports sector-bound items on image-map
 * regions and rolls child sectors up to their parent (Jolshiri → Sector 14).
 */
export function inventoryMatchesRegion(
  itemRegionIds: readonly RegionId[],
  viewRegionId: RegionId,
  opts: { sectorBound: boolean },
): boolean {
  if (itemMatchesMapRegion(itemRegionIds, viewRegionId, opts)) return true;

  if (opts.sectorBound && viewRegionId === "jolshiri") {
    const childIds = childSectorRegionIds("jolshiri");
    return itemRegionIds.some((id) => childIds.includes(id));
  }

  return false;
}

export function sectorInventoryMatchesRegion(
  sectorId: string,
  viewRegionId: RegionId,
): boolean {
  if (!isValidRegionId(sectorId)) return false;
  if (sectorId === viewRegionId) return true;
  if (viewRegionId === "bangladesh") return true;
  if (viewRegionId === "jolshiri") {
    return getRegionById(sectorId).parentId === "jolshiri";
  }
  return false;
}

/** Center the LocationPicker on this region when switching. */
export function regionCenter(regionId: RegionId): [number, number] {
  return getRegionById(regionId).center;
}

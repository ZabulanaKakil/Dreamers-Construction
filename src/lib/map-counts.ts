import type { RegionId } from "@/data/map-regions";
import { isImageMapRegion } from "@/data/map-regions";
import type { Building } from "@/data/buildings";
import type { Plot } from "@/data/plots";
import type { SectorPlotArea } from "@/data/sector-plots";
import type { Project } from "@/data/projects";
import {
  buildMapProjectFeatures,
} from "@/data/map-projects";
import {
  isSectorBoundItem,
  itemMatchesMapRegion,
  normalizeRegionIds,
} from "@/lib/map-location";

const ALL_REGION_IDS: RegionId[] = [
  "bangladesh",
  "dhaka",
  "jolshiri",
  "jolshiri-sector-14",
  "jolshiri-ext",
  "mirpur-dohs",
  "narayanganj-dohs",
  "chattogram",
];

function countBuildingsForRegion(buildings: Building[], regionId: RegionId): number {
  return buildings.filter((b) => {
    const ids = normalizeRegionIds(b.mapRegionIds);
    const regionList = ids.length > 0 ? ids : [b.regionId];
    return itemMatchesMapRegion(regionList, regionId, {
      sectorBound: isSectorBoundItem(b),
    });
  }).length;
}

function countPlotsForRegion(plots: Plot[], regionId: RegionId): number {
  if (regionId === "jolshiri-sector-14") return 0;
  if (regionId === "bangladesh") return plots.length;
  if (regionId === "dhaka") {
    return plots.filter(
      (p) =>
        p.regionId === "dhaka" ||
        p.regionId === "jolshiri" ||
        p.regionId === "mirpur-dohs" ||
        p.regionId === "narayanganj-dohs" ||
        p.regionId === "jolshiri-ext",
    ).length;
  }
  return plots.filter((p) => p.regionId === regionId).length;
}

function countSectorPlotsForRegion(sectorPlots: SectorPlotArea[], regionId: RegionId): number {
  if (!isImageMapRegion(regionId)) return 0;
  return sectorPlots.filter((p) => p.sectorId === regionId).length;
}

/** Combined map item counts for region switcher labels */
export function getMapItemCountsByRegion(input: {
  projects: Project[];
  buildings: Building[];
  plots: Plot[];
  sectorPlots: SectorPlotArea[];
}): Record<RegionId, number> {
  const { projects, buildings, plots, sectorPlots } = input;
  return Object.fromEntries(
    ALL_REGION_IDS.map((id) => {
      const projectCount = buildMapProjectFeatures(projects, id, {
        geoOnly: !isImageMapRegion(id),
        sectorOnly: isImageMapRegion(id),
      }).length;
      const buildingCount = countBuildingsForRegion(buildings, id);
      const plotCount = countPlotsForRegion(plots, id);
      const sectorPlotCount = countSectorPlotsForRegion(sectorPlots, id);
      return [id, projectCount + buildingCount + plotCount + sectorPlotCount];
    }),
  ) as Record<RegionId, number>;
}

/** Ensure sector-bound items include their sector region id */
export function ensureSectorRegionIds(
  mapRegionIds: RegionId[],
  sectorRegionId: RegionId | null,
): RegionId[] {
  if (!sectorRegionId) return mapRegionIds;
  const set = new Set(mapRegionIds);
  set.add(sectorRegionId);
  return [...set];
}

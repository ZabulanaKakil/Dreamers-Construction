import { isImageMapRegion, isValidRegionId, type RegionId } from "@/data/map-regions";
import {
  isSectorBoundItem,
  normalizeRegionIds,
  primaryGeoRegionId,
  primarySectorRegionId,
} from "@/lib/map-location";
import { isResidenceProjectType } from "@/lib/project-taxonomy";

export type MapCategory = "projects" | "residences";

export type MapSelectionState = {
  regionId?: RegionId | string | null;
  category?: MapCategory;
  projectSlug?: string | null;
  buildingSlug?: string | null;
  plotId?: string | null;
  sectorPlotId?: string | null;
};

export function mapCategoryForProjectType(type: string): MapCategory {
  return isResidenceProjectType(type) ? "residences" : "projects";
}

/** Pick the best map region for an item's mapRegionIds or fallback regionId. */
export function primaryMapRegion(
  mapRegionIds?: string[] | null,
  fallback?: string,
): RegionId | string {
  const ids = normalizeRegionIds(mapRegionIds);
  if (ids.length === 0) {
    return fallback ?? "dhaka";
  }
  const sector = primarySectorRegionId(ids);
  if (sector) return sector;
  return primaryGeoRegionId(ids, ids[0] as RegionId) ?? ids[0];
}

export function buildMapUrl(params: {
  region?: RegionId | string;
  category?: MapCategory;
  project?: string;
  building?: string;
  plot?: string;
  sectorPlot?: string;
}): string {
  const qs = new URLSearchParams();
  if (params.region) qs.set("region", params.region);
  if (params.category) qs.set("category", params.category);
  if (params.project) qs.set("project", params.project);
  if (params.building) qs.set("building", params.building);
  if (params.plot) qs.set("plot", params.plot);
  if (params.sectorPlot) qs.set("sectorPlot", params.sectorPlot);
  const q = qs.toString();
  return q ? `/map?${q}` : "/map";
}

/** Region-only map link (omits bangladesh default). */
export function mapUrlForRegion(regionId?: RegionId | string | null): string {
  if (!regionId || regionId === "bangladesh") return "/map";
  return buildMapUrl({ region: regionId });
}

type ProjectMapRef = {
  slug: string;
  type: string;
  mapRegionIds?: string[] | null;
  sectorX?: number | null;
  sectorY?: number | null;
};

/** Region where the project's marker is drawn: sector plan only when it has sector coordinates. */
export function mapRegionForProject(project: ProjectMapRef): RegionId | string {
  if (isSectorBoundItem(project)) return primaryMapRegion(project.mapRegionIds, "dhaka");
  return primaryGeoRegionId(normalizeRegionIds(project.mapRegionIds), "bangladesh");
}

/** Deep link for a project pin (construction or residence). */
export function mapUrlForProject(project: ProjectMapRef): string {
  return buildMapUrl({
    region: mapRegionForProject(project),
    category: mapCategoryForProjectType(project.type),
    project: project.slug,
  });
}

type BuildingMapRef = {
  slug: string;
  regionId: string;
  mapRegionIds?: string[] | null;
  sectorX?: number | null;
  sectorY?: number | null;
};

export function mapRegionForBuilding(building: BuildingMapRef): RegionId | string {
  if (isSectorBoundItem(building)) return primaryMapRegion(building.mapRegionIds, building.regionId);
  const fallback = isValidRegionId(building.regionId) && !isImageMapRegion(building.regionId)
    ? building.regionId
    : "dhaka";
  return primaryGeoRegionId(normalizeRegionIds(building.mapRegionIds), fallback);
}

/** Deep link for a house / building on the residences map. */
export function mapUrlForBuilding(building: BuildingMapRef): string {
  return buildMapUrl({
    region: mapRegionForBuilding(building),
    category: "residences",
    building: building.slug,
  });
}

/** Deep link for a geo plot or land parcel. */
export function mapUrlForGeoPlot(plot: {
  id: string;
  regionId: string;
}): string {
  return buildMapUrl({
    region: plot.regionId,
    category: "residences",
    plot: plot.id,
  });
}

/** Deep link for a sector master-plan plot. */
export function mapUrlForSectorPlot(plot: {
  id: string;
  sectorId: string;
}): string {
  return buildMapUrl({
    region: plot.sectorId,
    category: "residences",
    sectorPlot: plot.id,
  });
}

/** Build a map URL from current teaser / explorer selection state. */
export function mapUrlForSelection(state: MapSelectionState): string {
  const region =
    state.regionId && state.regionId !== "bangladesh"
      ? state.regionId
      : undefined;

  return buildMapUrl({
    region,
    category: state.category,
    project: state.projectSlug ?? undefined,
    building: state.buildingSlug ?? undefined,
    plot: state.plotId ?? undefined,
    sectorPlot: state.sectorPlotId ?? undefined,
  });
}

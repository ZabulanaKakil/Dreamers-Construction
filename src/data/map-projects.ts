import type { RegionId } from "./map-regions";
import type { MapProjectKind, Project, ProjectStatus } from "./projects";
import { getPublishedProjects } from "./projects";
import {
  isSectorBoundItem,
  itemMatchesMapRegion,
  normalizeRegionIds,
} from "@/lib/map-location";

export type { MapProjectKind } from "./projects";

export interface MapProjectPin {
  projectSlug: string;
  lat: number;
  lng: number;
  kind: MapProjectKind;
  shortLabel?: string;
  mapsUrl?: string;
  regionIds: RegionId[];
  sectorBound?: boolean;
  sectorX?: number | null;
  sectorY?: number | null;
  sectorWidth?: number | null;
  sectorHeight?: number | null;
}

export interface MapProjectFeature extends MapProjectPin {
  project: Project;
  status: ProjectStatus;
}

function pinFromProject(project: Project): MapProjectPin | null {
  const sectorBound = isSectorBoundItem(project);
  if (!sectorBound && (project.lat == null || project.lng == null)) return null;

  return {
    projectSlug: project.slug,
    lat: project.lat ?? 0,
    lng: project.lng ?? 0,
    kind: project.mapKind ?? "infrastructure",
    shortLabel: project.shortLabel ?? project.name,
    mapsUrl: project.mapsUrl ?? undefined,
    regionIds: normalizeRegionIds(project.mapRegionIds),
    sectorBound,
    ...(sectorBound && {
      sectorX: project.sectorX,
      sectorY: project.sectorY,
      sectorWidth: project.sectorWidth,
      sectorHeight: project.sectorHeight,
    }),
  };
}

function matchesRegion(pin: MapProjectPin, regionId: RegionId): boolean {
  return itemMatchesMapRegion(pin.regionIds, regionId, {
    sectorBound: Boolean(pin.sectorBound),
  });
}

export function buildMapProjectFeatures(
  projects: Project[],
  regionId: RegionId,
  opts?: { geoOnly?: boolean; sectorOnly?: boolean },
): MapProjectFeature[] {
  return projects
    .filter((project) => project.published !== false)
    .map((project) => {
      const pin = pinFromProject(project);
      if (!pin || !matchesRegion(pin, regionId)) return null;
      if (opts?.geoOnly && pin.sectorBound) return null;
      if (opts?.sectorOnly && !pin.sectorBound) return null;
      return { ...pin, project, status: project.status };
    })
    .filter((feature): feature is MapProjectFeature => feature !== null);
}

export function getMapProjectsForRegion(regionId: RegionId): MapProjectFeature[] {
  return buildMapProjectFeatures(getPublishedProjects(), regionId, { geoOnly: true });
}

export function getSectorMapProjectsForRegion(
  regionId: RegionId,
  projects?: Project[],
): MapProjectFeature[] {
  return buildMapProjectFeatures(projects ?? getPublishedProjects(), regionId, {
    sectorOnly: true,
  });
}

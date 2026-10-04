import rows from "./generated/projects.json";
import { mapRegions, type RegionId } from "./map-regions";
import { services } from "./services";
import { asset } from "@/lib/asset";
import { PROJECT_PLACEHOLDER_IMAGE } from "@/lib/project-images";
import { deriveProjectTypeFromServices } from "@/lib/service-taxonomy";

export type ProjectStatus = "completed" | "ongoing" | "upcoming";

export type ProjectType =
  | "civil"
  | "roads_bridges"
  | "canals"
  | "interior"
  | "landscaping"
  | "commercial"
  | "developer"
  | "builder"
  | "design";

export type ProjectPortfolio = "construction" | "residences";

/** Visual category for map markers / legend */
export type MapProjectKind =
  | "canal"
  | "bridge"
  | "institutional"
  | "sports"
  | "infrastructure"
  | "hq";

export type ProjectRelationRole =
  | "interior_of"
  | "exterior_of"
  | "landscaping_of"
  | "design_for"
  | "commercial_of"
  | "other";

export interface RelatedProjectRef {
  slug: string;
  role: ProjectRelationRole;
}

export interface Project {
  slug: string;
  name: string;
  client: string;
  location: string;
  status: ProjectStatus;
  type: ProjectType;
  portfolio?: ProjectPortfolio;
  serviceIds?: string[];
  serviceLabels?: { id: string; title: string }[];
  summary: string;
  description: string;
  featured?: boolean;
  images?: string[];
  coverImage?: string;
  specs?: { label: string; value: string }[];
  lat?: number | null;
  lng?: number | null;
  mapsUrl?: string | null;
  published?: boolean;
  mapKind?: MapProjectKind | null;
  shortLabel?: string | null;
  mapRegionIds?: RegionId[] | null;
  sectorX?: number | null;
  sectorY?: number | null;
  sectorWidth?: number | null;
  sectorHeight?: number | null;
  parentProjectSlug?: string | null;
  relatedProjects?: RelatedProjectRef[];
}

/** Row shape written by scripts/build-data.mjs from data/projects.csv */
type ProjectRow = Omit<Project, "type" | "portfolio" | "serviceLabels" | "coverImage"> & {
  portfolio: ProjectPortfolio | null;
  serviceIds: string[];
  images: string[];
};

const serviceTitles = new Map(services.map((s) => [s.id, s.title]));

const boundsArea = ({ bounds: [sw, ne] }: (typeof mapRegions)[number]) =>
  (ne[0] - sw[0]) * (ne[1] - sw[1]);

/**
 * Map regions whose bounds contain the pin, smallest first, used when the CSV
 * `map_regions` cell is blank.
 */
function regionsForPoint(lat: number, lng: number): RegionId[] {
  return mapRegions
    .filter(({ mapType, bounds: [sw, ne] }) => {
      if (mapType === "image") return false;
      return lng >= sw[0] && lng <= ne[0] && lat >= sw[1] && lat <= ne[1];
    })
    .sort((a, b) => boundsArea(a) - boundsArea(b))
    .map((r) => r.id);
}

function toProject(row: ProjectRow): Project {
  const portfolio = row.portfolio ?? "construction";
  const images = (row.images.length > 0 ? row.images : [PROJECT_PLACEHOLDER_IMAGE]).map(
    (src) => asset(src),
  );
  const mapRegionIds =
    row.mapRegionIds?.length || row.lat == null || row.lng == null
      ? row.mapRegionIds
      : regionsForPoint(row.lat, row.lng);
  return {
    ...row,
    mapRegionIds,
    portfolio,
    type: deriveProjectTypeFromServices(row.serviceIds, portfolio),
    serviceLabels: row.serviceIds.map((id) => ({
      id,
      title: serviceTitles.get(id) ?? id,
    })),
    images,
    coverImage: images[0],
  };
}

/** Every row in projects.csv, including unpublished drafts. */
export const projects: Project[] = (rows as unknown as ProjectRow[]).map(toProject);

/** Listed on the site: published, has a location, and can be placed on the map. */
export function isPublicReady(p: Project): boolean {
  const hasGeo = p.lat != null && p.lng != null;
  const hasSector = p.sectorX != null && p.sectorY != null;
  return p.published !== false && Boolean(p.location.trim()) && (hasGeo || hasSector);
}

const publishedProjects = projects.filter(isPublicReady);

export function getPublishedProjects(): Project[] {
  return publishedProjects;
}

export function getProjectBySlug(slug: string): Project | undefined {
  return publishedProjects.find((p) => p.slug === slug);
}

export function getFeaturedProjects(): Project[] {
  return publishedProjects.filter((p) => p.featured);
}

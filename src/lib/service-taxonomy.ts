import type { ProjectType } from "@/data/projects";
import type { ServiceCategory } from "@/data/services";
import { isResidenceProjectType } from "@/lib/project-taxonomy";

export type ProjectPortfolio = "construction" | "residences";

/** Canonical service externalIds (matches services.ts / DB). */
export const SERVICE_IDS = [
  "building-construction",
  "road-construction",
  "canal-works",
  "interior-design",
  "landscaping",
  "commercial-works",
  "bridge-construction",
  "steel-structure",
  "sports-complex",
  "retaining-wall",
  "u-channel",
  "renovation",
  "land-development",
  "joint-venture",
  "residential-projects",
  "builder-projects",
  "design-architecture",
] as const;

export type ServiceId = (typeof SERVICE_IDS)[number];

/** Legacy ProjectType → default service tag(s) for backfill. */
export const PROJECT_TYPE_TO_SERVICE_IDS: Record<ProjectType, ServiceId[]> = {
  civil: ["building-construction"],
  roads_bridges: ["road-construction"],
  canals: ["canal-works"],
  interior: ["interior-design"],
  landscaping: ["landscaping"],
  commercial: ["commercial-works"],
  developer: ["residential-projects"],
  builder: ["builder-projects"],
  design: ["design-architecture"],
};

/** Map legacy ?type= query to a primary service filter. */
export const PROJECT_TYPE_TO_PRIMARY_SERVICE: Record<ProjectType, ServiceId> = {
  civil: "building-construction",
  roads_bridges: "road-construction",
  canals: "canal-works",
  interior: "interior-design",
  landscaping: "landscaping",
  commercial: "commercial-works",
  developer: "residential-projects",
  builder: "builder-projects",
  design: "design-architecture",
};

/** Inverse: primary service → legacy Project.type (for frozen/derived type field). */
export const PRIMARY_SERVICE_TO_PROJECT_TYPE: Partial<
  Record<ServiceId, ProjectType>
> = {
  "building-construction": "civil",
  "road-construction": "roads_bridges",
  "bridge-construction": "roads_bridges",
  "canal-works": "canals",
  "interior-design": "interior",
  landscaping: "landscaping",
  "commercial-works": "commercial",
  "steel-structure": "civil",
  "sports-complex": "civil",
  "retaining-wall": "canals",
  "u-channel": "canals",
  renovation: "commercial",
  "land-development": "developer",
  "joint-venture": "developer",
  "residential-projects": "developer",
  "builder-projects": "builder",
  "design-architecture": "design",
};

export function deriveProjectTypeFromServices(
  serviceIds: string[],
  portfolio: ProjectPortfolio,
  fallback: ProjectType = "civil",
): ProjectType {
  for (const id of serviceIds) {
    if (isServiceId(id) && PRIMARY_SERVICE_TO_PROJECT_TYPE[id]) {
      return PRIMARY_SERVICE_TO_PROJECT_TYPE[id]!;
    }
  }
  if (portfolio === "residences") return "developer";
  return fallback;
}

/** Residences section → service filter */
export const RESIDENCE_SECTION_TO_SERVICE: Record<
  "developer" | "builders" | "design",
  ServiceId
> = {
  developer: "residential-projects",
  builders: "builder-projects",
  design: "design-architecture",
};

export function portfolioFromProjectType(type: ProjectType): ProjectPortfolio {
  return isResidenceProjectType(type) ? "residences" : "construction";
}

export function isServiceId(value: string): value is ServiceId {
  return (SERVICE_IDS as readonly string[]).includes(value);
}

export function defaultHrefForService(
  id: string,
  category: ServiceCategory,
): { href: string; hrefLabel: string } {
  if (category === "construction") {
    return { href: `/projects?service=${id}`, hrefLabel: "View related projects" };
  }
  if (id === "land-development") {
    return {
      href: "/residences?section=real-estate&tab=plot",
      hrefLabel: "Browse plots",
    };
  }
  if (id === "joint-venture") {
    return { href: "/contact?type=landowner", hrefLabel: "Landowner enquiry" };
  }
  if (id === "residential-projects") {
    return {
      href: "/residences?section=developer",
      hrefLabel: "Developer projects",
    };
  }
  if (id === "builder-projects") {
    return {
      href: "/residences?section=builders",
      hrefLabel: "Builder projects",
    };
  }
  if (id === "design-architecture") {
    return {
      href: "/residences?section=design",
      hrefLabel: "Design portfolio",
    };
  }
  return { href: `/projects?service=${id}`, hrefLabel: "View related projects" };
}

import type { Building } from "@/data/buildings";
import type { Plot } from "@/data/plots";
import type { SectorPlotArea } from "@/data/sector-plots";
import type { MapProjectFeature } from "@/data/map-projects";
import type { ProjectType } from "@/data/projects";
import {
  CONSTRUCTION_TYPES,
  isConstructionType,
  isResidenceProjectType,
  PROJECT_TYPE_LABELS,
} from "@/lib/project-taxonomy";
import type { MapLegendItem } from "@/components/map/MapLibreChrome";

export type MapTopCategory = "projects" | "residences";

export type ProjectLegendKey =
  | `kind:${string}`
  | "status:ongoing"
  | `type:${ProjectType}`;

export type ResidenceLegendKey =
  | "residence:developer"
  | "residence:builders"
  | "residence:design"
  | "residence:flat"
  | "residence:house"
  | "residence:plot"
  | "residence:land";

export type MapLegendFilterKey = ProjectLegendKey | ResidenceLegendKey;

const PROJECT_KIND_LABELS: Record<string, string> = {
  canal: "Canal / water works",
  bridge: "Bridge",
  institutional: "Institutional / HQ",
  hq: "Institutional / HQ",
  sports: "Sports facility",
  infrastructure: "Infrastructure",
};

const PROJECT_KIND_COLORS: Record<string, string> = {
  canal: "#38bdf8",
  bridge: "#f59e0b",
  institutional: "#c9a962",
  hq: "#c9a962",
  sports: "#34d399",
  infrastructure: "#94a3b8",
};

const RESIDENCE_SECTION_LABELS: Record<
  Exclude<ResidenceLegendKey, `residence:${string}`> | string,
  string
> = {
  "residence:developer": "Developer",
  "residence:builders": "Builders",
  "residence:design": "Design & Architecture",
  "residence:flat": "Flat",
  "residence:house": "House",
  "residence:plot": "Plot",
  "residence:land": "Land",
};

/** No boxes checked → show everything in the active top category. */
export function isLegendFilterActive(active: Set<MapLegendFilterKey>): boolean {
  return active.size > 0;
}

export function projectFeatureFilterKey(
  feature: MapProjectFeature,
): MapLegendFilterKey[] {
  const keys: MapLegendFilterKey[] = [
    `kind:${feature.kind}`,
    `type:${feature.project.type}`,
  ];
  if (feature.status === "ongoing") keys.push("status:ongoing");
  return keys;
}

export function matchesLegendFilter(
  itemKeys: MapLegendFilterKey[],
  active: Set<MapLegendFilterKey>,
): boolean {
  if (!isLegendFilterActive(active)) return true;
  return itemKeys.some((key) => active.has(key));
}

export function filterProjectFeatures(
  features: MapProjectFeature[],
  active: Set<MapLegendFilterKey>,
  topCategory: MapTopCategory,
): MapProjectFeature[] {
  const scoped =
    topCategory === "projects"
      ? features.filter(
          (f) =>
            f.project.portfolio === "construction" ||
            (!f.project.portfolio && isConstructionType(f.project.type)),
        )
      : features.filter(
          (f) =>
            f.project.portfolio === "residences" ||
            (!f.project.portfolio && isResidenceProjectType(f.project.type)),
        );

  if (!isLegendFilterActive(active)) return scoped;

  return scoped.filter((f) =>
    matchesLegendFilter(projectFeatureFilterKey(f), active),
  );
}

/** Empty serviceIds = show all; otherwise require intersection with project.serviceIds. */
export function filterFeaturesByServices(
  features: MapProjectFeature[],
  serviceIds: Set<string>,
): MapProjectFeature[] {
  if (serviceIds.size === 0) return features;
  return features.filter((f) => {
    const ids = f.project.serviceIds ?? [];
    if (ids.length === 0) return false;
    return ids.some((id) => serviceIds.has(id));
  });
}

export function filterBuildingsForMap(
  buildings: Building[],
  active: Set<MapLegendFilterKey>,
  buildingSlugsWithFlats: Set<string>,
): Building[] {
  if (!isLegendFilterActive(active)) return buildings;

  const showFlat = active.has("residence:flat");
  const showHouse = active.has("residence:house");
  if (!showFlat && !showHouse) return [];

  return buildings.filter((b) => {
    const hasFlats = buildingSlugsWithFlats.has(b.slug);
    const isHouse =
      b.saleStatus === "available" || b.saleStatus === "upcoming";
    if (showFlat && hasFlats) return true;
    if (showHouse && isHouse) return true;
    return false;
  });
}

export function filterResidenceProjectFeatures(
  features: MapProjectFeature[],
  active: Set<MapLegendFilterKey>,
): MapProjectFeature[] {
  const residence = features.filter((f) =>
    isResidenceProjectType(f.project.type),
  );
  if (!isLegendFilterActive(active)) return residence;

  const sectionKeys: ResidenceLegendKey[] = [
    "residence:developer",
    "residence:builders",
    "residence:design",
  ];
  const activeSections = sectionKeys.filter((key) => active.has(key));
  if (activeSections.length === 0) return [];

  return residence.filter((f) =>
    activeSections.includes(residenceProjectFilterKey(f.project.type)),
  );
}

export function filterGeoPlots(
  plots: Plot[],
  active: Set<MapLegendFilterKey>,
): Plot[] {
  if (!isLegendFilterActive(active)) return plots;

  const showPlot = active.has("residence:plot");
  const showLand = active.has("residence:land");
  if (!showPlot && !showLand) return [];

  return plots.filter((plot) => {
    const isPlot = plot.type === "residential";
    const isLand = plot.type === "land" || plot.type === "commercial";
    if (showPlot && isPlot) return true;
    if (showLand && isLand) return true;
    return false;
  });
}

export function filterSectorPlots(
  plots: SectorPlotArea[],
  active: Set<MapLegendFilterKey>,
): SectorPlotArea[] {
  if (!isLegendFilterActive(active)) return plots;
  if (!active.has("residence:land")) return [];
  return plots;
}

export function residenceProjectFilterKey(
  type: ProjectType,
): ResidenceLegendKey {
  if (type === "developer") return "residence:developer";
  if (type === "builder") return "residence:builders";
  return "residence:design";
}

export function buildProjectLegendItems(
  features: MapProjectFeature[],
): MapLegendItem[] {
  const construction = features.filter((f) =>
    isConstructionType(f.project.type),
  );
  const items: MapLegendItem[] = [];
  const kinds = new Set(construction.map((f) => f.kind));
  const types = new Set(construction.map((f) => f.project.type));
  const hasOngoing = construction.some((f) => f.status === "ongoing");

  for (const kind of kinds) {
    const label = PROJECT_KIND_LABELS[kind] ?? kind;
    items.push({
      label,
      swatch: PROJECT_KIND_COLORS[kind] ?? "#94a3b8",
      filterKey: `kind:${kind}`,
    });
  }

  for (const type of CONSTRUCTION_TYPES) {
    if (!types.has(type)) continue;
    if (items.some((i) => i.filterKey === `kind:${type}`)) continue;
    items.push({
      label: PROJECT_TYPE_LABELS[type],
      filterKey: `type:${type}`,
    });
  }

  if (hasOngoing) {
    items.push({
      label: "Ongoing (amber ring)",
      swatch: "#f59e0b",
      filterKey: "status:ongoing",
    });
  }

  return items;
}

export function buildResidenceLegendItems(input: {
  hasFlats: boolean;
  hasHouses: boolean;
  hasPlots: boolean;
  hasLand: boolean;
  hasDeveloper: boolean;
  hasBuilders: boolean;
  hasDesign: boolean;
}): MapLegendItem[] {
  const items: MapLegendItem[] = [];

  if (input.hasDeveloper) {
    items.push({
      label: RESIDENCE_SECTION_LABELS["residence:developer"],
      swatch: "#c9a962",
      filterKey: "residence:developer",
    });
  }
  if (input.hasBuilders) {
    items.push({
      label: RESIDENCE_SECTION_LABELS["residence:builders"],
      swatch: "#a78bfa",
      filterKey: "residence:builders",
    });
  }
  if (input.hasDesign) {
    items.push({
      label: RESIDENCE_SECTION_LABELS["residence:design"],
      swatch: "#60a5fa",
      filterKey: "residence:design",
    });
  }
  if (input.hasFlats) {
    items.push({
      label: RESIDENCE_SECTION_LABELS["residence:flat"],
      swatch: "#c9a962",
      filterKey: "residence:flat",
      group: "Real Estate",
    });
  }
  if (input.hasHouses) {
    items.push({
      label: RESIDENCE_SECTION_LABELS["residence:house"],
      swatch: "#d4b872",
      filterKey: "residence:house",
      group: "Real Estate",
    });
  }
  if (input.hasPlots) {
    items.push({
      label: RESIDENCE_SECTION_LABELS["residence:plot"],
      swatch: "#34d399",
      filterKey: "residence:plot",
      group: "Real Estate",
    });
  }
  if (input.hasLand) {
    items.push({
      label: RESIDENCE_SECTION_LABELS["residence:land"],
      swatch: "#22c55e",
      filterKey: "residence:land",
      group: "Real Estate",
    });
  }

  return items;
}

export function parseLegendFilterKey(
  value: string,
): MapLegendFilterKey | null {
  if (value.startsWith("kind:") || value.startsWith("type:")) {
    return value as MapLegendFilterKey;
  }
  if (value === "status:ongoing") return value;
  if (
    value === "residence:developer" ||
    value === "residence:builders" ||
    value === "residence:design" ||
    value === "residence:flat" ||
    value === "residence:house" ||
    value === "residence:plot" ||
    value === "residence:land"
  ) {
    return value;
  }
  return null;
}

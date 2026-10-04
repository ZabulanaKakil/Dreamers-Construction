export type RegionId =
  | "dhaka"
  | "jolshiri"
  | "jolshiri-sector-14"
  | "mirpur-dohs"
  | "narayanganj-dohs"
  | "jolshiri-ext"
  | "chattogram"
  | "bangladesh";

export type MapViewType = "maplibre" | "image";

export interface MapRegion {
  id: RegionId;
  label: string;
  center: [number, number];
  zoom: number;
  bounds: [[number, number], [number, number]];
  description: string;
  mapType?: MapViewType;
  /** Parent region for indented sector sub-options */
  parentId?: RegionId;
  imageSrc?: string;
}

export interface RegionSelectOption {
  id: RegionId;
  label: string;
  indent?: boolean;
}

export const mapRegions: MapRegion[] = [
  {
    id: "bangladesh",
    label: "Map of Bangladesh",
    center: [90.3563, 23.685],
    zoom: 5.8,
    bounds: [
      [88.0, 20.5],
      [92.7, 26.7],
    ],
    description: "National overview of Dreamer's presence across Bangladesh.",
  },
  {
    id: "dhaka",
    label: "Map of whole Dhaka",
    center: [90.4125, 23.8103],
    zoom: 10.5,
    bounds: [
      [90.25, 23.65],
      [90.55, 23.95],
    ],
    description:
      "City-wide view including Dhaka and eastern outskirts (Jolshiri / Rupganj).",
  },
  {
    id: "jolshiri",
    label: "Map of Jolshiri",
    // Rupganj, Narayanganj — Jolshiri Abashon (≈23.803°N, 90.501°E)
    center: [90.5006, 23.803],
    zoom: 13.2,
    bounds: [
      [90.485, 23.785],
      [90.52, 23.825],
    ],
    description:
      "Jolshiri Abashon, Rupganj (Narayanganj) — army officers' residential township east of Bashundhara.",
  },
  {
    id: "jolshiri-sector-14",
    label: "Sector 14",
    parentId: "jolshiri",
    center: [90.505, 23.808],
    zoom: 14.5,
    bounds: [
      [90.498, 23.8],
      [90.512, 23.816],
    ],
    description:
      "Master plan of Jolshiri Abashon Sector 14 — click highlighted plots for project details.",
    mapType: "image",
  },
  {
    id: "jolshiri-ext",
    label: "Map of Jolshiri Extension",
    // Southern / south-eastern expansion of Jolshiri Abashon
    center: [90.512, 23.79],
    zoom: 13.8,
    bounds: [
      [90.498, 23.775],
      [90.528, 23.805],
    ],
    description:
      "Jolshiri Extension — southern expansion zone of Jolshiri Abashon in Rupganj.",
  },
  {
    id: "mirpur-dohs",
    label: "Map of Mirpur DOHS",
    center: [90.3685, 23.8225],
    zoom: 15,
    bounds: [
      [90.358, 23.815],
      [90.378, 23.83],
    ],
    description: "Street-level precision for Mirpur DOHS — our headquarters area.",
  },
  {
    id: "narayanganj-dohs",
    label: "Map of Narayanganj DOHS",
    center: [90.5125, 23.615],
    zoom: 14.5,
    bounds: [
      [90.5, 23.605],
      [90.525, 23.625],
    ],
    description: "Detailed map of Narayanganj DOHS development zone.",
  },
  {
    id: "chattogram",
    label: "Map of Chattogram",
    center: [91.7832, 22.3569],
    zoom: 12,
    bounds: [
      [91.72, 22.28],
      [91.88, 22.42],
    ],
    description:
      "Construction and infrastructure projects in Chattogram — residential listings are primarily in Dhaka and Jolshiri.",
  },
];

/** Flat list for dropdown — sectors appear indented under their parent */
export function getRegionSelectOptions(): RegionSelectOption[] {
  const topLevel = mapRegions.filter((r) => !r.parentId);
  const options: RegionSelectOption[] = [];

  for (const region of topLevel) {
    options.push({ id: region.id, label: region.label });
    const sectors = mapRegions.filter((r) => r.parentId === region.id);
    for (const sector of sectors) {
      options.push({
        id: sector.id,
        label: `\u00A0\u00A0\u00A0\u00A0${sector.label}`,
        indent: true,
      });
    }
  }

  return options;
}

export function getRegionById(id: RegionId): MapRegion {
  return mapRegions.find((r) => r.id === id) ?? mapRegions[0];
}

export function isImageMapRegion(id: RegionId): boolean {
  const region = getRegionById(id);
  return region.mapType === "image";
}

export function isValidRegionId(id: string): id is RegionId {
  return mapRegions.some((r) => r.id === id);
}

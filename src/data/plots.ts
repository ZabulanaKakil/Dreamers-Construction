import rows from "./generated/plots.json";
import type { RegionId } from "./map-regions";
import { asset } from "@/lib/asset";

export type PlotStatus = "available" | "reserved" | "sold" | "upcoming";
export type PlotType = "residential" | "commercial" | "land";

export interface Plot {
  id: string;
  regionId: RegionId;
  name: string;
  lat: number;
  lng: number;
  status: PlotStatus;
  size?: string;
  type: PlotType;
  summary: string;
  oneLiner?: string;
  images?: string[];
  projectSlug?: string;
}

export const plots: Plot[] = (rows as unknown as Plot[]).map((p) => ({
  ...p,
  images: p.images?.map((src) => asset(src)),
}));

export function getPlotsByRegion(regionId: RegionId): Plot[] {
  if (regionId === "jolshiri-sector-14") return [];
  if (regionId === "bangladesh") return plots;
  if (regionId === "dhaka") {
    return plots.filter(
      (p) =>
        p.regionId === "dhaka" ||
        p.regionId === "jolshiri" ||
        p.regionId === "mirpur-dohs" ||
        p.regionId === "narayanganj-dohs" ||
        p.regionId === "jolshiri-ext",
    );
  }
  return plots.filter((p) => p.regionId === regionId);
}

export function getPlotById(id: string): Plot | undefined {
  return plots.find((p) => p.id === id);
}

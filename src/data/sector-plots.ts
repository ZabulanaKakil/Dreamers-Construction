import rows from "./generated/sector-plots.json";
import { asset } from "@/lib/asset";

export type SectorPlotStatus =
  | "available"
  | "reserved"
  | "sold"
  | "upcoming"
  | "ongoing"
  | "completed";

export interface SectorPlotArea {
  id: string;
  sectorId: string;
  plotNumber: string;
  block?: string;
  /** Percentage-based bounding box on image (0–100) for responsive overlay */
  x: number;
  y: number;
  width: number;
  height: number;
  status: SectorPlotStatus;
  projectSlug?: string;
  summary: string;
  oneLiner?: string;
  size?: string;
}

export interface SectorTileMapConfig {
  /** Public URL base path (may contain spaces — encoded at render time) */
  basePath: string;
  rows: number;
  cols: number;
  /** Pixel widths per column (left → right) */
  colWidths: number[];
  /** Pixel heights per row (top → bottom) */
  rowHeights: number[];
}

export interface SectorMapConfig {
  id: string;
  parentRegionId: string;
  label: string;
  description: string;
  /** Fallback single-image map */
  imageSrc?: string;
  /** Small overview thumbnail for minimap navigation */
  overviewSrc?: string;
  tileMap?: SectorTileMapConfig;
}

/** Measured from Section maps cut-outs — row-column grid (11 × 5) */
export const jolshiriSector14TileMap: SectorTileMapConfig = {
  basePath: asset("/images/maps/jolshiri/sector-14/Section maps"),
  rows: 11,
  cols: 5,
  colWidths: [1121, 1129, 1129, 1128, 344],
  rowHeights: [600, 600, 576, 577, 576, 577, 576, 578, 577, 575, 607],
};

export function getSectorTileSrc(
  tileMap: SectorTileMapConfig,
  row: number,
  col: number,
): string {
  const segment = `${row}-${col}.png`;
  return `${tileMap.basePath}/${segment}`.replace(/ /g, "%20");
}

export function getSectorTileMapSize(tileMap: SectorTileMapConfig): {
  width: number;
  height: number;
} {
  return {
    width: tileMap.colWidths.reduce((sum, w) => sum + w, 0),
    height: tileMap.rowHeights.reduce((sum, h) => sum + h, 0),
  };
}

export const sectorMaps: SectorMapConfig[] = [
  {
    id: "jolshiri-sector-14",
    parentRegionId: "jolshiri",
    label: "Sector 14",
    description:
      "Master plan of Jolshiri Abashon Sector 14 — click highlighted plots for project details.",
    overviewSrc: asset("/images/maps/jolshiri/sector-14/master-plan.png"),
    tileMap: jolshiriSector14TileMap,
  },
];

/** Clickable plots on the sector master plan (data/sector-plots.json) */
export const sectorPlots: SectorPlotArea[] = rows as unknown as SectorPlotArea[];

export function getSectorMapById(sectorId: string): SectorMapConfig | undefined {
  return sectorMaps.find((s) => s.id === sectorId);
}

export function getSectorPlots(sectorId: string): SectorPlotArea[] {
  return sectorPlots.filter((p) => p.sectorId === sectorId);
}

export function getSectorPlotById(id: string): SectorPlotArea | undefined {
  return sectorPlots.find((p) => p.id === id);
}

export function isSectorRegionId(id: string): boolean {
  return sectorMaps.some((s) => s.id === id);
}

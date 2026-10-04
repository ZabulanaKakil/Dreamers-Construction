export type SectorLabelKind = "block" | "landmark" | "road" | "water" | "green";

export interface SectorMapLabel {
  id: string;
  sectorId: string;
  label: string;
  /** Short hint shown on hover */
  hint?: string;
  kind: SectorLabelKind;
  /** Percent position on composite map (0–100) */
  x: number;
  y: number;
}

export const sectorMapLabels: SectorMapLabel[] = [
  {
    id: "s14-block-a",
    sectorId: "jolshiri-sector-14",
    label: "Block A",
    hint: "Residential block — flats available",
    kind: "block",
    x: 44,
    y: 40,
  },
  {
    id: "s14-block-b",
    sectorId: "jolshiri-sector-14",
    label: "Block B",
    hint: "Upcoming plot releases",
    kind: "block",
    x: 58,
    y: 46,
  },
  {
    id: "s14-main-road",
    sectorId: "jolshiri-sector-14",
    label: "Main Avenue",
    hint: "Primary access road",
    kind: "road",
    x: 50,
    y: 62,
  },
  {
    id: "s14-central-park",
    sectorId: "jolshiri-sector-14",
    label: "Central Green",
    hint: "Community park and open space",
    kind: "green",
    x: 36,
    y: 55,
  },
  {
    id: "s14-lake",
    sectorId: "jolshiri-sector-14",
    label: "Water Body",
    hint: "Retention pond",
    kind: "water",
    x: 28,
    y: 68,
  },
];

export function getSectorMapLabels(sectorId: string): SectorMapLabel[] {
  return sectorMapLabels.filter((entry) => entry.sectorId === sectorId);
}

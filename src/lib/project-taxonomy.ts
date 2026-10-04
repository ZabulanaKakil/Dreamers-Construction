import type { ProjectType } from "@/data/projects";

/** Construction portfolio — shown on /projects */
export const CONSTRUCTION_TYPES: readonly ProjectType[] = [
  "civil",
  "roads_bridges",
  "canals",
  "interior",
  "landscaping",
  "commercial",
] as const;

/** Residences non-inventory — Developer / Builders / Design sections */
export const RESIDENCE_PROJECT_TYPES: readonly ProjectType[] = [
  "developer",
  "builder",
  "design",
] as const;

export const ALL_PROJECT_TYPES: readonly ProjectType[] = [
  ...CONSTRUCTION_TYPES,
  ...RESIDENCE_PROJECT_TYPES,
] as const;

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  civil: "Civil Construction",
  roads_bridges: "Roads & Bridges",
  canals: "Canals",
  interior: "Interior",
  landscaping: "Landscaping",
  commercial: "Commercial",
  developer: "Developer",
  builder: "Builders",
  design: "Design & Architecture",
};

export type ProjectTypeGroup = "construction" | "residences";

export function projectTypeGroup(type: ProjectType): ProjectTypeGroup {
  return (CONSTRUCTION_TYPES as readonly string[]).includes(type)
    ? "construction"
    : "residences";
}

export function isConstructionType(type: string): type is ProjectType {
  return (CONSTRUCTION_TYPES as readonly string[]).includes(type);
}

export function isResidenceProjectType(type: string): type is ProjectType {
  return (RESIDENCE_PROJECT_TYPES as readonly string[]).includes(type);
}

export function projectTypeLabel(type: string): string {
  if (type in PROJECT_TYPE_LABELS) {
    return PROJECT_TYPE_LABELS[type as ProjectType];
  }
  return type;
}

/** Admin select: grouped Construction vs Residences */
export const PROJECT_TYPE_GROUPS: {
  label: string;
  types: ProjectType[];
}[] = [
  { label: "Construction", types: [...CONSTRUCTION_TYPES] },
  { label: "Residences", types: [...RESIDENCE_PROJECT_TYPES] },
];

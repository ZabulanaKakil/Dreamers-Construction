import type { Project, ProjectRelationRole, RelatedProjectRef } from "@/data/projects";
import { getPublishedProjects } from "@/data/projects";
import { buildings, type Building } from "@/data/buildings";

export const RELATION_ROLE_LABELS: Record<ProjectRelationRole, string> = {
  interior_of: "Interior",
  exterior_of: "Exterior",
  landscaping_of: "Landscaping",
  design_for: "Design",
  commercial_of: "Commercial",
  other: "Related",
};

export function getParentProject(
  project: Project,
  catalog: Project[] = getPublishedProjects(),
): Project | undefined {
  if (!project.parentProjectSlug) return undefined;
  return catalog.find((p) => p.slug === project.parentProjectSlug);
}

/**
 * Related works for a parent: explicit relatedProjects first, then children by parentSlug.
 */
export function getRelatedWorks(
  project: Project,
  catalog: Project[] = getPublishedProjects(),
): { role: ProjectRelationRole; project: Project }[] {
  const seen = new Set<string>();
  const out: { role: ProjectRelationRole; project: Project }[] = [];

  const push = (role: ProjectRelationRole, slug: string) => {
    if (slug === project.slug || seen.has(slug)) return;
    const target = catalog.find((p) => p.slug === slug);
    if (!target) return;
    seen.add(slug);
    out.push({ role, project: target });
  };

  for (const ref of project.relatedProjects ?? []) {
    push(ref.role, ref.slug);
  }

  for (const child of catalog) {
    if (child.parentProjectSlug !== project.slug) continue;
    push(inferRoleFromChild(child, project.relatedProjects), child.slug);
  }

  return out;
}

function inferRoleFromChild(
  child: Project,
  parentRefs?: RelatedProjectRef[],
): ProjectRelationRole {
  const fromParent = parentRefs?.find((r) => r.slug === child.slug);
  if (fromParent) return fromParent.role;
  if (child.type === "interior") return "interior_of";
  if (child.type === "landscaping") return "landscaping_of";
  if (child.type === "design") return "design_for";
  if (child.type === "commercial") return "commercial_of";
  return "other";
}

export function getBuildingsForProject(
  projectSlug: string,
  catalog: Building[] = buildings,
): Building[] {
  return catalog.filter((b) => b.projectSlug === projectSlug);
}

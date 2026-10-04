export const PROJECT_PLACEHOLDER_IMAGE = "/images/projects/placeholder.svg";

/** Theme-aware status badge classes (see globals.css) */
export const projectStatusBadgeClass: Record<string, string> = {
  completed: "project-status-badge project-status-completed",
  ongoing: "project-status-badge project-status-ongoing",
  upcoming: "project-status-badge project-status-upcoming",
};

/** Project type label — stronger contrast than plain text-muted on light surfaces */
export const projectTypeLabelClass = "project-type-label";

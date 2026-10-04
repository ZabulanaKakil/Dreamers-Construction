import { Suspense } from "react";
import ProjectsPageClient from "./ProjectsPageClient";

export const metadata = {
  title: "Projects",
  description:
    "Civil construction, roads, canals, sports facilities, interiors, and residential developments across Bangladesh.",
};

export default function ProjectsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-muted">Loading projects...</div>
      }
    >
      <ProjectsPageClient />
    </Suspense>
  );
}

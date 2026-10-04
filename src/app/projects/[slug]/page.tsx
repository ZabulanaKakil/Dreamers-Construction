import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug, getPublishedProjects } from "@/data/projects";
import { ProjectGallery } from "@/components/projects/ProjectGallery";
import { ProjectLinksPanel } from "@/components/projects/ProjectLinksPanel";
import { Reveal } from "@/components/ui/Reveal";
import { PageBackLink } from "@/components/ui/PageBackLink";
import { projectStatusBadgeClass, projectTypeLabelClass } from "@/lib/project-images";
import { formatProjectStatus } from "@/lib/inventory-status";
import { mapUrlForProject } from "@/lib/map-url";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPublishedProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return { title: "Project Not Found" };
  return {
    title: project.name,
    description: project.summary,
    openGraph: project.coverImage ? { images: [project.coverImage] } : undefined,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) notFound();

  const services = project.serviceLabels ?? [];

  return (
    <div className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <PageBackLink href="/projects" label="Projects" />
          <div className="mt-6 flex flex-wrap items-center gap-2 sm:gap-3">
            <span
              className={
                projectStatusBadgeClass[project.status] ?? projectStatusBadgeClass.upcoming
              }
            >
              {formatProjectStatus(project.status)}
            </span>
            {services.map((s) => (
              <Link
                key={s.id}
                href={`/projects?service=${s.id}`}
                className={`${projectTypeLabelClass} hover:text-accent`}
              >
                {s.title}
              </Link>
            ))}
          </div>
          <h1 className="mt-4 font-[family-name:var(--font-syne)] text-3xl font-bold sm:text-4xl lg:text-[2.5rem]">
            {project.name}
          </h1>
          {project.client && <p className="mt-2 text-lg text-muted">{project.client}</p>}
          <p className="mt-1 text-sm text-steel">{project.location}</p>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-8">
            <ProjectGallery images={project.images ?? []} alt={project.name} />
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mt-10 max-w-3xl">
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted sm:text-base">
              {project.description || project.summary}
            </p>
            {project.specs && project.specs.length > 0 && (
              <dl className="mt-8 grid gap-4 sm:grid-cols-2">
                {project.specs.map((spec) => (
                  <div key={spec.label} className="border border-border p-4">
                    <dt className="text-xs uppercase tracking-wider text-muted">{spec.label}</dt>
                    <dd className="mt-1 font-medium">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/contact?type=project" className="btn-primary text-center">
                Discuss a Similar Project
              </Link>
              <Link href={mapUrlForProject(project)} className="btn-outline text-center">
                View on map
              </Link>
              {project.mapsUrl && (
                <a
                  href={project.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline text-center"
                >
                  Google Maps
                </a>
              )}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.16}>
          <ProjectLinksPanel project={project} />
        </Reveal>
      </div>
    </div>
  );
}

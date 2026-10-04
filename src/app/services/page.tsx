import { Reveal } from "@/components/ui/Reveal";
import {
  ServicesPageClient,
  type ServiceWithLinks,
} from "@/components/services/ServicesPageClient";
import { getPublishedProjects } from "@/data/projects";
import { services } from "@/data/services";

export const metadata = {
  title: "Services",
  description:
    "Dreamer's Construction services — civil works, roads & bridges, canals, interiors, landscaping, developer, builder, and design packages.",
};

const LANDOWNER_SERVICES = new Set(["joint-venture", "land-development"]);

function withLinks(): ServiceWithLinks[] {
  const projects = getPublishedProjects();
  return services.map((service) => {
    const relatedProjects = projects
      .filter((p) => p.serviceIds?.includes(service.id))
      .map((p) => ({ slug: p.slug, name: p.name }));

    const link =
      relatedProjects.length > 0
        ? {
            href: `/projects?service=${service.id}`,
            label: `View ${relatedProjects.length} project${relatedProjects.length !== 1 ? "s" : ""}`,
          }
        : LANDOWNER_SERVICES.has(service.id)
          ? { href: "/contact?type=landowner", label: "Landowner enquiry" }
          : { href: "/contact?type=project", label: "Enquire" };

    return { ...service, relatedProjects, link };
  });
}

export default function ServicesPage() {
  return (
    <div className="page-band">
      <div className="page-shell">
        <Reveal>
          <p className="section-label">Services</p>
          <h1 className="mt-2 font-[family-name:var(--font-syne)] text-3xl font-bold sm:text-4xl lg:text-[2.5rem]">
            What We Deliver
          </h1>
          <p className="mt-4 max-w-2xl text-muted">
            Civil construction, roads & bridges, canals, interiors, landscaping, and
            commercial works — plus developer, builder, and design services. Explore each
            package, typical deliverables, and example projects.
          </p>
        </Reveal>

        <ServicesPageClient services={withLinks()} />
      </div>
    </div>
  );
}

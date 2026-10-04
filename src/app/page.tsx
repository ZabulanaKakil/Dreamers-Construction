import { HeroSection } from "@/components/home/HeroSection";
import { ProjectCarousel } from "@/components/home/ProjectCarousel";
import { ServicesSnapshot, CtaSection } from "@/components/home/HomeSections";
import { ProofStrip, type ProofStat } from "@/components/home/ProofStrip";
import { company } from "@/data/company";
import { partners } from "@/data/partners";
import { getFeaturedProjects, getPublishedProjects } from "@/data/projects";
import { services } from "@/data/services";

function isPhoto(src?: string) {
  return Boolean(src && !src.endsWith(".svg"));
}

export default function HomePage() {
  const published = getPublishedProjects();
  const featured = getFeaturedProjects();
  const heroProject =
    featured.find((p) => isPhoto(p.coverImage)) ?? published.find((p) => isPhoto(p.coverImage));

  const stats: ProofStat[] = [
    {
      label: "Projects completed",
      value: published.filter((p) => p.status === "completed").length,
    },
    {
      label: "Projects ongoing",
      value: published.filter((p) => p.status === "ongoing").length,
    },
    { label: "Institutional clients", value: partners.length, suffix: "+" },
    {
      label: "Years of delivery",
      value: new Date().getFullYear() - company.established,
      suffix: "+",
    },
  ];

  return (
    <div className="home-page">
      <HeroSection image={heroProject?.coverImage} imageAlt={heroProject?.name} />
      {featured.length > 0 && <ProjectCarousel projects={featured} />}
      <ServicesSnapshot services={services} />
      <ProofStrip stats={stats} partners={partners} />
      <CtaSection />
    </div>
  );
}

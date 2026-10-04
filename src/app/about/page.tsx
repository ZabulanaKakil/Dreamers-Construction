import Link from "next/link";
import { company } from "@/data/company";
import { partners } from "@/data/partners";
import { getServiceById } from "@/data/services";
import { asset } from "@/lib/asset";
import { Reveal, RevealStagger } from "@/components/ui/Reveal";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  AboutIcon,
  iconForCommitment,
  iconForTeamRole,
} from "@/components/about/AboutIcon";

export const metadata = {
  title: "About Us",
  description:
    "Learn about Dreamer's Construction — our story, leadership, mission, and values since 2019.",
};

/** Service photos reused on About — resolved from data so .webp conversions apply. */
const storyImages = [
  { serviceId: "building-construction", alt: "Building construction work by Dreamer's Construction" },
  { serviceId: "road-construction", alt: "Road and highway construction" },
  { serviceId: "residential-projects", alt: "Residential development" },
].map(({ serviceId, alt }) => ({ src: getServiceById(serviceId)?.image ?? "", alt }));

const pillars = [
  {
    label: "Mission",
    icon: "mission" as const,
    text: company.mission,
  },
  {
    label: "Vision",
    icon: "vision" as const,
    text: company.vision,
  },
  {
    label: "Values",
    icon: "values" as const,
    text: company.values.join(" · "),
  },
];

export default function AboutPage() {
  const leaderName = company.leadership.name.split("(")[0].trim();

  return (
    <div className="page-band">
      <div className="page-shell">
        <PageHeader
          label="About"
          title={company.name}
          intro={company.welcome}
        >
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset("/images/brand/logo.jpg")}
              alt=""
              width={48}
              height={48}
              className="h-12 w-12 rounded-[var(--radius-md)] border border-border object-cover"
            />
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 border border-border bg-surface px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-muted">
                <AboutIcon name="calendar" size="sm" />
                Est. {company.established}
              </span>
              <span className="inline-flex items-center gap-2 border border-border bg-surface px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-muted">
                <AboutIcon name="pin" size="sm" />
                Mirpur DOHS, Dhaka
              </span>
              <span className="inline-flex items-center gap-2 border border-accent/40 bg-accent/5 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-accent">
                {company.tagline}
              </span>
            </div>
          </div>
        </PageHeader>

        {/* Story */}
        <section className="mt-14 border-t border-border pt-12 sm:mt-16 sm:pt-14">
          <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
            <Reveal>
              <p className="section-label">Our Story</p>
              <h2 className="mt-2 font-[family-name:var(--font-syne)] text-2xl font-bold sm:text-3xl">
                Built on discipline, delivered with care
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
                {company.story}
              </p>
              <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
                {company.description}
              </p>
              <p className="mt-6 border-l-2 border-accent/50 pl-4 text-sm italic leading-relaxed text-muted sm:text-base">
                {company.motto}
              </p>
            </Reveal>

            <Reveal delay={0.1} variant="scaleIn">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="col-span-2 overflow-hidden rounded-[var(--radius-lg)] border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={storyImages[0].src}
                    alt={storyImages[0].alt}
                    className="aspect-[16/10] w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={storyImages[1].src}
                  alt={storyImages[1].alt}
                  className="aspect-[4/3] w-full rounded-[var(--radius-md)] border border-border object-cover"
                  loading="lazy"
                  decoding="async"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={storyImages[2].src}
                  alt={storyImages[2].alt}
                  className="aspect-[4/3] w-full rounded-[var(--radius-md)] border border-border object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* Mission / Vision / Values */}
        <section className="mt-14 border-t border-border pt-12 sm:mt-16 sm:pt-14">
          <Reveal>
            <p className="section-label">Principles</p>
            <h2 className="mt-2 font-[family-name:var(--font-syne)] text-2xl font-bold sm:text-3xl">
              Mission, vision & values
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
            {pillars.map((item, i) => (
              <Reveal key={item.label} delay={0.06 + i * 0.06} variant="fadeUp">
                <div className="h-full border-t border-border pt-6">
                  <AboutIcon name={item.icon} />
                  <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-accent">
                    {item.label}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                    {item.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Leadership */}
        <section className="mt-14 border-t border-border pt-12 sm:mt-16 sm:pt-14">
          <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
            <Reveal variant="scaleIn">
              <figure className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={asset("/images/team/owner-picture.jpg")}
                  alt={company.leadership.name}
                  width={541}
                  height={591}
                  decoding="async"
                  className="block h-auto w-full object-contain object-center"
                />
                <figcaption className="border-t border-border p-5">
                  <p className="font-[family-name:var(--font-syne)] text-lg font-semibold sm:text-xl">
                    {leaderName}
                  </p>
                  <p className="mt-1 text-sm text-accent sm:text-base">
                    {company.leadership.title}
                  </p>
                </figcaption>
                <div className="h-1 bg-accent" />
              </figure>
            </Reveal>

            <Reveal delay={0.08}>
              <p className="section-label">Leadership</p>
              <h2 className="mt-2 font-[family-name:var(--font-syne)] text-2xl font-bold sm:text-3xl">
                {company.leadership.name}
              </h2>
              <p className="mt-2 text-base text-accent sm:text-lg">
                {company.leadership.title}
              </p>
              <p className="mt-6 text-base leading-relaxed text-muted sm:text-lg">
                {company.leadership.bio}
              </p>
              <ul className="mt-8 space-y-3">
                {company.leadership.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-start gap-3 text-sm text-muted sm:text-base"
                  >
                    <AboutIcon name="check" size="sm" className="mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* Clients */}
        <section className="mt-14 border-t border-border pt-12 sm:mt-16 sm:pt-14">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="section-label">Clients</p>
                <h2 className="mt-2 font-[family-name:var(--font-syne)] text-2xl font-bold sm:text-3xl">
                  Institutional partners
                </h2>
                <p className="mt-3 max-w-2xl text-base text-muted sm:text-lg">
                  Public-sector and institutional clients from our portfolio
                  across Bangladesh.
                </p>
              </div>
              <AboutIcon name="client" />
            </div>
          </Reveal>
          <RevealStagger className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {partners.map((client) => (
              <div
                key={client}
                className="flex items-center gap-3 border border-border bg-surface px-4 py-3"
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full bg-accent"
                  aria-hidden
                />
                <span className="text-sm font-medium text-foreground">
                  {client}
                </span>
              </div>
            ))}
          </RevealStagger>
        </section>

        {/* Team */}
        <section className="mt-14 border-t border-border pt-12 sm:mt-16 sm:pt-14">
          <Reveal>
            <p className="section-label">Our Team</p>
            <h2 className="mt-2 font-[family-name:var(--font-syne)] text-2xl font-bold sm:text-3xl">
              People behind the build
            </h2>
            <p className="mt-4 max-w-2xl text-base text-muted sm:text-lg">
              A cohesive blend of project managers, engineers, architects, and
              skilled tradespeople — each bringing years of hands-on civil
              engineering experience.
            </p>
          </Reveal>
          <RevealStagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {company.teamRoles.map((role) => (
              <div
                key={role}
                className="flex items-center gap-3 border border-border px-4 py-3.5"
              >
                <AboutIcon name={iconForTeamRole(role)} />
                <p className="text-sm font-medium sm:text-base">{role}</p>
              </div>
            ))}
          </RevealStagger>
        </section>

        {/* Commitments */}
        <section className="mt-14 border-t border-border pt-12 sm:mt-16 sm:pt-14">
          <Reveal>
            <p className="section-label">Commitments</p>
            <h2 className="mt-2 font-[family-name:var(--font-syne)] text-2xl font-bold sm:text-3xl">
              How we work with you
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {company.commitments.map((c, i) => (
              <Reveal key={c} delay={0.05 + i * 0.04}>
                <div className="flex h-full gap-4 border-l-2 border-accent/40 pl-4">
                  <AboutIcon name={iconForCommitment(i)} />
                  <p className="pt-2 text-sm leading-relaxed text-muted sm:text-base">
                    {c}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CTA */}
        <Reveal delay={0.1}>
          <section className="mt-14 border-t border-border pt-12 text-center sm:mt-16 sm:pt-14">
            <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold sm:text-3xl">
              Ready to work with us?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted sm:text-lg">
              Reach out for project enquiries, residential work, or landowner
              partnerships — we typically respond within 1–2 business days.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/contact" className="btn-primary">
                Get in Touch
              </Link>
              <Link href="/contact?type=landowner" className="btn-outline">
                Landowner Enquiry
              </Link>
              <Link href="/projects" className="btn-outline">
                View Projects
              </Link>
            </div>
          </section>
        </Reveal>
      </div>
    </div>
  );
}

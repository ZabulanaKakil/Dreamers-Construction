"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { company } from "@/data/company";
import { services as staticServices, type Service } from "@/data/services";
import { Reveal, RevealStagger } from "@/components/ui/Reveal";
import { asset } from "@/lib/asset";

export function ServicesSnapshot({
  services = staticServices,
}: {
  services?: Service[];
}) {
  const developerServices = services.filter(
    (s) =>
      s.category === "developer" ||
      s.category === "builder" ||
      s.category === "design",
  );
  const constructionServices = services
    .filter((s) => s.category === "construction")
    .slice(0, 4);

  return (
    <section className="section-band">
      <div className="page-shell">
        <Reveal>
          <p className="section-label">What We Do</p>
          <h2 className="mt-2 font-[family-name:var(--font-syne)] text-2xl font-bold sm:text-3xl">
            Construction & Development
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-12 lg:grid-cols-2">
          <div>
            <Reveal delay={0.05} variant="fadeLeft">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-accent">
                Development & Design
              </h3>
            </Reveal>
            <RevealStagger className="mt-6 space-y-4">
              {developerServices.map((s) => (
                <div
                  key={s.id}
                  className="border-l-2 border-accent/40 pl-4 transition-transform hover:translate-x-1"
                >
                  <p className="text-base font-medium sm:text-lg">{s.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted sm:text-base">
                    {s.description}
                  </p>
                </div>
              ))}
            </RevealStagger>
          </div>

          <div>
            <Reveal delay={0.08} variant="fadeRight">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-steel">
                Construction
              </h3>
            </Reveal>
            <RevealStagger className="mt-6 space-y-4">
              {constructionServices.map((s) => (
                <div
                  key={s.id}
                  className="border-l-2 border-border pl-4 transition-transform hover:translate-x-1"
                >
                  <p className="text-base font-medium sm:text-lg">{s.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted sm:text-base">
                    {s.description}
                  </p>
                </div>
              ))}
            </RevealStagger>
          </div>
        </div>

        <Reveal delay={0.2}>
          <Link href="/services" className="btn-outline mt-12 inline-block">
            All Services
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export function MdSpotlight() {
  const { leadership } = company;

  return (
    <section className="border-t border-border bg-surface section-band">
      <div className="page-shell">
        <div className="grid items-center gap-10 lg:grid-cols-[2fr_1fr] lg:gap-12">
          <Reveal>
            <p className="section-label">Leadership</p>
            <h2 className="mt-2 font-[family-name:var(--font-syne)] text-2xl font-bold sm:text-3xl">
              {leadership.name}
            </h2>
            <p className="mt-2 text-base text-accent sm:text-lg">
              {leadership.title}
            </p>
            <p className="mt-6 text-base leading-relaxed text-muted sm:text-lg">
              {leadership.bio.slice(0, 400)}...
            </p>
            <ul className="mt-6 space-y-2.5">
              {leadership.highlights.map((h) => (
                <li
                  key={h}
                  className="flex items-center gap-2 text-sm text-muted sm:text-base"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {h}
                </li>
              ))}
            </ul>
            <Link href="/about" className="btn-outline mt-8 inline-block">
              About Us
            </Link>
          </Reveal>

          <Reveal delay={0.15} variant="scaleIn">
            <figure className="ui-panel-elevated mx-auto w-full max-w-md overflow-hidden lg:max-w-none">
              {/* Native img — exact file aspect (541×591), no crop */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset("/images/team/owner-picture.jpg")}
                alt={leadership.name}
                width={541}
                height={591}
                decoding="async"
                className="block h-auto w-full object-contain object-center"
              />
              <figcaption className="border-t border-border p-4 sm:p-5">
                <p className="font-[family-name:var(--font-syne)] text-lg font-semibold sm:text-xl">
                  {leadership.name.split("(")[0].trim()}
                </p>
                <p className="mt-1 text-sm text-muted sm:text-base">
                  {leadership.title}
                </p>
              </figcaption>
              <div className="h-1 bg-accent" />
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function CtaSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="border-t border-border section-band">
      <div className="page-shell text-center">
        <Reveal>
          <h2 className="font-[family-name:var(--font-syne)] text-2xl font-bold sm:text-3xl">
            Ready to build your dream?
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted sm:text-lg">
            Whether you&apos;re an institutional client, landowner, or private owner —
            we&apos;re here to deliver with integrity and precision.
          </p>
        </Reveal>
        <Reveal delay={0.14}>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <div className="flex flex-col items-center gap-2">
              <motion.div
                initial={reduceMotion ? false : { scale: 0.94, opacity: 0.85 }}
                whileInView={reduceMotion ? undefined : { scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.45,
                  delay: 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Link href="/contact?type=project" className="btn-primary">
                  Project Enquiry
                </Link>
              </motion.div>
              <p className="max-w-[16rem] text-xs text-muted sm:text-sm">
                Tenders, civil works, and fit-outs — we reply within 1–2 business days.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Link href="/contact?type=landowner" className="btn-outline">
                Landowner Partnership
              </Link>
              <p className="max-w-[16rem] text-xs text-muted sm:text-sm">
                Develop your land with a trusted builder and transparent terms.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

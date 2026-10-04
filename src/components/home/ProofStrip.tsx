"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useInView, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";

export type ProofStat = { label: string; value: number; suffix?: string };

function useCountUp(target: number, active: boolean, durationMs = 900) {
  const reduceMotion = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (reduceMotion || target <= 0) {
      setValue(target);
      return;
    }

    let frame = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, target, durationMs, reduceMotion]);

  return value;
}

function StatValue({ stat, active }: { stat: ProofStat; active: boolean }) {
  const displayed = useCountUp(stat.value, active);
  return (
    <p className="font-[family-name:var(--font-syne)] text-3xl font-bold text-accent tabular-nums">
      {displayed}
      {stat.suffix}
    </p>
  );
}

export function ProofStrip({
  stats,
  partners,
}: {
  stats: ProofStat[];
  partners: string[];
}) {
  const statsRef = useRef<HTMLDivElement | null>(null);
  const inView = useInView(statsRef, { once: true, margin: "-80px" });

  return (
    <section className="border-t border-border bg-surface section-band">
      <div className="page-shell">
        <Reveal>
          <p className="section-label">Track Record</p>
          <h2 className="mt-2 font-[family-name:var(--font-syne)] text-2xl font-bold sm:text-3xl">
            Outcomes that build trust
          </h2>
          <p className="mt-4 max-w-xl text-base text-muted sm:text-lg">
            Delivered work and the institutional clients we have built for across
            Bangladesh.
          </p>
        </Reveal>

        <div ref={statsRef} className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={0.05 + i * 0.04}>
              <div className="ui-panel h-full p-5 text-center sm:p-6 sm:text-left">
                <StatValue stat={stat} active={inView} />
                <p className="mt-2 text-sm text-muted">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {partners.length > 0 && (
          <Reveal delay={0.28} variant="fadeUp">
            <div className="mt-12">
              <p className="text-xs font-semibold uppercase tracking-wider text-steel">
                Selected institutional clients
              </p>
              <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted">
                {partners.map((client) => (
                  <li
                    key={client}
                    className="after:ml-4 after:text-border after:content-['·'] last:after:content-none"
                  >
                    {client}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-muted">
                Want a reference for a similar site?{" "}
                <Link href="/contact" className="text-accent hover:underline">
                  Ask our team
                </Link>{" "}
                or read{" "}
                <Link href="/about" className="text-accent hover:underline">
                  About
                </Link>
                .
              </p>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

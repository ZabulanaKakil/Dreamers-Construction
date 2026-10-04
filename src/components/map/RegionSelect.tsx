"use client";

import { useEffect, useId, useState } from "react";
import type { RegionId } from "@/data/map-regions";
import { getRegionSelectOptions } from "@/data/map-regions";

interface RegionSelectProps {
  value: RegionId;
  onChange: (id: RegionId) => void;
  className?: string;
  /** Optional project counts per region for the subdivision switcher */
  projectCounts?: Partial<Record<RegionId, number>>;
}

export function RegionSelect({
  value,
  onChange,
  className,
  projectCounts,
}: RegionSelectProps) {
  const selectId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const counts = mounted ? projectCounts : undefined;
  const options = getRegionSelectOptions();
  const activeCount = counts?.[value];
  const activeLabel =
    options.find((region) => region.id === value)?.label ?? value;

  return (
    <div className={className}>
      <label htmlFor={selectId} className="section-label mb-2 block">
        Select Region
      </label>
      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={(e) => onChange(e.target.value as RegionId)}
          className="ui-input w-full appearance-none truncate pr-10"
          title={
            typeof activeCount === "number"
              ? `${activeLabel} (${activeCount} items)`
              : undefined
          }
        >
          {options.map((region) => {
            const count = counts?.[region.id];
            const countLabel =
              typeof count === "number"
                ? ` (${count} item${count === 1 ? "" : "s"})`
                : "";
            return (
              <option key={region.id} value={region.id}>
                {region.label}
                {countLabel}
              </option>
            );
          })}
        </select>
        <span
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-accent"
          aria-hidden
        >
          ▾
        </span>
      </div>
    </div>
  );
}

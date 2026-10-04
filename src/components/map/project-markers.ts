import type { MapProjectFeature, MapProjectKind } from "@/data/map-projects";
import { getCssVar } from "@/lib/map-styles";

/**
 * Kind colors — status overlays (ongoing ring) are applied separately.
 * Keep these in sync with `mapProjectLegendItems` / MapLibreChrome legend.
 */
const KIND_COLORS: Record<MapProjectKind, string> = {
  canal: "#38bdf8",
  bridge: "#f59e0b",
  institutional: "", // resolved from --accent
  sports: "#34d399",
  infrastructure: "", // resolved from --steel
  hq: "", // resolved from --accent
};

export function resolveProjectMarkerColor(kind: MapProjectKind): string {
  if (kind === "institutional" || kind === "hq") {
    return getCssVar("--accent") || "#c9a962";
  }
  if (kind === "infrastructure") {
    return getCssVar("--steel") || "#71717a";
  }
  return KIND_COLORS[kind] || getCssVar("--accent") || "#c9a962";
}

/**
 * Fixed-size marker DOM. Labels are absolutely positioned so they never
 * change the box MapLibre anchors — this prevents lat/lng drift on zoom.
 * Never put CSS `transform` on the root element (MapLibre owns that).
 */
export function createProjectMarkerElement(
  feature: MapProjectFeature,
  selected: boolean,
): HTMLDivElement {
  const el = document.createElement("div");
  const ongoing = feature.status === "ongoing";
  el.className = [
    "project-map-marker",
    `project-map-marker--${feature.kind}`,
    `project-map-marker--${feature.status}`,
    selected ? "is-selected" : "",
    ongoing ? "is-ongoing" : "",
  ]
    .filter(Boolean)
    .join(" ");

  el.setAttribute("role", "button");
  el.setAttribute(
    "aria-label",
    `${feature.project.name} — ${feature.status}`,
  );
  el.title = `${feature.shortLabel ?? feature.project.name} (${feature.status})`;

  const color = resolveProjectMarkerColor(feature.kind);
  el.style.setProperty("--marker-color", color);

  const pulse = document.createElement("span");
  pulse.className = "project-map-marker__pulse";
  pulse.setAttribute("aria-hidden", "true");

  const pin = document.createElement("span");
  pin.className = "project-map-marker__pin";
  pin.setAttribute("aria-hidden", "true");

  const label = document.createElement("span");
  label.className = "project-map-marker__label";
  label.textContent = feature.shortLabel ?? feature.project.name;

  el.appendChild(pulse);
  el.appendChild(pin);
  el.appendChild(label);

  return el;
}

export function createBuildingMarkerElement(
  name: string,
  selected: boolean,
): HTMLDivElement {
  const el = document.createElement("div");
  el.className = `building-marker${selected ? " is-selected" : ""}`;
  el.title = name;
  el.setAttribute("role", "button");
  el.setAttribute("aria-label", name);

  const pin = document.createElement("span");
  pin.className = "building-marker__pin";
  pin.setAttribute("aria-hidden", "true");

  const label = document.createElement("span");
  label.className = "building-marker__label";
  label.textContent = name;

  el.appendChild(pin);
  el.appendChild(label);
  return el;
}

export function createPlotMarkerElement(
  name: string,
  selected: boolean,
): HTMLDivElement {
  const el = document.createElement("div");
  el.className = `plot-marker${selected ? " is-selected" : ""}`;
  el.title = name;
  el.setAttribute("role", "button");
  el.setAttribute("aria-label", name);

  const dot = document.createElement("span");
  dot.className = "plot-marker__dot";
  dot.setAttribute("aria-hidden", "true");

  el.appendChild(dot);
  return el;
}

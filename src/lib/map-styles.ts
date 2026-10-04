/** OpenFreeMap — richer OSM labels/detail than Carto Positron/Dark Matter */
export const MAP_STYLE_LIGHT =
  "https://tiles.openfreemap.org/styles/liberty";
export const MAP_STYLE_DARK =
  "https://tiles.openfreemap.org/styles/dark";

export function getMapStyleUrl(colorMode: "light" | "dark"): string {
  return colorMode === "dark" ? MAP_STYLE_DARK : MAP_STYLE_LIGHT;
}

export function getCssVar(name: string): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

import type { Map as MapLibreMap, GeoJSONSource, MapLayerMouseEvent } from "maplibre-gl";
import type { MapProjectFeature, MapProjectKind } from "@/data/map-projects";
import { getCssVar } from "@/lib/map-styles";

export const PROJECT_SOURCE_ID = "dc-project-pins";
export const PROJECT_HALO_LAYER = "dc-project-pins-halo";
export const PROJECT_CIRCLE_LAYER = "dc-project-pins-circle";
export const PROJECT_LABEL_LAYER = "dc-project-pins-label";

/** Stable hex colors used by layers + legend (theme accent/steel resolved at paint time) */
export const PROJECT_KIND_COLORS: Record<MapProjectKind, string> = {
  canal: "#38bdf8",
  bridge: "#f59e0b",
  institutional: "#c9a962",
  sports: "#34d399",
  infrastructure: "#94a3b8",
  hq: "#c9a962",
};

export function resolveKindColor(kind: MapProjectKind): string {
  if (kind === "institutional" || kind === "hq") {
    return getCssVar("--accent") || PROJECT_KIND_COLORS.institutional;
  }
  if (kind === "infrastructure") {
    return getCssVar("--steel") || PROJECT_KIND_COLORS.infrastructure;
  }
  return PROJECT_KIND_COLORS[kind];
}

export function projectsToGeoJSON(
  features: MapProjectFeature[],
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: features.map((feature) => ({
      type: "Feature",
      id: feature.projectSlug,
      geometry: {
        type: "Point",
        // MapLibre GeoJSON is always [longitude, latitude]
        coordinates: [feature.lng, feature.lat],
      },
      properties: {
        projectSlug: feature.projectSlug,
        kind: feature.kind,
        status: feature.status,
        label: feature.shortLabel ?? feature.project.name,
        color: resolveKindColor(feature.kind),
        ongoing: feature.status === "ongoing" ? 1 : 0,
      },
    })),
  };
}

function colorMatchExpression(): unknown {
  return [
    "match",
    ["get", "kind"],
    "canal",
    PROJECT_KIND_COLORS.canal,
    "bridge",
    PROJECT_KIND_COLORS.bridge,
    "sports",
    PROJECT_KIND_COLORS.sports,
    "infrastructure",
    resolveKindColor("infrastructure"),
    "hq",
    resolveKindColor("hq"),
    resolveKindColor("institutional"),
  ];
}

/**
 * GPU-projected pin layers — stay locked to lng/lat on every zoom/pan.
 * HTML Marker DOM was drifting; do not use Markers for project pins.
 */
export function upsertProjectLayers(
  map: MapLibreMap,
  features: MapProjectFeature[],
  selectedSlug?: string | null,
): void {
  const data = projectsToGeoJSON(features);
  const existing = map.getSource(PROJECT_SOURCE_ID) as GeoJSONSource | undefined;

  if (existing) {
    existing.setData(data);
  } else {
    map.addSource(PROJECT_SOURCE_ID, {
      type: "geojson",
      data,
      promoteId: "projectSlug",
    });
  }

  const kindColor = colorMatchExpression() as never;

  if (!map.getLayer(PROJECT_HALO_LAYER)) {
    map.addLayer({
      id: PROJECT_HALO_LAYER,
      type: "circle",
      source: PROJECT_SOURCE_ID,
      paint: {
        "circle-radius": [
          "case",
          ["boolean", ["feature-state", "selected"], false],
          14,
          ["==", ["get", "ongoing"], 1],
          12,
          9,
        ],
        "circle-color": kindColor,
        "circle-opacity": [
          "case",
          ["==", ["get", "ongoing"], 1],
          0.28,
          0.18,
        ],
        "circle-stroke-width": [
          "case",
          ["==", ["get", "ongoing"], 1],
          2,
          0,
        ],
        "circle-stroke-color": "#f59e0b",
        "circle-stroke-opacity": 0.9,
      },
    });
  }

  if (!map.getLayer(PROJECT_CIRCLE_LAYER)) {
    map.addLayer({
      id: PROJECT_CIRCLE_LAYER,
      type: "circle",
      source: PROJECT_SOURCE_ID,
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          5,
          ["case", ["boolean", ["feature-state", "selected"], false], 7, 5],
          12,
          ["case", ["boolean", ["feature-state", "selected"], false], 11, 8],
          16,
          ["case", ["boolean", ["feature-state", "selected"], false], 14, 10],
        ],
        "circle-color": kindColor,
        "circle-stroke-width": [
          "case",
          ["boolean", ["feature-state", "selected"], false],
          3,
          2,
        ],
        "circle-stroke-color": [
          "case",
          ["boolean", ["feature-state", "selected"], false],
          "#ffffff",
          ["==", ["get", "ongoing"], 1],
          "#f59e0b",
          "#1c1917",
        ],
        "circle-opacity": 0.95,
      },
    });
  }

  // Prefer fonts available in OpenFreeMap / OpenMapTiles styles
  const labelFonts = pickLabelFonts(map);

  if (!map.getLayer(PROJECT_LABEL_LAYER)) {
    map.addLayer({
      id: PROJECT_LABEL_LAYER,
      type: "symbol",
      source: PROJECT_SOURCE_ID,
      minzoom: 6.5,
      layout: {
        "text-field": ["get", "label"],
        "text-size": [
          "interpolate",
          ["linear"],
          ["zoom"],
          7,
          10,
          12,
          12,
        ],
        "text-offset": [0, 1.2],
        "text-anchor": "top",
        "text-allow-overlap": false,
        "text-optional": true,
        "text-font": labelFonts,
      },
      paint: {
        "text-color": getCssVar("--foreground") || "#f5f5f4",
        "text-halo-color": getCssVar("--background") || "#0a0a0b",
        "text-halo-width": 1.4,
      },
    });
  } else {
    map.setPaintProperty(
      PROJECT_LABEL_LAYER,
      "text-color",
      getCssVar("--foreground") || "#f5f5f4",
    );
    map.setPaintProperty(
      PROJECT_LABEL_LAYER,
      "text-halo-color",
      getCssVar("--background") || "#0a0a0b",
    );
  }

  setSelectedProjectFeatureState(map, features, selectedSlug ?? null);
}

export function setSelectedProjectFeatureState(
  map: MapLibreMap,
  features: MapProjectFeature[],
  selectedSlug: string | null,
): void {
  if (!map.getSource(PROJECT_SOURCE_ID)) return;

  features.forEach((feature) => {
    try {
      map.setFeatureState(
        { source: PROJECT_SOURCE_ID, id: feature.projectSlug },
        { selected: feature.projectSlug === selectedSlug },
      );
    } catch {
      // source may be mid-reload after setStyle
    }
  });
}

export function removeProjectLayers(map: MapLibreMap): void {
  for (const id of [
    PROJECT_LABEL_LAYER,
    PROJECT_CIRCLE_LAYER,
    PROJECT_HALO_LAYER,
  ]) {
    if (map.getLayer(id)) map.removeLayer(id);
  }
  if (map.getSource(PROJECT_SOURCE_ID)) map.removeSource(PROJECT_SOURCE_ID);
}

type ProjectClickHandler = (feature: MapProjectFeature | null) => void;

/**
 * Bind click/hover once per map instance. Returns cleanup.
 */
export function bindProjectLayerInteractions(
  map: MapLibreMap,
  getFeatures: () => MapProjectFeature[],
  onProjectSelect?: ProjectClickHandler,
): () => void {
  const layerIds = [PROJECT_CIRCLE_LAYER, PROJECT_HALO_LAYER, PROJECT_LABEL_LAYER];

  const onEnter = () => {
    map.getCanvas().style.cursor = "pointer";
  };
  const onLeave = () => {
    map.getCanvas().style.cursor = "";
  };

  const onClick = (event: MapLayerMouseEvent) => {
    const hit = event.features?.[0];
    const slug = hit?.properties?.projectSlug as string | undefined;
    if (!slug) return;
    const match = getFeatures().find((f) => f.projectSlug === slug) ?? null;
    onProjectSelect?.(match);
  };

  const onMapClick = (event: maplibregl.MapMouseEvent) => {
    const hits = map.queryRenderedFeatures(event.point, {
      layers: layerIds.filter((id) => map.getLayer(id)),
    });
    if (hits.length === 0) {
      // let callers decide; only clear when clicking empty map
      // (handled by parent if needed)
    }
  };

  layerIds.forEach((id) => {
    map.on("mouseenter", id, onEnter);
    map.on("mouseleave", id, onLeave);
    map.on("click", id, onClick);
  });
  map.on("click", onMapClick);

  return () => {
    layerIds.forEach((id) => {
      map.off("mouseenter", id, onEnter);
      map.off("mouseleave", id, onLeave);
      map.off("click", id, onClick);
    });
    map.off("click", onMapClick);
  };
}

function pickLabelFonts(map: MapLibreMap): string[] {
  try {
    const layers = map.getStyle()?.layers ?? [];
    for (const layer of layers) {
      if (layer.type !== "symbol") continue;
      const fonts = (layer.layout as { "text-font"?: string[] } | undefined)?.[
        "text-font"
      ];
      if (Array.isArray(fonts) && fonts.length > 0) return fonts;
    }
  } catch {
    // fall through
  }
  return ["Noto Sans Regular"];
}

export function legendItemsForProjects(features: MapProjectFeature[]) {
  const present = new Set(features.map((f) => f.kind));
  const hasOngoing = features.some((f) => f.status === "ongoing");

  const items: { label: string; className: string; swatch: string }[] = [];

  if (present.has("canal")) {
    items.push({
      label: "Canal / water works",
      className: "",
      swatch: PROJECT_KIND_COLORS.canal,
    });
  }
  if (present.has("bridge")) {
    items.push({
      label: "Bridge",
      className: "",
      swatch: PROJECT_KIND_COLORS.bridge,
    });
  }
  if (present.has("institutional") || present.has("hq")) {
    items.push({
      label: "Institutional / HQ",
      className: "bg-accent",
      swatch: resolveKindColor("institutional"),
    });
  }
  if (present.has("sports")) {
    items.push({
      label: "Sports facility",
      className: "",
      swatch: PROJECT_KIND_COLORS.sports,
    });
  }
  if (present.has("infrastructure")) {
    items.push({
      label: "Infrastructure",
      className: "bg-steel",
      swatch: resolveKindColor("infrastructure"),
    });
  }
  if (hasOngoing) {
    items.push({
      label: "Ongoing (amber ring)",
      className: "",
      swatch: "#f59e0b",
    });
  }

  return items;
}

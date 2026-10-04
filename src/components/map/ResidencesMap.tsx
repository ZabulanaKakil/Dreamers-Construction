"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import maplibregl from "maplibre-gl";
import type { RegionId } from "@/data/map-regions";
import { getRegionById } from "@/data/map-regions";
import type { Building } from "@/data/buildings";
import type { Plot } from "@/data/plots";
import type { MapProjectFeature } from "@/data/map-projects";
import { useTheme } from "@/components/theme/ThemeProvider";
import { getMapStyleUrl } from "@/lib/map-styles";
import { MapLibreChrome } from "@/components/map/MapLibreChrome";
import {
  bindProjectLayerInteractions,
  removeProjectLayers,
  setSelectedProjectFeatureState,
  upsertProjectLayers,
} from "@/components/map/project-map-layers";
import {
  buildResidenceLegendItems,
  filterBuildingsForMap,
  filterGeoPlots,
  filterResidenceProjectFeatures,
  type MapLegendFilterKey,
} from "@/lib/map-legend-filters";
import { isResidenceProjectType } from "@/lib/project-taxonomy";

interface ResidencesMapProps {
  regionId: RegionId;
  buildings: Building[];
  plots: Plot[];
  buildingSlugsWithFlats: Set<string>;
  onBuildingSelect: (building: Building | null) => void;
  onPlotSelect: (plot: Plot | null) => void;
  selectedBuildingSlug?: string | null;
  selectedPlotId?: string | null;
  className?: string;
  compact?: boolean;
  onProjectSelect?: (feature: MapProjectFeature | null) => void;
  selectedProjectSlug?: string | null;
  projectFeatures?: MapProjectFeature[];
  activeLegendFilters?: Set<MapLegendFilterKey>;
  onLegendFilterToggle?: (filterKey: string) => void;
}

export function ResidencesMap({
  regionId,
  buildings,
  plots,
  buildingSlugsWithFlats,
  onBuildingSelect,
  onPlotSelect,
  selectedBuildingSlug,
  selectedPlotId,
  className = "",
  compact = false,
  onProjectSelect,
  selectedProjectSlug,
  projectFeatures: projectFeaturesProp = [],
  activeLegendFilters,
  onLegendFilterToggle,
}: ResidencesMapProps) {
  const { resolvedColorMode } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const buildingMarkersRef = useRef<maplibregl.Marker[]>([]);
  const plotMarkersRef = useRef<maplibregl.Marker[]>([]);
  const featuresRef = useRef<MapProjectFeature[]>([]);
  const unbindRef = useRef<(() => void) | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);

  const mapStyle = getMapStyleUrl(resolvedColorMode);
  const region = getRegionById(regionId);
  const filters = activeLegendFilters ?? new Set<MapLegendFilterKey>();

  const residenceProjectsSource = useMemo(
    () =>
      projectFeaturesProp.filter((f) =>
        isResidenceProjectType(f.project.type),
      ),
    [projectFeaturesProp],
  );

  const visibleBuildings = useMemo(
    () => filterBuildingsForMap(buildings, filters, buildingSlugsWithFlats),
    [buildings, filters, buildingSlugsWithFlats],
  );

  const visiblePlots = useMemo(
    () => filterGeoPlots(plots, filters),
    [plots, filters],
  );

  const projectFeatures = useMemo(
    () => filterResidenceProjectFeatures(residenceProjectsSource, filters),
    [residenceProjectsSource, filters],
  );

  featuresRef.current = projectFeatures;

  const clearBuildingMarkers = useCallback(() => {
    buildingMarkersRef.current.forEach((m) => m.remove());
    buildingMarkersRef.current = [];
  }, []);

  const clearPlotMarkers = useCallback(() => {
    plotMarkersRef.current.forEach((m) => m.remove());
    plotMarkersRef.current = [];
  }, []);

  const syncProjectLayers = useCallback(
    (map: maplibregl.Map) => {
      if (projectFeatures.length === 0) {
        removeProjectLayers(map);
        return;
      }
      upsertProjectLayers(map, projectFeatures, selectedProjectSlug);
    },
    [projectFeatures, selectedProjectSlug],
  );

  const addBuildingMarkers = useCallback(
    (map: maplibregl.Map) => {
      clearBuildingMarkers();
      visibleBuildings.forEach((b) => {
        if (
          b.lat == null ||
          b.lng == null ||
          Number.isNaN(b.lat) ||
          Number.isNaN(b.lng) ||
          (b.lat === 0 && b.lng === 0)
        ) {
          return;
        }
        const selected = selectedBuildingSlug === b.slug;
        const el = document.createElement("div");
        el.style.cssText = `width:${selected ? 16 : 12}px;height:${selected ? 16 : 12}px;border-radius:3px;background:var(--accent);border:2px solid var(--foreground);box-shadow:0 0 10px var(--glow);cursor:pointer;`;
        el.title = b.name;
        const marker = new maplibregl.Marker({ element: el, anchor: "center" })
          .setLngLat([b.lng, b.lat])
          .addTo(map);
        el.addEventListener("click", (event) => {
          event.stopPropagation();
          onPlotSelect(null);
          onProjectSelect?.(null);
          onBuildingSelect(b);
        });
        buildingMarkersRef.current.push(marker);
      });
    },
    [
      visibleBuildings,
      clearBuildingMarkers,
      onBuildingSelect,
      onPlotSelect,
      onProjectSelect,
      selectedBuildingSlug,
    ],
  );

  const addPlotMarkers = useCallback(
    (map: maplibregl.Map) => {
      clearPlotMarkers();
      visiblePlots.forEach((plot) => {
        const selected = selectedPlotId === plot.id;
        const el = document.createElement("div");
        el.style.cssText = `width:${selected ? 16 : 12}px;height:${selected ? 16 : 12}px;border-radius:50%;background:#34d399;border:2px solid var(--foreground);box-shadow:0 0 10px var(--glow);cursor:pointer;`;
        el.title = plot.name;
        const marker = new maplibregl.Marker({ element: el, anchor: "center" })
          .setLngLat([plot.lng, plot.lat])
          .addTo(map);
        el.addEventListener("click", (event) => {
          event.stopPropagation();
          onBuildingSelect(null);
          onProjectSelect?.(null);
          onPlotSelect(plot);
        });
        plotMarkersRef.current.push(marker);
      });
    },
    [
      visiblePlots,
      clearPlotMarkers,
      onBuildingSelect,
      onPlotSelect,
      onProjectSelect,
      selectedPlotId,
    ],
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyle,
      center: region.center,
      zoom: region.zoom,
      minZoom: 4,
      maxZoom: 18,
    });
    map.on("load", () => {
      syncProjectLayers(map);
      addBuildingMarkers(map);
      addPlotMarkers(map);
      unbindRef.current = bindProjectLayerInteractions(
        map,
        () => featuresRef.current,
        (feature) => {
          onBuildingSelect(null);
          onPlotSelect(null);
          onProjectSelect?.(feature);
        },
      );
      setMapReady(true);
    });
    mapRef.current = map;
    setMapInstance(map);
    return () => {
      unbindRef.current?.();
      clearBuildingMarkers();
      clearPlotMarkers();
      removeProjectLayers(map);
      map.remove();
      mapRef.current = null;
      setMapInstance(null);
      setMapReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    map.setStyle(mapStyle);
    const onStyle = () => {
      syncProjectLayers(map);
      addBuildingMarkers(map);
      addPlotMarkers(map);
      unbindRef.current?.();
      unbindRef.current = bindProjectLayerInteractions(
        map,
        () => featuresRef.current,
        (feature) => {
          onBuildingSelect(null);
          onPlotSelect(null);
          onProjectSelect?.(feature);
        },
      );
    };
    map.once("style.load", onStyle);
    return () => {
      map.off("style.load", onStyle);
    };
  }, [
    mapStyle,
    mapReady,
    syncProjectLayers,
    addBuildingMarkers,
    addPlotMarkers,
    onBuildingSelect,
    onPlotSelect,
    onProjectSelect,
  ]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    map.fitBounds(region.bounds, {
      padding: compact ? 20 : 48,
      duration: 1200,
      maxZoom: region.zoom + 1,
    });
  }, [regionId, mapReady, region, compact]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    syncProjectLayers(map);
    addBuildingMarkers(map);
    addPlotMarkers(map);
  }, [
    mapReady,
    syncProjectLayers,
    addBuildingMarkers,
    addPlotMarkers,
    resolvedColorMode,
    regionId,
  ]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    setSelectedProjectFeatureState(
      map,
      projectFeatures,
      selectedProjectSlug ?? null,
    );
  }, [selectedProjectSlug, projectFeatures, mapReady]);

  const legendItems = useMemo(
    () =>
      buildResidenceLegendItems({
        hasFlats: buildings.some((b) => buildingSlugsWithFlats.has(b.slug)),
        hasHouses: buildings.some(
          (b) =>
            b.saleStatus === "available" || b.saleStatus === "upcoming",
        ),
        hasPlots: plots.some((p) => p.type === "residential"),
        hasLand: plots.some(
          (p) => p.type === "land" || p.type === "commercial",
        ),
        hasDeveloper: residenceProjectsSource.some(
          (f) => f.project.type === "developer",
        ),
        hasBuilders: residenceProjectsSource.some(
          (f) => f.project.type === "builder",
        ),
        hasDesign: residenceProjectsSource.some(
          (f) => f.project.type === "design",
        ),
      }),
    [buildings, buildingSlugsWithFlats, plots, residenceProjectsSource],
  );

  return (
    <MapLibreChrome
      map={mapInstance}
      mapReady={mapReady}
      region={region}
      compact={compact}
      toolbarLabel={`${region.label.replace(/^Map of\s+/i, "")} · residences`}
      legendItems={legendItems}
      activeLegendFilters={activeLegendFilters}
      onLegendFilterToggle={onLegendFilterToggle}
      className={className}
    >
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />
    </MapLibreChrome>
  );
}

"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import maplibregl from "maplibre-gl";
import type { RegionId } from "@/data/map-regions";
import { getRegionById } from "@/data/map-regions";
import type { Plot } from "@/data/plots";
import { getPlotsByRegion } from "@/data/plots";
import {
  getMapProjectsForRegion,
  type MapProjectFeature,
} from "@/data/map-projects";
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
  buildProjectLegendItems,
  filterProjectFeatures,
  type MapLegendFilterKey,
} from "@/lib/map-legend-filters";

interface PlotMapProps {
  regionId: RegionId;
  onPlotSelect: (plot: Plot | null) => void;
  selectedPlotId?: string | null;
  plots?: Plot[];
  className?: string;
  compact?: boolean;
  teaser?: boolean;
  onProjectSelect?: (feature: MapProjectFeature | null) => void;
  selectedProjectSlug?: string | null;
  showProjects?: boolean;
  /** Live project features from API (preferred over static fallback). */
  projectFeatures?: MapProjectFeature[];
  activeLegendFilters?: Set<MapLegendFilterKey>;
  onLegendFilterToggle?: (filterKey: string) => void;
}

export function PlotMap({
  regionId,
  onPlotSelect,
  selectedPlotId,
  plots: plotsProp,
  className = "",
  compact = false,
  teaser = false,
  onProjectSelect,
  selectedProjectSlug,
  showProjects = true,
  projectFeatures: projectFeaturesProp,
  activeLegendFilters,
  onLegendFilterToggle,
}: PlotMapProps) {
  const { resolvedColorMode } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const plotMarkersRef = useRef<maplibregl.Marker[]>([]);
  const featuresRef = useRef<MapProjectFeature[]>([]);
  const unbindRef = useRef<(() => void) | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapInstance, setMapInstance] = useState<maplibregl.Map | null>(null);

  const mapStyle = getMapStyleUrl(resolvedColorMode);
  const region = getRegionById(regionId);
  const regionPlots = plotsProp ?? getPlotsByRegion(regionId);
  const legendSource = useMemo(() => {
    if (!showProjects) return [];
    return projectFeaturesProp ?? getMapProjectsForRegion(regionId);
  }, [showProjects, projectFeaturesProp, regionId]);

  const projectFeatures = useMemo(
    () =>
      filterProjectFeatures(
        legendSource,
        activeLegendFilters ?? new Set(),
        "projects",
      ),
    [legendSource, activeLegendFilters],
  );
  featuresRef.current = projectFeatures;

  const clearPlotMarkers = useCallback(() => {
    plotMarkersRef.current.forEach((m) => m.remove());
    plotMarkersRef.current = [];
  }, []);

  const syncProjectLayers = useCallback(
    (map: maplibregl.Map) => {
      if (!showProjects || projectFeatures.length === 0) {
        removeProjectLayers(map);
        return;
      }
      upsertProjectLayers(map, projectFeatures, selectedProjectSlug);
    },
    [projectFeatures, selectedProjectSlug, showProjects],
  );

  const addPlotMarkers = useCallback(
    (map: maplibregl.Map, plots: Plot[]) => {
      clearPlotMarkers();
      plots.forEach((plot) => {
        const el = document.createElement("div");
        el.style.cssText =
          "width:12px;height:12px;border-radius:50%;background:var(--accent);border:2px solid var(--foreground);box-shadow:0 0 10px var(--glow);cursor:pointer;";
        if (selectedPlotId === plot.id) {
          el.style.width = "16px";
          el.style.height = "16px";
        }
        const marker = new maplibregl.Marker({ element: el, anchor: "center" })
          .setLngLat([plot.lng, plot.lat])
          .addTo(map);
        el.addEventListener("click", (event) => {
          event.stopPropagation();
          onProjectSelect?.(null);
          onPlotSelect(plot);
        });
        plotMarkersRef.current.push(marker);
      });
    },
    [clearPlotMarkers, onPlotSelect, onProjectSelect, selectedPlotId],
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: mapStyle,
      center: region.center,
      zoom: region.zoom,
      attributionControl: compact ? false : undefined,
      minZoom: 4,
      maxZoom: 18,
    });

    map.on("load", () => {
      syncProjectLayers(map);
      addPlotMarkers(map, regionPlots);
      unbindRef.current?.();
      unbindRef.current = bindProjectLayerInteractions(
        map,
        () => featuresRef.current,
        (feature) => {
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
      unbindRef.current = null;
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

    // setStyle wipes custom layers — rebuild after style loads
    map.setStyle(mapStyle);
    const onStyle = () => {
      syncProjectLayers(map);
      addPlotMarkers(map, regionPlots);
      unbindRef.current?.();
      unbindRef.current = bindProjectLayerInteractions(
        map,
        () => featuresRef.current,
        (feature) => {
          onPlotSelect(null);
          onProjectSelect?.(feature);
        },
      );
    };
    map.once("style.load", onStyle);
    return () => {
      map.off("style.load", onStyle);
    };
  }, [mapStyle, mapReady, syncProjectLayers, addPlotMarkers, regionPlots, onPlotSelect, onProjectSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    map.fitBounds(region.bounds, {
      padding: compact ? 20 : 48,
      duration: 1200,
      maxZoom: region.zoom + 1,
    });
  }, [regionId, mapReady, compact, region]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;
    syncProjectLayers(map);
    addPlotMarkers(map, regionPlots);
  }, [
    regionId,
    mapReady,
    syncProjectLayers,
    addPlotMarkers,
    regionPlots,
    resolvedColorMode,
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
      buildProjectLegendItems(
        filterProjectFeatures(legendSource, new Set(), "projects"),
      ),
    [legendSource],
  );

  return (
    <MapLibreChrome
      map={mapInstance}
      mapReady={mapReady}
      region={region}
      compact={compact}
      teaser={teaser}
      toolbarLabel={`${region.label.replace(/^Map of\s+/i, "")} · projects`}
      legendItems={legendItems}
      activeLegendFilters={activeLegendFilters}
      onLegendFilterToggle={onLegendFilterToggle}
      className={className}
    >
      <div ref={containerRef} className="absolute inset-0 h-full w-full" />
    </MapLibreChrome>
  );
}

export { RegionSelect } from "./RegionSelect";

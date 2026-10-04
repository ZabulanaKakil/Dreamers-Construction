"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type maplibregl from "maplibre-gl";
import type { MapRegion } from "@/data/map-regions";

export interface MapLegendItem {
  label: string;
  className?: string;
  /** Exact hex/rgb for marker color matching */
  swatch?: string;
  /** When set, legend row is a filter checkbox */
  filterKey?: string;
  /** Optional group heading (e.g. Real Estate sub-categories) */
  group?: string;
}

interface MapLibreChromeProps {
  map: maplibregl.Map | null;
  mapReady: boolean;
  region: MapRegion;
  legendItems: MapLegendItem[];
  activeLegendFilters?: Set<string>;
  onLegendFilterToggle?: (filterKey: string) => void;
  toolbarLabel?: string;
  hint?: string;
  compact?: boolean;
  /** Home map teaser: compact chrome, taller viewport */
  teaser?: boolean;
  children: ReactNode;
  className?: string;
  /** Extra height classes for the map surface */
  surfaceClassName?: string;
}

const MIN_ZOOM = 4;
const MAX_ZOOM = 18;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function boundsToViewportPercent(
  regionBounds: [[number, number], [number, number]],
  view: { west: number; south: number; east: number; north: number },
): { left: number; top: number; width: number; height: number } {
  const [[west, south], [east, north]] = regionBounds;
  const spanLng = Math.max(1e-9, east - west);
  const spanLat = Math.max(1e-9, north - south);

  const left = ((view.west - west) / spanLng) * 100;
  const right = ((view.east - west) / spanLng) * 100;
  const top = ((north - view.north) / spanLat) * 100;
  const bottom = ((north - view.south) / spanLat) * 100;

  return {
    left,
    top,
    width: right - left,
    height: bottom - top,
  };
}

function scrollRatioToLng(
  ratio: number,
  west: number,
  east: number,
): number {
  return west + ratio * (east - west);
}

function scrollRatioToLat(
  ratio: number,
  south: number,
  north: number,
): number {
  // UI track left→right / top ratio: 0 = north end visually at top of minimap logic;
  // for vertical scrollbar: 0 = north, 1 = south (matches map "scroll down")
  return north - ratio * (north - south);
}

function lngToScrollRatio(lng: number, west: number, east: number): number {
  return clamp((lng - west) / Math.max(1e-9, east - west), 0, 1);
}

function latToScrollRatio(lat: number, south: number, north: number): number {
  return clamp((north - lat) / Math.max(1e-9, north - south), 0, 1);
}

export function MapLibreChrome({
  map,
  mapReady,
  region,
  legendItems,
  activeLegendFilters,
  onLegendFilterToggle,
  toolbarLabel = "Presence map",
  hint = "Drag to pan · Scroll to zoom · Click markers for details",
  compact = false,
  teaser = false,
  children,
  className = "",
  surfaceClassName = "",
}: MapLibreChromeProps) {
  const slimChrome = compact || teaser;
  const [[west, south], [east, north]] = region.bounds;
  const [zoom, setZoom] = useState(region.zoom);
  const [centerLng, setCenterLng] = useState(region.center[0]);
  const [centerLat, setCenterLat] = useState(region.center[1]);
  const [viewport, setViewport] = useState({
    left: 20,
    top: 20,
    width: 40,
    height: 40,
  });

  const syncFromMap = useCallback(() => {
    if (!map) return;
    const c = map.getCenter();
    const b = map.getBounds();
    setZoom(map.getZoom());
    setCenterLng(c.lng);
    setCenterLat(c.lat);
    setViewport(
      boundsToViewportPercent(region.bounds, {
        west: b.getWest(),
        south: b.getSouth(),
        east: b.getEast(),
        north: b.getNorth(),
      }),
    );
  }, [map, region.bounds]);

  useEffect(() => {
    if (!map || !mapReady) return;
    syncFromMap();
    map.on("move", syncFromMap);
    map.on("zoom", syncFromMap);
    return () => {
      map.off("move", syncFromMap);
      map.off("zoom", syncFromMap);
    };
  }, [map, mapReady, syncFromMap]);

  useEffect(() => {
    if (!map || !mapReady) return;
    syncFromMap();
  }, [region.id, map, mapReady, syncFromMap]);

  const fitRegion = useCallback(() => {
    if (!map) return;
    map.fitBounds(region.bounds, {
      padding: slimChrome ? 24 : 56,
      duration: 900,
      maxZoom: region.zoom + 1,
    });
  }, [map, region, slimChrome]);

  const setZoomLevel = useCallback(
    (next: number) => {
      if (!map) return;
      map.easeTo({ zoom: clamp(next, MIN_ZOOM, MAX_ZOOM), duration: 120 });
    },
    [map],
  );

  const panToRatio = useCallback(
    (ratioX: number, ratioY: number) => {
      if (!map) return;
      map.easeTo({
        center: [
          scrollRatioToLng(ratioX, west, east),
          scrollRatioToLat(ratioY, south, north),
        ],
        duration: 200,
      });
    },
    [map, west, east, south, north],
  );

  const scrollXRatio = lngToScrollRatio(centerLng, west, east);
  const scrollYRatio = latToScrollRatio(centerLat, south, north);
  const zoomPercent = Math.round((zoom / Math.max(region.zoom, 1)) * 100);
  const canPanX = east - west > 0.002;
  const canPanY = north - south > 0.002;

  const mapSurfaceHeight = teaser
    ? "h-[min(52vh,560px)] min-h-[420px] sm:min-h-[520px] sm:h-[min(65vh,700px)]"
    : compact
      ? "h-[280px]"
      : "h-[min(62vh,520px)] min-h-[380px] sm:min-h-[560px] sm:h-[min(78vh,900px)]";

  return (
    <div
      className={`relative flex w-full flex-col overflow-hidden border-border bg-surface ${mapSurfaceHeight} ${surfaceClassName} ${className}`}
    >
      {!slimChrome && (
        <div
          data-map-control
          className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border bg-surface-elevated/90 px-2 py-1.5 sm:px-3 sm:py-2"
        >
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="truncate text-[10px] uppercase tracking-wider text-muted">
              {toolbarLabel}
            </span>
            <span className="text-[10px] tabular-nums text-muted">
              {zoomPercent}%
            </span>
          </div>
          <button
            type="button"
            onClick={fitRegion}
            className="shrink-0 border border-border px-2 py-1 text-[10px] uppercase tracking-wider text-muted transition-colors hover:border-accent hover:text-accent"
          >
            Recenter
          </button>
        </div>
      )}

      <div className="relative min-h-0 flex-1">
        {children}

        {!slimChrome && (
          <div className="absolute left-2 top-2 z-20 flex max-w-[120px] flex-col gap-1.5 sm:left-3 sm:top-3 sm:max-w-[148px] sm:gap-2">
            <OverviewMiniMap
              regionLabel={region.label}
              viewport={viewport}
              onNavigate={panToRatio}
              compactMobile
            />
            <MapLegend
              items={legendItems}
              activeFilters={activeLegendFilters}
              onToggleFilter={onLegendFilterToggle}
            />
          </div>
        )}

        {!slimChrome && (
          <div
            data-map-control
            className="absolute bottom-2 right-2 z-20 flex flex-col gap-1 sm:bottom-3 sm:right-3"
          >
            <ChromeButton label="Zoom in" onClick={() => setZoomLevel(zoom + 0.5)}>
              +
            </ChromeButton>
            <ChromeButton label="Zoom out" onClick={() => setZoomLevel(zoom - 0.5)}>
              −
            </ChromeButton>
            <ChromeButton label="Fit region" onClick={fitRegion}>
              ⟲
            </ChromeButton>
          </div>
        )}

        {!slimChrome && (
          <p className="pointer-events-none absolute bottom-3 left-[140px] z-10 hidden max-w-[36%] text-[10px] leading-relaxed text-muted lg:block">
            {hint}
          </p>
        )}
      </div>

      {!slimChrome && (
        <div
          data-map-control
          className="flex shrink-0 flex-col gap-1 border-t border-border bg-surface-elevated/95 px-2 py-1.5 backdrop-blur-sm sm:gap-1.5 sm:py-2"
        >
          <div className="flex items-center gap-2">
            <span className="w-8 shrink-0 text-[10px] uppercase tracking-wider text-muted sm:w-10">
              Zoom
            </span>
            <input
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.05}
              value={zoom}
              onChange={(event) => setZoomLevel(Number(event.target.value))}
              className="sector-map-zoom-slider h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-border"
              aria-label="Zoom level"
            />
            <span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-foreground sm:w-12">
              {zoomPercent}%
            </span>
            <button
              type="button"
              onClick={fitRegion}
              className="shrink-0 border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted transition-colors hover:border-accent hover:text-accent"
            >
              Fit
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-8 shrink-0 text-[10px] uppercase tracking-wider text-muted sm:w-10">
              ↔
            </span>
            <MapScrollTrack
              enabled={canPanX}
              ratio={scrollXRatio}
              ariaLabel="Horizontal map position"
              onChange={(ratio) => panToRatio(ratio, scrollYRatio)}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="w-8 shrink-0 text-[10px] uppercase tracking-wider text-muted sm:w-10">
              ↕
            </span>
            <MapScrollTrack
              enabled={canPanY}
              ratio={scrollYRatio}
              ariaLabel="Vertical map position"
              onChange={(ratio) => panToRatio(scrollXRatio, ratio)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function OverviewMiniMap({
  regionLabel,
  viewport,
  onNavigate,
  compactMobile = false,
}: {
  regionLabel: string;
  viewport: { left: number; top: number; width: number; height: number };
  onNavigate: (ratioX: number, ratioY: number) => void;
  compactMobile?: boolean;
}) {
  return (
    <div
      data-map-control
      className="overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface-elevated/95 shadow-sm backdrop-blur-sm"
    >
      <p className="border-b border-border px-1.5 py-0.5 text-[8px] uppercase tracking-wider text-muted sm:px-2 sm:py-1 sm:text-[9px]">
        Overview
      </p>
      <button
        type="button"
        className="relative block w-full"
        aria-label="Jump to map location"
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const ratioX = (event.clientX - rect.left) / rect.width;
          const ratioY = (event.clientY - rect.top) / rect.height;
          onNavigate(ratioX, ratioY);
        }}
      >
        <div
          className={`relative w-full bg-[linear-gradient(145deg,color-mix(in_srgb,var(--accent)_12%,var(--background)),var(--surface))] ${
            compactMobile ? "h-[64px] sm:h-[92px]" : "h-[92px]"
          }`}
        >
          <div
            className="pointer-events-none absolute inset-[10%] border border-dashed border-border/70"
            aria-hidden
          />
          <span className="pointer-events-none absolute inset-x-1 bottom-1 truncate text-center text-[8px] uppercase tracking-wider text-muted">
            {regionLabel.replace(/^Map of\s+/i, "")}
          </span>
          <div
            className="pointer-events-none absolute border-2 border-accent bg-accent/15"
            style={{
              left: `${clamp(viewport.left, 0, 92)}%`,
              top: `${clamp(viewport.top, 0, 92)}%`,
              width: `${clamp(viewport.width, 8, 100)}%`,
              height: `${clamp(viewport.height, 8, 100)}%`,
            }}
          />
        </div>
      </button>
    </div>
  );
}

function MapLegend({
  items,
  activeFilters,
  onToggleFilter,
}: {
  items: MapLegendItem[];
  activeFilters?: Set<string>;
  onToggleFilter?: (filterKey: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const filterable = items.some((item) => item.filterKey);

  if (items.length === 0) return null;

  let lastGroup: string | undefined;

  return (
    <div
      data-map-control
      className="rounded-[var(--radius-md)] border border-border bg-surface-elevated/95 shadow-sm backdrop-blur-sm"
    >
      <button
        type="button"
        className="flex w-full items-center justify-between px-2 py-1 text-[9px] uppercase tracking-wider text-muted"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        {filterable ? "Filter" : "Legend"}
        <span>{open ? "−" : "+"}</span>
      </button>
      <ul
        className={`max-h-[min(40vh,220px)] space-y-1 overflow-y-auto border-t border-border px-2.5 py-2 ${
          open ? "block" : "hidden"
        }`}
      >
        {items.map((item) => {
          const showGroup = item.group && item.group !== lastGroup;
          if (item.group) lastGroup = item.group;
          const key = item.filterKey ?? item.label;

          return (
            <li key={key}>
              {showGroup && (
                <p className="mb-1 mt-1.5 text-[8px] font-semibold uppercase tracking-wider text-muted first:mt-0">
                  {item.group}
                </p>
              )}
              <label className="flex cursor-pointer items-center gap-2 text-[10px] text-muted">
                {item.filterKey && onToggleFilter ? (
                  <input
                    type="checkbox"
                    className="h-3 w-3 shrink-0 accent-[var(--accent)]"
                    checked={activeFilters?.has(item.filterKey) ?? false}
                    onChange={() => onToggleFilter(item.filterKey!)}
                  />
                ) : null}
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full border border-foreground/20 ${item.className ?? ""}`}
                  style={
                    item.swatch ? { backgroundColor: item.swatch } : undefined
                  }
                />
                <span className="leading-tight">{item.label}</span>
              </label>
            </li>
          );
        })}
      </ul>
      {filterable && open && (
        <p className="border-t border-border px-2.5 py-1.5 text-[8px] leading-snug text-muted">
          Unchecked = show all. Check one to filter.
        </p>
      )}
    </div>
  );
}

function MapScrollTrack({
  enabled,
  ratio,
  ariaLabel,
  onChange,
}: {
  enabled: boolean;
  ratio: number;
  ariaLabel: string;
  onChange: (ratio: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const updateFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track || !enabled) return;
      const rect = track.getBoundingClientRect();
      const nextRatio = clamp((clientX - rect.left) / rect.width, 0, 1);
      onChange(nextRatio);
    },
    [enabled, onChange],
  );

  useEffect(() => {
    if (!dragging) return;
    const onMove = (event: PointerEvent) => updateFromClientX(event.clientX);
    const onUp = () => setDragging(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging, updateFromClientX]);

  const thumbWidth = enabled ? 18 : 100;

  return (
    <div
      ref={trackRef}
      data-map-control
      role="scrollbar"
      aria-label={ariaLabel}
      aria-valuenow={Math.round(ratio * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`relative h-3 min-w-0 flex-1 rounded-full border border-border bg-background/80 ${
        enabled ? "cursor-pointer" : "opacity-45"
      }`}
      onPointerDown={(event) => {
        if (!enabled) return;
        setDragging(true);
        updateFromClientX(event.clientX);
      }}
    >
      <div
        className={`absolute top-1/2 h-2.5 -translate-y-1/2 rounded-full border border-accent/60 bg-accent/80 shadow-sm ${
          enabled ? "" : "bg-muted"
        }`}
        style={{
          width: `${thumbWidth}%`,
          left: `${enabled ? ratio * (100 - thumbWidth) : 0}%`,
        }}
      />
    </div>
  );
}

function ChromeButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-border bg-surface-elevated/90 text-sm text-foreground backdrop-blur-sm transition-colors hover:border-accent hover:text-accent"
    >
      {children}
    </button>
  );
}

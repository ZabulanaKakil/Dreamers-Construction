"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { SectorPlotArea, SectorTileMapConfig } from "@/data/sector-plots";
import {
  getSectorMapById,
  getSectorPlots,
  getSectorTileMapSize,
} from "@/data/sector-plots";
import { TiledMap } from "@/components/map/TiledMap";
import {
  getSectorMapLabels,
  type SectorLabelKind,
  type SectorMapLabel,
} from "@/data/sector-map-labels";
import type { Building } from "@/data/buildings";
import type { MapProjectFeature } from "@/data/map-projects";
import { normalizeSectorBounds } from "@/lib/map-location";
import type { MapLegendItem } from "@/components/map/MapLibreChrome";
import {
  buildProjectLegendItems,
  buildResidenceLegendItems,
  filterProjectFeatures,
  type MapLegendFilterKey,
  type MapTopCategory,
} from "@/lib/map-legend-filters";
import { isResidenceProjectType } from "@/lib/project-taxonomy";

interface InteractiveSectorMapProps {
  sectorId: string;
  imageSrc?: string;
  tileMap?: SectorTileMapConfig;
  mapCategory?: MapTopCategory;
  onPlotSelect: (plot: SectorPlotArea | null) => void;
  selectedPlotId?: string | null;
  sectorPlots?: SectorPlotArea[];
  sectorProjects?: MapProjectFeature[];
  sectorBuildings?: Building[];
  allSectorPlots?: SectorPlotArea[];
  allSectorBuildings?: Building[];
  allSectorProjects?: MapProjectFeature[];
  buildingSlugsWithFlats?: Set<string>;
  activeLegendFilters?: Set<MapLegendFilterKey>;
  onLegendFilterToggle?: (filterKey: string) => void;
  onProjectSelect?: (feature: MapProjectFeature | null) => void;
  onBuildingSelect?: (building: Building | null) => void;
  selectedProjectSlug?: string | null;
  selectedBuildingSlug?: string | null;
  className?: string;
  compact?: boolean;
  teaser?: boolean;
}

interface PanBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

const MIN_SCALE = 0.08;
const MAX_SCALE = 16;
const WHEEL_ZOOM_STEP = 0.35;
const BUTTON_ZOOM_STEP = 0.4;

const plotStatusStyles: Record<
  SectorPlotArea["status"],
  { border: string; fill: string; dot: string }
> = {
  available: {
    border: "border-success/90",
    fill: "bg-success/25",
    dot: "bg-success",
  },
  reserved: {
    border: "border-warning/90",
    fill: "bg-warning/25",
    dot: "bg-warning",
  },
  sold: {
    border: "border-danger/80",
    fill: "bg-danger/20",
    dot: "bg-danger",
  },
  upcoming: {
    border: "border-info/80",
    fill: "bg-info/20",
    dot: "bg-info",
  },
  ongoing: {
    border: "border-accent",
    fill: "bg-accent/30",
    dot: "bg-accent",
  },
  completed: {
    border: "border-steel/80",
    fill: "bg-steel/20",
    dot: "bg-steel",
  },
};

function getPanBounds(
  containerWidth: number,
  containerHeight: number,
  mapWidth: number,
  mapHeight: number,
  scale: number,
): PanBounds {
  const scaledWidth = mapWidth * scale;
  const scaledHeight = mapHeight * scale;
  const maxX = Math.max(0, (scaledWidth - containerWidth) / 2);
  const maxY = Math.max(0, (scaledHeight - containerHeight) / 2);

  return {
    minX: -maxX,
    maxX,
    minY: -maxY,
    maxY,
  };
}

function clampOffset(
  offset: { x: number; y: number },
  bounds: PanBounds,
): { x: number; y: number } {
  return {
    x: Math.min(bounds.maxX, Math.max(bounds.minX, offset.x)),
    y: Math.min(bounds.maxY, Math.max(bounds.minY, offset.y)),
  };
}

function offsetToScrollRatio(value: number, min: number, max: number): number {
  if (max <= min) return 0.5;
  return (value - min) / (max - min);
}

function scrollRatioToOffset(ratio: number, min: number, max: number): number {
  return min + ratio * (max - min);
}

export function InteractiveSectorMap({
  sectorId,
  imageSrc,
  tileMap: tileMapProp,
  mapCategory = "projects",
  onPlotSelect,
  selectedPlotId,
  sectorPlots: sectorPlotsProp,
  sectorProjects = [],
  sectorBuildings = [],
  allSectorPlots,
  allSectorBuildings = [],
  allSectorProjects = [],
  buildingSlugsWithFlats = new Set(),
  activeLegendFilters,
  onLegendFilterToggle,
  onProjectSelect,
  onBuildingSelect,
  selectedProjectSlug,
  selectedBuildingSlug,
  className = "",
  compact = false,
  teaser = false,
}: InteractiveSectorMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [fitScale, setFitScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [hoveredPlotId, setHoveredPlotId] = useState<string | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const [viewReady, setViewReady] = useState(false);

  const sectorConfig = getSectorMapById(sectorId);
  const tileMap = tileMapProp ?? sectorConfig?.tileMap;
  const singleImageSrc = imageSrc ?? sectorConfig?.imageSrc;
  const plots = sectorPlotsProp ?? getSectorPlots(sectorId);
  const mapLabels = getSectorMapLabels(sectorId);

  const hasSelection = Boolean(
    selectedPlotId || selectedBuildingSlug || selectedProjectSlug,
  );
  const visiblePlots = hasSelection
    ? plots.filter((p) => p.id === selectedPlotId)
    : plots;
  const visibleBuildings = hasSelection
    ? sectorBuildings.filter((b) => b.slug === selectedBuildingSlug)
    : sectorBuildings;
  const visibleProjects = hasSelection
    ? sectorProjects.filter((f) => f.projectSlug === selectedProjectSlug)
    : sectorProjects;

  const legendItems = useMemo((): MapLegendItem[] => {
    if (mapCategory === "projects") {
      return buildProjectLegendItems(
        filterProjectFeatures(allSectorProjects, new Set(), "projects"),
      );
    }
    const residenceProjects = allSectorProjects.filter((f) =>
      isResidenceProjectType(f.project.type),
    );
    return buildResidenceLegendItems({
      hasFlats: allSectorBuildings.some((b) =>
        buildingSlugsWithFlats.has(b.slug),
      ),
      hasHouses: allSectorBuildings.some(
        (b) =>
          b.saleStatus === "available" || b.saleStatus === "upcoming",
      ),
      hasPlots: false,
      hasLand: (allSectorPlots ?? plots).length > 0,
      hasDeveloper: residenceProjects.some(
        (f) => f.project.type === "developer",
      ),
      hasBuilders: residenceProjects.some((f) => f.project.type === "builder"),
      hasDesign: residenceProjects.some((f) => f.project.type === "design"),
    });
  }, [
    allSectorBuildings,
    allSectorPlots,
    allSectorProjects,
    buildingSlugsWithFlats,
    mapCategory,
    plots,
  ]);

  const mapSize = useMemo(() => {
    if (tileMap) return getSectorTileMapSize(tileMap);
    return { width: compact ? 2800 : 3600, height: compact ? 3200 : 4200 };
  }, [tileMap, compact]);

  const computeFitScale = useCallback(() => {
    const container = containerRef.current;
    if (!container) return 1;

    const padding = compact ? 16 : 32;
    const fit = Math.min(
      (container.clientWidth - padding) / mapSize.width,
      (container.clientHeight - padding) / mapSize.height,
      1,
    );

    return Math.max(MIN_SCALE, fit);
  }, [compact, mapSize.height, mapSize.width]);

  const panBounds = useMemo(
    () =>
      getPanBounds(
        containerSize.width,
        containerSize.height,
        mapSize.width,
        mapSize.height,
        scale,
      ),
    [containerSize.height, containerSize.width, mapSize.height, mapSize.width, scale],
  );

  const canPanX = panBounds.maxX > 0;
  const canPanY = panBounds.maxY > 0;

  const scrollXRatio = offsetToScrollRatio(offset.x, panBounds.minX, panBounds.maxX);
  const scrollYRatio = offsetToScrollRatio(offset.y, panBounds.minY, panBounds.maxY);

  const zoomPercent = Math.round((scale / fitScale) * 100);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setContainerSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    observer.observe(container);
    setContainerSize({
      width: container.clientWidth,
      height: container.clientHeight,
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setViewReady(false);
    setOffset({ x: 0, y: 0 });
    const fit = computeFitScale();
    setFitScale(fit);
    setScale(fit);
    setViewReady(true);
  }, [sectorId, tileMap, singleImageSrc, computeFitScale]);

  useEffect(() => {
    setOffset((current) => clampOffset(current, panBounds));
  }, [panBounds]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const direction = event.deltaY > 0 ? -1 : 1;
      const magnitude =
        event.deltaMode === 1
          ? WHEEL_ZOOM_STEP * 2.5
          : event.deltaMode === 2
            ? WHEEL_ZOOM_STEP * 5
            : WHEEL_ZOOM_STEP;

      setScale((current) =>
        Math.min(MAX_SCALE, Math.max(MIN_SCALE, current + direction * magnitude)),
      );
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, []);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent) => {
      if ((event.target as HTMLElement).closest("[data-map-control]")) return;
      if ((event.target as HTMLElement).closest("[data-plot-hotspot]")) return;

      setDragging(true);
      dragStart.current = {
        x: event.clientX,
        y: event.clientY,
        ox: offset.x,
        oy: offset.y,
      };
      (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
    },
    [offset],
  );

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent) => {
      if (!dragging) return;
      const next = clampOffset(
        {
          x: dragStart.current.ox + (event.clientX - dragStart.current.x),
          y: dragStart.current.oy + (event.clientY - dragStart.current.y),
        },
        panBounds,
      );
      setOffset(next);
    },
    [dragging, panBounds],
  );

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  const zoomIn = () =>
    setScale((current) => Math.min(MAX_SCALE, current + BUTTON_ZOOM_STEP));
  const zoomOut = () =>
    setScale((current) => Math.max(MIN_SCALE, current - BUTTON_ZOOM_STEP));

  const resetView = () => {
    const fit = computeFitScale();
    setFitScale(fit);
    setScale(fit);
    setOffset({ x: 0, y: 0 });
  };

  const centerOnPlot = useCallback(
    (plot: SectorPlotArea) => {
      const plotCenterX = ((plot.x + plot.width / 2) / 100) * mapSize.width;
      const plotCenterY = ((plot.y + plot.height / 2) / 100) * mapSize.height;
      const focusScale = Math.min(MAX_SCALE, fitScale * 2.4);

      setScale(focusScale);
      setOffset(
        clampOffset(
          {
            x: mapSize.width / 2 - plotCenterX,
            y: mapSize.height / 2 - plotCenterY,
          },
          getPanBounds(
            containerSize.width,
            containerSize.height,
            mapSize.width,
            mapSize.height,
            focusScale,
          ),
        ),
      );
    },
    [
      containerSize.height,
      containerSize.width,
      fitScale,
      mapSize.height,
      mapSize.width,
    ],
  );

  useEffect(() => {
    if (!selectedPlotId) return;
    const plot = plots.find((entry) => entry.id === selectedPlotId);
    if (plot) centerOnPlot(plot);
  }, [selectedPlotId, plots, centerOnPlot]);

  const centerOnBounds = useCallback(
    (bounds: { x: number; y: number; width: number; height: number }) => {
      const centerX = ((bounds.x + bounds.width / 2) / 100) * mapSize.width;
      const centerY = ((bounds.y + bounds.height / 2) / 100) * mapSize.height;
      const focusScale = Math.min(MAX_SCALE, fitScale * 2.4);
      setScale(focusScale);
      setOffset(
        clampOffset(
          {
            x: mapSize.width / 2 - centerX,
            y: mapSize.height / 2 - centerY,
          },
          getPanBounds(
            containerSize.width,
            containerSize.height,
            mapSize.width,
            mapSize.height,
            focusScale,
          ),
        ),
      );
    },
    [
      containerSize.height,
      containerSize.width,
      fitScale,
      mapSize.height,
      mapSize.width,
    ],
  );

  useEffect(() => {
    if (!selectedBuildingSlug) return;
    const building = sectorBuildings.find((b) => b.slug === selectedBuildingSlug);
    if (building) centerOnBounds(normalizeSectorBounds(building));
  }, [selectedBuildingSlug, sectorBuildings, centerOnBounds]);

  useEffect(() => {
    if (!selectedProjectSlug) return;
    const feature = sectorProjects.find((f) => f.projectSlug === selectedProjectSlug);
    if (feature) centerOnBounds(normalizeSectorBounds(feature));
  }, [selectedProjectSlug, sectorProjects, centerOnBounds]);

  const mapSurfaceHeight = teaser
    ? "h-[min(52vh,560px)] min-h-[420px] sm:min-h-[520px] sm:h-[min(65vh,700px)]"
    : compact
      ? "h-[320px] sm:h-[380px]"
      : "h-[min(78vh,900px)] min-h-[480px]";

  const viewportRect = useMemo(() => {
    const scaledWidth = mapSize.width * scale;
    const scaledHeight = mapSize.height * scale;
    const mapLeft = containerSize.width / 2 + offset.x - scaledWidth / 2;
    const mapTop = containerSize.height / 2 + offset.y - scaledHeight / 2;

    return {
      left: (-mapLeft / scaledWidth) * 100,
      top: (-mapTop / scaledHeight) * 100,
      width: (containerSize.width / scaledWidth) * 100,
      height: (containerSize.height / scaledHeight) * 100,
    };
  }, [
    containerSize.height,
    containerSize.width,
    mapSize.height,
    mapSize.width,
    offset.x,
    offset.y,
    scale,
  ]);

  return (
    <div
      className={`relative flex w-full min-w-0 flex-col overflow-hidden bg-surface ${mapSurfaceHeight} ${className}`}
    >
      {!compact && (
        <MapToolbar
          showLabels={showLabels}
          onToggleLabels={() => setShowLabels((value) => !value)}
          onReset={resetView}
          zoomPercent={zoomPercent}
        />
      )}

      <div className="relative min-h-0 flex-1">
        <div
          ref={containerRef}
          className={`absolute inset-0 touch-none overscroll-none ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{ overscrollBehavior: "none" }}
        >
          <div
            className="absolute left-1/2 top-1/2 origin-center will-change-transform"
            style={{
              transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${scale})`,
              opacity: viewReady ? 1 : 0,
              transition: viewReady ? "opacity 0.15s ease" : undefined,
            }}
          >
            <div
              className="relative"
              style={{
                width: mapSize.width,
                height: mapSize.height,
              }}
            >
              {tileMap ? (
                <TiledMap tileMap={tileMap} />
              ) : singleImageSrc ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={singleImageSrc}
                  alt="Sector master plan"
                  className="block max-h-none w-auto max-w-none select-none"
                  draggable={false}
                  style={{
                    width: mapSize.width,
                    height: mapSize.height,
                    objectFit: "contain",
                  }}
                />
              ) : null}

              {showLabels &&
                mapLabels.map((entry) => (
                  <MapLabelMarker key={entry.id} label={entry} />
                ))}

              {visiblePlots.map((plot) => {
                const styles = plotStatusStyles[plot.status];
                const isSelected = selectedPlotId === plot.id;
                const isHovered = hoveredPlotId === plot.id;

                return (
                  <button
                    key={plot.id}
                    type="button"
                    data-plot-hotspot
                    aria-label={`Plot ${plot.plotNumber}${plot.block ? ` Block ${plot.block}` : ""}`}
                    onMouseEnter={() => setHoveredPlotId(plot.id)}
                    onMouseLeave={() => setHoveredPlotId(null)}
                    onClick={(event) => {
                      event.stopPropagation();
                      onPlotSelect(isSelected ? null : plot);
                    }}
                    className={`group absolute border-2 transition-all ${styles.border} ${styles.fill} ${
                      isSelected
                        ? "z-20 shadow-[0_0_16px_var(--glow)] ring-2 ring-foreground/70"
                        : "hover:z-10 hover:shadow-[0_0_10px_var(--glow)]"
                    }`}
                    style={{
                      left: `${plot.x}%`,
                      top: `${plot.y}%`,
                      width: `${plot.width}%`,
                      height: `${plot.height}%`,
                      cursor: "pointer",
                    }}
                  >
                    <span
                      className={`absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full border border-background ${styles.dot}`}
                    />
                    {(isSelected || isHovered) && (
                      <span className="pointer-events-none absolute -top-7 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-[var(--radius-sm)] border border-border bg-surface-elevated/95 px-2 py-0.5 text-[10px] font-semibold text-foreground shadow-sm backdrop-blur-sm">
                        {plot.block ? `Block ${plot.block} · ` : ""}Plot {plot.plotNumber}
                      </span>
                    )}
                  </button>
                );
              })}

              {visibleProjects.map((feature) => {
                const bounds = normalizeSectorBounds(feature);
                const isSelected = selectedProjectSlug === feature.projectSlug;
                return (
                  <button
                    key={`project-${feature.projectSlug}`}
                    type="button"
                    data-plot-hotspot
                    aria-label={`Project ${feature.shortLabel ?? feature.project.name}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onPlotSelect(null);
                      onBuildingSelect?.(null);
                      onProjectSelect?.(isSelected ? null : feature);
                    }}
                    className={`absolute z-[15] border-2 border-sky-400 bg-sky-400/35 transition-all ${
                      isSelected
                        ? "ring-2 ring-foreground/70 shadow-[0_0_16px_var(--glow)]"
                        : "hover:shadow-[0_0_10px_var(--glow)]"
                    }`}
                    style={{
                      left: `${bounds.x}%`,
                      top: `${bounds.y}%`,
                      width: `${bounds.width}%`,
                      height: `${bounds.height}%`,
                      cursor: "pointer",
                    }}
                    title={feature.shortLabel ?? feature.project.name}
                  >
                    <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[var(--radius-sm)] border border-border bg-surface-elevated/95 px-1.5 py-0.5 text-[9px] font-semibold text-sky-300">
                      {feature.shortLabel ?? feature.project.name}
                    </span>
                  </button>
                );
              })}

              {visibleBuildings.map((building) => {
                const bounds = normalizeSectorBounds(building);
                const isSelected = selectedBuildingSlug === building.slug;
                return (
                  <button
                    key={`house-${building.slug}`}
                    type="button"
                    data-plot-hotspot
                    aria-label={`House ${building.name}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onPlotSelect(null);
                      onProjectSelect?.(null);
                      onBuildingSelect?.(isSelected ? null : building);
                    }}
                    className={`absolute z-[15] border-2 border-accent bg-accent/40 transition-all ${
                      isSelected
                        ? "ring-2 ring-foreground/70 shadow-[0_0_16px_var(--glow)]"
                        : "hover:shadow-[0_0_10px_var(--glow)]"
                    }`}
                    style={{
                      left: `${bounds.x}%`,
                      top: `${bounds.y}%`,
                      width: `${bounds.width}%`,
                      height: `${bounds.height}%`,
                      cursor: "pointer",
                    }}
                    title={building.name}
                  >
                    <span className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[var(--radius-sm)] border border-border bg-surface-elevated/95 px-1.5 py-0.5 text-[9px] font-semibold text-accent">
                      House · {building.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {!compact && (
          <>
            <div className="absolute left-3 top-3 z-20 max-sm:hidden">
              <MiniMap
                overviewSrc={sectorConfig?.overviewSrc}
                viewport={viewportRect}
                onNavigate={(ratioX, ratioY) => {
                  setOffset(
                    clampOffset(
                      {
                        x: scrollRatioToOffset(
                          ratioX,
                          panBounds.minX,
                          panBounds.maxX,
                        ),
                        y: scrollRatioToOffset(
                          ratioY,
                          panBounds.minY,
                          panBounds.maxY,
                        ),
                      },
                      panBounds,
                    ),
                  );
                }}
              />
            </div>
            <div className="absolute right-3 top-3 z-20 max-w-[calc(100%-1.5rem)] sm:max-w-[180px]">
              <SectorMapLegend
                items={legendItems}
                activeFilters={activeLegendFilters}
                onToggleFilter={onLegendFilterToggle}
              />
            </div>
          </>
        )}

        <div
          data-map-control
          className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5 rounded-[var(--radius-md)] border border-border/80 bg-surface-elevated/95 p-1 shadow-sm backdrop-blur-sm"
        >
          <MapControlButton label="Zoom in" onClick={zoomIn}>
            +
          </MapControlButton>
          <MapControlButton label="Zoom out" onClick={zoomOut}>
            −
          </MapControlButton>
          <MapControlButton label="Reset view" onClick={resetView}>
            ⟲
          </MapControlButton>
        </div>

        <p className="absolute bottom-4 left-3 z-10 hidden max-w-[min(38%,280px)] text-[10px] leading-relaxed text-muted sm:block md:max-w-[32%] lg:left-4">
          Drag to pan · Scroll or use zoom bar · Click highlighted plots
        </p>
      </div>

      <div
        data-map-control
        className="flex shrink-0 flex-col gap-1.5 border-t border-border bg-surface-elevated/95 px-2 py-2 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2">
          <span className="w-10 shrink-0 text-[10px] uppercase tracking-wider text-muted">
            Zoom
          </span>
          <input
            type="range"
            min={MIN_SCALE}
            max={MAX_SCALE}
            step={0.01}
            value={scale}
            onChange={(event) => setScale(Number(event.target.value))}
            className="sector-map-zoom-slider h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-border"
            aria-label="Zoom level"
          />
          <span className="w-12 shrink-0 text-right text-[11px] tabular-nums text-foreground">
            {zoomPercent}%
          </span>
          <button
            type="button"
            onClick={resetView}
            className="hidden shrink-0 border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted transition-colors hover:border-accent hover:text-accent sm:inline"
          >
            Fit
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-10 shrink-0 text-[10px] uppercase tracking-wider text-muted">
            ↔
          </span>
          <MapScrollTrack
            enabled={canPanX}
            ratio={scrollXRatio}
            ariaLabel="Horizontal map position"
            onChange={(ratio) =>
              setOffset((current) =>
                clampOffset(
                  {
                    ...current,
                    x: scrollRatioToOffset(ratio, panBounds.minX, panBounds.maxX),
                  },
                  panBounds,
                ),
              )
            }
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="w-10 shrink-0 text-[10px] uppercase tracking-wider text-muted">
            ↕
          </span>
          <MapScrollTrack
            enabled={canPanY}
            ratio={scrollYRatio}
            ariaLabel="Vertical map position"
            onChange={(ratio) =>
              setOffset((current) =>
                clampOffset(
                  {
                    ...current,
                    y: scrollRatioToOffset(ratio, panBounds.minY, panBounds.maxY),
                  },
                  panBounds,
                ),
              )
            }
          />
        </div>
      </div>
    </div>
  );
}

function MapToolbar({
  showLabels,
  onToggleLabels,
  onReset,
  zoomPercent,
}: {
  showLabels: boolean;
  onToggleLabels: () => void;
  onReset: () => void;
  zoomPercent: number;
}) {
  return (
    <div
      data-map-control
      className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border bg-surface-elevated/90 px-3 py-2"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider text-muted">
          Sector 14 · Detailed plan
        </span>
        <span className="hidden text-[10px] text-muted sm:inline">·</span>
        <span className="hidden text-[10px] tabular-nums text-muted sm:inline">
          Zoom {zoomPercent}%
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleLabels}
          className={`border px-2 py-1 text-[10px] uppercase tracking-wider transition-colors ${
            showLabels
              ? "border-accent bg-accent/15 font-semibold text-accent"
              : "border-border text-muted hover:border-accent/50"
          }`}
        >
          {showLabels ? "Hide labels" : "Show labels"}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="border border-border px-2 py-1 text-[10px] uppercase tracking-wider text-muted transition-colors hover:border-accent hover:text-accent"
        >
          Recenter
        </button>
      </div>
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
      const nextRatio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
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

function MiniMap({
  overviewSrc,
  viewport,
  onNavigate,
}: {
  overviewSrc?: string;
  viewport: { left: number; top: number; width: number; height: number };
  onNavigate: (ratioX: number, ratioY: number) => void;
}) {
  if (!overviewSrc) return null;

  return (
    <div
      data-map-control
      className="w-full overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface-elevated/95 shadow-sm backdrop-blur-sm"
    >
      <p className="border-b border-border px-2 py-1 text-[9px] uppercase tracking-wider text-muted">
        Overview · click to jump
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={overviewSrc}
          alt=""
          aria-hidden
          className="block h-[100px] w-full object-contain bg-background/50 opacity-90"
          draggable={false}
        />
        <div
          className="pointer-events-none absolute border-2 border-accent bg-accent/15"
          style={{
            left: `${Math.max(0, viewport.left)}%`,
            top: `${Math.max(0, viewport.top)}%`,
            width: `${Math.min(100, Math.max(8, viewport.width))}%`,
            height: `${Math.min(100, Math.max(8, viewport.height))}%`,
          }}
        />
      </button>
    </div>
  );
}

function SectorMapLegend({
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
      className="w-full rounded-[var(--radius-md)] border border-border bg-surface-elevated/95 shadow-sm backdrop-blur-sm"
    >
      <button
        type="button"
        className="flex w-full items-center justify-between px-2.5 py-1.5 text-[9px] uppercase tracking-wider text-muted"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        {filterable ? "Filter" : "Legend"}
        <span>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <>
          <ul className="max-h-[min(40vh,240px)] space-y-1 overflow-y-auto border-t border-border px-2.5 py-2">
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
                      className={`h-2 w-2 shrink-0 rounded-full ${item.className ?? "bg-accent"}`}
                      style={
                        item.swatch
                          ? { backgroundColor: item.swatch }
                          : undefined
                      }
                    />
                    {item.label}
                  </label>
                </li>
              );
            })}
          </ul>
          {filterable && (
            <p className="border-t border-border px-2.5 py-1.5 text-[8px] leading-snug text-muted">
              Unchecked = show all. Check one to filter.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function MapLabelMarker({ label }: { label: SectorMapLabel }) {
  const kindStyles: Record<SectorLabelKind, string> = {
    block: "border-accent/70 bg-surface-elevated/95 text-accent",
    landmark: "border-foreground/35 bg-surface-elevated/95 text-foreground",
    road: "border-border bg-surface-elevated/95 text-muted",
    water: "border-sky-500/55 bg-surface-elevated/95 text-foreground",
    green: "border-emerald-500/55 bg-surface-elevated/95 text-foreground",
  };

  return (
    <div
      className="pointer-events-none absolute z-[5]"
      style={{
        left: `${label.x}%`,
        top: `${label.y}%`,
        // margin centering avoids fighting parent map transforms on zoom
        transform: "translate(-50%, -50%)",
      }}
      title={label.hint}
    >
      <span
        className={`inline-block max-w-[100px] truncate rounded border px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide shadow-sm backdrop-blur-sm sm:max-w-[150px] sm:text-[10px] ${kindStyles[label.kind]}`}
      >
        {label.label}
      </span>
    </div>
  );
}

function MapControlButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
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

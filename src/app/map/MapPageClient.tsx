"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import type { RegionId } from "@/data/map-regions";
import {
  getRegionById,
  isImageMapRegion,
  isValidRegionId,
} from "@/data/map-regions";
import type { Plot } from "@/data/plots";
import { getPlotsByRegion, plots as allPlots } from "@/data/plots";
import type { SectorPlotArea } from "@/data/sector-plots";
import { getSectorPlots, sectorPlots as allSectorPlots } from "@/data/sector-plots";
import type { Building } from "@/data/buildings";
import {
  buildings as allBuildings,
  buildingSlugsWithFlats as flatBuildingSlugs,
  getBuildingsByRegion,
} from "@/data/buildings";
import { getPublishedProjects } from "@/data/projects";
import {
  buildMapProjectFeatures,
  type MapProjectFeature,
} from "@/data/map-projects";
import {
  filterProjectFeatures,
  filterResidenceProjectFeatures,
  filterFeaturesByServices,
  filterBuildingsForMap,
  filterGeoPlots,
  filterSectorPlots,
  parseLegendFilterKey,
  type MapLegendFilterKey,
  type MapTopCategory,
} from "@/lib/map-legend-filters";
import { isSectorBoundItem } from "@/lib/map-location";
import { getMapItemCountsByRegion } from "@/lib/map-counts";
import { isResidenceProjectType } from "@/lib/project-taxonomy";
import { SERVICE_IDS } from "@/lib/service-taxonomy";
import { services as staticServices } from "@/data/services";
import { mapRegionForBuilding, mapRegionForProject } from "@/lib/map-url";
import { RegionSelect } from "@/components/map/RegionSelect";
import { PlotPanelWithRegion } from "@/components/map/PlotPanel";
import { SectorPlotPanel } from "@/components/map/SectorPlotPanel";
import { SectorRegionOverviewPanel } from "@/components/map/SectorRegionOverviewPanel";
import { BuildingPanel } from "@/components/map/BuildingPanel";
import { ProjectMapPanel } from "@/components/map/ProjectMapPanel";
import { Reveal } from "@/components/ui/Reveal";
import { FilterChip } from "@/components/ui/FilterChip";
import { FilterChipRow } from "@/components/ui/FilterChipRow";

const serviceLabelById = new Map(
  staticServices.map((s) => [s.id, s.title] as const),
);
const projects = getPublishedProjects();
const itemCounts = getMapItemCountsByRegion({
  projects,
  buildings: allBuildings,
  plots: allPlots,
  sectorPlots: allSectorPlots,
});
const PlotMap = dynamic(
  () => import("@/components/map/PlotMap").then((m) => m.PlotMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[min(62vh,520px)] min-h-[380px] items-center justify-center bg-surface sm:h-[min(78vh,900px)]">
        <p className="text-sm text-muted">Loading map...</p>
      </div>
    ),
  },
);

const ResidencesMap = dynamic(
  () => import("@/components/map/ResidencesMap").then((m) => m.ResidencesMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[min(62vh,520px)] min-h-[380px] items-center justify-center bg-surface sm:h-[min(78vh,900px)]">
        <p className="text-sm text-muted">Loading map...</p>
      </div>
    ),
  },
);

const InteractiveSectorMap = dynamic(
  () =>
    import("@/components/map/InteractiveSectorMap").then(
      (m) => m.InteractiveSectorMap,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[min(62vh,520px)] min-h-[380px] items-center justify-center bg-surface sm:min-h-[640px] sm:h-[min(78vh,900px)]">
        <p className="text-sm text-muted">Loading sector map...</p>
      </div>
    ),
  },
);

export default function MapPageClient() {
  const searchParams = useSearchParams();
  const regionParam = searchParams.get("region");
  const categoryParam = searchParams.get("category");
  const projectParam = searchParams.get("project");
  const buildingParam = searchParams.get("building");
  const plotParam = searchParams.get("plot");
  const sectorPlotParam = searchParams.get("sectorPlot");
  const validUrlRegion =
    regionParam && isValidRegionId(regionParam) ? regionParam : null;

  const [pickedRegion, setPickedRegion] = useState<RegionId | null>(null);
  const regionId = pickedRegion ?? validUrlRegion ?? "bangladesh";
  const [mapCategory, setMapCategory] = useState<MapTopCategory>(() =>
    categoryParam === "residences" || categoryParam === "projects"
      ? categoryParam
      : "projects",
  );
  const [legendFilters, setLegendFilters] = useState<Set<MapLegendFilterKey>>(
    () => new Set(),
  );
  const [serviceFilters, setServiceFilters] = useState<Set<string>>(
    () => new Set(),
  );
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [selectedSectorPlot, setSelectedSectorPlot] =
    useState<SectorPlotArea | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null,
  );
  const [selectedProject, setSelectedProject] =
    useState<MapProjectFeature | null>(null);
  const isSectorMap = isImageMapRegion(regionId);
  const plots = useMemo(() => getPlotsByRegion(regionId), [regionId]);
  const sectorPlots = useMemo(
    () => (isSectorMap ? getSectorPlots(regionId) : []),
    [regionId, isSectorMap],
  );
  const buildings = useMemo(() => getBuildingsByRegion(regionId), [regionId]);
  const region = getRegionById(regionId);

  const regionProjects = useMemo(
    () =>
      buildMapProjectFeatures(projects, regionId, {
        geoOnly: !isSectorMap,
        sectorOnly: isSectorMap,
      }),
    [regionId, isSectorMap],
  );

  const geoBuildings = useMemo(
    () => buildings.filter((b) => !isSectorBoundItem(b)),
    [buildings],
  );

  const sectorBuildings = useMemo(
    () => buildings.filter((b) => isSectorBoundItem(b)),
    [buildings],
  );

  const [deepLinkDone, setDeepLinkDone] = useState(false);

  useEffect(() => {
    if (categoryParam === "projects" || categoryParam === "residences") {
      setMapCategory(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    if (validUrlRegion) setPickedRegion(validUrlRegion);
  }, [validUrlRegion]);

  useEffect(() => {
    setDeepLinkDone(false);
  }, [projectParam, buildingParam, plotParam, sectorPlotParam, regionId]);

  useEffect(() => {
    if (deepLinkDone) return;
    const hasTarget =
      projectParam || buildingParam || plotParam || sectorPlotParam;
    if (!hasTarget) {
      setDeepLinkDone(true);
      return;
    }

    if (projectParam && projects.length > 0) {
      const catalogProject = projects.find((p) => p.slug === projectParam);
      if (catalogProject) {
        const targetRegion = mapRegionForProject(catalogProject);
        if (
          isValidRegionId(targetRegion) &&
          targetRegion !== regionId
        ) {
          setPickedRegion(targetRegion);
          return;
        }
        const feature = buildMapProjectFeatures(projects, regionId, {
          geoOnly: !isSectorMap,
          sectorOnly: isSectorMap,
        }).find((f) => f.projectSlug === projectParam);
        if (feature) {
          setSelectedProject(feature);
          setMapCategory(
            isResidenceProjectType(feature.project.type)
              ? "residences"
              : "projects",
          );
          setDeepLinkDone(true);
          return;
        }
      }
    }

    if (buildingParam) {
      const building =
        buildings.find((b) => b.slug === buildingParam) ??
        allBuildings.find((b) => b.slug === buildingParam);
      if (building) {
        const targetRegion = mapRegionForBuilding(building);
        if (
          isValidRegionId(targetRegion) &&
          targetRegion !== regionId
        ) {
          setPickedRegion(targetRegion);
          return;
        }
        if (buildings.some((b) => b.slug === buildingParam)) {
          setSelectedBuilding(building);
          setMapCategory("residences");
          setDeepLinkDone(true);
          return;
        }
      }
    }

    if (plotParam) {
      const plot =
        plots.find((p) => p.id === plotParam) ??
        allPlots.find((p) => p.id === plotParam);
      if (plot) {
        if (plot.regionId !== regionId && isValidRegionId(plot.regionId)) {
          setPickedRegion(plot.regionId);
          return;
        }
        if (plots.some((p) => p.id === plotParam)) {
          setSelectedPlot(plot);
          setMapCategory("residences");
          setDeepLinkDone(true);
          return;
        }
      }
    }

    if (sectorPlotParam) {
      const sp =
        sectorPlots.find((p) => p.id === sectorPlotParam) ??
        allSectorPlots.find((p) => p.id === sectorPlotParam);
      if (sp) {
        const sectorRegion = sp.sectorId as RegionId;
        if (sectorRegion !== regionId && isValidRegionId(sectorRegion)) {
          setPickedRegion(sectorRegion);
          return;
        }
        if (sectorPlots.some((p) => p.id === sectorPlotParam)) {
          setSelectedSectorPlot(sp);
          setMapCategory("residences");
          setDeepLinkDone(true);
          return;
        }
      }
    }
  }, [
    deepLinkDone,
    projectParam,
    buildingParam,
    plotParam,
    sectorPlotParam,
    buildings,
    plots,
    sectorPlots,
    regionId,
    isSectorMap,
    validUrlRegion,
  ]);

  const handleRegionChange = (id: RegionId) => {
    setPickedRegion(id);
    setSelectedPlot(null);
    setSelectedSectorPlot(null);
    setSelectedBuilding(null);
    setSelectedProject(null);
  };

  const handleCategoryChange = (next: MapTopCategory) => {
    setMapCategory(next);
    setLegendFilters(new Set());
    setServiceFilters(new Set());
    setSelectedPlot(null);
    setSelectedSectorPlot(null);
    setSelectedBuilding(null);
    setSelectedProject(null);
  };

  const toggleServiceFilter = (serviceId: string) => {
    setServiceFilters((current) => {
      const next = new Set(current);
      if (next.has(serviceId)) next.delete(serviceId);
      else next.add(serviceId);
      return next;
    });
  };

  const toggleLegendFilter = (filterKey: string) => {
    const parsed = parseLegendFilterKey(filterKey);
    if (!parsed) return;
    setLegendFilters((current) => {
      const next = new Set(current);
      if (next.has(parsed)) next.delete(parsed);
      else next.add(parsed);
      return next;
    });
  };

  const constructionProjects = useMemo(
    () =>
      filterFeaturesByServices(
        filterProjectFeatures(regionProjects, legendFilters, "projects"),
        serviceFilters,
      ),
    [regionProjects, legendFilters, serviceFilters],
  );

  const residenceProjects = useMemo(
    () =>
      filterFeaturesByServices(
        filterResidenceProjectFeatures(regionProjects, legendFilters),
        serviceFilters,
      ),
    [regionProjects, legendFilters, serviceFilters],
  );

  const visibleGeoPlots = useMemo(
    () => filterGeoPlots(plots, legendFilters),
    [plots, legendFilters],
  );

  const visibleSectorPlots = useMemo(
    () => filterSectorPlots(sectorPlots, legendFilters),
    [sectorPlots, legendFilters],
  );

  const visibleSectorBuildings = useMemo(
    () =>
      filterBuildingsForMap(
        sectorBuildings,
        legendFilters,
        flatBuildingSlugs,
      ),
    [sectorBuildings, legendFilters],
  );

  const sectorConstructionProjects = useMemo(
    () =>
      filterFeaturesByServices(
        filterProjectFeatures(regionProjects, legendFilters, "projects"),
        serviceFilters,
      ),
    [regionProjects, legendFilters, serviceFilters],
  );

  const sectorResidenceProjects = useMemo(
    () =>
      filterFeaturesByServices(
        filterResidenceProjectFeatures(regionProjects, legendFilters),
        serviceFilters,
      ),
    [regionProjects, legendFilters, serviceFilters],
  );

  const sidePanel = (() => {
    if (isSectorMap) {
      if (selectedProject) {
        return (
          <ProjectMapPanel
            feature={selectedProject}
            projectCount={regionProjects.length}
            onClose={() => setSelectedProject(null)}
          />
        );
      }
      if (selectedBuilding) {
        return (
          <BuildingPanel
            building={selectedBuilding}
            onClose={() => setSelectedBuilding(null)}
          />
        );
      }
      if (selectedSectorPlot) {
        return (
          <SectorPlotPanel
            plot={selectedSectorPlot}
            sectorId={regionId}
            onClose={() => setSelectedSectorPlot(null)}
          />
        );
      }
      return (
        <SectorRegionOverviewPanel
          sectorId={regionId}
          plots={mapCategory === "residences" ? visibleSectorPlots : []}
          buildings={mapCategory === "residences" ? visibleSectorBuildings : []}
          projects={
            mapCategory === "projects"
              ? sectorConstructionProjects
              : sectorResidenceProjects
          }
          onSelectPlot={setSelectedSectorPlot}
          onSelectBuilding={setSelectedBuilding}
          onSelectProject={setSelectedProject}
        />
      );
    }
    if (selectedProject) {
      return (
        <ProjectMapPanel
          feature={selectedProject}
          projectCount={
            mapCategory === "projects"
              ? constructionProjects.length
              : residenceProjects.length
          }
          onClose={() => setSelectedProject(null)}
        />
      );
    }
    if (mapCategory === "residences") {
      if (selectedPlot) {
        return (
          <PlotPanelWithRegion
            plot={selectedPlot}
            regionId={regionId}
            plotCount={visibleGeoPlots.length}
            onClose={() => setSelectedPlot(null)}
          />
        );
      }
      return (
        <BuildingPanel
          building={selectedBuilding}
          onClose={() => setSelectedBuilding(null)}
        />
      );
    }
    return (
      <ProjectMapPanel
        feature={null}
        projectCount={constructionProjects.length}
        onClose={() => setSelectedProject(null)}
      />
    );
  })();

  const categories: { id: MapTopCategory; label: string }[] = [
    { id: "projects", label: "Projects" },
    { id: "residences", label: "Residential" },
  ];

  return (
    <div className="page-band">
      <div className="page-shell">
        <Reveal>
          <p className="section-label">Our Presence</p>
          <h1 className="mt-2 font-[family-name:var(--font-syne)] text-3xl font-bold sm:text-4xl lg:text-[2.5rem]">
            Our Presence Map
          </h1>
          <p className="mt-4 max-w-2xl text-muted">
            Switch between construction projects and residential work — each has its
            own map and category filters. {region.description}
          </p>
          {!isSectorMap && mapCategory === "projects" && constructionProjects.length > 0 && (
            <p className="mt-2 text-sm text-muted">
              {constructionProjects.length} construction project
              {constructionProjects.length === 1 ? "" : "s"} pinned — use the
              legend to filter by category.
            </p>
          )}
          {!isSectorMap && mapCategory === "residences" && (
            <p className="mt-2 text-sm text-muted">
              Residential map — developer, builder, and design projects plus the
              buildings and land we work on. Use the legend to filter by section.
            </p>
          )}
          {isSectorMap && (
            <p className="mt-2 text-sm text-muted">
              Sector master plan — choose Projects or Residential, then filter
              with the legend checkboxes.
            </p>
          )}
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-6">
            <FilterChipRow>
              {categories.map((category) => (
                <FilterChip
                  key={category.id}
                  active={mapCategory === category.id}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  {category.label}
                </FilterChip>
              ))}
            </FilterChipRow>
            <div className="mt-3">
              <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
                Service (optional)
              </p>
              <FilterChipRow>
                <FilterChip
                  active={serviceFilters.size === 0}
                  onClick={() => setServiceFilters(new Set())}
                >
                  All services
                </FilterChip>
                {(mapCategory === "projects"
                  ? SERVICE_IDS.filter(
                      (id) =>
                        staticServices.find((s) => s.id === id)?.category ===
                        "construction",
                    )
                  : SERVICE_IDS.filter((id) => {
                      const cat = staticServices.find((s) => s.id === id)
                        ?.category;
                      return (
                        cat === "developer" ||
                        cat === "builder" ||
                        cat === "design"
                      );
                    })
                ).map((id) => (
                  <FilterChip
                    key={id}
                    active={serviceFilters.has(id)}
                    onClick={() => toggleServiceFilter(id)}
                  >
                    {serviceLabelById.get(id) ?? id}
                  </FilterChip>
                ))}
              </FilterChipRow>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-5 lg:grid-cols-[minmax(220px,280px)_minmax(0,1fr)]">
            <div className="order-2 min-w-0 space-y-4 overflow-x-hidden lg:order-1 lg:sticky lg:top-24 lg:max-h-[min(78vh,900px)] lg:space-y-6 lg:overflow-x-hidden lg:overflow-y-auto lg:overscroll-contain lg:pr-1 lg:self-start">
              <RegionSelect
                value={regionId}
                onChange={handleRegionChange}
                projectCounts={itemCounts}
              />
              {sidePanel}
            </div>

            <div className="order-1 min-w-0 overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface lg:order-2">
              {isSectorMap ? (
                <InteractiveSectorMap
                  sectorId={regionId}
                  mapCategory={mapCategory}
                  sectorPlots={
                    mapCategory === "residences" ? visibleSectorPlots : []
                  }
                  sectorProjects={
                    mapCategory === "projects"
                      ? sectorConstructionProjects
                      : sectorResidenceProjects
                  }
                  sectorBuildings={
                    mapCategory === "residences" ? visibleSectorBuildings : []
                  }
                  activeLegendFilters={legendFilters}
                  onLegendFilterToggle={toggleLegendFilter}
                  buildingSlugsWithFlats={flatBuildingSlugs}
                  allSectorPlots={sectorPlots}
                  allSectorBuildings={sectorBuildings}
                  allSectorProjects={regionProjects}
                  onPlotSelect={(plot) => {
                    setSelectedSectorPlot(plot);
                    setSelectedProject(null);
                    setSelectedBuilding(null);
                  }}
                  onProjectSelect={(feature) => {
                    setSelectedProject(feature);
                    setSelectedSectorPlot(null);
                    setSelectedBuilding(null);
                  }}
                  onBuildingSelect={(building) => {
                    setSelectedBuilding(building);
                    setSelectedSectorPlot(null);
                    setSelectedProject(null);
                  }}
                  selectedPlotId={selectedSectorPlot?.id}
                  selectedProjectSlug={selectedProject?.projectSlug}
                  selectedBuildingSlug={selectedBuilding?.slug}
                />
              ) : mapCategory === "residences" ? (
                <ResidencesMap
                  regionId={regionId}
                  buildings={geoBuildings}
                  plots={plots}
                  buildingSlugsWithFlats={flatBuildingSlugs}
                  projectFeatures={regionProjects}
                  onBuildingSelect={setSelectedBuilding}
                  selectedBuildingSlug={selectedBuilding?.slug}
                  onPlotSelect={setSelectedPlot}
                  selectedPlotId={selectedPlot?.id}
                  onProjectSelect={setSelectedProject}
                  selectedProjectSlug={selectedProject?.projectSlug}
                  activeLegendFilters={legendFilters}
                  onLegendFilterToggle={toggleLegendFilter}
                />
              ) : (
                <PlotMap
                  regionId={regionId}
                  plots={[]}
                  projectFeatures={regionProjects}
                  onPlotSelect={setSelectedPlot}
                  selectedPlotId={selectedPlot?.id}
                  onProjectSelect={setSelectedProject}
                  selectedProjectSlug={selectedProject?.projectSlug}
                  activeLegendFilters={legendFilters}
                  onLegendFilterToggle={toggleLegendFilter}
                />
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

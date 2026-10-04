import type { SectorTileMapConfig } from "@/data/sector-plots";
import { getSectorTileMapSize } from "@/data/sector-plots";

/** Convert pointer position to % coords on the sector tile map (matches InteractiveSectorMap). */
export function pointerToSectorPercent(
  clientX: number,
  clientY: number,
  viewportEl: HTMLElement,
  mapSize: { width: number; height: number },
  offset: { x: number; y: number },
  scale: number,
): { x: number; y: number } | null {
  const rect = viewportEl.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;

  const cx = rect.width / 2;
  const cy = rect.height / 2;
  const localX = clientX - rect.left;
  const localY = clientY - rect.top;
  const mapX = (localX - cx - offset.x) / scale + mapSize.width / 2;
  const mapY = (localY - cy - offset.y) / scale + mapSize.height / 2;

  return {
    x: Math.min(100, Math.max(0, (mapX / mapSize.width) * 100)),
    y: Math.min(100, Math.max(0, (mapY / mapSize.height) * 100)),
  };
}

export function getSectorMapDimensions(tileMap?: SectorTileMapConfig | null) {
  if (tileMap) return getSectorTileMapSize(tileMap);
  return { width: 3600, height: 4200 };
}

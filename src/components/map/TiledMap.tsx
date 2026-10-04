import type { SectorTileMapConfig } from "@/data/sector-plots";
import { getSectorTileSrc } from "@/data/sector-plots";

export function TiledMap({ tileMap }: { tileMap: SectorTileMapConfig }) {
  const { rows, cols, colWidths, rowHeights } = tileMap;

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: colWidths.map((width) => `${width}px`).join(" "),
        gridTemplateRows: rowHeights.map((height) => `${height}px`).join(" "),
      }}
    >
      {Array.from({ length: rows }, (_, rowIndex) =>
        Array.from({ length: cols }, (_, colIndex) => {
          const row = rowIndex + 1;
          const col = colIndex + 1;

          return (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={`${row}-${col}`}
              src={getSectorTileSrc(tileMap, row, col)}
              alt=""
              aria-hidden
              className="block h-full w-full select-none"
              draggable={false}
              loading="eager"
              decoding="async"
            />
          );
        }),
      )}
    </div>
  );
}

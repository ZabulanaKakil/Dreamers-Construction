/** Human-readable labels for inventory / reservation status badges. */
export const inventoryStatusLabels: Record<string, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
  upcoming: "Upcoming",
};

export function formatInventoryStatus(status: string): string {
  return inventoryStatusLabels[status] ?? titleCaseStatus(status);
}

export function formatProjectStatus(status: string): string {
  return titleCaseStatus(status);
}

export function formatPlotType(type: string): string {
  return titleCaseStatus(type);
}

function titleCaseStatus(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

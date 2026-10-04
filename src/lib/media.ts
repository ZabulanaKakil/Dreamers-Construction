export type MediaReference = {
  label: string;
  url: string;
};

export function normalizeImages(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
}

export function normalizeReferences(value: unknown): MediaReference[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const label = String((item as { label?: unknown }).label ?? "").trim();
      const url = String((item as { url?: unknown }).url ?? "").trim();
      if (!label || !url) return null;
      return { label, url };
    })
    .filter((item): item is MediaReference => item !== null);
}

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Prefixes a /public file path with the GitHub Pages base path.
 * next/image and <img> do not add basePath to plain string sources.
 */
export function asset(src: string): string;
export function asset(src: string | null | undefined): string | undefined;
export function asset(src: string | null | undefined): string | undefined {
  if (!src) return undefined;
  if (/^(https?:|data:|blob:)/i.test(src) || !src.startsWith("/")) return src;
  if (BASE_PATH && (src === BASE_PATH || src.startsWith(`${BASE_PATH}/`))) return src;
  return `${BASE_PATH}${src}`;
}

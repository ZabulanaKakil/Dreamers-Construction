/**
 * Converts large photos in public/images to WebP (max 1920px wide) and removes
 * the originals. Paths in data/ can keep the .jpg/.png name — build-data
 * resolves them to the .webp file.
 *
 * maps/, brand/ and team/ are left as-is: their file names are referenced
 * directly from code.
 */
import { readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const IMAGES_DIR = path.join(ROOT, "public", "images");
const SKIP_DIRS = new Set(["maps", "brand", "team"].map((d) => path.join(IMAGES_DIR, d)));
const MAX_WIDTH = 1920;
const MAX_BYTES = 350 * 1024;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(full)) yield* walk(full);
    } else if (/\.(jpe?g|png)$/i.test(entry.name)) {
      yield full;
    }
  }
}

let converted = 0;
let savedBytes = 0;

for await (const file of walk(IMAGES_DIR)) {
  const { size } = await stat(file);
  const meta = await sharp(file).metadata();
  if (size <= MAX_BYTES && (meta.width ?? 0) <= MAX_WIDTH) continue;

  const target = file.replace(/\.(jpe?g|png)$/i, ".webp");
  const info = await sharp(file)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toFile(target);
  await unlink(file);

  converted++;
  savedBytes += size - info.size;
  console.log(
    `  ${path.relative(ROOT, file)} → .webp (${Math.round(size / 1024)}KB → ${Math.round(info.size / 1024)}KB)`,
  );
}

console.log(
  converted === 0
    ? "optimize-images: nothing to convert"
    : `optimize-images: converted ${converted} image(s), saved ${(savedBytes / 1024 / 1024).toFixed(1)}MB`,
);

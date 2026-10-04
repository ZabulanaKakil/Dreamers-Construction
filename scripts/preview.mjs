/**
 * Serves the built out/ folder under the GitHub Pages base path, so the
 * exported site can be checked locally exactly as it will be published.
 *   npm run build && npm run preview  →  http://localhost:4173/Dreamers-Construction/
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "out");
const BASE = (process.env.PAGES_BASE_PATH ?? "/Dreamers-Construction").replace(/\/$/, "");
const PORT = Number(process.env.PORT ?? 4173);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

if (!existsSync(ROOT)) {
  console.error("out/ not found — run `npm run build` first.");
  process.exit(1);
}

function resolveFile(urlPath) {
  const candidate = path.join(ROOT, decodeURIComponent(urlPath));
  if (!candidate.startsWith(ROOT)) return null;
  if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  const index = path.join(candidate, "index.html");
  if (existsSync(index)) return index;
  return null;
}

createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://localhost");
  if (url.pathname === "/" && BASE) {
    res.writeHead(302, { Location: `${BASE}/` }).end();
    return;
  }
  if (BASE && !url.pathname.startsWith(`${BASE}/`) && url.pathname !== BASE) {
    res.writeHead(404).end("Not under base path");
    return;
  }
  const file = resolveFile(url.pathname.slice(BASE.length) || "/");
  if (!file) {
    res.writeHead(404, { "Content-Type": TYPES[".html"] });
    createReadStream(path.join(ROOT, "404.html")).pipe(res);
    return;
  }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream" });
  createReadStream(file).pipe(res);
}).listen(PORT, () => {
  console.log(`Preview: http://localhost:${PORT}${BASE}/`);
});

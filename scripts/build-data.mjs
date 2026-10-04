/**
 * Turns the editable files in data/ (projects.csv + JSON) into
 * src/data/generated/*.json, which the site imports at build time.
 *
 * Runs automatically before `npm run dev` and `npm run build`.
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = path.join(ROOT, "data");
const PUBLIC_DIR = path.join(ROOT, "public");
const OUT_DIR = path.join(ROOT, "src", "data", "generated");

const STATUSES = new Set(["completed", "ongoing", "upcoming"]);
const PORTFOLIOS = new Set(["construction", "residences"]);
const RELATION_ROLES = new Set([
  "interior_of",
  "exterior_of",
  "landscaping_of",
  "design_for",
  "commercial_of",
  "other",
]);
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const errors = [];
const warnings = [];

/** RFC 4180 parser — handles quoted cells, embedded newlines and "" escapes. */
function parseCsv(text) {
  const firstLine = text.slice(0, text.search(/\r?\n|$/));
  const delimiter =
    (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";

  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') inQuotes = true;
    else if (ch === delimiter) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function list(cell) {
  return cell
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);
}

function bool(cell, fallback, where) {
  const v = cell.trim().toLowerCase();
  if (v === "") return fallback;
  if (["yes", "y", "true", "1"].includes(v)) return true;
  if (["no", "n", "false", "0"].includes(v)) return false;
  errors.push(`${where}: expected yes or no, got "${cell}"`);
  return fallback;
}

function num(cell, where) {
  const v = cell.trim().replace(",", ".");
  if (v === "") return null;
  const n = Number(v);
  if (Number.isFinite(n)) return n;
  errors.push(`${where}: expected a number, got "${cell}"`);
  return null;
}

function text(cell) {
  const v = cell.trim();
  return v === "" ? null : v;
}

/**
 * Keeps an image path only when the file is in public/. Large photos are
 * converted to .webp by optimize-images, so a missing .jpg/.png falls back to
 * its .webp sibling.
 */
function resolveImage(src, where) {
  if (!src) return null;
  if (/^(https?:|data:)/i.test(src)) return src;
  const clean = src.startsWith("/") ? src : `/${src}`;
  const onDisk = (p) => existsSync(path.join(PUBLIC_DIR, decodeURI(p)));
  if (onDisk(clean)) return clean;
  const webp = clean.replace(/\.(jpe?g|png)$/i, ".webp");
  if (webp !== clean && onDisk(webp)) return webp;
  warnings.push(`${where}: image not found in public/ — ${src}`);
  return null;
}

function resolveImages(list, where) {
  return (list ?? []).map((src) => resolveImage(src, where)).filter(Boolean);
}

async function readJson(name, fallback) {
  const file = path.join(DATA_DIR, name);
  if (!existsSync(file)) {
    warnings.push(`data/${name} not found — using an empty list`);
    return fallback;
  }
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (err) {
    errors.push(`data/${name}: invalid JSON (${err.message})`);
    return fallback;
  }
}

async function buildProjects(serviceIds) {
  const file = path.join(DATA_DIR, "projects.csv");
  const raw = (await readFile(file, "utf8")).replace(/^\uFEFF/, "");
  const [header = [], ...body] = parseCsv(raw);
  const cols = header.map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));

  for (const required of ["slug", "name", "status"]) {
    if (!cols.includes(required)) errors.push(`projects.csv: missing column "${required}"`);
  }

  const seen = new Set();
  const projects = [];

  body.forEach((cells, index) => {
    if (cells.every((c) => c.trim() === "")) return;
    const line = index + 2;
    const get = (col) => {
      const i = cols.indexOf(col);
      return i === -1 ? "" : (cells[i] ?? "");
    };
    const where = (col) => `projects.csv line ${line}${col ? ` (${col})` : ""}`;

    const slug = get("slug").trim();
    const name = get("name").trim();
    if (!slug) return errors.push(`${where("slug")}: slug is required`);
    if (!SLUG_RE.test(slug)) {
      errors.push(`${where("slug")}: "${slug}" must be lowercase letters, numbers and dashes`);
    }
    if (seen.has(slug)) errors.push(`${where("slug")}: duplicate slug "${slug}"`);
    seen.add(slug);
    if (!name) errors.push(`${where("name")}: name is required`);

    const status = get("status").trim().toLowerCase() || "completed";
    if (!STATUSES.has(status)) {
      errors.push(`${where("status")}: must be completed, ongoing or upcoming (got "${status}")`);
    }

    const services = list(get("services"));
    for (const id of services) {
      if (!serviceIds.has(id)) warnings.push(`${where("services")}: unknown service id "${id}"`);
    }

    const portfolio = get("portfolio").trim().toLowerCase() || null;
    if (portfolio && !PORTFOLIOS.has(portfolio)) {
      errors.push(`${where("portfolio")}: must be construction or residences`);
    }

    const specs = list(get("specs")).map((pair) => {
      const at = pair.indexOf(":");
      return at === -1
        ? { label: pair, value: "" }
        : { label: pair.slice(0, at).trim(), value: pair.slice(at + 1).trim() };
    });

    const relatedProjects = list(get("related")).map((pair) => {
      const [relSlug, role = "other"] = pair.split(":").map((s) => s.trim());
      if (!RELATION_ROLES.has(role)) {
        warnings.push(`${where("related")}: unknown role "${role}" — using "other"`);
      }
      return { slug: relSlug, role: RELATION_ROLES.has(role) ? role : "other" };
    });

    projects.push({
      slug,
      name,
      client: get("client").trim(),
      location: get("location").trim(),
      status,
      serviceIds: services,
      featured: bool(get("featured"), false, where("featured")),
      published: bool(get("published"), true, where("published")),
      summary: get("summary").trim(),
      description: get("description").trim(),
      images: resolveImages(list(get("images")), where("images")),
      specs,
      lat: num(get("lat"), where("lat")),
      lng: num(get("lng"), where("lng")),
      mapsUrl: text(get("maps_url")),
      mapKind: text(get("map_kind")),
      shortLabel: text(get("short_label")),
      mapRegionIds: list(get("map_regions")),
      portfolio,
      parentProjectSlug: text(get("parent")),
      relatedProjects,
      sectorX: num(get("sector_x"), where("sector_x")),
      sectorY: num(get("sector_y"), where("sector_y")),
      sectorWidth: num(get("sector_width"), where("sector_width")),
      sectorHeight: num(get("sector_height"), where("sector_height")),
    });
  });

  for (const p of projects) {
    if (p.parentProjectSlug && !seen.has(p.parentProjectSlug)) {
      warnings.push(`${p.slug}: parent "${p.parentProjectSlug}" is not in projects.csv`);
    }
    for (const rel of p.relatedProjects) {
      if (!seen.has(rel.slug)) warnings.push(`${p.slug}: related "${rel.slug}" is not in projects.csv`);
    }
  }

  return projects;
}

async function main() {
  const services = (await readJson("services.json", [])).map((s) => ({
    ...s,
    image: resolveImage(s.image, `services.json (${s.id})`) ?? undefined,
  }));
  const serviceIds = new Set(services.map((s) => s.id));

  const projects = await buildProjects(serviceIds);

  const buildings = (await readJson("buildings.json", [])).map((b) => {
    const images = resolveImages(b.images, `buildings.json (${b.slug})`);
    return {
      ...b,
      images,
      imageUrl: resolveImage(b.imageUrl, `buildings.json (${b.slug})`) ?? images[0] ?? null,
    };
  });
  const plots = (await readJson("plots.json", [])).map((p) => ({
    ...p,
    images: resolveImages(p.images, `plots.json (${p.id})`),
  }));
  const sectorPlots = await readJson("sector-plots.json", []);
  const partners = await readJson("partners.json", []);

  for (const w of warnings) console.warn(`  warning  ${w}`);
  if (errors.length > 0) {
    for (const e of errors) console.error(`  error    ${e}`);
    console.error(`\nbuild-data: ${errors.length} error(s) — fix data/ and run again.`);
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });
  const write = (name, value) =>
    writeFile(path.join(OUT_DIR, name), `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await Promise.all([
    write("projects.json", projects),
    write("services.json", services),
    write("buildings.json", buildings),
    write("plots.json", plots),
    write("sector-plots.json", sectorPlots),
    write("partners.json", partners),
  ]);

  console.log(
    `build-data: ${projects.length} projects, ${services.length} services, ` +
      `${buildings.length} buildings, ${plots.length} plots → src/data/generated/`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * Next's static export writes segment prefetch payloads as nested folders
 * (`__next.projects/$d$slug/__PAGE__.txt`) while the client router requests
 * dotted flat names (`__next.projects.$d$slug.__PAGE__.txt`). Static hosts
 * cannot map one to the other, so copy every nested payload to its flat name.
 */
import { copyFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "out");
let copied = 0;

function flattenInto(dir, segmentDir, prefix) {
  for (const entry of readdirSync(segmentDir, { withFileTypes: true })) {
    const full = path.join(segmentDir, entry.name);
    if (entry.isDirectory()) {
      flattenInto(dir, full, `${prefix}.${entry.name}`);
    } else if (entry.name.endsWith(".txt")) {
      const target = path.join(dir, `${prefix}.${entry.name}`);
      if (!existsSync(target)) {
        copyFileSync(full, target);
        copied++;
      }
    }
  }
}

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    if (entry.name.startsWith("__next.")) flattenInto(dir, full, entry.name);
    else if (entry.name !== "_next") walk(full);
  }
}

if (!existsSync(OUT)) {
  console.error("flatten-rsc: out/ not found");
  process.exit(1);
}
walk(OUT);
console.log(`flatten-rsc: ${copied} prefetch payloads copied`);

// Scans the design image folders in /public and writes data/designs.json.
// Run `npm run catalog` after adding or removing design images.
// The generated file is committed so pages can be statically generated and
// the order API can validate designs without reading the filesystem at runtime.
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "data", "designs.json");

// folder in /public → collection definition (labels are customer-facing Serbian)
const SOURCES = [
  { category: "tapete", collection: "decije", folder: "tapete/decije", label: "Dečije tapete", singular: "Dečija tapeta", slugBase: "decija-tapeta" },
  { category: "tapete", collection: "cvetne", folder: "tapete/cvetne", label: "Cvetne tapete", singular: "Cvetna tapeta", slugBase: "cvetna-tapeta" },
  { category: "tapete", collection: "3d", folder: "tapete/3d", label: "3D tapete", singular: "3D tapeta", slugBase: "3d-tapeta" },
  { category: "tapete", collection: "grad", folder: "tapete/grad", label: "Gradske tapete", singular: "Gradska tapeta", slugBase: "gradska-tapeta" },
  { category: "tapete", collection: "mermer", folder: "tapete/mermer", label: "Mermerne tapete", singular: "Mermerna tapeta", slugBase: "mermerna-tapeta" },
  { category: "zidni-stikeri", collection: "decije", folder: "stikeri/decije", label: "Dečiji stikeri", singular: "Dečiji stiker", slugBase: "deciji-stiker" },
  { category: "zidni-stikeri", collection: "soba", folder: "stikeri/soba", label: "Stikeri za sobu", singular: "Stiker za sobu", slugBase: "stiker-za-sobu" },
  { category: "slike-na-platnu", collection: "motivi", folder: "slike-na-platnu", label: "Motivi", singular: "Motiv", slugBase: "motiv" },
];

const IMAGE_EXT = /\.(webp|jpe?g|png)$/i;
const pad = (n) => String(n).padStart(2, "0");

async function describe(file) {
  const image = sharp(file);
  const [{ width, height }, stats] = await Promise.all([image.metadata(), image.stats()]);
  const { r, g, b } = stats.dominant;
  const hex = "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
  return { width, height, color: hex };
}

const designs = [];
for (const source of SOURCES) {
  const dir = path.join(ROOT, "public", source.folder);
  const files = fs
    .readdirSync(dir)
    .filter((f) => IMAGE_EXT.test(f))
    .map((f) => ({ file: f, number: Number(f.match(/(\d+)\.[a-z]+$/i)?.[1]) || 0 })) // trailing file number; "3Dtapete12" → 12
    .sort((a, b) => a.number - b.number);

  for (const { file, number } of files) {
    const meta = await describe(path.join(dir, file));
    // Optimized images are cached for a month by URL, so a replaced file gets a new URL.
    const version = createHash("sha1").update(fs.readFileSync(path.join(dir, file))).digest("hex").slice(0, 8);
    designs.push({
      id: `${source.category}/${source.collection}/${source.slugBase}-${pad(number)}`,
      category: source.category,
      collection: source.collection,
      slug: `${source.slugBase}-${pad(number)}`,
      name: `${source.singular} ${pad(number)}`,
      src: `/${source.folder}/${file}?v=${version}`,
      ...meta,
    });
  }
}

const collections = SOURCES.map(({ category, collection, label, singular }) => ({
  category,
  slug: collection,
  label,
  singular,
  count: designs.filter((d) => d.category === category && d.collection === collection).length,
}));

fs.writeFileSync(OUT, JSON.stringify({ collections, designs }, null, 2) + "\n");
console.log(`Wrote ${designs.length} designs in ${collections.length} collections to ${path.relative(ROOT, OUT)}`);

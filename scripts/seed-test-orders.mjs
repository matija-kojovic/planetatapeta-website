// Adds clearly fake orders to data/database/orders.json so the admin can be
// tried with data. Local development only; the file is git-ignored.
// Run: npm run seed:orders            (adds 8 orders)
//      npm run seed:orders -- 20      (adds 20)
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { buildOrderItems } from "../lib/orders.js";
import { ORDER_STATUSES } from "../lib/db.js";

if (process.env.NODE_ENV === "production") {
  console.error("Refusing to add test orders in production.");
  process.exit(1);
}

const FILE = path.join(process.cwd(), "data", "database", "orders.json");
const count = Math.max(1, Math.min(100, Number(process.argv[2]) || 8));

const CUSTOMERS = [
  ["Ana Testić", "Beograd", "11000"],
  ["Marko Primerović", "Novi Sad", "21000"],
  ["Jelena Probić", "Niš", "18000"],
  ["Nikola Uzorak", "Kragujevac", "34000"],
  ["Milica Demo", "Beograd", "11070"],
  ["Stefan Testni", "Subotica", "24000"],
];

// Valid configurations for every product type; prices come from lib/pricing.js.
const CARTS = [
  [{ category: "tapete", designId: "tapete/cvetne/cvetna-tapeta-09", options: { material: "klasik", width: 300, height: 240, installation: false }, quantity: 1 }],
  [{ category: "tapete", designId: "tapete/mermer/mermerna-tapeta-12", options: { material: "reljefne", width: 420, height: 260, installation: true }, quantity: 1 }],
  [{ category: "zidni-stikeri", designId: "zidni-stikeri/soba/stiker-za-sobu-01", options: { material: "laminirana", width: 120, height: 80, contourCut: true }, quantity: 2 }],
  [{ category: "slike-na-platnu", designId: "slike-na-platnu/motivi/motiv-03", options: { layout: "5", size: "medium", edge: "mirror" }, quantity: 1 }],
  [
    { category: "slike-na-platnu", designId: "slike-na-platnu/motivi/motiv-07", options: { layout: "1", size: "custom", width: 80, height: 60, edge: "black" }, quantity: 1 },
    { category: "tapete", designId: "tapete/decije/decija-tapeta-01", options: { material: "samolepljive", width: 250, height: 240, installation: false }, quantity: 1 },
  ],
  [{ category: "slike-na-pleksiglasu", options: { size: "105x117", note: "Porodična fotografija, poslaću je e-poštom." }, quantity: 1 }],
  [{ category: "izrada-nalepnica", options: { width: 5, height: 5, material: "bela-mat", cut: "konturno", packaging: "pojedinacno", design: "imam", speed: "normalna", pieces: 300, note: "" }, quantity: 1 }],
  [{ category: "tapete", designId: "tapete/3d/3d-tapeta-05", options: { material: "klasik", width: 180, height: 250, installation: true }, quantity: 1 }],
];

const NOTES = ["", "Molim poziv pre dostave.", "", "Zid je blago zakrivljen, da li je to problem?", ""];

let existing = [];
try {
  existing = JSON.parse(fs.readFileSync(FILE, "utf-8"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const taken = new Set(existing.map((o) => o.id));
const newId = () => {
  let id;
  do id = `PS-${crypto.randomInt(100000, 1000000)}`;
  while (taken.has(id));
  taken.add(id);
  return id;
};

const now = Date.now();
const orders = Array.from({ length: count }, (_, i) => {
  const cart = buildOrderItems(CARTS[i % CARTS.length]);
  if (!cart.ok) throw new Error(`Test cart ${i % CARTS.length} is invalid: ${JSON.stringify(cart.errors)}`);
  const [name, city, zip] = CUSTOMERS[i % CUSTOMERS.length];
  const slug = name.toLowerCase().normalize("NFD").replace(/[^a-z ]/g, "").replace(" ", ".");
  return {
    id: newId(),
    // Spread over the last three weeks, newest first; older orders are further along.
    createdAt: new Date(now - i * 2.6 * 24 * 3600 * 1000 - i * 3_100_000).toISOString(),
    status: ORDER_STATUSES[Math.min(ORDER_STATUSES.length - 1, Math.floor(i / 2))],
    customer: {
      ime_prezime: name,
      email: `${slug}@example.com`,
      telefon: `060 000 00${String(10 + i).slice(-2)}`,
      adresa: `Testna ulica ${i + 1}`,
      grad: city,
      postanski_broj: zip,
      napomena: NOTES[i % NOTES.length],
    },
    items: cart.items,
    total: cart.total,
    test: true,
  };
});

fs.mkdirSync(path.dirname(FILE), { recursive: true });
const all = [...orders, ...existing].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
fs.writeFileSync(FILE, JSON.stringify(all, null, 2));
console.log(`Added ${orders.length} test orders (${all.length} in total) to data/database/orders.json.`);

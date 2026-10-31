// File-based storage for site content, fixed-price products and orders.
//
// Data lives in data/database/*.json. This works on a single server with a
// writable disk (local development, a VPS). On Vercel the deployment
// filesystem is read-only, so writes fail with StorageUnavailableError —
// callers handle that explicitly instead of crashing. A persistent store
// (database or blob storage) is required before admin edits and order
// history can work on Vercel; see README.
import "server-only";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const DB_DIR = path.join(process.cwd(), "data", "database");
const FILES = {
  orders: path.join(DB_DIR, "orders.json"),
  products: path.join(DB_DIR, "products.json"),
  content: path.join(DB_DIR, "content.json"),
};

/** False on read-only deployments (e.g. Vercel), where admin edits cannot be saved. */
export function isStorageWritable() {
  try {
    fs.accessSync(DB_DIR, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

export class StorageUnavailableError extends Error {
  constructor(cause) {
    super("Storage is not writable on this server");
    this.name = "StorageUnavailableError";
    this.cause = cause;
  }
}

export const DEFAULT_CONTENT = {
  hero: {
    title: "Tapete i slike, štampane po meri vašeg zida",
    subtitle:
      "Izaberite dizajn, unesite dimenzije i odmah vidite cenu. Štampamo foto tapete, zidne stikere i slike na platnu i pleksiglasu.",
    buttonText: "Pogledajte tapete",
  },
  header: { announcement: "" },
  contact: {
    address: "Božice Divnić 10",
    city: "Beograd",
    zip: "11080",
    email: "djoletodorovic20@gmail.com",
    phone: "+381 62 814 8444",
    instagram: "https://www.instagram.com/planetatapeta/",
  },
  seo: {
    title: "PLANETATAPETA — foto tapete, zidni stikeri i slike po meri",
    description:
      "Foto tapete po meri zida, zidni stikeri, slike na platnu i pleksiglasu i izrada nalepnica. Izaberite dizajn, unesite dimenzije i poručite online.",
  },
};

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch (error) {
    if (error.code !== "ENOENT") console.error(`Could not read ${path.basename(file)}:`, error.message);
    return fallback;
  }
}

/** Writes atomically (temp file + rename) so a crash never leaves half-written JSON. */
function writeJson(file, data) {
  try {
    fs.mkdirSync(DB_DIR, { recursive: true });
    const tmp = `${file}.${crypto.randomBytes(4).toString("hex")}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
    fs.renameSync(tmp, file);
  } catch (error) {
    if (["EROFS", "EACCES", "EPERM", "ENOENT"].includes(error.code)) throw new StorageUnavailableError(error);
    throw error;
  }
}

// ── Content ──────────────────────────────────────────────────────────────────

/** Site content merged over defaults, so missing or legacy fields never break rendering. */
export function getContent() {
  const stored = readJson(FILES.content, {});
  // Older content files stored the headline in two parts.
  const legacyTitle = [stored.hero?.titleLine1, stored.hero?.titleLine2].filter(Boolean).join(" ");
  return {
    hero: { ...DEFAULT_CONTENT.hero, ...(legacyTitle ? { title: legacyTitle } : {}), ...pick(stored.hero, ["title", "subtitle", "buttonText"]) },
    header: { ...DEFAULT_CONTENT.header, ...pick(stored.header, ["announcement"]) },
    contact: { ...DEFAULT_CONTENT.contact, ...pick(stored.contact, Object.keys(DEFAULT_CONTENT.contact)) },
    seo: { ...DEFAULT_CONTENT.seo, ...pick(stored.seo, ["title", "description"]) },
  };
}

export function saveContent(content) {
  writeJson(FILES.content, content);
  return content;
}

function pick(source, keys) {
  const out = {};
  if (!source || typeof source !== "object") return out;
  for (const key of keys) if (typeof source[key] === "string" && source[key].trim() !== "") out[key] = source[key];
  return out;
}

// ── Fixed-price products (managed in the admin) ──────────────────────────────

export const getProducts = () => {
  const products = readJson(FILES.products, []);
  return Array.isArray(products) ? products : [];
};

export const getProduct = (id) => getProducts().find((p) => p.id === id) || null;

export function saveProducts(products) {
  writeJson(FILES.products, products);
}

// ── Orders ───────────────────────────────────────────────────────────────────

export const getOrders = () => {
  const orders = readJson(FILES.orders, []);
  return Array.isArray(orders) ? orders : [];
};

function newOrderId(existing) {
  const taken = new Set(existing.map((o) => o.id));
  let id;
  do id = `PS-${crypto.randomInt(100000, 1000000)}`;
  while (taken.has(id));
  return id;
}

/** Creates the order record. Persisting may fail with StorageUnavailableError; the record is still returned. */
export function createOrder(order) {
  const orders = getOrders();
  const record = { id: newOrderId(orders), createdAt: new Date().toISOString(), status: "U obradi", ...order };
  let persisted = true;
  try {
    writeJson(FILES.orders, [record, ...orders]);
  } catch (error) {
    if (!(error instanceof StorageUnavailableError)) throw error;
    persisted = false;
  }
  return { order: record, persisted };
}

export const ORDER_STATUSES = ["U obradi", "U štampi", "Poslato", "Isporučeno"];

export function updateOrderStatus(id, status) {
  const orders = getOrders();
  const order = orders.find((o) => o.id === id);
  if (!order) return null;
  order.status = status;
  writeJson(FILES.orders, orders);
  return order;
}

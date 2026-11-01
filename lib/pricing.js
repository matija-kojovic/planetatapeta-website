// Authoritative pricing rules and option validation.
//
// This module is the single source of truth for prices. It is imported by the
// configurators (to show live prices), the cart, and the order API (which
// recalculates every price on the server and ignores anything the browser sends).
// It must stay free of server-only imports so it can run in the browser.
//
// Rates and options are taken unchanged from the original configurators.
// Values marked ASSUMPTION did not exist in the original code (it accepted any
// size, including 0) and need confirmation from the business.

import { formatArea, formatRSD } from "./format.js";

export const PRICING = {
  tapete: {
    materials: [
      { id: "klasik", label: "Klasik", pricePerM2: 700 },
      { id: "samolepljive", label: "Samolepljiva", pricePerM2: 900 },
      { id: "reljefne", label: "Reljefna", pricePerM2: 1100 },
    ],
    installation: { pricePerM2: 500, smallJobBelowM2: 20, smallJobFee: 2000 },
    limits: { width: { min: 50, max: 1500 }, height: { min: 50, max: 600 } }, // ASSUMPTION
    defaults: { material: "klasik", width: 300, height: 240, installation: false },
  },
  "zidni-stikeri": {
    materials: [
      { id: "standard", label: "Standardna folija", pricePerM2: 1500 },
      { id: "laminirana", label: "Laminirana folija", pricePerM2: 2200 },
      { id: "premium", label: "Easy-Apply folija", pricePerM2: 2800 },
    ],
    contourCut: { pricePerM2: 400 },
    minimumPrice: 1000,
    limits: { width: { min: 10, max: 300 }, height: { min: 10, max: 300 } }, // stated on the original page
    defaults: { material: "standard", width: 100, height: 100, contourCut: true },
  },
  "slike-na-platnu": {
    layouts: [
      {
        id: "1",
        label: "Jednodelna",
        panels: 1,
        presets: [
          { id: "small", width: 50, height: 40, price: 2900 },
          { id: "medium", width: 70, height: 50, price: 3900 },
          { id: "large", width: 100, height: 70, price: 5400 },
        ],
        custom: { pricePerM2: 5000, base: 1500 },
      },
      {
        id: "3",
        label: "Trodelna",
        panels: 3,
        presets: [
          { id: "small", width: 90, height: 60, price: 5800 },
          { id: "medium", width: 120, height: 80, price: 7900 },
          { id: "large", width: 150, height: 100, price: 10800 },
        ],
        custom: { pricePerM2: 6500, base: 2500 },
      },
      {
        id: "5",
        label: "Petodelna, kaskadna",
        panels: 5,
        presets: [
          { id: "small", width: 100, height: 60, price: 6900 },
          { id: "medium", width: 150, height: 80, price: 9200 },
          { id: "large", width: 200, height: 100, price: 12500 },
        ],
        custom: { pricePerM2: 7000, base: 3500 },
      },
    ],
    edges: [
      { id: "mirror", label: "Ogledalo ivica", hint: "Slika se preslikava na bočne strane rama. Preporučeno." },
      { id: "black", label: "Crna ivica" },
      { id: "white", label: "Bela ivica" },
    ],
    frame: "Drveni blind ram, 2 cm",
    customRoundTo: 100,
    customLimits: { width: { min: 30, max: 300 }, height: { min: 20, max: 200 } }, // ASSUMPTION
    defaults: { layout: "5", size: "medium", width: 150, height: 80, edge: "mirror" },
  },
  "slike-na-pleksiglasu": {
    sizes: [
      { id: "90x100", width: 90, height: 100, price: 8260 },
      { id: "105x117", width: 105, height: 117, price: 10500 },
      { id: "120x134", width: 120, height: 134, price: 12800 },
    ],
    defaults: { size: "90x100", note: "" },
  },
  "izrada-nalepnica": {
    pricePerCm2: 0.35, // marked as provisional ("fiktivna") in the original code — confirm
    materials: [
      { id: "bela-mat", label: "Bela mat" },
      { id: "bela-sjaj", label: "Bela sjaj" },
      { id: "providna", label: "Providna" },
    ],
    cuts: [
      { id: "konturno", label: "Konturno opsecanje" },
      { id: "na-meru", label: "Pravougaono, na meru" },
    ],
    packaging: [
      { id: "tabak", label: "Na tabaku", pricePerPiece: 0 },
      { id: "pojedinacno", label: "Pojedinačno", pricePerPiece: 2 },
    ],
    design: [
      { id: "imam", label: "Imam svoj dizajn" },
      { id: "izrada", label: "Potrebna mi je pomoć oko dizajna" },
    ],
    speed: [
      { id: "normalna", label: "Normalna izrada, 7 radnih dana" },
      { id: "hitna", label: "Hitna izrada, 2 radna dana" },
    ],
    quantities: [50, 100, 300, 500, 1000],
    customQuantity: { min: 50, max: 10000 }, // ASSUMPTION: original "Proizvoljna količina" option did nothing
    limits: { width: { min: 1, max: 100 }, height: { min: 1, max: 100 } }, // ASSUMPTION
    defaults: {
      width: 5,
      height: 5,
      material: "bela-mat",
      cut: "konturno",
      packaging: "tabak",
      design: "imam",
      speed: "normalna",
      pieces: 100,
      note: "",
    },
  },
};

export const CART_QUANTITY = { min: 1, max: 99 };
export const NOTE_MAX_LENGTH = 500;

const byId = (list, id) => list.find((entry) => entry.id === id);
// Non-breaking spaces keep a measurement such as "150 × 80 cm" on one line.
const sizeLabel = (w, h) => `${w}\u00a0×\u00a0${h}\u00a0cm`;

// Serbian needs the accusative ("unesite širinu") and the nominative ("širina mora biti").
const DIMENSION_LABELS = { širinu: "širina", visinu: "visina" };

/** Parse a whole number of centimetres; returns an error message or the value. */
function readDimension(value, { min, max }, label) {
  const n = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  if (typeof n !== "number" || !Number.isFinite(n)) return { error: `Unesite ${label} u centimetrima.` };
  if (!Number.isInteger(n)) return { error: `${capitalize(label)} unesite u celim centimetrima.` };
  if (n < min || n > max) return { error: `${capitalize(DIMENSION_LABELS[label] || label)} mora biti između ${min} i ${max} cm.` };
  return { value: n };
}

function readChoice(value, list, message) {
  return byId(list, value) ? { value } : { error: message };
}

function readNote(value) {
  if (value == null || value === "") return { value: "" };
  if (typeof value !== "string") return { error: "Napomena nije ispravna." };
  const trimmed = value.trim();
  if (trimmed.length > NOTE_MAX_LENGTH) return { error: `Napomena može imati najviše ${NOTE_MAX_LENGTH} znakova.` };
  return { value: trimmed };
}

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** Collects {field: value|error} readers into { ok, options, errors }. */
function collect(readers) {
  const options = {};
  const errors = {};
  for (const [field, result] of Object.entries(readers)) {
    if (result.error) errors[field] = result.error;
    else options[field] = result.value;
  }
  return { ok: Object.keys(errors).length === 0, options, errors };
}

/**
 * Validates and normalises the configuration for a product category.
 * Unknown fields are dropped. Returns { ok, options, errors }.
 */
export function validateOptions(category, raw = {}) {
  const input = raw && typeof raw === "object" ? raw : {};
  const rules = PRICING[category];
  if (!rules) return { ok: false, options: {}, errors: { category: "Nepoznata vrsta proizvoda." } };

  switch (category) {
    case "tapete":
      return collect({
        material: readChoice(input.material, rules.materials, "Izaberite vrstu materijala."),
        width: readDimension(input.width, rules.limits.width, "širinu"),
        height: readDimension(input.height, rules.limits.height, "visinu"),
        installation: { value: input.installation === true },
      });

    case "zidni-stikeri":
      return collect({
        material: readChoice(input.material, rules.materials, "Izaberite vrstu folije."),
        width: readDimension(input.width, rules.limits.width, "širinu"),
        height: readDimension(input.height, rules.limits.height, "visinu"),
        contourCut: { value: input.contourCut === true },
      });

    case "slike-na-platnu": {
      const layout = byId(rules.layouts, input.layout);
      const readers = {
        layout: layout ? { value: layout.id } : { error: "Izaberite raspored." },
        edge: readChoice(input.edge, rules.edges, "Izaberite stil ivice."),
      };
      if (input.size === "custom") {
        readers.size = { value: "custom" };
        readers.width = readDimension(input.width, rules.customLimits.width, "širinu");
        readers.height = readDimension(input.height, rules.customLimits.height, "visinu");
      } else if (layout && byId(layout.presets, input.size)) {
        readers.size = { value: input.size };
      } else {
        readers.size = { error: "Izaberite dimenzije." };
      }
      return collect(readers);
    }

    case "slike-na-pleksiglasu":
      return collect({
        size: readChoice(input.size, rules.sizes, "Izaberite dimenzije."),
        note: readNote(input.note),
      });

    case "izrada-nalepnica": {
      const pieces = Number(input.pieces);
      const piecesOk =
        Number.isInteger(pieces) &&
        (rules.quantities.includes(pieces) ||
          (pieces >= rules.customQuantity.min && pieces <= rules.customQuantity.max));
      return collect({
        width: readDimension(input.width, rules.limits.width, "širinu"),
        height: readDimension(input.height, rules.limits.height, "visinu"),
        material: readChoice(input.material, rules.materials, "Izaberite materijal."),
        cut: readChoice(input.cut, rules.cuts, "Izaberite vrstu sečenja."),
        packaging: readChoice(input.packaging, rules.packaging, "Izaberite pakovanje."),
        design: readChoice(input.design, rules.design, "Izaberite opciju za dizajn."),
        speed: readChoice(input.speed, rules.speed, "Izaberite brzinu izrade."),
        pieces: piecesOk
          ? { value: pieces }
          : {
              error: `Količina mora biti ceo broj između ${rules.customQuantity.min} i ${rules.customQuantity.max}.`,
            },
        note: readNote(input.note),
      });
    }
    default:
      return { ok: false, options: {}, errors: { category: "Nepoznata vrsta proizvoda." } };
  }
}

/** Canvas: resolves the total width/height for the chosen layout and size. */
export function canvasDimensions(options) {
  const layout = byId(PRICING["slike-na-platnu"].layouts, options.layout);
  if (options.size === "custom") return { width: options.width, height: options.height };
  const preset = layout && byId(layout.presets, options.size);
  return preset ? { width: preset.width, height: preset.height } : { width: 0, height: 0 };
}

/**
 * Calculates the price of ONE configured item from already validated options.
 * Returns { total, lines: [{ label, amount }] } — total equals the sum of lines.
 */
export function calculatePrice(category, options) {
  const rules = PRICING[category];
  const lines = [];

  switch (category) {
    case "tapete": {
      const material = byId(rules.materials, options.material);
      const area = (options.width * options.height) / 10000;
      lines.push({ label: `${material.label}, ${formatArea(area)} × ${formatRSD(material.pricePerM2)}/m²`, amount: Math.round(area * material.pricePerM2) });
      if (options.installation) {
        const { pricePerM2, smallJobBelowM2, smallJobFee } = rules.installation;
        lines.push({ label: `Ugradnja, ${formatArea(area)} × ${formatRSD(pricePerM2)}/m²`, amount: Math.round(area * pricePerM2) });
        if (area < smallJobBelowM2) lines.push({ label: `Izlazak na teren, za površinu manju od ${smallJobBelowM2} m²`, amount: smallJobFee });
      }
      break;
    }
    case "zidni-stikeri": {
      const material = byId(rules.materials, options.material);
      const area = (options.width * options.height) / 10000;
      lines.push({ label: `${material.label}, ${formatArea(area)} × ${formatRSD(material.pricePerM2)}/m²`, amount: Math.round(area * material.pricePerM2) });
      if (options.contourCut) {
        lines.push({ label: `Konturno sečenje, ${formatRSD(rules.contourCut.pricePerM2)}/m²`, amount: Math.round(area * rules.contourCut.pricePerM2) });
      }
      const subtotal = lines.reduce((sum, l) => sum + l.amount, 0);
      if (subtotal < rules.minimumPrice) {
        lines.push({ label: `Doplata do minimalne cene od ${formatRSD(rules.minimumPrice)}`, amount: rules.minimumPrice - subtotal });
      }
      break;
    }
    case "slike-na-platnu": {
      const layout = byId(rules.layouts, options.layout);
      if (options.size === "custom") {
        const area = (options.width * options.height) / 10000;
        const raw = area * layout.custom.pricePerM2 + layout.custom.base;
        const rounded = Math.round(raw / rules.customRoundTo) * rules.customRoundTo;
        lines.push({ label: `${layout.label} slika, ${sizeLabel(options.width, options.height)}, po meri`, amount: rounded });
      } else {
        const preset = byId(layout.presets, options.size);
        lines.push({ label: `${layout.label} slika, ${sizeLabel(preset.width, preset.height)}`, amount: preset.price });
      }
      break;
    }
    case "slike-na-pleksiglasu": {
      const size = byId(rules.sizes, options.size);
      lines.push({ label: `Pleksiglas, ${sizeLabel(size.width, size.height)}`, amount: size.price });
      break;
    }
    case "izrada-nalepnica": {
      const areaCm2 = options.width * options.height;
      lines.push({
        label: `${options.pieces} kom × ${areaCm2} cm² × ${String(rules.pricePerCm2).replace(".", ",")} RSD/cm²`,
        amount: Math.round(areaCm2 * rules.pricePerCm2 * options.pieces),
      });
      const packaging = byId(rules.packaging, options.packaging);
      if (packaging.pricePerPiece > 0) {
        lines.push({ label: `Pojedinačno pakovanje, ${options.pieces} × ${formatRSD(packaging.pricePerPiece)}`, amount: packaging.pricePerPiece * options.pieces });
      }
      break;
    }
    default:
      throw new Error(`Unknown category: ${category}`);
  }

  return { total: lines.reduce((sum, l) => sum + l.amount, 0), lines };
}

/** Human-readable configuration lines for the cart, checkout and order e-mail. */
export function describeOptions(category, options) {
  const rules = PRICING[category];
  switch (category) {
    case "tapete":
      return [
        ["Materijal", byId(rules.materials, options.material).label],
        ["Dimenzije zida", sizeLabel(options.width, options.height)],
        ["Površina", formatArea((options.width * options.height) / 10000)],
        ["Ugradnja", options.installation ? "Da" : "Ne"],
      ];
    case "zidni-stikeri":
      return [
        ["Folija", byId(rules.materials, options.material).label],
        ["Dimenzije", sizeLabel(options.width, options.height)],
        ["Sečenje", options.contourCut ? "Konturno" : "Pravougaono"],
      ];
    case "slike-na-platnu": {
      const { width, height } = canvasDimensions(options);
      return [
        ["Raspored", byId(rules.layouts, options.layout).label],
        ["Ukupne dimenzije", sizeLabel(width, height)],
        ["Ivica", byId(rules.edges, options.edge).label],
        ["Ram", rules.frame],
      ];
    }
    case "slike-na-pleksiglasu": {
      const size = byId(rules.sizes, options.size);
      return [["Dimenzije", sizeLabel(size.width, size.height)], ...(options.note ? [["Napomena", options.note]] : [])];
    }
    case "izrada-nalepnica":
      return [
        ["Dimenzije nalepnice", sizeLabel(options.width, options.height)],
        ["Količina", `${options.pieces} kom`],
        ["Materijal", byId(rules.materials, options.material).label],
        ["Sečenje", byId(rules.cuts, options.cut).label],
        ["Pakovanje", byId(rules.packaging, options.packaging).label],
        ["Dizajn", byId(rules.design, options.design).label],
        ["Izrada", byId(rules.speed, options.speed).label],
        ...(options.note ? [["Napomena", options.note]] : []),
      ];
    default:
      return [];
  }
}

/** Short price teaser for listings, derived from the rules above ("od 700 RSD/m²"). */
export function priceTeaser(category) {
  const rules = PRICING[category];
  switch (category) {
    case "tapete":
    case "zidni-stikeri":
      return `od ${formatRSD(Math.min(...rules.materials.map((m) => m.pricePerM2)))}/m²`;
    case "slike-na-platnu":
      return `od ${formatRSD(Math.min(...rules.layouts.flatMap((l) => l.presets.map((p) => p.price))))}`;
    case "slike-na-pleksiglasu":
      return `od ${formatRSD(Math.min(...rules.sizes.map((s) => s.price)))}`;
    case "izrada-nalepnica":
      return `${String(rules.pricePerCm2).replace(".", ",")} RSD po cm²`;
    default:
      return "";
  }
}

/** Stable key so identical configurations merge into one cart line. */
export function configurationKey(category, ref, options) {
  const sorted = Object.keys(options)
    .sort()
    .map((k) => `${k}=${options[k]}`)
    .join("&");
  return `${category}|${ref || ""}|${sorted}`;
}

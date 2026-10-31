// Product catalog: categories, design collections and designs.
// Server-side module (imports the generated design list); client components
// receive the data they need as props.
import catalog from "../data/designs.json" with { type: "json" };

export const CATEGORIES = [
  {
    slug: "tapete",
    label: "Tapete",
    navLabel: "Tapete",
    hasDesigns: true,
    summary: "Foto tapete štampane po meri vašeg zida, u tri vrste materijala.",
    intro:
      "Izaberite dizajn, unesite širinu i visinu zida i odmah vidite cenu. Tapetu štampamo tačno po vašim merama, a ugradnju možete dodati uz porudžbinu.",
    collections: {
      decije: "Veseli motivi za dečije sobe: životinje, oblaci i crtani likovi.",
      cvetne: "Cvetni motivi koji unose toplinu u prostor.",
      "3d": "Dizajni koji daju iluziju dubine i prostora.",
      grad: "Gradski pejzaži i urbani motivi.",
      mermer: "Motivi mermera za miran, elegantan zid.",
    },
  },
  {
    slug: "zidni-stikeri",
    label: "Zidni stikeri",
    navLabel: "Zidni stikeri",
    hasDesigns: true,
    summary: "Dekorativni stikeri za zidove i staklo, sečeni po meri.",
    intro:
      "Stiker štampamo u dimenziji koju izaberete, od 10 do 300 cm, na jednoj od tri vrste folije. Konturno sečenje prati oblik motiva.",
    collections: {
      decije: "Veseli motivi za dečije sobe.",
      soba: "Stikeri za dnevnu sobu, spavaću sobu i druge prostore.",
    },
  },
  {
    slug: "slike-na-platnu",
    label: "Slike na platnu",
    navLabel: "Slike na platnu",
    hasDesigns: true,
    summary: "Jednodelne i višedelne slike na slikarskom platnu, na drvenom ramu.",
    intro:
      "Svaki motiv možete poručiti kao jednodelnu, trodelnu ili petodelnu sliku. Platno zatežemo na drveni blind ram debljine 2 cm.",
    collections: { motivi: "" },
  },
  {
    slug: "slike-na-pleksiglasu",
    label: "Slike na pleksiglasu",
    navLabel: "Pleksiglas",
    hasDesigns: false,
    summary: "Štampa vašeg motiva na akrilnom staklu.",
    intro:
      "Izaberite dimenziju i u napomeni opišite motiv. Fotografiju ili pripremu za štampu pošaljite nam e-poštom, uz broj porudžbine.",
  },
  {
    slug: "izrada-nalepnica",
    label: "Izrada nalepnica",
    navLabel: "Nalepnice",
    hasDesigns: false,
    summary: "Nalepnice sa vašim logom ili dizajnom, za sve vrste podloga.",
    intro:
      "Unesite dimenzije i količinu, izaberite materijal i način sečenja. Cena se računa po kvadratnom centimetru i odmah je vidite.",
  },
];

export const getCategory = (slug) => CATEGORIES.find((c) => c.slug === slug) || null;

export const getCollections = (category) =>
  catalog.collections
    .filter((c) => c.category === category)
    .map((c) => ({ ...c, description: getCategory(category)?.collections?.[c.slug] || "" }));

export const getCollection = (category, slug) => getCollections(category).find((c) => c.slug === slug) || null;

export const getDesigns = (category, collection) =>
  catalog.designs.filter((d) => d.category === category && (!collection || d.collection === collection));

export const getDesign = (id) => catalog.designs.find((d) => d.id === id) || null;

export const findDesign = (category, collection, slug) =>
  catalog.designs.find((d) => d.category === category && d.collection === collection && d.slug === slug) || null;

export const findDesignBySrc = (src) => catalog.designs.find((d) => d.src === src) || null;

export const allDesigns = () => catalog.designs;

/** Public URL of a design's detail page. Canvas has a single collection, so it is omitted. */
export function designHref(design) {
  return design.category === "slike-na-platnu"
    ? `/slike-na-platnu/${design.slug}`
    : `/${design.category}/${design.collection}/${design.slug}`;
}

export const collectionHref = (category, collection) => `/${category}/${collection}`;

/** Representative cover image for a collection (first design). */
export const collectionCover = (category, collection) => getDesigns(category, collection)[0] || null;

// Hand-picked for the homepage. Designs showing trademarks or real people are
// deliberately not featured (see README, "Remaining issues").
const FEATURED_IDS = [
  "tapete/cvetne/cvetna-tapeta-09",
  "tapete/grad/gradska-tapeta-04",
  "slike-na-platnu/motivi/motiv-03",
  "tapete/3d/3d-tapeta-05",
  "zidni-stikeri/soba/stiker-za-sobu-01",
  "tapete/cvetne/cvetna-tapeta-06",
  "tapete/mermer/mermerna-tapeta-03",
  "tapete/cvetne/cvetna-tapeta-15",
];

export const featuredDesigns = () => FEATURED_IDS.map(getDesign).filter(Boolean);

export const HERO_DESIGN_ID = "tapete/mermer/mermerna-tapeta-12";

/** Thumbnail shown for each category in listings. */
export const CATEGORY_COVERS = {
  tapete: "tapete/cvetne/cvetna-tapeta-09",
  "zidni-stikeri": "zidni-stikeri/soba/stiker-za-sobu-01",
  "slike-na-platnu": "slike-na-platnu/motivi/motiv-03",
};

// Old URLs from the original site, mapped to their new location.
// Old category ids used underscores; product ids came from the retired products.json seed.
export const LEGACY_CATEGORY_IDS = {
  tapete: "tapete",
  zidni_stikeri: "zidni-stikeri",
  slike_na_platnu: "slike-na-platnu",
  slike_na_pleksiglasu: "slike-na-pleksiglasu",
  izrada_nalepnica: "izrada-nalepnica",
};

const LEGACY_PRODUCT_IMAGES = {
  "tapeta-1": "/tapete/cvetne/cvetnaTapeta1.webp",
  "tapeta-2": "/tapete/decije/decijeTapete1.webp",
  "tapeta-3": "/tapete/3d/3Dtapete1.webp",
  "tapeta-4": "/tapete/cvetne/cvetnaTapeta2.webp",
  "tapeta-5": "/tapete/decije/decijeTapete2.webp",
  "tapeta-6": "/tapete/cvetne/cvetnaTapeta3.webp",
  "tapeta-7": "/tapete/3d/3Dtapete2.webp",
  "tapeta-8": "/tapete/grad/gradTapete1.webp",
  "tapeta-9": "/tapete/3d/3Dtapete3.webp",
  "tapeta-10": "/tapete/mermer/mermerTapete1.webp",
  "platno-1": "/slike-na-platnu/slikePlatno1.jpg",
  "stiker-1": "/stikeri/decije/stikerDeca1.webp",
  "stiker-2": "/stikeri/soba/stikeriSoba1.webp",
};

const LEGACY_PRODUCT_PAGES = {
  "nalepnica-1": "/izrada-nalepnica",
  "pleksiglas-1": "/slike-na-pleksiglasu",
};

/** New URL for a retired /product/{id} page, or null if the id was never a catalog product. */
export function legacyProductHref(productId) {
  if (LEGACY_PRODUCT_PAGES[productId]) return LEGACY_PRODUCT_PAGES[productId];
  const design = LEGACY_PRODUCT_IMAGES[productId] && findDesignBySrc(LEGACY_PRODUCT_IMAGES[productId]);
  return design ? designHref(design) : null;
}

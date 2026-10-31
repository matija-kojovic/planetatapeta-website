// Builds order items on the server from catalog data and the pricing rules.
// Nothing the browser sends about price, title or image is trusted.
import "server-only";
import { CATEGORIES, getCategory, getDesign, designHref } from "./catalog.js";
import { CART_QUANTITY, calculatePrice, describeOptions, validateOptions } from "./pricing.js";
import { getProduct } from "./db.js";

export const MAX_ORDER_ITEMS = 30;
export const FIXED_PRODUCT = "proizvod";

/** Validates one cart line and returns the priced server-side item, or { error }. */
export function buildItem(raw) {
  if (!raw || typeof raw !== "object") return { error: "Neispravna stavka." };
  const quantity = Number(raw.quantity);
  if (!Number.isInteger(quantity) || quantity < CART_QUANTITY.min || quantity > CART_QUANTITY.max) {
    return { error: `Količina mora biti između ${CART_QUANTITY.min} i ${CART_QUANTITY.max}.` };
  }

  if (raw.category === FIXED_PRODUCT) {
    const product = typeof raw.productId === "string" ? getProduct(raw.productId) : null;
    if (!product || !Number.isInteger(product.price) || product.price <= 0) return { error: "Proizvod više nije dostupan." };
    return {
      item: {
        category: FIXED_PRODUCT,
        categoryLabel: getCategory(product.category)?.label || "Proizvod",
        productId: product.id,
        name: product.title,
        image: product.image || "",
        href: `/product/${product.id}`,
        options: {},
        details: [],
        priceLines: [{ label: product.title, amount: product.price }],
        unitPrice: product.price,
        quantity,
        lineTotal: product.price * quantity,
      },
    };
  }

  const category = getCategory(raw.category);
  if (!category) return { error: "Nepoznata vrsta proizvoda." };

  let design = null;
  if (category.hasDesigns) {
    design = typeof raw.designId === "string" ? getDesign(raw.designId) : null;
    if (!design || design.category !== category.slug) return { error: "Izabrani dizajn ne postoji." };
  }

  const { ok, options, errors } = validateOptions(category.slug, raw.options);
  if (!ok) return { error: Object.values(errors)[0] };

  const { total, lines } = calculatePrice(category.slug, options);
  if (!(total > 0)) return { error: "Cena nije mogla biti izračunata." };

  return {
    item: {
      category: category.slug,
      categoryLabel: category.label,
      designId: design?.id || null,
      name: design ? design.name : category.label,
      image: design?.src || "",
      href: design ? designHref(design) : `/${category.slug}`,
      options,
      details: describeOptions(category.slug, options),
      priceLines: lines,
      unitPrice: total,
      quantity,
      lineTotal: total * quantity,
    },
  };
}

/** Validates the whole cart. Returns { ok, items, total, errors: [{ index, message }] }. */
export function buildOrderItems(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return { ok: false, items: [], total: 0, errors: [{ index: -1, message: "Korpa je prazna." }] };
  }
  if (rawItems.length > MAX_ORDER_ITEMS) {
    return { ok: false, items: [], total: 0, errors: [{ index: -1, message: `Porudžbina može imati najviše ${MAX_ORDER_ITEMS} stavki.` }] };
  }
  const items = [];
  const errors = [];
  rawItems.forEach((raw, index) => {
    const { item, error } = buildItem(raw);
    if (error) errors.push({ index, message: error });
    else items.push(item);
  });
  return { ok: errors.length === 0, items, total: items.reduce((sum, i) => sum + i.lineTotal, 0), errors };
}

export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug);

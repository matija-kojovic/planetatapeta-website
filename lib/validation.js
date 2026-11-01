// Input validation for forms submitted to the API. Messages are shown to customers:
// short and neutral, saying what is wrong. The fields' placeholders show the expected format.

const REQUIRED = "Obavezno polje";

const EMAIL = /^[^\s@<>()[\]\\,;:"]+@[^\s@<>()[\]\\,;:"]+\.[a-z]{2,}$/i;
const PHONE = /^[+()\d\s/.-]{6,25}$/;

const text = (value) => (typeof value === "string" ? value.trim() : "");

/**
 * Runs field rules: { field: [value, required, maxLength, test?, message] }.
 * Returns { ok, values, errors }.
 */
function validateFields(rules) {
  const values = {};
  const errors = {};
  for (const [field, [raw, required, max, test, message]] of Object.entries(rules)) {
    const value = text(raw);
    if (!value) {
      if (required) errors[field] = message.required;
      values[field] = "";
      continue;
    }
    if (value.length > max) errors[field] = "Predugačko";
    else if (test && !test(value)) errors[field] = message.invalid;
    values[field] = value;
  }
  return { ok: Object.keys(errors).length === 0, values, errors };
}

const digits = (v) => v.replace(/\D/g, "").length >= 6;

export function validateCustomer(input = {}) {
  return validateFields({
    ime_prezime: [input.ime_prezime, true, 100, (v) => v.length >= 2, { required: REQUIRED, invalid: "Prekratko" }],
    email: [input.email, true, 254, (v) => EMAIL.test(v), { required: REQUIRED, invalid: "Neispravna e-adresa" }],
    telefon: [input.telefon, true, 25, (v) => PHONE.test(v) && digits(v), { required: REQUIRED, invalid: "Neispravan broj" }],
    adresa: [input.adresa, true, 200, (v) => v.length >= 3, { required: REQUIRED, invalid: "Prekratko" }],
    grad: [input.grad, true, 100, (v) => v.length >= 2, { required: REQUIRED, invalid: "Prekratko" }],
    postanski_broj: [input.postanski_broj, false, 5, (v) => /^\d{5}$/.test(v), { invalid: "Neispravan" }],
    napomena: [input.napomena, false, 1000, null, {}],
  });
}

export function validateContactMessage(input = {}) {
  return validateFields({
    ime: [input.ime, true, 60, null, { required: REQUIRED }],
    prezime: [input.prezime, true, 60, null, { required: REQUIRED }],
    email: [input.email, true, 254, (v) => EMAIL.test(v), { required: REQUIRED, invalid: "Neispravna e-adresa" }],
    telefon: [input.telefon, true, 25, (v) => PHONE.test(v) && digits(v), { required: REQUIRED, invalid: "Neispravan broj" }],
    poruka: [input.poruka, true, 3000, (v) => v.length >= 5, { required: REQUIRED, invalid: "Prekratka poruka" }],
  });
}

const HTTPS_URL = (v) => {
  try {
    return new URL(v).protocol === "https:";
  } catch {
    return false;
  }
};

/** Validates the admin content form; only known fields are kept. */
export function validateContent(input = {}) {
  const hero = validateFields({
    title: [input.hero?.title, true, 120, null, { required: REQUIRED }],
    subtitle: [input.hero?.subtitle, true, 300, null, { required: REQUIRED }],
    buttonText: [input.hero?.buttonText, true, 40, null, { required: REQUIRED }],
  });
  const header = validateFields({ announcement: [input.header?.announcement, false, 160, null, {}] });
  const contact = validateFields({
    address: [input.contact?.address, true, 120, null, { required: REQUIRED }],
    city: [input.contact?.city, true, 60, null, { required: REQUIRED }],
    zip: [input.contact?.zip, false, 10, null, {}],
    email: [input.contact?.email, true, 254, (v) => EMAIL.test(v), { required: REQUIRED, invalid: "Neispravna e-adresa" }],
    phone: [input.contact?.phone, true, 25, (v) => PHONE.test(v), { required: REQUIRED, invalid: "Neispravan broj" }],
    instagram: [input.contact?.instagram, false, 200, HTTPS_URL, { invalid: "Neispravan link" }],
  });
  const seo = validateFields({
    title: [input.seo?.title, true, 70, null, { required: REQUIRED }],
    description: [input.seo?.description, true, 170, null, { required: REQUIRED }],
  });

  const sections = { hero, header, contact, seo };
  const errors = {};
  for (const [name, result] of Object.entries(sections)) {
    for (const [field, message] of Object.entries(result.errors)) errors[`${name}.${field}`] = message;
  }
  return {
    ok: Object.keys(errors).length === 0,
    errors,
    values: Object.fromEntries(Object.entries(sections).map(([name, r]) => [name, r.values])),
  };
}

export const PRODUCT_IMAGE = /^\/uploads\/[a-f0-9]{24}\.(jpg|png|webp)$/;

/**
 * Validates an admin fixed-price product. `categories` is the list of allowed
 * category slugs (passed in so the browser form can share these rules).
 */
export function validateProduct(input = {}, categories = []) {
  const errors = {};
  const title = text(input.title);
  const description = text(input.description);
  const image = text(input.image);
  const price = typeof input.price === "string" && input.price.trim() !== "" ? Number(input.price) : input.price;

  if (!title) errors.title = REQUIRED;
  else if (title.length < 2) errors.title = "Prekratko";
  else if (title.length > 120) errors.title = "Predugačko";
  if (!categories.includes(input.category)) errors.category = REQUIRED;
  if (input.price === "" || input.price == null) errors.price = REQUIRED;
  else if (!Number.isInteger(price) || price < 1 || price > 10_000_000) errors.price = "Neispravna cena";
  if (description.length > 1000) errors.description = "Predugačko";
  if (image && !PRODUCT_IMAGE.test(image)) errors.image = "Neispravna slika";

  return { ok: Object.keys(errors).length === 0, errors, values: { title, category: input.category, price, description, image } };
}

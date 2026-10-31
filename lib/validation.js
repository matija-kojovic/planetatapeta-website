// Input validation for forms submitted to the API. Messages are shown to customers.

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
    if (value.length > max) errors[field] = `Najviše ${max} znakova.`;
    else if (test && !test(value)) errors[field] = message.invalid;
    values[field] = value;
  }
  return { ok: Object.keys(errors).length === 0, values, errors };
}

const digits = (v) => v.replace(/\D/g, "").length >= 6;

export function validateCustomer(input = {}) {
  return validateFields({
    ime_prezime: [input.ime_prezime, true, 100, (v) => v.length >= 2, { required: "Unesite ime i prezime.", invalid: "Unesite ime i prezime." }],
    email: [input.email, true, 254, (v) => EMAIL.test(v), { required: "Unesite e-adresu.", invalid: "E-adresa nije ispravna, npr. ime@primer.rs." }],
    telefon: [input.telefon, true, 25, (v) => PHONE.test(v) && digits(v), { required: "Unesite broj telefona.", invalid: "Broj telefona nije ispravan, npr. 060 123 4567." }],
    adresa: [input.adresa, true, 200, (v) => v.length >= 3, { required: "Unesite ulicu i broj.", invalid: "Unesite ulicu i broj." }],
    grad: [input.grad, true, 100, (v) => v.length >= 2, { required: "Unesite mesto.", invalid: "Unesite mesto." }],
    postanski_broj: [input.postanski_broj, false, 5, (v) => /^\d{5}$/.test(v), { invalid: "Poštanski broj ima 5 cifara." }],
    napomena: [input.napomena, false, 1000, null, {}],
  });
}

export function validateContactMessage(input = {}) {
  return validateFields({
    ime: [input.ime, true, 60, null, { required: "Unesite ime." }],
    prezime: [input.prezime, true, 60, null, { required: "Unesite prezime." }],
    email: [input.email, true, 254, (v) => EMAIL.test(v), { required: "Unesite e-adresu.", invalid: "E-adresa nije ispravna, npr. ime@primer.rs." }],
    telefon: [input.telefon, true, 25, (v) => PHONE.test(v) && digits(v), { required: "Unesite broj telefona.", invalid: "Broj telefona nije ispravan, npr. 060 123 4567." }],
    poruka: [input.poruka, true, 3000, (v) => v.length >= 5, { required: "Napišite poruku.", invalid: "Poruka je prekratka." }],
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
    title: [input.hero?.title, true, 120, null, { required: "Naslov je obavezan." }],
    subtitle: [input.hero?.subtitle, true, 300, null, { required: "Podnaslov je obavezan." }],
    buttonText: [input.hero?.buttonText, true, 40, null, { required: "Tekst dugmeta je obavezan." }],
  });
  const header = validateFields({ announcement: [input.header?.announcement, false, 160, null, {}] });
  const contact = validateFields({
    address: [input.contact?.address, true, 120, null, { required: "Adresa je obavezna." }],
    city: [input.contact?.city, true, 60, null, { required: "Grad je obavezan." }],
    zip: [input.contact?.zip, false, 10, null, {}],
    email: [input.contact?.email, true, 254, (v) => EMAIL.test(v), { required: "E-adresa je obavezna.", invalid: "E-adresa nije ispravna." }],
    phone: [input.contact?.phone, true, 25, (v) => PHONE.test(v), { required: "Telefon je obavezan.", invalid: "Telefon nije ispravan." }],
    instagram: [input.contact?.instagram, false, 200, HTTPS_URL, { invalid: "Unesite pun link koji počinje sa https://." }],
  });
  const seo = validateFields({
    title: [input.seo?.title, true, 70, null, { required: "SEO naslov je obavezan." }],
    description: [input.seo?.description, true, 170, null, { required: "SEO opis je obavezan." }],
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

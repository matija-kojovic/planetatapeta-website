// Site-wide constants used for metadata, canonical URLs and structured data.
export const SITE_NAME = "PLANETATAPETA";

/** Public origin, e.g. https://planetatapeta.rs. Set NEXT_PUBLIC_SITE_URL in production. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const absoluteUrl = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/** Digits-only phone for tel:, Viber and WhatsApp links. */
export const phoneDigits = (phone) => String(phone || "").replace(/[^\d]/g, "");

/** "Božice Divnić 10, 11080 Beograd"; the postal code is optional. */
export const postalAddress = (contact) => `${contact.address}, ${[contact.zip, contact.city].filter(Boolean).join(" ")}`;

/** "https://www.instagram.com/planetatapeta/" → "@planetatapeta" */
export function instagramHandle(url) {
  try {
    const name = new URL(url).pathname.split("/").filter(Boolean)[0];
    return name ? `@${name}` : "Instagram";
  } catch {
    return "Instagram";
  }
}

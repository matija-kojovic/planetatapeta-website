// Site-wide constants used for metadata, canonical URLs and structured data.
export const SITE_NAME = "PLANETATAPETA";

/** Public origin, e.g. https://planetatapeta.rs. Set NEXT_PUBLIC_SITE_URL in production. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const absoluteUrl = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/** Digits-only phone for tel:, Viber and WhatsApp links. */
export const phoneDigits = (phone) => String(phone || "").replace(/[^\d]/g, "");

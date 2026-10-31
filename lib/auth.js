// Admin authentication: one shared password from the environment and a signed,
// HttpOnly session cookie. Uses Web Crypto so it runs in both proxy.js and
// route handlers. If ADMIN_PASSWORD or ADMIN_SESSION_SECRET is missing, the
// admin stays locked (fail closed).

export const SESSION_COOKIE = "pt_admin";
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

const encoder = new TextEncoder();

function config() {
  const password = process.env.ADMIN_PASSWORD || "";
  const secret = process.env.ADMIN_SESSION_SECRET || "";
  return { password, secret, configured: password.length >= 12 && secret.length >= 32 };
}

export const isAdminConfigured = () => config().configured;

async function hmac(secret, value) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
  let binary = "";
  for (const byte of signature) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Constant-time comparison of two strings of equal length. */
function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Compares HMACs of both values so timing does not leak the password length or content. */
export async function checkPassword(candidate) {
  const { password, secret, configured } = config();
  if (!configured || typeof candidate !== "string") return false;
  const [a, b] = await Promise.all([hmac(secret, `pw:${candidate}`), hmac(secret, `pw:${password}`)]);
  return safeEqual(a, b);
}

export async function createSessionToken() {
  const { secret } = config();
  const payload = `v1.${Math.floor(Date.now() / 1000) + SESSION_MAX_AGE}`;
  return `${payload}.${await hmac(secret, payload)}`;
}

export async function verifySessionToken(token) {
  const { secret, configured } = config();
  if (!configured || typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 3 || parts[0] !== "v1") return false;
  const expires = Number(parts[1]);
  if (!Number.isFinite(expires) || expires < Date.now() / 1000) return false;
  return safeEqual(parts[2], await hmac(secret, `${parts[0]}.${parts[1]}`));
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
  maxAge: SESSION_MAX_AGE,
};

/** True when the request carries a valid admin session cookie. */
export async function isAdminRequest(request) {
  return verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
}

/**
 * Guard for admin API handlers. Returns a Response to send back when the
 * request is not allowed, or null when it may proceed. Write requests must
 * also come from this site's own origin (CSRF defence on top of SameSite).
 */
export async function requireAdmin(request) {
  if (!(await isAdminRequest(request))) {
    return Response.json({ error: "Potrebna je prijava." }, { status: 401 });
  }
  if (request.method !== "GET" && !isSameOrigin(request)) {
    return Response.json({ error: "Zahtev nije dozvoljen." }, { status: 403 });
  }
  return null;
}

export function isSameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === (request.headers.get("x-forwarded-host") || request.headers.get("host"));
  } catch {
    return false;
  }
}

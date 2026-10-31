import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { checkPassword, createSessionToken, isAdminConfigured, verifySessionToken, requireAdmin } from "../lib/auth.js";
import { validateCustomer, validateContent } from "../lib/validation.js";
import { escapeHtml } from "../lib/security.js";

beforeEach(() => {
  process.env.ADMIN_PASSWORD = "test-password-123";
  process.env.ADMIN_SESSION_SECRET = "x".repeat(40);
});

const fakeRequest = ({ cookie, method = "GET", origin, host = "localhost:3000" } = {}) => ({
  method,
  cookies: { get: (name) => (name === "pt_admin" && cookie ? { value: cookie } : undefined) },
  headers: new Headers({ host, ...(origin ? { origin } : {}) }),
});

test("admin stays locked when credentials are not configured", async () => {
  delete process.env.ADMIN_PASSWORD;
  assert.equal(isAdminConfigured(), false);
  assert.equal(await checkPassword(""), false);
  assert.equal(await checkPassword(undefined), false);
});

test("password check accepts only the configured password", async () => {
  assert.equal(await checkPassword("test-password-123"), true);
  assert.equal(await checkPassword("test-password-12"), false);
  assert.equal(await checkPassword(""), false);
});

test("session tokens verify, and tampered or foreign tokens do not", async () => {
  const token = await createSessionToken();
  assert.equal(await verifySessionToken(token), true);
  assert.equal(await verifySessionToken(token.slice(0, -2) + "aa"), false);
  assert.equal(await verifySessionToken("v1.9999999999.forged"), false);
  process.env.ADMIN_SESSION_SECRET = "y".repeat(40);
  assert.equal(await verifySessionToken(token), false);
});

test("expired session tokens are rejected", async () => {
  assert.equal(await verifySessionToken("v1.1000.abc"), false);
});

test("requireAdmin blocks anonymous reads and cross-site writes", async () => {
  assert.equal((await requireAdmin(fakeRequest())).status, 401);
  const token = await createSessionToken();
  assert.equal(await requireAdmin(fakeRequest({ cookie: token })), null);
  assert.equal((await requireAdmin(fakeRequest({ cookie: token, method: "POST", origin: "https://evil.example" }))).status, 403);
  assert.equal(await requireAdmin(fakeRequest({ cookie: token, method: "POST", origin: "http://localhost:3000" })), null);
});

test("customer validation requires contact and delivery fields", () => {
  const result = validateCustomer({ email: "nije-email", telefon: "12" });
  assert.equal(result.ok, false);
  for (const field of ["ime_prezime", "email", "telefon", "adresa", "grad"]) assert.ok(result.errors[field], field);

  const ok = validateCustomer({ ime_prezime: "Ana Anić", email: "ana@primer.rs", telefon: "060 123 4567", adresa: "Ulica 1", grad: "Beograd", postanski_broj: "11080" });
  assert.equal(ok.ok, true);
  assert.equal(validateCustomer({ ...ok.values, postanski_broj: "1108" }).ok, false);
});

test("content validation keeps only known fields and rejects non-https links", () => {
  const result = validateContent({
    hero: { title: "Naslov", subtitle: "Podnaslov", buttonText: "Dugme", extra: "x" },
    contact: { address: "A", city: "B", email: "a@b.rs", phone: "+381 62 000 000", instagram: "javascript:alert(1)" },
    seo: { title: "T", description: "D" },
    theme: { bgColor: "red" },
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors["contact.instagram"]);
  assert.equal(result.values.theme, undefined);
  assert.equal(result.values.hero.extra, undefined);
});

test("escapeHtml neutralises markup in e-mails", () => {
  assert.equal(escapeHtml('<img src=x onerror="a">'), "&lt;img src=x onerror=&quot;a&quot;&gt;");
});

// Small request-safety helpers shared by the public API routes.

/** Escapes text for safe interpolation into HTML (order and contact e-mails). */
export function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function clientIp(request) {
  return (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
}

// Best-effort, per-instance rate limiting. Serverless platforms may run several
// instances, so this slows abuse down rather than guaranteeing a hard limit.
const buckets = new Map();

export function rateLimit(key, { limit, windowMs }) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    if (buckets.size > 5000) for (const [k, b] of buckets) if (b.reset < now) buckets.delete(k);
    return true;
  }
  bucket.count += 1;
  return bucket.count <= limit;
}

/** Reads a JSON body with a size cap; returns null for invalid or oversized bodies. */
export async function readJsonBody(request, maxBytes = 50_000) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > maxBytes) return null;
  try {
    const text = await request.text();
    if (text.length > maxBytes) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export const tooManyRequests = () =>
  Response.json({ error: "Previše zahteva. Pokušajte ponovo za nekoliko minuta." }, { status: 429 });

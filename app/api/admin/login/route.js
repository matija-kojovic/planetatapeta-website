import { cookies } from "next/headers";
import { SESSION_COOKIE, checkPassword, createSessionToken, isAdminConfigured, isSameOrigin, sessionCookieOptions } from "@/lib/auth";
import { clientIp, rateLimit, readJsonBody, tooManyRequests } from "@/lib/security";

export async function POST(request) {
  if (!isAdminConfigured()) {
    return Response.json({ error: "Administracija nije podešena na ovom serveru." }, { status: 503 });
  }
  if (!isSameOrigin(request)) return Response.json({ error: "Zahtev nije dozvoljen." }, { status: 403 });
  if (!rateLimit(`login:${clientIp(request)}`, { limit: 5, windowMs: 15 * 60_000 })) return tooManyRequests();

  const body = await readJsonBody(request, 2_000);
  if (!(await checkPassword(body?.password))) {
    return Response.json({ error: "Lozinka nije tačna." }, { status: 401 });
  }

  (await cookies()).set(SESSION_COOKIE, await createSessionToken(), sessionCookieOptions);
  return Response.json({ ok: true });
}

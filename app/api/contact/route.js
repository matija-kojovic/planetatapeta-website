import { sendContactEmail, isMailConfigured } from "@/lib/mail";
import { clientIp, rateLimit, readJsonBody, tooManyRequests } from "@/lib/security";
import { validateContactMessage } from "@/lib/validation";

export async function POST(request) {
  if (!rateLimit(`contact:${clientIp(request)}`, { limit: 5, windowMs: 10 * 60_000 })) return tooManyRequests();

  const body = await readJsonBody(request, 20_000);
  if (!body || body.website) return Response.json({ error: "Neispravan zahtev." }, { status: 400 });

  const { ok, values, errors } = validateContactMessage(body);
  if (!ok) return Response.json({ error: "Proverite označena polja.", fieldErrors: errors }, { status: 400 });

  if (!isMailConfigured() || !(await sendContactEmail(values))) {
    return Response.json(
      { error: "Poruka trenutno ne može da se pošalje. Pozovite nas ili pišite direktno na našu e-adresu." },
      { status: 503 }
    );
  }
  return Response.json({ ok: true });
}

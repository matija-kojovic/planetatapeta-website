import { cookies } from "next/headers";
import { SESSION_COOKIE, isSameOrigin } from "@/lib/auth";

export async function POST(request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Zahtev nije dozvoljen." }, { status: 403 });
  (await cookies()).delete(SESSION_COOKIE);
  return Response.json({ ok: true });
}

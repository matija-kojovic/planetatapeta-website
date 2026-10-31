import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { getContent, saveContent, StorageUnavailableError } from "@/lib/db";
import { readJsonBody } from "@/lib/security";
import { validateContent } from "@/lib/validation";

export async function GET(request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  return Response.json(getContent(), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const body = await readJsonBody(request);
  if (!body) return Response.json({ error: "Neispravan zahtev." }, { status: 400 });

  const { ok, errors, values } = validateContent(body);
  if (!ok) return Response.json({ error: "Proverite označena polja.", fieldErrors: errors }, { status: 400 });

  try {
    saveContent(values);
  } catch (error) {
    if (error instanceof StorageUnavailableError) {
      return Response.json({ error: "Izmene nisu moguće: skladište na ovom serveru je samo za čitanje." }, { status: 503 });
    }
    throw error;
  }
  revalidatePath("/", "layout");
  return Response.json({ content: values });
}

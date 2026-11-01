import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { savePriceOverrides, StorageUnavailableError } from "@/lib/db";
import { applyPriceOverrides, validatePriceOverrides } from "@/lib/pricing";
import { readJsonBody } from "@/lib/security";

// POST /api/prices — admin only. Body: { prices: { key: amount } }.
// Only amounts that differ from the defaults in lib/pricing.js are stored.
export async function POST(request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const body = await readJsonBody(request);
  if (!body || typeof body.prices !== "object" || body.prices === null) {
    return Response.json({ error: "Neispravan zahtev." }, { status: 400 });
  }

  const { ok, values, errors } = validatePriceOverrides(body.prices);
  if (!ok) return Response.json({ error: "Proverite označene cene.", fieldErrors: errors }, { status: 400 });

  try {
    savePriceOverrides(values);
  } catch (error) {
    if (error instanceof StorageUnavailableError) {
      return Response.json({ error: "Izmene nisu moguće: skladište na ovom serveru je samo za čitanje." }, { status: 503 });
    }
    throw error;
  }
  applyPriceOverrides(values);
  revalidatePath("/", "layout");
  return Response.json({ overrides: values });
}

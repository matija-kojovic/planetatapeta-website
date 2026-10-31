import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { getProducts, saveProducts, StorageUnavailableError } from "@/lib/db";
import { CATEGORY_SLUGS } from "@/lib/orders";
import { readJsonBody } from "@/lib/security";

// Fixed-price products managed in the admin. Configurable products (wallpaper,
// stickers, canvas, plexiglass, sticker printing) are priced by lib/pricing.js.

export async function GET() {
  return Response.json(getProducts());
}

function validateProduct(input) {
  const errors = {};
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const description = typeof input.description === "string" ? input.description.trim() : "";
  const image = typeof input.image === "string" ? input.image.trim() : "";
  const price = Number(input.price);

  if (title.length < 2 || title.length > 120) errors.title = "Naziv mora imati od 2 do 120 znakova.";
  if (!CATEGORY_SLUGS.includes(input.category)) errors.category = "Izaberite kategoriju.";
  if (!Number.isInteger(price) || price < 1 || price > 10_000_000) errors.price = "Cena mora biti ceo broj veći od nule.";
  if (description.length > 1000) errors.description = "Opis može imati najviše 1000 znakova.";
  if (image && !/^\/uploads\/[a-f0-9]{24}\.(jpg|png|webp)$/.test(image)) errors.image = "Slika nije ispravna.";

  return { ok: Object.keys(errors).length === 0, errors, values: { title, category: input.category, price, description, image } };
}

function persist(products) {
  try {
    saveProducts(products);
    revalidatePath("/", "layout");
    return null;
  } catch (error) {
    if (error instanceof StorageUnavailableError) {
      return Response.json({ error: "Izmene nisu moguće: skladište na ovom serveru je samo za čitanje." }, { status: 503 });
    }
    throw error;
  }
}

export async function POST(request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const body = await readJsonBody(request);
  if (!body) return Response.json({ error: "Neispravan zahtev." }, { status: 400 });

  const { ok, errors, values } = validateProduct(body);
  if (!ok) return Response.json({ error: "Proverite podatke proizvoda.", fieldErrors: errors }, { status: 400 });

  const product = { id: `p-${crypto.randomBytes(4).toString("hex")}`, ...values };
  return persist([...getProducts(), product]) || Response.json({ product }, { status: 201 });
}

export async function PUT(request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const body = await readJsonBody(request);
  if (!body || typeof body.id !== "string") return Response.json({ error: "ID proizvoda je obavezan." }, { status: 400 });

  const products = getProducts();
  const index = products.findIndex((p) => p.id === body.id);
  if (index === -1) return Response.json({ error: "Proizvod nije pronađen." }, { status: 404 });

  const { ok, errors, values } = validateProduct(body);
  if (!ok) return Response.json({ error: "Proverite podatke proizvoda.", fieldErrors: errors }, { status: 400 });

  products[index] = { id: body.id, ...values };
  return persist(products) || Response.json({ product: products[index] });
}

export async function DELETE(request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const id = new URL(request.url).searchParams.get("id");
  const products = getProducts();
  const remaining = products.filter((p) => p.id !== id);
  if (!id || remaining.length === products.length) return Response.json({ error: "Proizvod nije pronađen." }, { status: 404 });
  return persist(remaining) || Response.json({ ok: true });
}

import { buildOrderItems } from "@/lib/orders";
import { clientIp, rateLimit, readJsonBody, tooManyRequests } from "@/lib/security";

// POST /api/orders/quote — prices the cart on the server without placing an order,
// so checkout shows exactly the amounts the order will be created with.
export async function POST(request) {
  if (!rateLimit(`quote:${clientIp(request)}`, { limit: 60, windowMs: 60_000 })) return tooManyRequests();
  const body = await readJsonBody(request, 100_000);
  if (!body) return Response.json({ error: "Neispravan zahtev." }, { status: 400 });

  const { ok, items, total, errors } = buildOrderItems(body.items);
  return Response.json(
    {
      ok,
      total,
      errors,
      items: items.map(({ name, categoryLabel, details, unitPrice, quantity, lineTotal }) => ({
        name,
        categoryLabel,
        details,
        unitPrice,
        quantity,
        lineTotal,
      })),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

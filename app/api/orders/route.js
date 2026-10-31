import { requireAdmin } from "@/lib/auth";
import { ORDER_STATUSES, createOrder, getOrders, updateOrderStatus, StorageUnavailableError } from "@/lib/db";
import { sendOrderEmail } from "@/lib/mail";
import { buildOrderItems } from "@/lib/orders";
import { clientIp, rateLimit, readJsonBody, tooManyRequests } from "@/lib/security";
import { validateCustomer } from "@/lib/validation";

// GET /api/orders — admin only. Customer data is never public.
export async function GET(request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  return Response.json(getOrders(), { headers: { "Cache-Control": "no-store" } });
}

// POST /api/orders — places an order. Prices are recalculated here; client totals are ignored.
export async function POST(request) {
  if (!rateLimit(`order:${clientIp(request)}`, { limit: 5, windowMs: 10 * 60_000 })) return tooManyRequests();

  const body = await readJsonBody(request, 100_000);
  if (!body) return Response.json({ error: "Neispravan zahtev." }, { status: 400 });
  if (body.website) return Response.json({ error: "Neispravan zahtev." }, { status: 400 }); // honeypot

  const customer = validateCustomer(body.customer);
  const cart = buildOrderItems(body.items);
  if (!customer.ok || !cart.ok) {
    return Response.json(
      { error: "Proverite podatke porudžbine.", fieldErrors: customer.errors, itemErrors: cart.errors },
      { status: 400 }
    );
  }

  try {
    const { order, persisted } = createOrder({ customer: customer.values, items: cart.items, total: cart.total });
    const emailed = await sendOrderEmail(order);
    if (!persisted && !emailed) {
      console.error(`Order ${order.id} could not be stored or e-mailed.`);
      return Response.json(
        { error: "Porudžbinu trenutno ne možemo da primimo. Pozovite nas ili nam pišite e-poštom, pa ćemo je evidentirati ručno." },
        { status: 503 }
      );
    }
    return Response.json({ order: { id: order.id, total: order.total, createdAt: order.createdAt } }, { status: 201 });
  } catch (error) {
    console.error("Order processing error:", error);
    return Response.json({ error: "Porudžbina nije sačuvana. Pokušajte ponovo." }, { status: 500 });
  }
}

// PATCH /api/orders — admin: { id, status }
export async function PATCH(request) {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const body = await readJsonBody(request);
  if (!body || typeof body.id !== "string" || !ORDER_STATUSES.includes(body.status)) {
    return Response.json({ error: "Neispravan status." }, { status: 400 });
  }
  try {
    const order = updateOrderStatus(body.id, body.status);
    if (!order) return Response.json({ error: "Porudžbina nije pronađena." }, { status: 404 });
    return Response.json({ order: { id: order.id, status: order.status } });
  } catch (error) {
    if (error instanceof StorageUnavailableError) {
      return Response.json({ error: "Izmene nisu moguće: skladište na ovom serveru je samo za čitanje." }, { status: 503 });
    }
    throw error;
  }
}

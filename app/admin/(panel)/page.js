import Link from "next/link";
import { allDesigns } from "@/lib/catalog";
import { getOrders, getProducts } from "@/lib/db";
import { formatDateTime, formatRSD } from "@/lib/format";

export const metadata = { title: "Pregled" };

export default function AdminDashboard() {
  const orders = getOrders();
  const open = orders.filter((o) => o.status === "U obradi");
  const revenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const stats = [
    ["Porudžbine ukupno", orders.length],
    ["Čekaju obradu", open.length],
    ["Vrednost svih porudžbina", formatRSD(revenue)],
    ["Dizajna i proizvoda", allDesigns().length + getProducts().length],
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="t-page">Pregled</h1>
      <dl className="mt-8 grid grid-cols-2 gap-px border-y border-line bg-line lg:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="bg-paper py-5 pr-4">
            <dt className="t-small text-ink-2">{label}</dt>
            <dd className="tabular mt-1 font-display text-[1.75rem] leading-tight">{value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="poslednje" className="mt-12">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="poslednje" className="t-title">
            Poslednje porudžbine
          </h2>
          <Link href="/admin/orders" className="link">
            Sve porudžbine
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="mt-4 text-ink-2">Još nema porudžbina.</p>
        ) : (
          <ul className="mt-4 border-t border-ink">
            {orders.slice(0, 6).map((order) => (
              <li key={order.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-0.5 border-b border-line py-3 sm:grid-cols-[8rem_minmax(0,1fr)_9rem_8rem]">
                <span className="tabular font-semibold">{order.id}</span>
                <span className="tabular text-right sm:order-last">{formatRSD(order.total || 0)}</span>
                <span className="truncate text-ink-2">{order.customer?.ime_prezime || "—"}</span>
                <span className="t-small text-ink-2">{formatDateTime(order.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

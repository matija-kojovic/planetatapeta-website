"use client";

import { Fragment, useMemo, useState } from "react";
import { formatDateTime, formatRSD } from "@/lib/format";

const customerName = (order) => order.customer?.ime_prezime || "—";

/** Older orders stored client-sent item fields; newer ones store server-built items. */
function itemLines(item) {
  if (Array.isArray(item.details)) return item.details.map(([k, v]) => `${k}: ${v}`);
  if (item.configuration && typeof item.configuration === "object") {
    return Object.entries(item.configuration)
      .filter(([, v]) => typeof v !== "object")
      .map(([k, v]) => `${k}: ${v}`);
  }
  return [];
}

const csvCell = (value) => {
  const text = String(value ?? "");
  // Prefix formula-like values so spreadsheets do not execute them.
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
};

function exportCsv(orders) {
  const header = ["Broj", "Datum", "Status", "Kupac", "E-adresa", "Telefon", "Adresa", "Mesto", "Poštanski broj", "Napomena", "Stavke", "Ukupno (RSD)"];
  const rows = orders.map((o) => [
    o.id,
    o.createdAt,
    o.status,
    o.customer?.ime_prezime,
    o.customer?.email,
    o.customer?.telefon,
    o.customer?.adresa,
    o.customer?.grad,
    o.customer?.postanski_broj,
    o.customer?.napomena,
    (o.items || []).map((i) => `${i.name || i.title} x${i.quantity}`).join("; "),
    o.total,
  ]);
  const csv = "﻿" + [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = Object.assign(document.createElement("a"), { href: url, download: `porudzbine-${new Date().toISOString().slice(0, 10)}.csv` });
  link.click();
  URL.revokeObjectURL(url);
}

export default function OrdersTable({ initialOrders, statuses }) {
  const [orders, setOrders] = useState(initialOrders);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [open, setOpen] = useState(null);
  const [message, setMessage] = useState(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (status && o.status !== status) return false;
      if (!q) return true;
      return [o.id, o.customer?.ime_prezime, o.customer?.email, o.customer?.telefon].some((v) => String(v || "").toLowerCase().includes(q));
    });
  }, [orders, query, status]);

  const changeStatus = async (order, next) => {
    setMessage(null);
    const response = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: order.id, status: next }),
    }).catch(() => null);
    const data = await response?.json().catch(() => ({}));
    if (response?.ok) {
      setOrders((list) => list.map((o) => (o.id === order.id ? { ...o, status: next } : o)));
      setMessage({ type: "ok", text: `Status porudžbine ${order.id} je promenjen u „${next}“.` });
    } else {
      setMessage({ type: "error", text: data?.error || "Status nije promenjen." });
    }
  };

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-end gap-3">
        <div className="field min-w-[14rem] flex-1">
          <label htmlFor="order-search" className="label">
            Pretraga
          </label>
          <input id="order-search" type="search" className="input" placeholder="Broj, ime, e-adresa ili telefon" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="order-status" className="label">
            Status
          </label>
          <select id="order-status" className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Svi statusi</option>
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => exportCsv(visible)} disabled={visible.length === 0}>
          Izvezi CSV ({visible.length})
        </button>
      </div>

      <div role="status">{message ? <p className={`notice mt-4 ${message.type === "ok" ? "notice-ok" : "notice-error"}`}>{message.text}</p> : null}</div>

      {orders.length === 0 ? (
        <p className="mt-8 text-ink-2">Još nema porudžbina. Nove porudžbine sa sajta pojaviće se ovde.</p>
      ) : visible.length === 0 ? (
        <p className="mt-8 text-ink-2">Nijedna porudžbina ne odgovara pretrazi.</p>
      ) : (
        <div className="mt-6 overflow-x-auto border-t border-ink">
          <table className="w-full min-w-[46rem] text-left text-[0.9375rem]">
            <thead className="t-small text-ink-2">
              <tr className="border-b border-line">
                <th className="py-3 pr-4 font-semibold">Broj</th>
                <th className="py-3 pr-4 font-semibold">Kupac</th>
                <th className="py-3 pr-4 font-semibold">Datum</th>
                <th className="py-3 pr-4 text-right font-semibold">Ukupno</th>
                <th className="py-3 pr-4 font-semibold">Status</th>
                <th className="py-3 font-semibold">
                  <span className="sr-only">Detalji</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((order) => {
                const expanded = open === order.id;
                return (
                  <Fragment key={order.id}>
                    <tr className="border-b border-line align-top">
                      <td className="tabular py-3 pr-4 font-semibold">{order.id}</td>
                      <td className="py-3 pr-4">
                        <span className="block">{customerName(order)}</span>
                        <span className="t-micro text-ink-2">{order.customer?.email}</span>
                      </td>
                      <td className="t-small py-3 pr-4 text-ink-2">{formatDateTime(order.createdAt)}</td>
                      <td className="tabular py-3 pr-4 text-right">{formatRSD(order.total || 0)}</td>
                      <td className="py-2 pr-4">
                        <label className="sr-only" htmlFor={`status-${order.id}`}>
                          Status porudžbine {order.id}
                        </label>
                        <select id={`status-${order.id}`} className="input min-h-10 py-1.5" value={order.status} onChange={(e) => changeStatus(order, e.target.value)}>
                          {!statuses.includes(order.status) ? <option>{order.status}</option> : null}
                          {statuses.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 text-right">
                        <button type="button" className="btn btn-quiet min-h-10 px-3 text-[0.875rem]" aria-expanded={expanded} aria-controls={`details-${order.id}`} onClick={() => setOpen(expanded ? null : order.id)}>
                          {expanded ? "Sakrij" : "Detalji"}
                        </button>
                      </td>
                    </tr>
                    {expanded ? (
                      <tr id={`details-${order.id}`} className="border-b border-line bg-board">
                        <td colSpan={6} className="p-5">
                          <div className="grid gap-6 md:grid-cols-2">
                            <dl className="t-small grid grid-cols-[8rem_1fr] gap-x-4 gap-y-1">
                              <dt className="text-ink-2">Telefon</dt>
                              <dd>
                                <a href={`tel:${order.customer?.telefon}`}>{order.customer?.telefon}</a>
                              </dd>
                              <dt className="text-ink-2">Adresa</dt>
                              <dd>{order.customer?.adresa}</dd>
                              <dt className="text-ink-2">Mesto</dt>
                              <dd>
                                {order.customer?.postanski_broj} {order.customer?.grad}
                              </dd>
                              <dt className="text-ink-2">Napomena</dt>
                              <dd className="whitespace-pre-wrap">{order.customer?.napomena || "—"}</dd>
                            </dl>
                            <ul className="grid gap-3">
                              {(order.items || []).map((item, i) => (
                                <li key={i} className="t-small">
                                  <p className="font-semibold">
                                    {item.name || item.title} × {item.quantity}
                                    {item.lineTotal ? <span className="tabular font-normal text-ink-2"> · {formatRSD(item.lineTotal)}</span> : null}
                                  </p>
                                  <p className="text-ink-2">{itemLines(item).join("; ")}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

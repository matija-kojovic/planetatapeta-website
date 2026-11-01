"use client";

import Link from "next/link";
import { useState } from "react";
import { FIXED_PRODUCT, linePrice, useCart } from "@/components/CartProvider";
import { QuantityStepper } from "@/components/configurators/fields";
import { formatRSD } from "@/lib/format";
import { describeOptions, validateOptions } from "@/lib/pricing";
import CartThumb from "./CartThumb";

const CATEGORY_LINKS = [
  ["/tapete", "Tapete"],
  ["/zidni-stikeri", "Zidni stikeri"],
  ["/slike-na-platnu", "Slike na platnu"],
];

function details(item) {
  if (item.category === FIXED_PRODUCT) return [];
  const { ok, options } = validateOptions(item.category, item.options);
  return ok ? describeOptions(item.category, options) : [];
}

export function EmptyCart() {
  return (
    <div className="max-w-xl border-t border-ink pt-8">
      <h2 className="t-title">Korpa je prazna</h2>
      <p className="mt-3 text-ink-2">Izaberite dizajn, unesite mere i dodajte proizvod u korpu. Cenu vidite pre nego što ga dodate.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        {CATEGORY_LINKS.map(([href, label], i) => (
          <Link key={href} href={href} className={`btn ${i === 0 ? "btn-primary" : "btn-secondary"}`}>
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function CartSkeleton() {
  return (
    <div className="grid gap-6" aria-busy="true" aria-label="Učitavanje korpe">
      {[0, 1].map((i) => (
        <div key={i} className="flex gap-5">
          <div className="skeleton size-22" />
          <div className="grid flex-1 content-start gap-2">
            <div className="skeleton h-5 w-1/2" />
            <div className="skeleton h-4 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CartView() {
  const { items, ready, total, setQuantity, removeItem, restoreItem } = useCart();
  const [removed, setRemoved] = useState(null);

  if (!ready) return <CartSkeleton />;
  if (items.length === 0 && !removed) return <EmptyCart />;

  const invalid = items.filter((item) => linePrice(item) === null);

  const remove = (item) => {
    setRemoved({ item, index: items.indexOf(item) });
    removeItem(item.key);
  };

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-8">
        <div role="status">
          {removed ? (
            <p className="notice notice-quiet mb-6 flex flex-wrap items-center justify-between gap-3">
              <span>Uklonjeno iz korpe: {removed.item.name}</span>
              <button
                type="button"
                className="font-semibold underline underline-offset-4"
                onClick={() => {
                  restoreItem(removed.item, removed.index);
                  setRemoved(null);
                }}
              >
                Vrati
              </button>
            </p>
          ) : null}
        </div>

        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <>
            <ul className="border-t border-ink">
              {items.map((item) => {
                const unit = linePrice(item);
                const lines = details(item);
                return (
                  <li key={item.key} className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-4 border-b border-line py-6 sm:gap-x-6">
                    <CartThumb item={item} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                        <h2 className="text-[1.0625rem] font-semibold leading-snug">
                          {item.href ? (
                            <Link href={item.href} className="no-underline hover:underline">
                              {item.name}
                            </Link>
                          ) : (
                            item.name
                          )}
                        </h2>
                        <p className="tabular font-semibold">{unit !== null ? formatRSD(unit * item.quantity) : "—"}</p>
                      </div>
                      {lines.length ? (
                        <dl className="t-small mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-0.5 text-ink-2">
                          {lines.map(([label, value]) => (
                            <div key={label} className="contents">
                              <dt>{label}</dt>
                              <dd className="text-ink [overflow-wrap:anywhere]">{value}</dd>
                            </div>
                          ))}
                        </dl>
                      ) : null}
                      {unit === null ? (
                        <p className="notice notice-error mt-3">Ova stavka više nije dostupna u izabranoj konfiguraciji. Uklonite je i podesite proizvod ponovo.</p>
                      ) : null}
                    </div>
                    <div className="col-span-2 flex flex-wrap items-end justify-between gap-4 sm:col-start-2 sm:col-span-1">
                      <QuantityStepper id={`qty-${item.key}`} label="Količina" value={item.quantity} onChange={(n) => setQuantity(item.key, n)} />
                      <div className="flex items-center gap-4">
                        {unit !== null && item.quantity > 1 ? <span className="t-micro tabular text-ink-2">{formatRSD(unit)} po komadu</span> : null}
                        <button type="button" className="btn btn-quiet px-3 text-[0.875rem] text-ink-2 hover:text-error" onClick={() => remove(item)}>
                          Ukloni
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <Link href="/tapete" className="link mt-6 inline-block">
              Nastavite kupovinu
            </Link>
          </>
        )}
      </div>

      {items.length ? (
        <aside aria-labelledby="pregled" className="lg:col-span-4">
          <div className="panel p-6 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
            <h2 id="pregled" className="font-sans text-[0.875rem] font-semibold">
              Pregled
            </h2>
            <dl className="tabular mt-4 grid gap-2">
              <div className="flex justify-between gap-4 text-ink-2">
                <dt>Proizvodi</dt>
                <dd>{items.reduce((n, i) => n + i.quantity, 0)} kom</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-t border-ink pt-3">
                <dt className="font-semibold">Ukupno</dt>
                <dd className="font-display text-[1.75rem] leading-none">{formatRSD(total)}</dd>
              </div>
            </dl>
            <p className="t-small mt-4 text-ink-2">Na sajtu se ne plaća karticom. Posle slanja porudžbine javljamo vam se radi potvrde i dogovora oko dostave.</p>
            {invalid.length ? (
              <p className="notice notice-error mt-4">Uklonite stavke koje nisu dostupne da biste nastavili.</p>
            ) : null}
            <Link
              href="/checkout"
              className="btn btn-primary btn-block mt-6"
              aria-disabled={invalid.length ? true : undefined}
              onClick={(event) => invalid.length && event.preventDefault()}
            >
              Nastavite na podatke za dostavu
            </Link>
          </div>
        </aside>
      ) : null}
    </div>
  );
}

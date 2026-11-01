"use client";

import Link from "next/link";
import { TrashIcon } from "@/components/icons";
import { useState } from "react";
import { FIXED_PRODUCT, linePrice, useCart } from "@/components/CartProvider";
import { QuantityStepper } from "@/components/configurators/fields";
import { formatRSD } from "@/lib/format";
import { describeOptions, validateOptions } from "@/lib/pricing";
import CartThumb from "./CartThumb";

const CATEGORY_LABELS = {
  tapete: "Tapete",
  "zidni-stikeri": "Zidni stikeri",
  "slike-na-platnu": "Slike na platnu",
  "slike-na-pleksiglasu": "Slike na pleksiglasu",
  "izrada-nalepnica": "Izrada nalepnica",
  [FIXED_PRODUCT]: "Proizvod",
};

/** One line describing the configuration: "Klasik · 300 × 240 cm · 7,20 m² · Ugradnja: ne". */
function summary(item) {
  if (item.category === FIXED_PRODUCT) return "";
  const { ok, options } = validateOptions(item.category, item.options);
  if (!ok) return "";
  return describeOptions(item.category, options)
    .map(([label, value]) => (value === "Da" || value === "Ne" ? `${label}: ${value.toLowerCase()}` : value))
    .join(" · ");
}

export function EmptyCart() {
  return (
    <div className="border-t border-ink pt-10">
      <p className="mb-6 text-[1.0625rem]">Korpa je prazna.</p>
      <Link href="/tapete" className="btn btn-primary">
        Pogledajte tapete
      </Link>
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
    <div className="grid gap-7 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:items-start lg:gap-12">
      <div>
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
                const line = summary(item);
                return (
                  <li key={item.key} className="grid grid-cols-[5rem_minmax(0,1fr)] gap-x-4 gap-y-2.5 border-b border-line py-6 md:grid-cols-[7rem_minmax(0,1fr)_auto_8.125rem] md:gap-6">
                    <CartThumb item={item} />
                    <div className="min-w-0">
                      <h2 className="font-sans text-[1.0625rem] font-semibold leading-snug tracking-normal">
                        {item.href ? (
                          <Link href={item.href} className="no-underline hover:underline">
                            {item.name}
                          </Link>
                        ) : (
                          item.name
                        )}
                      </h2>
                      <p className="mt-0.5 text-[0.84375rem] text-ink-2">{CATEGORY_LABELS[item.category]}</p>
                      {line ? <p className="mt-2 text-[0.875rem] [overflow-wrap:anywhere]">{line}</p> : null}
                      {unit === null ? (
                        <p className="notice notice-error mt-3">Ova stavka više nije dostupna u izabranoj konfiguraciji. Uklonite je i podesite proizvod ponovo.</p>
                      ) : null}
                      <button type="button" className="-ml-1 mt-1.5 inline-flex min-h-9 items-center gap-1.5 px-1 text-[0.84375rem] font-medium text-error hover:bg-error-bg" onClick={() => remove(item)}>
                        <TrashIcon size={16} />
                        Ukloni
                      </button>
                    </div>
                    <div className="col-start-2 md:col-start-auto">
                      <QuantityStepper id={`qty-${item.key}`} label={`Količina: ${item.name}`} hideLabel value={item.quantity} onChange={(n) => setQuantity(item.key, n)} />
                    </div>
                    <p className="tabular col-start-2 md:col-start-auto md:text-right">
                      <b className="block font-semibold">{unit !== null ? formatRSD(unit * item.quantity) : "—"}</b>
                      {unit !== null ? <small className="block text-[0.78125rem] text-ink-2">{formatRSD(unit)} po komadu</small> : null}
                    </p>
                  </li>
                );
              })}
            </ul>

          </>
        )}
      </div>

      {items.length ? (
        <aside aria-labelledby="pregled">
          <div className="panel p-7 lg:sticky lg:top-6">
            <h2 id="pregled" className="text-[1.625rem] leading-tight">
              Pregled
            </h2>
            <dl className="tabular mt-3.5">
              <div className="flex justify-between gap-4 py-1 text-[0.875rem] text-ink-2">
                <dt>Broj proizvoda</dt>
                <dd className="text-ink">{items.reduce((n, i) => n + i.quantity, 0)}</dd>
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-line pt-3.5">
                <dt className="t-label">Ukupno</dt>
                <dd className="font-display text-[1.875rem] leading-none lg:text-[2.25rem]">{formatRSD(total)}</dd>
              </div>
            </dl>
            {invalid.length ? <p className="notice notice-error mt-4">Uklonite stavke koje nisu dostupne da biste nastavili.</p> : null}
            <Link
              href="/checkout"
              className="btn btn-primary btn-block mt-[1.375rem]"
              aria-disabled={invalid.length ? true : undefined}
              onClick={(event) => invalid.length && event.preventDefault()}
            >
              Nastavite na porudžbinu
            </Link>
            <Link href="/tapete" className="link mx-auto mt-4 block w-fit">
              Nastavite kupovinu
            </Link>
            <p className="mt-3.5 text-center text-[0.84375rem] text-ink-2">Plaćanje nije online. Posle porudžbine javljamo vam se da potvrdimo detalje.</p>
          </div>
        </aside>
      ) : null}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatRSD } from "@/lib/format";

/** Radio group rendered as option rows. options: [{ value, label, detail?, hint? }] */
export function ChoiceGroup({ legend, name, value, onChange, options, columns = 1, hint }) {
  const hintId = useId();
  return (
    <fieldset className="choice-group" aria-describedby={hint ? hintId : undefined}>
      <legend className="label">{legend}</legend>
      <div className={`grid gap-2 ${columns === 3 ? (options.length % 2 === 0 ? "grid-cols-2 xs:grid-cols-3" : "grid-cols-1 xs:grid-cols-3") : columns === 2 ? "grid-cols-1 xs:grid-cols-2" : ""}`}>
        {options.map((option) => (
          <label key={option.value} className="choice">
            <input type="radio" name={name} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} />
            <span className="choice-text">
              <span className="choice-mark" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block font-medium leading-snug">{option.label}</span>
                {option.hint ? <span className="hint block">{option.hint}</span> : null}
              </span>
            </span>
            {option.detail ? <span className="choice-price">{option.detail}</span> : null}
          </label>
        ))}
      </div>
      {hint ? (
        <p id={hintId} className="hint mt-2">
          {hint}
        </p>
      ) : null}
    </fieldset>
  );
}

/** Single checkbox styled as an option row. */
export function Toggle({ label, hint, detail, checked, onChange }) {
  return (
    <label className="choice is-checkbox">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className="choice-text">
        <span className="choice-mark" aria-hidden="true" />
        <span className="min-w-0">
          <span className="block font-medium leading-snug">{label}</span>
          {hint ? <span className="hint block">{hint}</span> : null}
        </span>
      </span>
      {detail ? <span className="choice-price">{detail}</span> : null}
    </label>
  );
}

/** Whole-centimetre input with a "cm" suffix and a range hint. */
export function CentimetreInput({ id, label, value, onChange, onBlur, limits, error, showError }) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const invalid = Boolean(error && showError);
  return (
    <div className="field">
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className="unit-input">
        <input
          id={id}
          className="input"
          type="number"
          inputMode="numeric"
          min={limits.min}
          max={limits.max}
          step="1"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? `${errorId} ${hintId}` : hintId}
        />
        <span aria-hidden="true">cm</span>
      </div>
      {invalid ? (
        <p id={errorId} className="error-text">
          {error}
        </p>
      ) : null}
      <p id={hintId} className="hint">
        Od {limits.min} do {limits.max} cm
      </p>
    </div>
  );
}

/** Tracks which fields were blurred so errors appear after the user leaves a field. */
export function useTouched() {
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  return {
    show: (field) => submitted || touched[field],
    touch: (field) => () => setTouched((t) => ({ ...t, [field]: true })),
    submit: () => setSubmitted(true),
  };
}

/** Price lines and total; shows guidance instead of a total while options are invalid. */
export function PriceBreakdown({ price }) {
  if (!price) {
    return <p className="notice notice-quiet">Unesite ispravne mere da biste videli cenu.</p>;
  }
  return (
    <dl className="tabular t-small grid gap-2">
      {price.lines.map((line) => (
        <div key={line.label} className="flex justify-between gap-6 text-ink-2">
          <dt>{line.label}</dt>
          <dd className="shrink-0 text-ink">{formatRSD(line.amount)}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Total + add-to-cart. Sticks to the bottom of the screen on small viewports
 * while the form is visible, so the price and action are always in reach.
 */
export function AddToCartBar({ price, onAdd, quantity = 1 }) {
  const { count } = useCart();
  const [added, setAdded] = useState(false);
  const total = price ? price.total * quantity : null;
  const [shownTotal, setShownTotal] = useState(total);
  // A changed configuration is a new item, so the "added" confirmation no longer applies.
  if (shownTotal !== total) {
    setShownTotal(total);
    setAdded(false);
  }

  const handleClick = () => {
    const ok = onAdd();
    setAdded(Boolean(ok));
  };

  return (
    <div className="sticky bottom-0 z-10 -mx-[var(--gutter)] border-t border-line bg-paper px-[var(--gutter)] pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 lg:static lg:mx-0 lg:border-0 lg:p-0">
      <div className="flex items-center justify-between gap-4 lg:border-t lg:border-ink lg:pt-4">
        <div>
          <p className="t-micro text-ink-2">{quantity > 1 ? `Ukupno za ${quantity} kom` : "Ukupno"}</p>
          <p className="tabular font-display text-[1.75rem] leading-tight" aria-live="polite">
            {price ? formatRSD(price.total * quantity) : "—"}
          </p>
        </div>
        <button type="button" className="btn btn-primary min-w-[10.5rem]" onClick={handleClick}>
          Dodaj u korpu
        </button>
      </div>
      <div role="status" className="min-h-0">
        {added ? (
          <p className="notice notice-ok mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <span>Dodato u korpu.</span>
            <Link href="/cart" className="font-semibold underline underline-offset-4">
              Pregledaj korpu ({count})
            </Link>
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function QuantityStepper({ id, label, value, onChange, min = 1, max = 99 }) {
  const set = (n) => onChange(Math.min(max, Math.max(min, n)));
  return (
    <div className="field">
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className="flex w-fit items-stretch">
        <button type="button" className="btn btn-secondary w-12 rounded-r-none px-0" onClick={() => set(value - 1)} disabled={value <= min} aria-label="Smanji količinu">
          −
        </button>
        <input
          id={id}
          className="input tabular w-16 rounded-none border-x-0 text-center"
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value}
          onChange={(event) => set(Number(event.target.value) || min)}
        />
        <button type="button" className="btn btn-secondary w-12 rounded-l-none px-0" onClick={() => set(value + 1)} disabled={value >= max} aria-label="Povećaj količinu">
          +
        </button>
      </div>
    </div>
  );
}

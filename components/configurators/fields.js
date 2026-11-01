"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatRSD } from "@/lib/format";

/** A numbered section of a configurator form: "1 Materijal", "2 Dimenzije", … */
export function Step({ n, legend, children, describedBy }) {
  return (
    <fieldset className="form-step" aria-describedby={describedBy}>
      <legend>
        <span className="step-n">{n}</span>
        {legend}
      </legend>
      <div>{children}</div>
    </fieldset>
  );
}

/** Radio group rendered as option rows. options: [{ value, label, detail?, hint? }]. With `step`, it is a numbered section. */
export function ChoiceGroup({ legend, step, name, value, onChange, options, columns = 1, hint }) {
  const hintId = useId();
  return (
    <fieldset className={step ? "form-step" : "choice-group"} aria-describedby={hint ? hintId : undefined}>
      <legend className={step ? undefined : "label"}>
        {step ? <span className="step-n">{step}</span> : null}
        {legend}
      </legend>
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
/** Error for the hint line, so it never changes the field's height. Out of range, the range hint itself turns red. */
function dimensionError(value, { min, max }) {
  if (String(value).trim() === "") return "Obavezno polje";
  if (!Number.isInteger(Number(value))) return "Samo celi centimetri";
  return `Od ${min} do ${max} cm`;
}

export function CentimetreInput({ id, label, value, onChange, onBlur, limits, error, showError }) {
  const hintId = `${id}-hint`;
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
          aria-describedby={hintId}
        />
        <span aria-hidden="true">cm</span>
      </div>
      {invalid ? (
        <p id={hintId} className="error-text">
          {dimensionError(value, limits)}
        </p>
      ) : (
        <p id={hintId} className="hint">
          Od {limits.min} do {limits.max} cm
        </p>
      )}
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
    <dl className="tabular grid gap-1.5 border-t border-ink pt-4 text-[0.875rem]">
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
    <div className="sticky bottom-0 z-10 -mx-[var(--gutter)] mt-3 border-t border-line bg-paper px-[var(--gutter)] pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0">
      <div className="flex items-center justify-between gap-4 lg:block">
        <div className="lg:flex lg:items-baseline lg:justify-between lg:gap-4 lg:border-t lg:border-line lg:pt-3.5">
          <p className="t-label">{quantity > 1 ? `Ukupno za ${quantity} kom` : "Ukupno"}</p>
          <p className="tabular font-display text-[1.75rem] leading-tight lg:text-[2.25rem]" aria-live="polite">
            {price ? formatRSD(price.total * quantity) : "—"}
          </p>
        </div>
        <button type="button" className="btn btn-primary min-w-[10.5rem] lg:mt-5 lg:w-full" onClick={handleClick}>
          Dodaj u korpu
        </button>
      </div>
      <div role="status" className="min-h-0">
        {added ? (
          <p className="mt-3.5 text-center text-[0.90625rem]">
            Dodato u korpu.{" "}
            <Link href="/cart" className="link">
              Pogledajte korpu ({count})
            </Link>
          </p>
        ) : null}
      </div>
      <p className="mt-3.5 hidden text-center text-[0.84375rem] text-ink-2 lg:block">Plaćanje nije online. Posle porudžbine javljamo vam se da potvrdimo detalje.</p>
    </div>
  );
}

export function QuantityStepper({ id, label, value, onChange, min = 1, max = 99, hideLabel = false }) {
  const set = (n) => onChange(Math.min(max, Math.max(min, n)));
  return (
    <div className="field">
      <label htmlFor={id} className={hideLabel ? "sr-only" : "label"}>
        {label}
      </label>
      <div className="flex w-fit items-stretch">
        <button type="button" className="btn btn-secondary w-11 rounded-r-none px-0" onClick={() => set(value - 1)} disabled={value <= min} aria-label="Smanji količinu">
          −
        </button>
        <input
          id={id}
          className="input tabular w-14 rounded-none border-x-0 px-1 text-center"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="off"
          value={value}
          onChange={(event) => set(Number(event.target.value.replace(/\D/g, "")) || min)}
        />
        <button type="button" className="btn btn-secondary w-11 rounded-l-none px-0" onClick={() => set(value + 1)} disabled={value >= max} aria-label="Povećaj količinu">
          +
        </button>
      </div>
    </div>
  );
}

/**
 * Product page body (A): the preview and its notes on the left (sticky on desktop),
 * the product's intro and the numbered form on the right.
 */
export function ConfiguratorLayout({ media, aside, intro, children }) {
  return (
    <div className="grid gap-7 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start lg:gap-16">
      <div className="lg:sticky lg:top-6">
        {media}
        {aside ? <div className="hidden lg:block">{aside}</div> : null}
      </div>
      <div>
        {intro}
        <form className="grid" onSubmit={(event) => event.preventDefault()} noValidate>
          {children}
        </form>
        {/* On a phone the specifications follow the form, so the title comes straight after the preview. */}
        {aside ? <div className="lg:hidden">{aside}</div> : null}
      </div>
    </div>
  );
}

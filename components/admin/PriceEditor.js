"use client";

import { useEffect, useRef, useState } from "react";
import { ErrorSummary } from "@/components/shop/FormField";
import { formatNumber } from "@/lib/format";

// Edits the amounts listed in PRICE_FIELDS (lib/pricing.js). The server validates
// and stores only the amounts that differ from the defaults.

const show = (value, decimals) => (decimals ? String(value).replace(".", ",") : String(value));

export default function PriceEditor({ fields }) {
  const initial = Object.fromEntries(fields.map((f) => [f.key, show(f.value, f.decimals)]));
  const defaults = Object.fromEntries(fields.map((f) => [f.key, show(f.defaultValue, f.decimals)]));
  const [saved, setSaved] = useState(initial);
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState({ status: "idle" });
  const summaryRef = useRef(null);

  const dirty = fields.some((f) => values[f.key] !== saved[f.key]);
  const atDefaults = fields.every((f) => values[f.key] === defaults[f.key]);
  const groups = [...new Set(fields.map((f) => f.group))];
  const labels = Object.fromEntries(fields.map((f) => [`price-${f.key}`, `${f.group}, ${f.label}`]));

  // Warn before leaving the page with unsaved prices.
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update = (key, value) => {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    if (state.status !== "sending") setState({ status: "idle" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setState({ status: "sending" });
    try {
      const response = await fetch("/api/prices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prices: values }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setErrors(data.fieldErrors || {});
        setState({ status: "error", message: data.error || "Cene nisu sačuvane." });
        if (data.fieldErrors) requestAnimationFrame(() => summaryRef.current?.focus());
        return;
      }
      const next = Object.fromEntries(fields.map((f) => [f.key, show(data.overrides[f.key] ?? f.defaultValue, f.decimals)]));
      setSaved(next);
      setValues(next);
      setErrors({});
      setState({ status: "saved" });
    } catch {
      setState({ status: "error", message: "Nema veze sa serverom. Cene nisu sačuvane, pokušajte ponovo." });
    }
  };

  const summaryErrors = Object.fromEntries(Object.entries(errors).filter(([, m]) => m).map(([key, m]) => [`price-${key}`, m]));

  return (
    <section aria-labelledby="cenovnik" className="mt-16">
      <h2 id="cenovnik" className="t-title">
        Cene proizvoda po meri
      </h2>
      <p className="measure mt-2 text-ink-2">
        Ove cene koriste konfiguratori, korpa i server pri prijemu porudžbine. Izmena važi odmah za nove porudžbine; već primljene porudžbine zadržavaju svoje cene.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-8 grid gap-10">
        {Object.keys(summaryErrors).length ? <ErrorSummary errors={summaryErrors} labels={labels} summaryRef={summaryRef} /> : null}

        <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
          {groups.map((group) => (
            <fieldset key={group} className="m-0 min-w-0 border-0 p-0">
              <legend className="mb-2 p-0 font-semibold">{group}</legend>
              {fields
                .filter((f) => f.group === group)
                .map((f) => {
                  const id = `price-${f.key}`;
                  const changed = values[f.key] !== defaults[f.key];
                  const error = errors[f.key];
                  return (
                    <div key={f.key} className="grid grid-cols-[minmax(0,1fr)_9.5rem] items-center gap-x-4 border-t border-line py-2">
                      <label htmlFor={id} className="text-[0.9375rem]">
                        {f.label}
                        <span className="t-micro block text-ink-2">
                          {error ? <span className="font-semibold text-error">{error}</span> : changed ? `Podrazumevano ${f.decimals ? show(f.defaultValue, f.decimals) : formatNumber(f.defaultValue)}` : " "}
                        </span>
                      </label>
                      <div className="unit-input">
                        <input
                          id={id}
                          className="input tabular min-h-11 py-2 pr-[4.5rem] text-right"
                          type="text"
                          inputMode={f.decimals ? "decimal" : "numeric"}
                          autoComplete="off"
                          value={values[f.key]}
                          onChange={(event) => update(f.key, event.target.value)}
                          aria-invalid={error ? true : undefined}
                        />
                        <span aria-hidden="true" className="!text-[0.75rem]">
                          {f.unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </fieldset>
          ))}
        </div>

        <div className="sticky bottom-0 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-ink bg-paper py-4">
          <button type="submit" className="btn btn-primary" disabled={state.status === "sending" || !dirty}>
            {state.status === "sending" ? "Čuvanje…" : "Sačuvaj cene"}
          </button>
          <button type="button" className="btn btn-quiet" disabled={atDefaults} onClick={() => setValues(defaults)}>
            Vrati podrazumevane cene
          </button>
          <div role="status" className="t-small min-w-0">
            {state.status === "saved" ? (
              <span className="text-teal-deep">Cene su sačuvane i važe na sajtu.</span>
            ) : state.status === "error" ? (
              <span className="font-semibold text-error">{state.message}</span>
            ) : dirty ? (
              <span className="text-ink-2">Imate nesačuvane izmene.</span>
            ) : null}
          </div>
        </div>
      </form>
    </section>
  );
}

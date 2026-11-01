"use client";

import { useEffect, useRef, useState } from "react";
import FormField, { ErrorSummary } from "@/components/shop/FormField";
import { validateContent } from "@/lib/validation";

// Field ids match the "section.field" keys returned by validateContent and the API.
const FIELDS = {
  hero: {
    legend: "Naslovna strana",
    hint: "Veliki naslov, tekst ispod njega i dugme na vrhu naslovne strane.",
    fields: {
      title: { label: "Naslov", max: 120 },
      subtitle: { label: "Podnaslov", max: 300, as: "textarea", rows: 3 },
      buttonText: { label: "Tekst dugmeta", max: 40 },
    },
  },
  header: {
    legend: "Obaveštenje",
    hint: "Kratka traka iznad menija na svim stranicama, npr. o neradnim danima. Ostavite prazno da se ne prikazuje.",
    fields: { announcement: { label: "Tekst obaveštenja", max: 160, optional: true } },
  },
  contact: {
    legend: "Kontakt podaci",
    hint: "Prikazuju se u podnožju, na stranici Kontakt i u podacima za pretraživače.",
    fields: {
      address: { label: "Ulica i broj", max: 120, autoComplete: "street-address" },
      city: { label: "Grad", max: 60 },
      zip: { label: "Poštanski broj", max: 10, optional: true, inputMode: "numeric" },
      phone: { label: "Telefon", max: 25, type: "tel" },
      email: { label: "E-adresa", max: 254, type: "email", inputMode: "email" },
      instagram: { label: "Instagram", max: 200, optional: true, type: "url", hint: "Pun link, npr. https://www.instagram.com/planetatapeta/" },
    },
  },
  seo: {
    legend: "Pretraživači",
    hint: "Naslov i opis naslovne strane koje prikazuju Google i društvene mreže.",
    fields: {
      title: { label: "SEO naslov", max: 70, counter: true },
      description: { label: "SEO opis", max: 170, as: "textarea", rows: 3, counter: true },
    },
  },
};

const LABELS = Object.fromEntries(
  Object.entries(FIELDS).flatMap(([section, { fields }]) => Object.entries(fields).map(([field, f]) => [`${section}.${field}`, f.label])),
);

export default function ContentForm({ initialContent }) {
  const [saved, setSaved] = useState(initialContent);
  const [values, setValues] = useState(initialContent);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [state, setState] = useState({ status: "idle" });
  const summaryRef = useRef(null);

  const validation = validateContent(values);
  // Server errors are cleared per field by setting them to undefined, so only defined ones may override.
  const errors = { ...validation.errors, ...Object.fromEntries(Object.entries(serverErrors).filter(([, message]) => message)) };
  const dirty = JSON.stringify(values) !== JSON.stringify(saved);

  // Warn before leaving the page with unsaved edits.
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update = (section, field, value) => {
    setValues((v) => ({ ...v, [section]: { ...v[section], [field]: value } }));
    setServerErrors((e) => ({ ...e, [`${section}.${field}`]: undefined }));
    if (state.status !== "sending") setState({ status: "idle" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (!validation.ok) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setState({ status: "sending" });
    try {
      const response = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.values),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setServerErrors(data.fieldErrors || {});
        setState({ status: "error", message: data.error || "Izmene nisu sačuvane." });
        if (data.fieldErrors) requestAnimationFrame(() => summaryRef.current?.focus());
        return;
      }
      setSaved(data.content);
      setValues(data.content);
      setSubmitted(false);
      setTouched({});
      setState({ status: "saved" });
    } catch {
      setState({ status: "error", message: "Nema veze sa serverom. Izmene nisu sačuvane, pokušajte ponovo." });
    }
  };

  const visibleErrors = Object.fromEntries(Object.entries(errors).filter(([key, message]) => message && (submitted || touched[key])));

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-8 grid gap-12">
      {submitted && Object.keys(visibleErrors).length > 0 ? <ErrorSummary errors={visibleErrors} labels={LABELS} summaryRef={summaryRef} /> : null}

      {Object.entries(FIELDS).map(([section, group]) => (
        <fieldset key={section} className="grid gap-5 border-0 border-t border-ink p-0 pt-6" aria-describedby={`${section}-hint`}>
          <legend className="float-left w-full">
            <span className="display t-title block">{group.legend}</span>
          </legend>
          <p id={`${section}-hint`} className="measure -mt-2 text-ink-2">
            {group.hint}
          </p>
          <div className="grid gap-5 sm:grid-cols-2">
            {Object.entries(group.fields).map(([field, f]) => {
              const key = `${section}.${field}`;
              const value = values[section]?.[field] ?? "";
              const hint = f.counter ? `${value.length} od najviše ${f.max} znakova.` : f.hint;
              return (
                <FormField
                  key={key}
                  id={key}
                  label={f.label}
                  optional={f.optional}
                  as={f.as}
                  rows={f.rows}
                  type={f.as ? undefined : f.type || "text"}
                  inputMode={f.inputMode}
                  autoComplete={f.autoComplete || "off"}
                  maxLength={f.max}
                  className={f.as === "textarea" || f.counter || section === "hero" ? "sm:col-span-2" : ""}
                  value={value}
                  onChange={(event) => update(section, field, event.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, [key]: true }))}
                  error={visibleErrors[key]}
                  hint={hint}
                  required={!f.optional}
                />
              );
            })}
          </div>
        </fieldset>
      ))}

      <div className="sticky bottom-0 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-ink bg-paper py-4">
        <button type="submit" className="btn btn-primary" disabled={state.status === "sending" || !dirty}>
          {state.status === "sending" ? "Čuvanje…" : "Sačuvaj izmene"}
        </button>
        <div role="status" className="t-small min-w-0">
          {state.status === "saved" ? (
            <span className="text-teal-deep">
              Izmene su sačuvane i vidljive na sajtu.{" "}
              <a href="/" target="_blank" rel="noopener" className="link">
                Otvori sajt
              </a>
            </span>
          ) : state.status === "error" ? (
            <span className="font-semibold text-error">{state.message}</span>
          ) : dirty ? (
            <span className="text-ink-2">Imate nesačuvane izmene.</span>
          ) : (
            <span className="text-ink-2">Nema nesačuvanih izmena.</span>
          )}
        </div>
      </div>
    </form>
  );
}

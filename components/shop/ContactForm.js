"use client";

import { useRef, useState } from "react";
import { validateContactMessage } from "@/lib/validation";
import FormField, { ErrorSummary, Honeypot, RequiredNote } from "./FormField";

const LABELS = { ime: "Ime", prezime: "Prezime", email: "E-adresa", telefon: "Telefon", poruka: "Poruka" };
const EMPTY = { ime: "", prezime: "", email: "", telefon: "", poruka: "" };

export default function ContactForm({ email }) {
  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [state, setState] = useState({ status: "idle" });
  const summaryRef = useRef(null);

  const validation = validateContactMessage(values);
  // An empty field left by tabbing past is not an error yet; it becomes one on submit.
  const errorFor = (field) => ((submitted || (touched[field] && values[field].trim())) && validation.errors[field]) || undefined;
  const fieldProps = (field) => ({
    id: field,
    label: LABELS[field],
    value: values[field],
    onChange: (event) => setValues((v) => ({ ...v, [field]: event.target.value })),
    onBlur: () => setTouched((t) => ({ ...t, [field]: true })),
    error: errorFor(field),
    required: true,
  });

  if (state.status === "success") {
    return (
      <div className="notice notice-ok grid gap-3 p-6" role="status">
        <p className="font-semibold">Poruka je poslata.</p>
        <p>Odgovorićemo vam na e-adresu {values.email} u najkraćem roku.</p>
        <button
          type="button"
          className="justify-self-start font-semibold underline underline-offset-4"
          onClick={() => {
            setValues(EMPTY);
            setTouched({});
            setSubmitted(false);
            setState({ status: "idle" });
          }}
        >
          Pošaljite novu poruku
        </button>
      </div>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (!validation.ok) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setState({ status: "sending" });
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...validation.values, website: honeypot }),
      });
      const data = await response.json().catch(() => ({}));
      setState(response.ok ? { status: "success" } : { status: "error", message: data.error || "Poruka nije poslata. Pokušajte ponovo." });
    } catch {
      setState({ status: "error", message: "Nema veze sa serverom. Proverite internet vezu i pokušajte ponovo." });
    }
  };

  return (
    <form className="grid gap-5" onSubmit={handleSubmit} noValidate>
      {submitted && !validation.ok ? <ErrorSummary errors={validation.errors} labels={LABELS} summaryRef={summaryRef} /> : null}
      <RequiredNote />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField {...fieldProps("ime")} autoComplete="given-name" />
        <FormField {...fieldProps("prezime")} autoComplete="family-name" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField {...fieldProps("email")} type="email" inputMode="email" autoComplete="email" />
        <FormField {...fieldProps("telefon")} type="tel" autoComplete="tel" />
      </div>
      <FormField {...fieldProps("poruka")} as="textarea" rows={6} />
      <Honeypot value={honeypot} onChange={setHoneypot} />
      {state.status === "error" ? (
        <p className="notice notice-error" role="alert">
          {state.message} Možete nam pisati i direktno na{" "}
          <a className="underline underline-offset-4" href={`mailto:${email}`}>
            {email}
          </a>
          .
        </p>
      ) : null}
      <button type="submit" className="btn btn-primary justify-self-start" disabled={state.status === "sending"}>
        {state.status === "sending" ? "Šaljemo…" : "Pošaljite poruku"}
      </button>
    </form>
  );
}

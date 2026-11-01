"use client";

import Link from "next/link";
import CartThumb from "./CartThumb";
import { EditIcon } from "@/components/icons";
import { useEffect, useRef, useState } from "react";
import { FIXED_PRODUCT, useCart } from "@/components/CartProvider";
import { formatRSD } from "@/lib/format";
import { validateCustomer } from "@/lib/validation";
import { CartSkeleton, EmptyCart } from "./CartView";
import FormField, { ErrorSummary, Honeypot, RequiredNote } from "./FormField";

const LABELS = {
  ime_prezime: "Ime i prezime",
  email: "E-adresa",
  telefon: "Telefon",
  adresa: "Ulica i broj",
  postanski_broj: "Poštanski broj",
  grad: "Mesto",
  napomena: "Napomena",
};

const EMPTY = { ime_prezime: "", email: "", telefon: "", adresa: "", postanski_broj: "", grad: "", napomena: "" };

/** Only what the server needs to rebuild and price each line. */
const toPayload = (items) =>
  items.map((item) =>
    item.category === FIXED_PRODUCT
      ? { category: FIXED_PRODUCT, productId: item.productId, quantity: item.quantity }
      : { category: item.category, designId: item.designId, options: item.options, quantity: item.quantity }
  );

function OrderSummary({ quote, items }) {
  if (quote.status === "loading") {
    return (
      <div className="grid gap-3" aria-busy="true">
        <div className="skeleton h-5 w-2/3" />
        <div className="skeleton h-5 w-1/2" />
        <div className="skeleton h-8 w-1/3" />
      </div>
    );
  }
  if (quote.status === "error") {
    return (
      <div className="notice notice-error grid gap-2" role="alert">
        <p>{quote.message}</p>
        <Link href="/cart" className="font-semibold underline underline-offset-4">
          Vratite se u korpu
        </Link>
      </div>
    );
  }
  return (
    <>
      <ul>
        {quote.items.map((item, i) => (
          <li key={i} className="grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-3.5 border-b border-line py-3 text-[0.875rem]">
            {items[i] ? <CartThumb item={items[i]} className="!p-1.5" /> : <span />}
            <span className="min-w-0">
              <b className="block font-semibold">{item.name}</b>
              <small className="block text-[0.8125rem] text-ink-2">
                {item.details.map(([, v]) => v).join(" · ") || item.categoryLabel} · {item.quantity} kom
              </small>
            </span>
            <span className="tabular whitespace-nowrap">{formatRSD(item.lineTotal)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-line pt-3.5">
        <span className="t-label">Ukupno</span>
        <span className="tabular font-display text-[1.875rem] leading-none lg:text-[2.25rem]">{formatRSD(quote.total)}</span>
      </div>
      <p className="mt-2.5 text-[0.8125rem] text-ink-2">Cene su izračunate na serveru za izabrane mere.</p>
    </>
  );
}

function Success({ order, email, phone }) {
  return (
    <div className="max-w-[42.5rem] pb-6" role="status">
      <p className="t-lead">Javićemo vam se na broj {phone} da potvrdimo detalje porudžbine, dostavu i ugradnju, ako ste je izabrali.</p>
      <dl className="mt-8 grid gap-1 border-t border-ink pt-5">
        <dt className="t-label">Broj porudžbine</dt>
        <dd className="tabular font-display text-[2.25rem] leading-tight">{order.id}</dd>
        <dt className="t-label mt-3">Ukupno</dt>
        <dd className="tabular text-[1.0625rem] font-medium">{formatRSD(order.total)}</dd>
      </dl>
      <p className="mt-5 text-ink-2">
        Ako šaljete svoju fotografiju ili pripremu za štampu, pošaljite je na{" "}
        <a className="link" href={`mailto:${email}?subject=${encodeURIComponent(`Porudžbina ${order.id}`)}`}>
          {email}
        </a>{" "}
        i navedite broj porudžbine.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className="btn btn-primary">
          Nazad na početnu
        </Link>
        <Link href="/tapete" className="btn btn-secondary">
          Pogledajte tapete
        </Link>
      </div>
    </div>
  );
}

export default function Checkout({ contactEmail }) {
  const { items, ready, clear } = useCart();
  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [state, setState] = useState({ status: "idle" });
  const [quoteResult, setQuoteResult] = useState(null);
  const summaryRef = useRef(null);
  const cartSignature = JSON.stringify(toPayload(items));
  // A quote belongs to the cart it was requested for; while the cart changes, it is loading.
  const quote = quoteResult?.signature === cartSignature ? quoteResult : { status: "loading" };

  useEffect(() => {
    if (!ready || items.length === 0) return;
    const controller = new AbortController();
    const setQuote = (result) => setQuoteResult({ ...result, signature: cartSignature });
    fetch("/api/orders/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: `{"items":${cartSignature}}`,
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setQuote({ status: "ready", items: data.items, total: data.total });
        else setQuote({ status: "error", message: data.errors?.[0]?.message || data.error || "Korpa sadrži neispravne stavke." });
      })
      .catch((error) => {
        if (error.name !== "AbortError") setQuote({ status: "error", message: "Pregled porudžbine nije učitan. Proverite vezu i osvežite stranicu." });
      });
    return () => controller.abort();
  }, [ready, cartSignature]); // eslint-disable-line react-hooks/exhaustive-deps

  const validation = validateCustomer(values);
  // An empty field left by tabbing past is not an error yet; it becomes one on submit.
  const errorFor = (field) => ((submitted || (touched[field] && values[field].trim())) && validation.errors[field]) || undefined;
  const update = (field) => (event) => setValues((v) => ({ ...v, [field]: event.target.value }));
  const blur = (field) => () => setTouched((t) => ({ ...t, [field]: true }));

  // The page heading follows the state, so the confirmation is not titled "Podaci za dostavu".
  const heading = (text, label) => (
    <div className="mb-8 mt-3">
      {label ? <p className="t-label mb-2.5">{label}</p> : null}
      <h1 className="t-section">{text}</h1>
    </div>
  );
  if (state.status === "success") {
    return (
      <>
        {heading(`Hvala, ${values.ime_prezime.trim().split(/\s+/)[0]}.`, "Porudžbina je poslata")}
        <Success order={state.order} email={contactEmail} phone={values.telefon} />
      </>
    );
  }
  if (!ready || items.length === 0) {
    return (
      <>
        {heading("Porudžbina")}
        {ready ? <EmptyCart /> : <CartSkeleton />}
      </>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (!validation.ok) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    if (quote.status !== "ready") return;

    setState({ status: "submitting" });
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer: validation.values, items: toPayload(items), website: honeypot }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        clear();
        setState({ status: "success", order: data.order });
        window.scrollTo({ top: 0 });
        return;
      }
      setState({ status: "error", message: data.error || "Porudžbina nije poslata. Pokušajte ponovo." });
    } catch {
      setState({ status: "error", message: "Nema veze sa serverom. Proverite internet vezu i pokušajte ponovo." });
    }
  };

  const fieldProps = (field) => ({ id: field, label: LABELS[field], value: values[field], onChange: update(field), onBlur: blur(field), error: errorFor(field) });

  return (
    <>
      {heading("Porudžbina")}
      <div className="grid gap-7 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start lg:gap-14">
        <form className="grid content-start" onSubmit={handleSubmit} noValidate>
          {submitted && !validation.ok ? (
            <div className="mb-5">
              <ErrorSummary errors={validation.errors} labels={LABELS} summaryRef={summaryRef} />
            </div>
          ) : null}

          <fieldset className="form-step">
            <legend>
              <span className="step-n">1</span>Kontakt
            </legend>
            <div className="grid gap-1">
              <div className="mb-3">
                <RequiredNote />
              </div>
              <FormField {...fieldProps("ime_prezime")} autoComplete="name" required />
              <div className="grid gap-x-4 gap-y-1 sm:grid-cols-2">
                <FormField {...fieldProps("email")} type="email" autoComplete="email" inputMode="email" required />
                <FormField {...fieldProps("telefon")} type="tel" autoComplete="tel" required hint="Za potvrdu porudžbine." />
              </div>
            </div>
          </fieldset>

          <fieldset className="form-step">
            <legend>
              <span className="step-n">2</span>Adresa za dostavu
            </legend>
            <div className="grid gap-1">
              <FormField {...fieldProps("adresa")} autoComplete="street-address" required />
              <div className="grid gap-x-4 gap-y-1 sm:grid-cols-[12rem_1fr]">
                <FormField {...fieldProps("postanski_broj")} autoComplete="postal-code" inputMode="numeric" maxLength={5} />
                <FormField {...fieldProps("grad")} autoComplete="address-level2" required />
              </div>
            </div>
          </fieldset>

          <fieldset className="form-step">
            <legend>
              <span className="step-n">3</span>Napomena
            </legend>
            <div>
              <FormField {...fieldProps("napomena")} as="textarea" rows={4} />
            </div>
          </fieldset>

          <Honeypot value={honeypot} onChange={setHoneypot} />

          <div className="grid gap-3.5 border-t border-ink pt-5">
            {state.status === "error" ? (
              <p className="notice notice-error" role="alert">
                {state.message}
              </p>
            ) : null}
            <button type="submit" className="btn btn-primary w-full" disabled={state.status === "submitting" || quote.status !== "ready"}>
              {state.status === "submitting" ? "Šaljemo porudžbinu…" : "Pošaljite porudžbinu"}
            </button>
            <p className="text-center text-[0.84375rem] text-ink-2">
              Plaćanje nije online. Slanjem porudžbine šaljete nam podatke potrebne za njenu obradu i dostavu; javljamo vam se da potvrdimo detalje.
            </p>
          </div>
        </form>

        <aside aria-labelledby="vasa-porudzbina" className="order-first lg:order-none">
          <div className="panel p-7 lg:sticky lg:top-6">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <h2 id="vasa-porudzbina" className="text-[1.625rem] leading-tight">
                Vaša porudžbina
              </h2>
              <Link href="/cart" className="btn btn-secondary min-h-10 gap-2 px-3.5 text-[0.875rem]">
                <EditIcon size={16} />
                Izmeni korpu
              </Link>
            </div>
            <OrderSummary quote={quote} items={items} />
          </div>
        </aside>
      </div>
    </>
  );
}

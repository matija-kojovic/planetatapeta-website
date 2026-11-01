"use client";

import Link from "next/link";
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

function OrderSummary({ quote }) {
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
      <ul className="grid gap-4">
        {quote.items.map((item, i) => (
          <li key={i} className="t-small grid gap-1 border-b border-line pb-4">
            <div className="flex justify-between gap-4">
              <span className="font-semibold">
                {item.name}
                {item.quantity > 1 ? <span className="font-normal text-ink-2"> × {item.quantity}</span> : null}
              </span>
              <span className="tabular shrink-0">{formatRSD(item.lineTotal)}</span>
            </div>
            <p className="text-ink-2">{item.details.map(([k, v]) => `${k}: ${v}`).join("; ") || item.categoryLabel}</p>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <span className="font-semibold">Ukupno</span>
        <span className="tabular font-display text-[1.75rem] leading-none">{formatRSD(quote.total)}</span>
      </div>
      <p className="t-micro mt-2 text-ink-2">Cene su izračunate na serveru za izabrane mere.</p>
    </>
  );
}

function Success({ order, email }) {
  return (
    <div className="max-w-2xl border-t border-ink pt-8" role="status">
      <p className="text-ink-2">Broj porudžbine</p>
      <p className="tabular font-display text-[2.5rem] leading-tight">{order.id}</p>
      <p className="mt-6 text-ink-2">
        Ukupan iznos je {formatRSD(order.total)}. Javićemo vam se telefonom ili e-poštom radi potvrde porudžbine i dogovora oko dostave.
      </p>
      <p className="mt-3 text-ink-2">
        Ako šaljete svoju fotografiju ili pripremu za štampu, pošaljite je na{" "}
        <a className="link" href={`mailto:${email}?subject=${encodeURIComponent(`Porudžbina ${order.id}`)}`}>
          {email}
        </a>{" "}
        i navedite broj porudžbine.
      </p>
      <Link href="/" className="btn btn-secondary mt-8">
        Nazad na početnu
      </Link>
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
  const heading = (text) => <h1 className="t-page mb-8 lg:mb-12">{text}</h1>;
  if (state.status === "success") {
    return (
      <>
        {heading("Porudžbina je primljena")}
        <Success order={state.order} email={contactEmail} />
      </>
    );
  }
  if (!ready || items.length === 0) {
    return (
      <>
        {heading("Podaci za dostavu")}
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
      {heading("Podaci za dostavu")}
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
        <form className="grid content-start gap-10 lg:col-span-7" onSubmit={handleSubmit} noValidate>
          {submitted && !validation.ok ? <ErrorSummary errors={validation.errors} labels={LABELS} summaryRef={summaryRef} /> : null}

          <RequiredNote />

        <fieldset className="grid gap-5">
            <legend className="display t-title mb-5">Kontakt</legend>
            <FormField {...fieldProps("ime_prezime")} autoComplete="name" required />
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField {...fieldProps("email")} type="email" autoComplete="email" inputMode="email" required />
              <FormField {...fieldProps("telefon")} type="tel" autoComplete="tel" required hint="Za potvrdu porudžbine." />
            </div>
          </fieldset>

          <fieldset className="grid gap-5">
            <legend className="display t-title mb-5">Adresa za dostavu</legend>
            <FormField {...fieldProps("adresa")} autoComplete="street-address" required />
            <div className="grid gap-5 sm:grid-cols-[12rem_1fr]">
              <FormField {...fieldProps("postanski_broj")} autoComplete="postal-code" inputMode="numeric" maxLength={5} />
              <FormField {...fieldProps("grad")} autoComplete="address-level2" required />
            </div>
            <FormField {...fieldProps("napomena")} as="textarea" rows={4} />
          </fieldset>

          <Honeypot value={honeypot} onChange={setHoneypot} />

          <div className="grid gap-4 border-t border-ink pt-6">
            {state.status === "error" ? (
              <p className="notice notice-error" role="alert">
                {state.message}
              </p>
            ) : null}
            <p className="t-small text-ink-2">
              Slanjem porudžbine šaljete nam podatke potrebne za njenu obradu i dostavu. Na sajtu se ne plaća karticom.
            </p>
            <button type="submit" className="btn btn-primary w-full sm:w-auto sm:justify-self-start" disabled={state.status === "submitting" || quote.status !== "ready"}>
              {state.status === "submitting" ? "Šaljemo porudžbinu…" : "Pošaljite porudžbinu"}
            </button>
          </div>
        </form>

        <aside aria-labelledby="vasa-porudzbina" className="order-first lg:order-none lg:col-span-5">
          <div className="panel p-6 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h2 id="vasa-porudzbina" className="font-sans text-[0.875rem] font-semibold">
                Vaša porudžbina
              </h2>
              <Link href="/cart" className="link text-[0.875rem]">
                Izmeni korpu
              </Link>
            </div>
            <OrderSummary quote={quote} />
          </div>
        </aside>
      </div>
    </>
  );
}

"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import FormField, { ErrorSummary } from "@/components/shop/FormField";
import { formatRSD } from "@/lib/format";
import { validateProduct } from "@/lib/validation";

const LABELS = { title: "Naziv", category: "Kategorija", price: "Cena", description: "Opis", image: "Slika" };
const EMPTY = { title: "", category: "", price: "", description: "", image: "" };

async function send(method, url, body) {
  try {
    const response = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, data };
  } catch {
    return { ok: false, data: { error: "Nema veze sa serverom. Pokušajte ponovo." } };
  }
}

export default function ProductsManager({ initialProducts, categories }) {
  const [products, setProducts] = useState(initialProducts);
  const [editing, setEditing] = useState(null); // null | "new" | product id
  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [serverErrors, setServerErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [upload, setUpload] = useState({ status: "idle" });
  const [confirming, setConfirming] = useState(null);
  const [message, setMessage] = useState(null);
  const summaryRef = useRef(null);
  const formRef = useRef(null);
  const addButtonRef = useRef(null);

  const slugs = categories.map((c) => c.slug);
  const categoryLabel = (slug) => categories.find((c) => c.slug === slug)?.label || slug;
  const validation = validateProduct(values, slugs);
  // Server errors are cleared per field by setting them to undefined, so only defined ones may override.
  const errors = { ...validation.errors, ...Object.fromEntries(Object.entries(serverErrors).filter(([, message]) => message)) };
  const errorFor = (field) => ((submitted || touched[field]) && errors[field]) || undefined;

  const openForm = (product) => {
    setEditing(product ? product.id : "new");
    setValues(product ? { ...EMPTY, ...product, price: String(product.price) } : EMPTY);
    setTouched({});
    setSubmitted(false);
    setServerErrors({});
    setUpload({ status: "idle" });
    setMessage(null);
    requestAnimationFrame(() => formRef.current?.querySelector("input")?.focus());
  };

  const closeForm = () => {
    setEditing(null);
    requestAnimationFrame(() => addButtonRef.current?.focus());
  };

  const fieldProps = (field) => ({
    id: field,
    label: LABELS[field],
    value: values[field],
    onChange: (event) => {
      setValues((v) => ({ ...v, [field]: event.target.value }));
      setServerErrors((e) => ({ ...e, [field]: undefined }));
    },
    onBlur: () => setTouched((t) => ({ ...t, [field]: true })),
    error: errorFor(field),
  });

  const handleImage = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setUpload({ status: "error", message: "Slika je veća od 5 MB. Smanjite je pa pokušajte ponovo." });
      return;
    }
    setUpload({ status: "uploading" });
    const form = new FormData();
    form.append("file", file);
    try {
      const response = await fetch("/api/upload", { method: "POST", body: form });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Slika nije otpremljena.");
      setValues((v) => ({ ...v, image: data.url }));
      setServerErrors((e) => ({ ...e, image: undefined }));
      setUpload({ status: "idle" });
    } catch (error) {
      setUpload({ status: "error", message: error.message === "Failed to fetch" ? "Nema veze sa serverom." : error.message });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitted(true);
    if (!validation.ok) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setSaving(true);
    const isNew = editing === "new";
    const { ok, data } = await send(isNew ? "POST" : "PUT", "/api/products", isNew ? validation.values : { id: editing, ...validation.values });
    setSaving(false);
    if (!ok) {
      setServerErrors(data.fieldErrors || {});
      setMessage({ type: "error", text: data.error || "Proizvod nije sačuvan." });
      if (data.fieldErrors) requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setProducts((list) => (isNew ? [...list, data.product] : list.map((p) => (p.id === data.product.id ? data.product : p))));
    setMessage({ type: "ok", text: isNew ? `Proizvod „${data.product.title}“ je dodat.` : `Izmene proizvoda „${data.product.title}“ su sačuvane.` });
    closeForm();
  };

  const handleDelete = async (product) => {
    const { ok, data } = await send("DELETE", `/api/products?id=${encodeURIComponent(product.id)}`);
    setConfirming(null);
    if (!ok) {
      setMessage({ type: "error", text: data.error || "Proizvod nije obrisan." });
      return;
    }
    setProducts((list) => list.filter((p) => p.id !== product.id));
    if (editing === product.id) setEditing(null);
    setMessage({ type: "ok", text: `Proizvod „${product.title}“ je obrisan.` });
    requestAnimationFrame(() => addButtonRef.current?.focus());
  };

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="measure text-ink-2">
          Proizvodi sa fiksnom cenom prikazuju se na stranici svoje kategorije, ispod dizajna, i imaju svoju stranicu sa dugmetom za korpu.
        </p>
        {editing === null ? (
          <button ref={addButtonRef} type="button" className="btn btn-primary" onClick={() => openForm(null)}>
            Dodaj proizvod
          </button>
        ) : null}
      </div>

      <div role="status">{message ? <p className={`notice mt-6 ${message.type === "ok" ? "notice-ok" : "notice-error"}`}>{message.text}</p> : null}</div>

      {editing !== null ? (
        <form ref={formRef} onSubmit={handleSubmit} noValidate aria-labelledby="product-form-title" className="mt-8 grid max-w-2xl gap-5 border-t border-ink pt-6">
          <h2 id="product-form-title" className="t-title">
            {editing === "new" ? "Novi proizvod" : "Izmena proizvoda"}
          </h2>
          {submitted && Object.values(errors).some(Boolean) ? (
            <ErrorSummary errors={Object.fromEntries(Object.entries(errors).filter(([, v]) => v))} labels={LABELS} summaryRef={summaryRef} />
          ) : null}
          <FormField {...fieldProps("title")} maxLength={120} required />
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="field">
              <label htmlFor="category" className="label">
                {LABELS.category}
              </label>
              <select
                id="category"
                className="input"
                value={values.category}
                onChange={fieldProps("category").onChange}
                onBlur={fieldProps("category").onBlur}
                aria-invalid={errorFor("category") ? true : undefined}
                aria-describedby={errorFor("category") ? "category-error" : undefined}
                required
              >
                <option value="">Izaberite kategoriju</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </select>
              {errorFor("category") ? (
                <p id="category-error" className="error-text">
                  {errorFor("category")}
                </p>
              ) : null}
            </div>
            <div className="field">
              <label htmlFor="price" className="label">
                {LABELS.price}
              </label>
              <div className="unit-input">
                <input
                  id="price"
                  className="input"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  value={values.price}
                  onChange={fieldProps("price").onChange}
                  onBlur={fieldProps("price").onBlur}
                  aria-invalid={errorFor("price") ? true : undefined}
                  aria-describedby={errorFor("price") ? "price-error price-hint" : "price-hint"}
                  required
                />
                <span aria-hidden="true">RSD</span>
              </div>
              {errorFor("price") ? (
                <p id="price-error" className="error-text">
                  {errorFor("price")}
                </p>
              ) : null}
              <p id="price-hint" className="hint">
                Ceo iznos u dinarima, kako ga kupac plaća.
              </p>
            </div>
          </div>
          <FormField {...fieldProps("description")} as="textarea" rows={4} maxLength={1000} optional hint="Prikazuje se na stranici proizvoda. Do 1000 znakova." />

          <fieldset className="grid gap-3 border-0 p-0" aria-describedby="image-hint">
            <legend className="label mb-2">
              {LABELS.image} <span className="optional">(nije obavezno)</span>
            </legend>
            <div className="flex flex-wrap items-center gap-4">
              <div className="board w-28 shrink-0 !p-2">
                {values.image ? <Image src={values.image} alt="Izabrana slika proizvoda" width={224} height={224} unoptimized /> : <span className="t-micro text-ink-2">Bez slike</span>}
              </div>
              <div className="grid gap-2">
                <label className="btn btn-secondary cursor-pointer has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-ink">
                  {upload.status === "uploading" ? "Otpremanje…" : values.image ? "Zamenite sliku" : "Izaberite sliku"}
                  <input id="image" type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleImage} disabled={upload.status === "uploading"} />
                </label>
                {values.image ? (
                  <button type="button" className="btn btn-quiet justify-self-start px-2 text-[0.875rem]" onClick={() => setValues((v) => ({ ...v, image: "" }))}>
                    Uklonite sliku
                  </button>
                ) : null}
              </div>
            </div>
            <p id="image-hint" className="hint">
              JPG, PNG ili WebP, najviše 5 MB. Najbolje izgleda kvadratna slika.
            </p>
            {upload.status === "error" || errorFor("image") ? (
              <p className="error-text" role="alert">
                {upload.status === "error" ? upload.message : errorFor("image")}
              </p>
            ) : null}
          </fieldset>

          <div className="flex flex-wrap gap-3 pt-2">
            <button type="submit" className="btn btn-primary" disabled={saving || upload.status === "uploading"}>
              {saving ? "Čuvanje…" : editing === "new" ? "Dodaj proizvod" : "Sačuvaj izmene"}
            </button>
            <button type="button" className="btn btn-quiet" onClick={closeForm}>
              Odustani
            </button>
          </div>
        </form>
      ) : null}

      <section aria-labelledby="lista-proizvoda" className="mt-12">
        <h2 id="lista-proizvoda" className="t-title">
          Proizvodi sa fiksnom cenom <span className="tabular text-ink-2">({products.length})</span>
        </h2>
        {products.length === 0 ? (
          <p className="mt-4 text-ink-2">Još nema dodatih proizvoda.</p>
        ) : (
          <ul className="mt-4 border-t border-ink">
            {products.map((product) => (
              <li key={product.id} className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-x-4 gap-y-3 border-b border-line py-3 sm:grid-cols-[3.5rem_minmax(0,1fr)_8rem_auto]">
                <div className="board">{product.image ? <Image src={product.image} alt="" width={112} height={112} unoptimized /> : null}</div>
                <div className="min-w-0">
                  <a href={`/product/${product.id}`} className="block truncate font-semibold no-underline hover:underline" target="_blank" rel="noopener">
                    {product.title}
                  </a>
                  <span className="t-small text-ink-2">{categoryLabel(product.category)}</span>
                </div>
                <span className="tabular col-start-2 sm:col-start-auto sm:text-right">{formatRSD(product.price)}</span>
                <div className="col-start-2 flex flex-wrap gap-2 sm:col-start-auto sm:justify-end">
                  {confirming === product.id ? (
                    <>
                      <span className="t-small self-center">Obrisati proizvod?</span>
                      <button type="button" className="btn min-h-10 bg-error px-3 text-[0.875rem] text-white hover:bg-[#862f24]" onClick={() => handleDelete(product)}>
                        Obriši
                      </button>
                      <button type="button" className="btn btn-quiet min-h-10 px-3 text-[0.875rem]" onClick={() => setConfirming(null)}>
                        Odustani
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" className="btn btn-quiet min-h-10 px-3 text-[0.875rem]" onClick={() => openForm(product)} aria-label={`Izmeni: ${product.title}`}>
                        Izmeni
                      </button>
                      <button type="button" className="btn btn-quiet min-h-10 px-3 text-[0.875rem] text-error" onClick={() => setConfirming(product.id)} aria-label={`Obriši: ${product.title}`}>
                        Obriši
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

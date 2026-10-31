"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatRSD } from "@/lib/format";
import { NOTE_MAX_LENGTH, PRICING, calculatePrice, validateOptions } from "@/lib/pricing";
import { AddToCartBar, ChoiceGroup, PriceBreakdown, QuantityStepper } from "./fields";

const rules = PRICING["slike-na-pleksiglasu"];

export default function PlexiglassConfigurator({ email }) {
  const { addItem } = useCart();
  const [size, setSize] = useState(rules.defaults.size);
  const [note, setNote] = useState("");
  const [quantity, setQuantity] = useState(1);

  const { ok, options, errors } = validateOptions("slike-na-pleksiglasu", { size, note });
  const price = ok ? calculatePrice("slike-na-pleksiglasu", options) : null;

  const handleAdd = () => {
    if (!ok) {
      document.getElementById("plexi-note")?.focus();
      return false;
    }
    addItem({ category: "slike-na-pleksiglasu", options, name: "Slika na pleksiglasu", image: "", href: "/slike-na-pleksiglasu" }, quantity);
    return true;
  };

  return (
    <form className="grid content-start gap-8" onSubmit={(event) => event.preventDefault()} noValidate>
      <ChoiceGroup
        legend="Dimenzije (širina × visina)"
        name="plexi-size"
        value={size}
        onChange={setSize}
        options={rules.sizes.map((s) => ({ value: s.id, label: `${s.width} × ${s.height} cm`, detail: formatRSD(s.price) }))}
      />

      <div className="field">
        <label htmlFor="plexi-note" className="label">
          Motiv <span className="optional">(nije obavezno)</span>
        </label>
        <textarea
          id="plexi-note"
          className="input"
          rows={4}
          maxLength={NOTE_MAX_LENGTH}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          aria-invalid={errors.note ? true : undefined}
          aria-describedby="plexi-note-hint"
          placeholder="Na primer: porodična fotografija, ili link do motiva sa Shutterstock-a"
        />
        <p id="plexi-note-hint" className="hint">
          Fotografiju pošaljite na <a className="link" href={`mailto:${email}`}>{email}</a> uz broj porudžbine koji dobijete posle slanja.
        </p>
      </div>

      <QuantityStepper id="plexi-quantity" label="Broj komada" value={quantity} onChange={setQuantity} />

      <div className="grid gap-4">
        <h2 className="font-sans text-[0.875rem] font-semibold">Obračun</h2>
        <PriceBreakdown price={price} />
        <AddToCartBar price={price} onAdd={handleAdd} quantity={quantity} />
      </div>
    </form>
  );
}

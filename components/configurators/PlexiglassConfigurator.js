"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatRSD } from "@/lib/format";
import { NOTE_MAX_LENGTH, PRICING, calculatePrice, validateOptions } from "@/lib/pricing";
import { FittedElevation } from "@/components/shop/Dimension";
import { PlexiglassGlyph } from "@/components/shop/ProductGlyph";
import { AddToCartBar, ChoiceGroup, ConfiguratorLayout, PriceBreakdown, QuantityStepper, Step } from "./fields";

const rules = PRICING["slike-na-pleksiglasu"];

export default function PlexiglassConfigurator({ email, intro, aside }) {
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

  const plate = rules.sizes.find((s) => s.id === size);

  return (
    <ConfiguratorLayout
      intro={intro}
      aside={aside}
      media={
        <div>
          <FittedElevation widthLabel={`${plate.width} cm`} heightLabel={`${plate.height} cm`} ratio={String(plate.width / plate.height)}>
            <PlexiglassGlyph className="absolute inset-0 h-full w-full p-[6%]" />
          </FittedElevation>
          <p className="mt-3.5 text-center text-[0.84375rem] text-ink-2">Skica ploče sa distancerima, u izabranoj dimenziji.</p>
        </div>
      }
    >
      <ChoiceGroup
        step={1}
        legend="Dimenzija"
        name="plexi-size"
        value={size}
        onChange={setSize}
        options={rules.sizes.map((s) => ({ value: s.id, label: `${s.width} × ${s.height} cm`, detail: formatRSD(s.price) }))}
      />

      <Step n={2} legend="Motiv">
        <label htmlFor="plexi-note" className="label mb-2 block">
          Napomena
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
          placeholder="Opišite motiv koji želite da odštampamo."
        />
        <p id="plexi-note-hint" className="hint mt-3">
          Fotografiju ili pripremu pošaljite na <a className="link" href={`mailto:${email}`}>{email}</a>, uz broj porudžbine.
        </p>
      </Step>

      <Step n={3} legend="Količina">
        <QuantityStepper id="plexi-quantity" label="Broj komada" value={quantity} onChange={setQuantity} />
      </Step>

      <PriceBreakdown price={price} />
      <AddToCartBar price={price} onAdd={handleAdd} quantity={quantity} />
    </ConfiguratorLayout>
  );
}

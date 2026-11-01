"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatNumber, formatRSD } from "@/lib/format";
import { NOTE_MAX_LENGTH, PRICING, calculatePrice, validateOptions } from "@/lib/pricing";
import { AddToCartBar, CentimetreInput, ChoiceGroup, PriceBreakdown, useTouched } from "./fields";

const rules = PRICING["izrada-nalepnica"];
const d = rules.defaults;

const toOptions = (list) => list.map((entry) => ({ value: entry.id, label: entry.label }));

export default function StickerPrintConfigurator({ email }) {
  const { addItem } = useCart();
  const touched = useTouched();
  const [width, setWidth] = useState(String(d.width));
  const [height, setHeight] = useState(String(d.height));
  const [material, setMaterial] = useState(d.material);
  const [cut, setCut] = useState(d.cut);
  const [packaging, setPackaging] = useState(d.packaging);
  const [design, setDesign] = useState(d.design);
  const [speed, setSpeed] = useState(d.speed);
  const [quantityChoice, setQuantityChoice] = useState(String(d.pieces));
  const [customPieces, setCustomPieces] = useState("250");
  const [note, setNote] = useState("");

  const pieces = quantityChoice === "custom" ? customPieces : quantityChoice;
  const { ok, options, errors } = validateOptions("izrada-nalepnica", { width, height, material, cut, packaging, design, speed, pieces, note });
  const price = ok ? calculatePrice("izrada-nalepnica", options) : null;
  const perPiece = price && options.pieces ? price.total / options.pieces : null;

  const handleAdd = () => {
    touched.submit();
    if (!ok) {
      const first = ["width", "height", "pieces"].find((field) => errors[field]);
      document.getElementById(`sticker-${first || "note"}`)?.focus();
      return false;
    }
    addItem({ category: "izrada-nalepnica", options, name: "Nalepnice po meri", image: "", href: "/izrada-nalepnica" });
    return true;
  };

  return (
    <form className="grid content-start gap-8" onSubmit={(event) => event.preventDefault()} noValidate>
      <fieldset className="choice-group">
        <legend className="label">Dimenzije jedne nalepnice</legend>
        <div className="grid grid-cols-2 gap-3">
          <CentimetreInput id="sticker-width" label="Širina" value={width} onChange={setWidth} onBlur={touched.touch("width")} limits={rules.limits.width} error={errors.width} showError={touched.show("width")} />
          <CentimetreInput id="sticker-height" label="Visina" value={height} onChange={setHeight} onBlur={touched.touch("height")} limits={rules.limits.height} error={errors.height} showError={touched.show("height")} />
        </div>
      </fieldset>

      <div className="grid gap-3">
        <ChoiceGroup
          legend="Količina"
          name="sticker-quantity"
          value={quantityChoice}
          onChange={setQuantityChoice}
          columns={3}
          options={[...rules.quantities.map((q) => ({ value: String(q), label: `${formatNumber(q)} kom` })), { value: "custom", label: "Druga količina" }]}
        />
        {quantityChoice === "custom" ? (
          <div className="field max-w-[14rem] border-l border-gold pl-4">
            <label htmlFor="sticker-pieces" className="label">
              Broj komada
            </label>
            <input
              id="sticker-pieces"
              className="input tabular"
              type="number"
              inputMode="numeric"
              min={rules.customQuantity.min}
              max={rules.customQuantity.max}
              value={customPieces}
              onChange={(event) => setCustomPieces(event.target.value)}
              onBlur={touched.touch("pieces")}
              aria-invalid={errors.pieces && touched.show("pieces") ? true : undefined}
              aria-describedby="sticker-pieces-hint"
            />
            {errors.pieces && touched.show("pieces") ? <p className="error-text">{errors.pieces}</p> : null}
            <p id="sticker-pieces-hint" className="hint">
              Od {formatNumber(rules.customQuantity.min)} do {formatNumber(rules.customQuantity.max)} kom
            </p>
          </div>
        ) : null}
      </div>

      <ChoiceGroup legend="Materijal" name="sticker-material" value={material} onChange={setMaterial} columns={3} options={toOptions(rules.materials)} />
      <ChoiceGroup legend="Sečenje" name="sticker-cut" value={cut} onChange={setCut} columns={2} options={toOptions(rules.cuts)} />
      <ChoiceGroup
        legend="Pakovanje"
        name="sticker-packaging"
        value={packaging}
        onChange={setPackaging}
        columns={2}
        options={rules.packaging.map((p) => ({ value: p.id, label: p.label, detail: p.pricePerPiece ? `+${formatRSD(p.pricePerPiece)}/kom` : null }))}
      />
      <ChoiceGroup
        legend="Dizajn"
        name="sticker-design"
        value={design}
        onChange={setDesign}
        options={toOptions(rules.design)}
        hint={
          design === "imam"
            ? `Pripremu pošaljite na ${email} uz broj porudžbine.`
            : "Javićemo vam se da zajedno dogovorimo dizajn pre štampe."
        }
      />
      <ChoiceGroup legend="Rok izrade" name="sticker-speed" value={speed} onChange={setSpeed} options={toOptions(rules.speed)} />

      <div className="field">
        <label htmlFor="sticker-note" className="label">
          Napomena
        </label>
        <textarea id="sticker-note" className="input" rows={3} maxLength={NOTE_MAX_LENGTH} value={note} onChange={(event) => setNote(event.target.value)} />
      </div>

      <div className="grid gap-4">
        <h2 className="font-sans text-[0.875rem] font-semibold">Obračun</h2>
        <PriceBreakdown price={price} />
        {perPiece ? <p className="t-micro tabular text-ink-2">Cena po komadu: {perPiece.toFixed(2).replace(".", ",")} RSD</p> : null}
        <AddToCartBar price={price} onAdd={handleAdd} />
      </div>
    </form>
  );
}

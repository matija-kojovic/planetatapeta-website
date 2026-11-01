"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatNumber, formatRSD } from "@/lib/format";
import { NOTE_MAX_LENGTH, PRICING, calculatePrice, validateOptions } from "@/lib/pricing";
import { StickerSheetGlyph } from "@/components/shop/ProductGlyph";
import { AddToCartBar, CentimetreInput, ChoiceGroup, ConfiguratorLayout, PriceBreakdown, Step, useTouched } from "./fields";

const rules = PRICING["izrada-nalepnica"];
const d = rules.defaults;

const toOptions = (list) => list.map((entry) => ({ value: entry.id, label: entry.label }));

export default function StickerPrintConfigurator({ email, intro, aside }) {
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
    <ConfiguratorLayout
      intro={intro}
      aside={aside}
      media={
        <div>
          <div className="grid aspect-[5/4] place-items-center bg-board p-[12%]">
            <StickerSheetGlyph className="h-full w-auto" />
          </div>
          <p className="mt-3.5 text-center text-[0.84375rem] text-ink-2">Skica tabaka sa nalepnicama.</p>
        </div>
      }
    >
      <Step n={1} legend="Dimenzije nalepnice">
        <div className="grid grid-cols-2 gap-3.5">
          <CentimetreInput id="sticker-width" label="Širina" value={width} onChange={setWidth} onBlur={touched.touch("width")} limits={rules.limits.width} error={errors.width} showError={touched.show("width")} />
          <CentimetreInput id="sticker-height" label="Visina" value={height} onChange={setHeight} onBlur={touched.touch("height")} limits={rules.limits.height} error={errors.height} showError={touched.show("height")} />
        </div>
        <p className="hint mt-3">Dimenzije jedne nalepnice.</p>
      </Step>

      <Step n={2} legend="Količina">
        <ChoiceGroup
          legend="Broj komada"
          name="sticker-quantity"
          value={quantityChoice}
          onChange={setQuantityChoice}
          columns={3}
          options={[...rules.quantities.map((q) => ({ value: String(q), label: `${formatNumber(q)} kom` })), { value: "custom", label: "Druga količina" }]}
        />
        {quantityChoice === "custom" ? (
          <div className="field mt-3 max-w-[14rem] border-l border-gold pl-4">
            <label htmlFor="sticker-pieces" className="label">
              Broj komada
            </label>
            <input
              id="sticker-pieces"
              className="input tabular"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={customPieces}
              onChange={(event) => setCustomPieces(event.target.value.replace(/\D/g, ""))}
              onBlur={touched.touch("pieces")}
              aria-invalid={errors.pieces && touched.show("pieces") ? true : undefined}
              aria-describedby="sticker-pieces-hint"
            />
            <p id="sticker-pieces-hint" className={errors.pieces && touched.show("pieces") ? "error-text" : "hint"}>
              Od {formatNumber(rules.customQuantity.min)} do {formatNumber(rules.customQuantity.max)} kom
            </p>
          </div>
        ) : null}
      </Step>

      <ChoiceGroup step={3} legend="Materijal" name="sticker-material" value={material} onChange={setMaterial} columns={3} options={toOptions(rules.materials)} />
      <ChoiceGroup step={4} legend="Sečenje" name="sticker-cut" value={cut} onChange={setCut} options={toOptions(rules.cuts)} />
      <ChoiceGroup
        step={5}
        legend="Pakovanje"
        name="sticker-packaging"
        value={packaging}
        onChange={setPackaging}
        options={rules.packaging.map((p) => ({ value: p.id, label: p.label, detail: p.pricePerPiece ? `+${formatRSD(p.pricePerPiece)}/kom` : null }))}
      />
      <ChoiceGroup step={6} legend="Izrada" name="sticker-speed" value={speed} onChange={setSpeed} options={toOptions(rules.speed)} />
      <ChoiceGroup
        step={7}
        legend="Dizajn"
        name="sticker-design"
        value={design}
        onChange={setDesign}
        options={toOptions(rules.design)}
        hint={design === "imam" ? `Pripremu pošaljite na ${email} uz broj porudžbine.` : "Javićemo vam se da zajedno dogovorimo dizajn pre štampe."}
      />
      <Step n={8} legend="Napomena">
        <label htmlFor="sticker-note" className="sr-only">
          Napomena
        </label>
        <textarea id="sticker-note" className="input" rows={3} maxLength={NOTE_MAX_LENGTH} value={note} onChange={(event) => setNote(event.target.value)} />
      </Step>

      <PriceBreakdown price={price} />
      {perPiece ? <p className="tabular mt-1.5 text-[0.84375rem] text-ink-2">Cena po komadu: {perPiece.toFixed(2).replace(".", ",")} RSD</p> : null}
      <AddToCartBar price={price} onAdd={handleAdd} />
    </ConfiguratorLayout>
  );
}

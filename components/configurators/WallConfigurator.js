"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatRSD } from "@/lib/format";
import { PRICING, calculatePrice, validateOptions } from "@/lib/pricing";
import DesignStage from "./DesignStage";
import { AddToCartBar, CentimetreInput, ChoiceGroup, PriceBreakdown, Toggle, useTouched } from "./fields";

// Wallpaper (tapete) and wall stickers (zidni-stikeri): material per m², width × height, one add-on.
const COPY = {
  tapete: {
    materialLegend: "Materijal",
    widthLabel: "Širina zida",
    heightLabel: "Visina zida",
    previewLabel: "Na zidu",
    measureHint: "Izmerite zid na najširem i najvišem mestu.",
  },
  "zidni-stikeri": {
    materialLegend: "Folija",
    widthLabel: "Širina stikera",
    heightLabel: "Visina stikera",
    previewLabel: "Dimenzije",
    measureHint: "Unesite željenu širinu i visinu stikera.",
  },
};

export default function WallConfigurator({ category, design, href }) {
  const rules = PRICING[category];
  const copy = COPY[category];
  const isWallpaper = category === "tapete";
  const { addItem } = useCart();
  const touched = useTouched();

  const [material, setMaterial] = useState(rules.defaults.material);
  const [width, setWidth] = useState(String(rules.defaults.width));
  const [height, setHeight] = useState(String(rules.defaults.height));
  const [extra, setExtra] = useState(isWallpaper ? rules.defaults.installation : rules.defaults.contourCut);

  const raw = isWallpaper
    ? { material, width, height, installation: extra }
    : { material, width, height, contourCut: extra };
  const { ok, options, errors } = validateOptions(category, raw);
  const price = ok ? calculatePrice(category, options) : null;

  const numericWidth = Number(width);
  const numericHeight = Number(height);

  const handleAdd = () => {
    touched.submit();
    if (!ok) {
      document.getElementById(errors.width ? `${category}-width` : `${category}-height`)?.focus();
      return false;
    }
    addItem({ category, designId: design.id, options, name: design.name, image: design.src, href });
    return true;
  };

  const extraOption = isWallpaper
    ? {
        label: "Dodajte ugradnju",
        hint: `${formatRSD(rules.installation.pricePerM2)}/m², uz ${formatRSD(rules.installation.smallJobFee)} za izlazak na teren kod površina manjih od ${rules.installation.smallJobBelowM2} m². Za montažu van Beograda naplaćuju se putni troškovi.`,
      }
    : {
        label: "Konturno sečenje",
        hint: `Stiker se seče po obliku motiva. ${formatRSD(rules.contourCut.pricePerM2)}/m². Bez ove opcije seče se pravougaono.`,
      };

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-7">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
          <DesignStage
            design={design}
            width={ok || !errors.width ? numericWidth : 0}
            height={ok || !errors.height ? numericHeight : 0}
            previewLabel={copy.previewLabel}
            renderPreview={(d) => (
              <Image src={d.src} alt="" fill sizes="(min-width: 1024px) 54vw, 92vw" className={isWallpaper ? "object-cover" : "object-contain p-[4%]"} />
            )}
          />
        </div>
      </div>

      <form className="grid content-start gap-8 lg:col-span-5" onSubmit={(event) => event.preventDefault()} noValidate>
        <ChoiceGroup
          legend={copy.materialLegend}
          name={`${category}-material`}
          value={material}
          onChange={setMaterial}
          options={rules.materials.map((m) => ({ value: m.id, label: m.label, detail: `${formatRSD(m.pricePerM2)}/m²` }))}
        />

        <fieldset className="choice-group">
          <legend className="label">Dimenzije</legend>
          <div className="grid grid-cols-2 gap-3">
            <CentimetreInput
              id={`${category}-width`}
              label={copy.widthLabel}
              value={width}
              onChange={setWidth}
              onBlur={touched.touch("width")}
              limits={rules.limits.width}
              error={errors.width}
              showError={touched.show("width")}
            />
            <CentimetreInput
              id={`${category}-height`}
              label={copy.heightLabel}
              value={height}
              onChange={setHeight}
              onBlur={touched.touch("height")}
              limits={rules.limits.height}
              error={errors.height}
              showError={touched.show("height")}
            />
          </div>
          <p className="hint mt-2">{copy.measureHint}</p>
        </fieldset>

        <Toggle label={extraOption.label} hint={extraOption.hint} checked={extra} onChange={setExtra} />

        {!isWallpaper ? (
          <p className="hint -mt-4">Minimalna cena stikera je {formatRSD(rules.minimumPrice)}.</p>
        ) : null}

        <div className="grid gap-4">
          <h2 className="font-sans text-[0.875rem] font-semibold">Obračun</h2>
          <PriceBreakdown price={price} />
          <AddToCartBar price={price} onAdd={handleAdd} />
        </div>
      </form>
    </div>
  );
}

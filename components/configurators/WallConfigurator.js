"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatRSD } from "@/lib/format";
import { PRICING, calculatePrice, validateOptions } from "@/lib/pricing";
import DesignStage from "./DesignStage";
import { AddToCartBar, CentimetreInput, ChoiceGroup, ConfiguratorLayout, PriceBreakdown, Step, Toggle, useTouched } from "./fields";

// Wallpaper (tapete) and wall stickers (zidni-stikeri): material per m², width × height, one add-on.
const COPY = {
  tapete: {
    materialLegend: "Materijal",
    widthLabel: "Širina zida",
    heightLabel: "Visina zida",
    dimsLegend: "Dimenzije zida",
    extraLegend: "Ugradnja",
    caption: "Pregled zida u proporcijama koje ste uneli.",
    measureHint: "Izmerite zid na najširem i najvišem mestu.",
  },
  "zidni-stikeri": {
    materialLegend: "Folija",
    widthLabel: "Širina stikera",
    heightLabel: "Visina stikera",
    dimsLegend: "Dimenzije",
    extraLegend: "Sečenje",
    caption: "Stiker na zidu, u proporcijama koje ste uneli.",
    measureHint: "Unesite željenu širinu i visinu stikera.",
  },
};

export default function WallConfigurator({ category, design, href, intro, aside }) {
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
    <ConfiguratorLayout
      intro={intro}
      aside={aside}
      media={
        <DesignStage
          design={design}
          width={ok || !errors.width ? numericWidth : 0}
          height={ok || !errors.height ? numericHeight : 0}
          caption={copy.caption}
          renderPreview={(d) => (
            <Image src={d.src} alt="" fill sizes="(min-width: 1024px) 54vw, 92vw" className={isWallpaper ? "object-cover" : "object-contain p-[4%]"} />
          )}
        />
      }
    >
      <ChoiceGroup
        step={1}
        legend={copy.materialLegend}
        name={`${category}-material`}
        value={material}
        onChange={setMaterial}
        options={rules.materials.map((m) => ({ value: m.id, label: m.label, detail: `${formatRSD(m.pricePerM2)}/m²` }))}
      />

      <Step n={2} legend={copy.dimsLegend}>
        <div className="grid grid-cols-2 gap-3.5">
          <CentimetreInput
            id={`${category}-width`}
            label="Širina"
            value={width}
            onChange={setWidth}
            onBlur={touched.touch("width")}
            limits={rules.limits.width}
            error={errors.width}
            showError={touched.show("width")}
          />
          <CentimetreInput
            id={`${category}-height`}
            label="Visina"
            value={height}
            onChange={setHeight}
            onBlur={touched.touch("height")}
            limits={rules.limits.height}
            error={errors.height}
            showError={touched.show("height")}
          />
        </div>
        <p className="hint mt-3">{copy.measureHint}</p>
      </Step>

      <Step n={3} legend={copy.extraLegend}>
        <Toggle label={extraOption.label} hint={extraOption.hint} checked={extra} onChange={setExtra} />
        {!isWallpaper ? <p className="hint mt-3">Minimalna cena stikera je {formatRSD(rules.minimumPrice)}.</p> : null}
      </Step>

      <PriceBreakdown price={price} />
      <AddToCartBar price={price} onAdd={handleAdd} />
    </ConfiguratorLayout>
  );
}

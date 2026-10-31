"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { formatRSD } from "@/lib/format";
import { PRICING, calculatePrice, canvasDimensions, validateOptions } from "@/lib/pricing";
import DesignStage from "./DesignStage";
import { AddToCartBar, CentimetreInput, ChoiceGroup, PriceBreakdown, useTouched } from "./fields";

const rules = PRICING["slike-na-platnu"];
const STAGGER = { 5: [72, 86, 100, 86, 72] };

/** Splits one image into panels by drawing the gaps (and staggered edges) over it. */
export function PanelOverlay({ panels, gap = 1.8, color = "var(--color-board)" }) {
  if (panels < 2) return null;
  const width = (100 - gap * (panels - 1)) / panels;
  const heights = STAGGER[panels];
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {Array.from({ length: panels - 1 }, (_, i) => (
        <div key={`gap-${i}`} className="absolute inset-y-0" style={{ left: `${(i + 1) * width + i * gap}%`, width: `${gap}%`, background: color }} />
      ))}
      {heights?.map((h, i) =>
        h < 100 ? (
          <div key={`mask-${i}`}>
            <div className="absolute top-0" style={{ left: `${i * (width + gap)}%`, width: `${width}%`, height: `${(100 - h) / 2}%`, background: color }} />
            <div className="absolute bottom-0" style={{ left: `${i * (width + gap)}%`, width: `${width}%`, height: `${(100 - h) / 2}%`, background: color }} />
          </div>
        ) : null
      )}
    </div>
  );
}

function LayoutGlyph({ panels }) {
  const heights = STAGGER[panels] || Array(panels).fill(100);
  return (
    <span className="flex h-6 w-10 items-center justify-center gap-[2px]" aria-hidden="true">
      {heights.map((h, i) => (
        <span key={i} className="block bg-ink" style={{ width: panels === 1 ? "100%" : `${100 / panels}%`, height: `${h}%` }} />
      ))}
    </span>
  );
}

export default function CanvasConfigurator({ design, href }) {
  const { addItem } = useCart();
  const touched = useTouched();
  const [layout, setLayout] = useState(rules.defaults.layout);
  const [size, setSize] = useState(rules.defaults.size);
  const [width, setWidth] = useState(String(rules.defaults.width));
  const [height, setHeight] = useState(String(rules.defaults.height));
  const [edge, setEdge] = useState(rules.defaults.edge);

  const raw = size === "custom" ? { layout, size, width, height, edge } : { layout, size, edge };
  const { ok, options, errors } = validateOptions("slike-na-platnu", raw);
  const price = ok ? calculatePrice("slike-na-platnu", options) : null;
  const currentLayout = rules.layouts.find((l) => l.id === layout);
  const dims = ok ? canvasDimensions(options) : size === "custom" ? { width: Number(width) || 0, height: Number(height) || 0 } : { width: 0, height: 0 };

  const changeLayout = (next) => {
    setLayout(next);
    if (size !== "custom") setSize("medium");
  };

  const handleAdd = () => {
    touched.submit();
    if (!ok) {
      document.getElementById(errors.width ? "canvas-width" : "canvas-height")?.focus();
      return false;
    }
    addItem({ category: "slike-na-platnu", designId: design.id, options, name: design.name, image: design.src, href });
    return true;
  };

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-7">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+1.5rem)]">
          <DesignStage
            design={design}
            width={dims.width}
            height={dims.height}
            previewLabel="Raspored"
            renderPreview={(d) => (
              <>
                <Image src={d.src} alt="" fill sizes="(min-width: 1024px) 54vw, 92vw" className="object-cover" />
                <PanelOverlay panels={currentLayout.panels} />
              </>
            )}
          />
        </div>
      </div>

      <form className="grid content-start gap-8 lg:col-span-5" onSubmit={(event) => event.preventDefault()} noValidate>
        <fieldset className="choice-group">
          <legend className="label">Raspored</legend>
          <div className="grid grid-cols-3 gap-2">
            {rules.layouts.map((l) => (
              <label key={l.id} className="choice flex-col items-start justify-start gap-2 py-3">
                <input type="radio" name="canvas-layout" value={l.id} checked={layout === l.id} onChange={() => changeLayout(l.id)} />
                <LayoutGlyph panels={l.panels} />
                <span className="text-[0.875rem] font-medium leading-tight">{l.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-3">
          <ChoiceGroup
            legend="Ukupne dimenzije kompleta"
            name="canvas-size"
            value={size}
            onChange={setSize}
            options={[
              ...currentLayout.presets.map((p) => ({ value: p.id, label: `${p.width} × ${p.height} cm`, detail: formatRSD(p.price) })),
              { value: "custom", label: "Po meri", detail: "cena po m²" },
            ]}
          />
          {size === "custom" ? (
            <div className="grid grid-cols-2 gap-3 border-l border-gold pl-4">
              <CentimetreInput
                id="canvas-width"
                label="Širina"
                value={width}
                onChange={setWidth}
                onBlur={touched.touch("width")}
                limits={rules.customLimits.width}
                error={errors.width}
                showError={touched.show("width")}
              />
              <CentimetreInput
                id="canvas-height"
                label="Visina"
                value={height}
                onChange={setHeight}
                onBlur={touched.touch("height")}
                limits={rules.customLimits.height}
                error={errors.height}
                showError={touched.show("height")}
              />
            </div>
          ) : null}
        </div>

        <ChoiceGroup
          legend="Ivica platna"
          name="canvas-edge"
          value={edge}
          onChange={setEdge}
          options={rules.edges.map((e) => ({ value: e.id, label: e.label, hint: e.hint }))}
        />

        <p className="hint -mt-4">{rules.frame}. Bočne strane rama dobijaju izabranu ivicu.</p>

        <div className="grid gap-4">
          <h2 className="font-sans text-[0.875rem] font-semibold">Obračun</h2>
          <PriceBreakdown price={price} />
          <AddToCartBar price={price} onAdd={handleAdd} />
        </div>
      </form>
    </div>
  );
}

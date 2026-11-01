"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Elevation } from "@/components/shop/Dimension";
import { CloseIcon, ExpandIcon } from "@/components/icons";

const clampRatio = (w, h) => {
  if (!(w > 0 && h > 0)) return 1;
  return Math.min(3.2, Math.max(0.45, w / h));
};

/**
 * Shows a design two ways: the full design as supplied (never cropped), and a
 * dimensioned preview of how it sits on the configured surface.
 * `renderPreview(design)` draws the inside of the preview frame.
 */
export default function DesignStage({ design, width, height, previewLabel, renderPreview }) {
  const [view, setView] = useState("design");
  const [viewChosen, setViewChosen] = useState(false);
  const [shownSize, setShownSize] = useState(`${width}x${height}`);
  const dialogRef = useRef(null);
  const hasSize = width > 0 && height > 0;

  // The page opens on the full, uncropped design. Once the customer changes the size,
  // the dimensioned preview shows what that size means, unless they picked a view themselves.
  if (shownSize !== `${width}x${height}`) {
    setShownSize(`${width}x${height}`);
    if (!viewChosen && hasSize) setView("preview");
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex gap-1" role="group" aria-label="Prikaz">
          {[
            ["design", "Ceo dizajn"],
            ["preview", previewLabel],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={view === key}
              onClick={() => {
                setView(key);
                setViewChosen(true);
              }}
              className="btn btn-quiet relative min-h-11 px-3 text-[0.875rem] text-ink-2 aria-pressed:text-ink aria-pressed:after:absolute aria-pressed:after:inset-x-3 aria-pressed:after:bottom-1.5 aria-pressed:after:h-px aria-pressed:after:bg-gold"
            >
              {label}
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-quiet min-h-11 px-3 text-[0.875rem]" onClick={() => dialogRef.current?.showModal()}>
          <ExpandIcon size={18} />
          Uvećaj
        </button>
      </div>

      {view === "design" ? (
        <div className="board !aspect-[5/4] !p-[6%]">
          <Image
            src={design.src}
            alt={`${design.name}, ceo dizajn`}
            width={design.width}
            height={design.height}
            priority
            sizes="(min-width: 1024px) 54vw, 92vw"
            style={{ backgroundColor: design.color }}
          />
        </div>
      ) : (
        <div>
          <Elevation
            widthLabel={hasSize ? `${width} cm` : "—"}
            heightLabel={hasSize ? `${height} cm` : "—"}
            ratio={String(clampRatio(width, height))}
            className="mx-auto max-h-[70vh]"
          >
            {renderPreview(design)}
          </Elevation>
          <p className="t-micro mt-3 text-ink-2">Približan prikaz u izabranim proporcijama.</p>
        </div>
      )}

      <dialog
        ref={dialogRef}
        aria-label={`${design.name}, uvećan prikaz`}
        className="m-auto max-h-[94dvh] w-[min(94vw,80rem)] max-w-none bg-paper p-0"
        onClick={(event) => event.target === dialogRef.current && dialogRef.current.close()}
      >
        <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-2">
          <p className="font-semibold">{design.name}</p>
          <button type="button" className="btn btn-quiet -mr-2 px-3" onClick={() => dialogRef.current?.close()}>
            <CloseIcon />
            Zatvori
          </button>
        </div>
        <div className="grid place-items-center bg-board p-4">
          <Image
            src={design.src}
            alt={`${design.name}, uvećan prikaz`}
            width={design.width}
            height={design.height}
            sizes="94vw"
            className="max-h-[calc(94dvh-5rem)] w-auto object-contain"
          />
        </div>
      </dialog>
    </div>
  );
}

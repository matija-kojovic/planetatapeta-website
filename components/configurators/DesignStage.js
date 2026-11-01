"use client";

import Image from "next/image";
import { useRef } from "react";
import { FittedElevation } from "@/components/shop/Dimension";
import { CloseIcon, ExpandIcon } from "@/components/icons";

const clampRatio = (w, h) => {
  if (!(w > 0 && h > 0)) return 1;
  return Math.min(3.2, Math.max(0.45, w / h));
};

/**
 * The configured surface drawn as an elevation in the entered proportions (A),
 * with the full, uncropped design one click away in a lightbox.
 * `renderPreview(design)` draws the inside of the wall.
 */
export default function DesignStage({ design, width, height, caption, renderPreview }) {
  const dialogRef = useRef(null);
  const hasSize = width > 0 && height > 0;

  return (
    <div>
      <FittedElevation widthLabel={hasSize ? `${width} cm` : "—"} heightLabel={hasSize ? `${height} cm` : "—"} ratio={String(clampRatio(width, height))}>
        {renderPreview(design)}
      </FittedElevation>
      <p className="mt-3.5 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-center text-[0.84375rem] text-ink-2">
        {caption}
        <button type="button" className="inline-flex min-h-11 items-center gap-1.5 font-medium text-teal underline underline-offset-4 hover:decoration-2" onClick={() => dialogRef.current?.showModal()}>
          <ExpandIcon size={16} />
          Ceo dizajn
        </button>
      </p>

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

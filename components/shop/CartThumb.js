import Image from "next/image";
import { PlexiglassGlyph, StickerSheetGlyph } from "./ProductGlyph";

/** Square product image for cart and checkout lines; it fills the width it is given. */
export default function CartThumb({ item, className = "" }) {
  return (
    <div className={`grid aspect-square w-full place-items-center overflow-hidden bg-board p-[9%] ${className}`}>
      {item.image ? (
        <Image src={item.image} alt="" width={224} height={224} sizes="112px" className="max-h-full w-auto object-contain" unoptimized={item.image.startsWith("/uploads/")} />
      ) : item.category === "slike-na-pleksiglasu" ? (
        <PlexiglassGlyph className="h-full w-full" />
      ) : (
        <StickerSheetGlyph className="h-full w-full" />
      )}
    </div>
  );
}

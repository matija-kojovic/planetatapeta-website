import Image from "next/image";
import { PlexiglassGlyph, StickerSheetGlyph } from "./ProductGlyph";

/** Small product image for cart and checkout lines. */
export default function CartThumb({ item, size = "5.5rem" }) {
  return (
    <div className="grid shrink-0 place-items-center overflow-hidden rounded-[var(--radius-control)] bg-board p-2" style={{ width: size, height: size }}>
      {item.image ? (
        <Image src={item.image} alt="" width={176} height={176} sizes="88px" className="max-h-full w-auto object-contain" unoptimized={item.image.startsWith("/uploads/")} />
      ) : item.category === "slike-na-pleksiglasu" ? (
        <PlexiglassGlyph className="h-full w-full" />
      ) : (
        <StickerSheetGlyph className="h-full w-full" />
      )}
    </div>
  );
}

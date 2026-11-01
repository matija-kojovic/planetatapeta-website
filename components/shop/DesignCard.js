import Image from "next/image";
import Link from "next/link";
import { designHref } from "@/lib/catalog";

const GRID_SIZES = "(min-width: 1280px) 290px, (min-width: 1024px) 23vw, (min-width: 640px) 31vw, 46vw";

/** A design mounted uncropped on a sample board, with its name. */
export default function DesignCard({ design, meta, price, priority = false, sizes = GRID_SIZES, headingLevel: Heading = "h3" }) {
  return (
    <Link href={designHref(design)} className="card-link block">
      <div className="board">
        <Image src={design.src} alt="" width={design.width} height={design.height} sizes={sizes} priority={priority} />
      </div>
      <Heading className="card-title mt-3.5 font-sans text-[0.9375rem] font-semibold leading-snug tracking-normal lg:text-[0.96875rem]">{design.name}</Heading>
      {meta ? <p className="mt-0.5 text-[0.84375rem] text-ink-2">{meta}</p> : null}
      {price ? <p className="tabular mt-1.5 text-[0.875rem]">{price}</p> : null}
    </Link>
  );
}

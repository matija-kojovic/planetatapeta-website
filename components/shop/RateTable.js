import { formatRSD } from "@/lib/format";
import { PRICING } from "@/lib/pricing";

/** Price list beside a catalogue heading (A), straight from the pricing rules. */
export function rateRows(category) {
  const rules = PRICING[category];
  switch (category) {
    case "tapete":
      return [
        ...rules.materials.map((m) => [m.label, `${formatRSD(m.pricePerM2)}/m²`]),
        ["Ugradnja", `${formatRSD(rules.installation.pricePerM2)}/m²`],
        [`Izlazak na teren, ispod ${rules.installation.smallJobBelowM2} m²`, formatRSD(rules.installation.smallJobFee)],
      ];
    case "zidni-stikeri":
      return [
        ...rules.materials.map((m) => [m.label, `${formatRSD(m.pricePerM2)}/m²`]),
        ["Konturno sečenje", `${formatRSD(rules.contourCut.pricePerM2)}/m²`],
        ["Minimalna cena", formatRSD(rules.minimumPrice)],
      ];
    case "slike-na-platnu":
      return [...rules.layouts.map((l) => [l.label, `od ${formatRSD(Math.min(...l.presets.map((p) => p.price)))}`]), ["Ram", rules.frame]];
    default:
      return [];
  }
}

export default function RateTable({ category }) {
  return (
    <dl className="tabular border-t border-line">
      {rateRows(category).map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4 border-b border-line py-2.5 text-[0.90625rem]">
          <dt className="text-ink-2">{label}</dt>
          <dd className="text-right font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

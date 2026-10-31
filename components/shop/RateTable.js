import { formatRSD } from "@/lib/format";
import { PRICING } from "@/lib/pricing";

/** Per-m² price list for wallpaper and wall stickers, straight from the pricing rules. */
export default function RateTable({ category }) {
  const rules = PRICING[category];
  return (
    <table className="tabular w-full text-[0.9375rem]">
      <caption className="label mb-2 text-left">Cena po kvadratnom metru</caption>
      <tbody>
        {rules.materials.map((m) => (
          <tr key={m.id} className="border-t border-line">
            <th scope="row" className="py-2.5 text-left font-normal">
              {m.label}
            </th>
            <td className="py-2.5 text-right">{formatRSD(m.pricePerM2)}</td>
          </tr>
        ))}
        {category === "tapete" ? (
          <tr className="border-t border-line text-ink-2">
            <th scope="row" className="py-2.5 text-left font-normal">
              Ugradnja
            </th>
            <td className="py-2.5 text-right">{formatRSD(rules.installation.pricePerM2)}</td>
          </tr>
        ) : (
          <tr className="border-t border-line text-ink-2">
            <th scope="row" className="py-2.5 text-left font-normal">
              Konturno sečenje
            </th>
            <td className="py-2.5 text-right">+{formatRSD(rules.contourCut.pricePerM2)}</td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

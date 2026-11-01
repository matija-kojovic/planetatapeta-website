import { formatNumber, formatRSD } from "@/lib/format";
import { PRICING } from "@/lib/pricing";

// Read-only view of lib/pricing.js, so staff can see exactly what customers are charged.
// Values marked `pending` were introduced during the redesign and await the owner's confirmation.

const range = ({ min, max }) => `${formatNumber(min)}–${formatNumber(max)} cm`;
const size = (w, h) => `${w} × ${h} cm`;
const perCm2 = (value) => `${String(value).replace(".", ",")} RSD/cm²`;

function sections() {
  const wall = PRICING.tapete;
  const sticker = PRICING["zidni-stikeri"];
  const canvas = PRICING["slike-na-platnu"];
  const plexi = PRICING["slike-na-pleksiglasu"];
  const print = PRICING["izrada-nalepnica"];

  return [
    {
      title: "Tapete",
      rows: [
        ...wall.materials.map((m) => [m.label, `${formatRSD(m.pricePerM2)}/m²`]),
        ["Ugradnja", `${formatRSD(wall.installation.pricePerM2)}/m²`],
        [`Izlazak na teren, ispod ${wall.installation.smallJobBelowM2} m²`, formatRSD(wall.installation.smallJobFee)],
        ["Širina zida", range(wall.limits.width), true],
        ["Visina zida", range(wall.limits.height), true],
      ],
    },
    {
      title: "Zidni stikeri",
      rows: [
        ...sticker.materials.map((m) => [m.label, `${formatRSD(m.pricePerM2)}/m²`]),
        ["Konturno sečenje", `+${formatRSD(sticker.contourCut.pricePerM2)}/m²`],
        ["Minimalna cena stikera", formatRSD(sticker.minimumPrice)],
        ["Širina i visina", range(sticker.limits.width)],
      ],
    },
    ...canvas.layouts.map((layout) => ({
      title: `Slike na platnu, ${layout.label.toLowerCase()}`,
      rows: [
        ...layout.presets.map((p) => [size(p.width, p.height), formatRSD(p.price)]),
        ["Po meri", `${formatRSD(layout.custom.pricePerM2)}/m² + ${formatRSD(layout.custom.base)}, zaokruženo na ${canvas.customRoundTo} RSD`],
      ],
    })),
    {
      title: "Slike na platnu, mere po meri",
      rows: [
        ["Širina", range(canvas.customLimits.width), true],
        ["Visina", range(canvas.customLimits.height), true],
      ],
    },
    {
      title: "Slike na pleksiglasu",
      rows: plexi.sizes.map((s) => [size(s.width, s.height), formatRSD(s.price)]),
    },
    {
      title: "Izrada nalepnica",
      rows: [
        ["Cena po komadu", perCm2(print.pricePerCm2), true],
        ...print.packaging.filter((p) => p.pricePerPiece > 0).map((p) => [`Pakovanje: ${p.label.toLowerCase()}`, `+${formatRSD(p.pricePerPiece)}/kom`]),
        ["Ponuđene količine", `${print.quantities.map(formatNumber).join(", ")} kom`],
        ["Proizvoljna količina", `${formatNumber(print.customQuantity.min)}–${formatNumber(print.customQuantity.max)} kom`, true],
        ["Širina i visina", range(print.limits.width), true],
        ["Hitna izrada, pomoć oko dizajna", "bez doplate", true],
      ],
    },
  ];
}

export default function PriceList() {
  return (
    <section aria-labelledby="cenovnik" className="mt-16">
      <h2 id="cenovnik" className="t-title">
        Cene proizvoda po meri
      </h2>
      <p className="measure mt-2 text-ink-2">
        Ove cene sajt koristi u konfiguratorima, u korpi i pri prijemu porudžbine. Deo su koda sajta (<code className="t-small">lib/pricing.js</code>), pa ih ovde nije moguće menjati. Za izmenu cene javite se programeru.
      </p>
      <div className="mt-8 grid gap-x-12 gap-y-10 md:grid-cols-2">
        {sections().map((section) => (
          <table key={section.title} className="tabular w-full self-start text-[0.9375rem]">
            <caption className="mb-2 text-left font-semibold">{section.title}</caption>
            <tbody>
              {section.rows.map(([label, value, pending]) => (
                <tr key={label} className="border-t border-line">
                  <th scope="row" className="py-2 pr-4 text-left font-normal">
                    {label}
                    {pending ? <span className="t-micro block text-ink-2">čeka potvrdu</span> : null}
                  </th>
                  <td className="py-2 text-right align-top">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>
      <p className="t-small measure mt-8 text-ink-2">
        „Čeka potvrdu“: originalni sajt za ovu stavku nije imao pravilo (prihvatao je bilo koju meru), ili je cena u originalnom kodu označena kao privremena. Vrednosti su postavljene pri redizajnu i treba ih potvrditi.
      </p>
    </section>
  );
}

import { formatNumber } from "@/lib/format";
import { PRICING } from "@/lib/pricing";

// Read-only limits and options from lib/pricing.js. Prices themselves are edited
// in PriceEditor; these values stay in code. `pending` marks values introduced
// during the redesign that await the owner's confirmation.

const range = ({ min, max }) => `${formatNumber(min)}–${formatNumber(max)} cm`;

function sections() {
  const wall = PRICING.tapete;
  const sticker = PRICING["zidni-stikeri"];
  const canvas = PRICING["slike-na-platnu"];
  const print = PRICING["izrada-nalepnica"];

  return [
    {
      title: "Tapete",
      rows: [
        ["Širina zida", range(wall.limits.width), true],
        ["Visina zida", range(wall.limits.height), true],
      ],
    },
    { title: "Zidni stikeri", rows: [["Širina i visina", range(sticker.limits.width)]] },
    {
      title: "Slike na platnu, po meri",
      rows: [
        ["Širina", range(canvas.customLimits.width), true],
        ["Visina", range(canvas.customLimits.height), true],
        ["Zaokruživanje cene", `na ${canvas.customRoundTo} RSD`],
      ],
    },
    {
      title: "Izrada nalepnica",
      rows: [
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
    <section aria-labelledby="ogranicenja" className="mt-16">
      <h2 id="ogranicenja" className="t-title">
        Mere i količine
      </h2>
      <p className="measure mt-2 text-ink-2">Dozvoljene mere i količine su deo koda sajta i ovde se ne menjaju. Za izmenu se javite programeru.</p>
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
        „Čeka potvrdu“: originalni sajt za ovu stavku nije imao pravilo (prihvatao je bilo koju meru). Vrednosti su postavljene pri redizajnu i treba ih potvrditi.
      </p>
    </section>
  );
}

// Server-rendered parts of a product page, passed into the configurators (A).

/** Opening of the form column: small label, title, starting price, intro. */
export function ProductIntro({ kicker, title, price, intro }) {
  return (
    <div className="mb-6">
      <p className="t-label">{kicker}</p>
      <h1 className="t-section mt-2.5">{title}</h1>
      {price ? <p className="tabular mt-2.5 text-[1.0625rem] font-medium">{price}</p> : null}
      {intro ? <p className="mt-3.5 text-ink-2">{intro}</p> : null}
    </div>
  );
}

/** Three short facts under the preview. items: [[term, value], …] */
export function ProductSpec({ items }) {
  return (
    <dl className="mt-7 grid gap-3 border-t border-line pt-5 sm:grid-cols-3 sm:gap-4">
      {items.map(([term, value]) => (
        <div key={term}>
          <dt className="t-label">{term}</dt>
          <dd className="mt-1.5 text-[0.9375rem] leading-snug">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** What each product type is, in three facts (from the shop's own options). */
export const SPEC = {
  tapete: [
    ["Štampa", "Po meri vašeg zida"],
    ["Materijal", "Klasik, Samolepljiva ili Reljefna"],
    ["Ugradnja", "Po izboru, uz porudžbinu"],
  ],
  "zidni-stikeri": [
    ["Dimenzije", "Od 10 do 300 cm"],
    ["Folija", "Standardna, laminirana ili Easy-Apply"],
    ["Sečenje", "Konturno ili pravougaono"],
  ],
  "slike-na-platnu": [
    ["Ram", "Drveni blind ram, 2 cm"],
    ["Raspored", "Jedan, tri ili pet delova"],
    ["Ivica", "Ogledalo, crna ili bela"],
  ],
  "slike-na-pleksiglasu": [
    ["Materijal", "Akrilno staklo"],
    ["Motiv", "Vaša fotografija ili priprema"],
    ["Dimenzije", "Tri gotove veličine"],
  ],
  "izrada-nalepnica": [
    ["Podloga", "Sve vrste podloga"],
    ["Materijal", "Bela mat, bela sjaj ili providna"],
    ["Izrada", "7 ili 2 radna dana"],
  ],
};

import { test } from "node:test";
import assert from "node:assert/strict";
import { calculatePrice, validateOptions, PRICING, configurationKey } from "../lib/pricing.js";

const price = (category, raw) => {
  const { ok, options, errors } = validateOptions(category, raw);
  assert.ok(ok, `expected valid options, got ${JSON.stringify(errors)}`);
  return calculatePrice(category, options);
};

test("wallpaper: area × material rate, matching the original configurator", () => {
  // 300 × 240 cm = 7.2 m² × 700 RSD
  assert.equal(price("tapete", { material: "klasik", width: 300, height: 240 }).total, 5040);
  assert.equal(price("tapete", { material: "reljefne", width: 300, height: 240 }).total, 7920);
});

test("wallpaper: installation adds 500 RSD/m² and a 2.000 RSD call-out fee below 20 m²", () => {
  const small = price("tapete", { material: "klasik", width: 300, height: 240, installation: true });
  assert.equal(small.total, 5040 + 3600 + 2000);
  assert.equal(small.lines.length, 3);

  const large = price("tapete", { material: "klasik", width: 1000, height: 250, installation: true }); // 25 m²
  assert.equal(large.total, 17500 + 12500);
});

test("wall stickers: contour cut surcharge and 1.000 RSD minimum", () => {
  assert.equal(price("zidni-stikeri", { material: "standard", width: 100, height: 100, contourCut: true }).total, 1900);
  const tiny = price("zidni-stikeri", { material: "standard", width: 10, height: 10, contourCut: false });
  assert.equal(tiny.total, 1000);
});

test("canvas: presets use fixed prices, custom sizes round to 100 RSD", () => {
  assert.equal(price("slike-na-platnu", { layout: "5", size: "medium", edge: "mirror" }).total, 9200);
  assert.equal(price("slike-na-platnu", { layout: "1", size: "small", edge: "black" }).total, 2900);
  // 1-panel custom 80 × 60: 0.48 m² × 5000 + 1500 = 3900
  assert.equal(price("slike-na-platnu", { layout: "1", size: "custom", width: 80, height: 60, edge: "white" }).total, 3900);
});

test("plexiglass and sticker printing", () => {
  assert.equal(price("slike-na-pleksiglasu", { size: "105x117" }).total, 10500);
  const stickers = price("izrada-nalepnica", {
    ...PRICING["izrada-nalepnica"].defaults,
    width: 2,
    height: 2,
    pieces: 50,
    packaging: "pojedinacno",
  });
  assert.equal(stickers.total, 70 + 100); // 4 cm² × 0.35 × 50 + 2 RSD × 50
});

test("rejects zero, negative, fractional, huge and non-numeric dimensions", () => {
  for (const width of [0, -10, 12.5, 99999, "abc", null, undefined, Infinity]) {
    const result = validateOptions("tapete", { material: "klasik", width, height: 240 });
    assert.equal(result.ok, false, `width ${width} should be rejected`);
    assert.ok(result.errors.width);
  }
  assert.equal(validateOptions("zidni-stikeri", { material: "standard", width: 5000, height: 100 }).ok, false);
});

test("rejects unknown materials, layouts and presets from another layout", () => {
  assert.equal(validateOptions("tapete", { material: "zlato", width: 300, height: 240 }).ok, false);
  assert.equal(validateOptions("slike-na-platnu", { layout: "7", size: "medium", edge: "mirror" }).ok, false);
  assert.equal(validateOptions("slike-na-platnu", { layout: "1", size: "giant", edge: "mirror" }).ok, false);
  assert.equal(validateOptions("izrada-nalepnica", { ...PRICING["izrada-nalepnica"].defaults, pieces: 7 }).ok, false);
});

test("drops fields the client should not control, such as price", () => {
  const { options } = validateOptions("tapete", { material: "klasik", width: 300, height: 240, price: 1, total: 1 });
  assert.deepEqual(Object.keys(options).sort(), ["height", "installation", "material", "width"]);
});

test("totals always equal the sum of the displayed lines", () => {
  const { total, lines } = price("tapete", { material: "samolepljive", width: 333, height: 257, installation: true });
  assert.equal(total, lines.reduce((s, l) => s + l.amount, 0));
});

test("identical configurations produce the same cart key regardless of field order", () => {
  assert.equal(
    configurationKey("tapete", "d1", { width: 1, height: 2, material: "klasik" }),
    configurationKey("tapete", "d1", { material: "klasik", height: 2, width: 1 })
  );
});

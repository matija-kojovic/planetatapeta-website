"use client";

import { applyPriceOverrides } from "@/lib/pricing";

/**
 * Applies the admin's saved prices to the browser's copy of the pricing rules
 * before anything below renders, so configurators and the cart show the same
 * amounts the server charges. Applying is idempotent.
 */
export default function PricingSync({ overrides, children }) {
  applyPriceOverrides(overrides);
  return children;
}

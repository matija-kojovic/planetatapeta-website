// Loads the admin's saved prices into the pricing rules on the server.
//
// Server code is bundled per route (and separately for server and client
// components), so each bundle has its own copy of lib/pricing.js. Every server
// entry point that shows or charges prices calls syncPricing() first; the
// browser gets the same amounts through <PricingSync> in the root layout.
import "server-only";
import { getPriceOverrides } from "./db.js";
import { applyPriceOverrides, validatePriceOverrides } from "./pricing.js";

/** Applies the saved overrides to this bundle's pricing rules and returns them. */
export function syncPricing() {
  const { values } = validatePriceOverrides(getPriceOverrides());
  applyPriceOverrides(values);
  return values;
}

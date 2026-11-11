// Does the payment someone left without paying still earn the win-back offer?
// GET ?claim=… → { eligible, plan, price, regular, expiresAt }.
//
// The claim code is the one their abandoned Mollie payment was created with
// (it comes back in the cancel URL, and the page keeps it). The answer says
// only yes or no: the reasons stay in the logs.
import { MOLLIE_PRICES, MOLLIE_WINBACK, checkoutProviderFor, methodNotAllowed, mollieWinbackEligibility } from "./_shared.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res);
  res.setHeader("Cache-Control", "no-store");
  if (checkoutProviderFor(MOLLIE_WINBACK.plan) !== "mollie") return res.json({ eligible: false });
  try {
    const check = await mollieWinbackEligibility(String(req.query?.claim || ""));
    if (!check.eligible) return res.json({ eligible: false });
    return res.json({ eligible: true, plan: MOLLIE_WINBACK.plan, price: MOLLIE_WINBACK.price, regular: MOLLIE_PRICES[MOLLIE_WINBACK.plan], expiresAt: check.expiresAt });
  } catch (error) {
    console.error("Mollie win-back lookup failed:", error);
    return res.json({ eligible: false });
  }
}

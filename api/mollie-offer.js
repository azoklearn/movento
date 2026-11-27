// Does the payment someone left without paying still earn the win-back offer?
// GET ?claim=…[&left=1] → { eligible, plan, price, regular, expiresAt, endsIn }.
// The offer is the plan they left, at its offer price, and it ends `endsIn`
// seconds from now: the first call starts that clock (api/_shared.js).
// left=1: the buyer is back on the site from a payment still open.
//
// The claim code is the one their abandoned Mollie payment was created with
// (it comes back in the cancel URL, and the page keeps it). The answer says
// only yes or no: the reasons stay in the logs.
import { checkoutProviderFor, methodNotAllowed, mollieWinbackEligibility } from "./_shared.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res);
  res.setHeader("Cache-Control", "no-store");
  try {
    const check = await mollieWinbackEligibility(String(req.query?.claim || ""), { left: req.query?.left === "1" });
    if (!check.eligible || checkoutProviderFor(check.plan) !== "mollie") return res.json({ eligible: false });
    return res.json({ eligible: true, plan: check.plan, price: check.price, regular: check.regular, expiresAt: check.expiresAt, endsIn: check.endsIn });
  } catch (error) {
    console.error("Mollie win-back lookup failed:", error);
    return res.json({ eligible: false });
  }
}

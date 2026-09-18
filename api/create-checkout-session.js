import { appendAffiliate, appendPromo, bestCheckoutUrl, checkoutUrls, methodNotAllowed, RETIRED_PLANS } from "./_shared.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);

  const { plan, ref } = req.body || {};
  const checkoutUrl = RETIRED_PLANS.has(plan) ? null : checkoutUrls[plan];

  if (!checkoutUrl) {
    return res.status(400).json({
      error: "Plan invalide ou lien de checkout Whop manquant.",
      // Only what a caller could actually buy: a plan whose link is still
      // waiting to be configured is as unbuyable as a retired one, and
      // listing it would send whoever read this error straight back into a 400.
      validPlans: Object.keys(checkoutUrls).filter((id) => checkoutUrls[id] && !RETIRED_PLANS.has(id)),
    });
  }

  // One URL, and everything the buyer must not have to type is already on it:
  // the affiliate ref so the commission is credited, and the promo code so the
  // discount is applied before they see the total. The site no longer mounts a
  // checkout of its own — it sends them to this page and Whop returns them to
  // /success.
  return res.json({
    checkoutUrl: appendPromo(appendAffiliate(bestCheckoutUrl(plan) || checkoutUrl, ref)),
  });
}

import { appendAffiliate, appendPromo, bestCheckoutUrl, CHECKOUT_PROMO_CODE, checkoutUrls, methodNotAllowed, resolvePlanId, RETIRED_PLANS } from "./_shared.js";

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

  // planId (plan_xxx) drives the on-site EMBEDDED checkout: the client mounts
  // Whop's form inline and the buyer never leaves movento.dev. It stays null
  // when only a product-page link is configured, and the client then falls back
  // to redirecting to checkoutUrl.
  //
  // checkoutUrl is still returned either way — it is the escape hatch the
  // overlay offers when the embed cannot load, and the path a referred visitor
  // takes, since the affiliate code only credits from the URL.
  //
  // The promo rides on that URL for the redirect and is handed over separately
  // for the embed, so the discount applies without the buyer typing anything.
  return res.json({
    checkoutUrl: appendPromo(appendAffiliate(bestCheckoutUrl(plan) || checkoutUrl, ref)),
    planId: resolvePlanId(plan),
    promoCode: CHECKOUT_PROMO_CODE || null,
  });
}

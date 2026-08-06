import { appendAffiliate, appendPromo, bestCheckoutUrl, CHECKOUT_PROMO_CODE, checkoutUrls, methodNotAllowed, resolvePlanId } from "./_shared.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);

  const { plan, ref } = req.body || {};
  const checkoutUrl = checkoutUrls[plan];

  if (!checkoutUrl) {
    return res.status(400).json({
      error: "Plan invalide ou lien de checkout Whop manquant.",
      validPlans: Object.keys(checkoutUrls),
    });
  }

  // planId (plan_xxx) drives the on-site EMBEDDED checkout — the client mounts the
  // Whop checkout inline, no redirect. When only a product-page link is configured
  // it stays null and the client falls back to redirecting to checkoutUrl.
  //
  // The promo rides on the URL for the redirect path and is handed to the client
  // separately for the embedded one, so the buyer never has to type it.
  return res.json({
    checkoutUrl: appendPromo(appendAffiliate(bestCheckoutUrl(plan) || checkoutUrl, ref)),
    planId: resolvePlanId(plan),
    promoCode: CHECKOUT_PROMO_CODE || null,
  });
}

import { activeCheckoutUrl, appendAffiliate, appendPromo, bestCheckoutUrl, CHECKOUT_PROMO_CODE, checkoutProviderFor, checkoutUrls, isGumroadUrl, methodNotAllowed, onWhopCheckout, paddleClientToken, paddleEnvironment, paddlePriceIds, resolvePlanId, RETIRED_PLANS } from "./_shared.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);

  const { plan, ref } = req.body || {};

  // Paddle has no URL to send anyone to: the client opens Paddle.js's overlay
  // with the price id, so that is what goes back, with the public token and
  // the environment it belongs to.
  if (!RETIRED_PLANS.has(plan) && checkoutProviderFor(plan) === "paddle") {
    return res.json({
      provider: "paddle",
      checkoutUrl: null,
      planId: null,
      promoCode: null,
      paddle: { environment: paddleEnvironment(), token: paddleClientToken(), priceId: paddlePriceIds()[plan] },
    });
  }

  const checkoutUrl = RETIRED_PLANS.has(plan) ? null : activeCheckoutUrl(plan);

  if (!checkoutUrl) {
    return res.status(400).json({
      error: checkoutProviderFor(plan) === "none" && !RETIRED_PLANS.has(plan)
        ? "Cette offre n'est pas encore disponible au paiement. Réessaie dans quelques minutes, ou prends l'offre mensuelle."
        : onWhopCheckout()
          ? "Plan invalide ou lien de checkout Whop manquant."
          : "Plan invalide ou lien de checkout manquant pour cette offre.",
      // Only what a caller could actually buy: a plan whose link is still
      // waiting to be configured is as unbuyable as a retired one, and
      // listing it would send whoever read this error straight back into a 400.
      validPlans: Object.keys(checkoutUrls).filter((id) => (checkoutProviderFor(id) === "paddle" || activeCheckoutUrl(id)) && !RETIRED_PLANS.has(id)),
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
  // Off Whop: no plan id, which is what makes the client redirect instead of
  // mounting Whop's element — that branch already exists for plans that never
  // had an embeddable id. And no Whop-only parameter is appended to a URL that
  // would not understand it.
  //
  // provider tells the client which page this is: a Gumroad link opens in
  // Gumroad's own overlay on top of the site rather than as a redirect.
  if (checkoutProviderFor(plan) !== "whop") {
    const provider = isGumroadUrl(checkoutUrl) ? "gumroad" : "external";
    return res.json({ checkoutUrl, planId: null, promoCode: null, provider });
  }

  return res.json({
    checkoutUrl: appendPromo(appendAffiliate(bestCheckoutUrl(plan) || checkoutUrl, ref)),
    planId: resolvePlanId(plan),
    promoCode: CHECKOUT_PROMO_CODE || null,
    provider: "whop",
  });
}

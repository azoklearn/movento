import { checkoutUrls, methodNotAllowed, resolvePlanId } from "./_shared.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);

  const { plan } = req.body || {};
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
  return res.json({ checkoutUrl, planId: resolvePlanId(plan) });
}

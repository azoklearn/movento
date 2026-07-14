import { checkoutUrls, methodNotAllowed } from "./_shared.js";

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

  // Whop hosts checkout, so there is no session to create — just hand back the
  // plan's hosted link and let the client redirect.
  return res.json({ checkoutUrl });
}

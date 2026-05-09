import { getClientUrl, methodNotAllowed, priceIds, stripe } from "./_shared.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);

  const { plan } = req.body || {};
  const priceId = priceIds[plan];

  if (!priceId) {
    return res.status(400).json({
      error: "Plan invalide ou Price ID Stripe manquant.",
      validPlans: Object.keys(priceIds),
    });
  }

  try {
    const clientUrl = getClientUrl(req);
    const session = await stripe.checkout.sessions.create({
      mode: plan === "lifetime" ? "payment" : "subscription",
      allow_promotion_codes: true,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { plan },
      success_url: `${clientUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/#pricing`,
    });

    return res.json({ checkoutUrl: session.url });
  } catch (error) {
    console.error("Stripe Checkout session creation failed:", error);
    return res.status(500).json({ error: "Impossible de créer la session Stripe Checkout." });
  }
}

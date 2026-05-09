import { methodNotAllowed, normalizeEmail, stripe } from "./_shared.js";

export default async function handler(req, res) {
  if (req.method !== "GET") return methodNotAllowed(res, "GET");

  const sessionId = req.query.session_id;
  if (!sessionId || typeof sessionId !== "string") {
    return res.status(400).json({ error: "session_id requis." });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(402).json({ error: "Paiement non confirmé." });
    }

    return res.json({
      hasAccess: true,
      email: normalizeEmail(session.customer_details?.email),
      plan: session.metadata?.plan || "unknown",
    });
  } catch (error) {
    console.error("Checkout session verification failed:", error);
    return res.status(500).json({ error: "Impossible de confirmer la session Stripe." });
  }
}

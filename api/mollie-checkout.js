// Starts a Mollie payment for one plan and returns the hosted payment page
// to send the buyer to.
//
// The email is asked on the site first, because the month is a subscription:
// Mollie needs a customer to store the card against (sequenceType "first"),
// and the access is granted to that address. The same customer is reused for
// the same email (kept in Redis), so a buyer who comes back has one history.
//
// What is charged comes from MOLLIE_PRICES, never from the request.
import { Redis } from "@upstash/redis";
import { checkoutProviderFor, methodNotAllowed, MOLLIE_PLAN_LABELS, MOLLIE_PRICES, mollieApi, normalizeEmail, RETIRED_PLANS } from "./_shared.js";

const looksLikeEmail = (email) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

async function customerFor(email) {
  const key = `mollie:customer:${email}`;
  let redis = null;
  try {
    redis = Redis.fromEnv();
    const known = await redis.get(key);
    if (known) return String(known);
  } catch {
    // No Redis: a new customer each time, which Mollie handles fine.
  }
  const customer = await mollieApi("/customers", { method: "POST", body: { email, metadata: { source: "movento.dev" } } });
  try { await redis?.set(key, customer.id); } catch {}
  return customer.id;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);
  res.setHeader("Cache-Control", "no-store");

  const plan = String(req.body?.plan || "");
  const email = normalizeEmail(req.body?.email);
  if (RETIRED_PLANS.has(plan) || checkoutProviderFor(plan) !== "mollie") {
    return res.status(400).json({ error: "Cette offre n'est pas disponible au paiement." });
  }
  if (!looksLikeEmail(email)) {
    return res.status(400).json({ error: "Entre une adresse email valide.", errorEn: "Enter a valid email address." });
  }

  // The site's own address, as this request reached it.
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const base = `https://${host}`;
  try {
    const customerId = await customerFor(email);
    const payment = await mollieApi("/payments", {
      method: "POST",
      body: {
        amount: { currency: "EUR", value: MOLLIE_PRICES[plan] },
        description: plan === "lifetime" ? "Movento — Accès à vie" : `Movento — ${MOLLIE_PLAN_LABELS[plan]}`,
        customerId,
        // The month stores the card for the charges that follow; lifetime is
        // charged once.
        sequenceType: plan === "m1" ? "first" : "oneoff",
        redirectUrl: `${base}/success?provider=mollie&email=${encodeURIComponent(email)}`,
        cancelUrl: `${base}/pricing`,
        webhookUrl: `${base}/api/mollie-webhook`,
        locale: "fr_FR",
        metadata: { plan, email },
      },
    });
    const checkoutUrl = payment?._links?.checkout?.href;
    if (!checkoutUrl) throw new Error("Mollie returned no checkout link");
    return res.json({ checkoutUrl });
  } catch (error) {
    console.error("Mollie checkout failed:", error);
    return res.status(502).json({ error: "Le paiement n'a pas pu démarrer. Réessaie dans un instant.", errorEn: "The payment could not start. Try again in a moment." });
  }
}

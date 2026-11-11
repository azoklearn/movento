// Starts a Mollie payment for one plan and returns the hosted payment page
// to send the buyer to, straight away: no email is asked first, that was
// friction. The buyer gives it on /success after paying.
//
// So the payment carries a claim code: a random secret, in the return URL
// and in the payment's metadata, mapped here to the payment. Whoever comes
// back from Mollie with it can attach an email to that one payment
// (api/mollie-claim.js); nobody without it can.
//
// 3 months and the year are subscriptions, so Mollie needs a customer to store the card
// against (sequenceType "first"): one is created with no email, and the email
// is added to it on the claim. When the email IS already known (a returning
// visitor), it is passed along and the customer reused, as before.
//
// What is charged comes from MOLLIE_PRICES, never from the request.
import { randomBytes } from "node:crypto";
import { Redis } from "@upstash/redis";
import { checkoutProviderFor, methodNotAllowed, MOLLIE_PACK_SIZES, MOLLIE_PLAN_LABELS, MOLLIE_PRICES, MOLLIE_WINBACK, mollieApi, mollieWinbackEligibility, normalizeEmail, RETIRED_PLANS } from "./_shared.js";

const looksLikeEmail = (email) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

async function customerFor(email) {
  if (!email) {
    const customer = await mollieApi("/customers", { method: "POST", body: { metadata: { source: "movento.dev" } } });
    return customer.id;
  }
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
  // Optional: used when known, never required.
  const knownEmail = looksLikeEmail(email) ? email : "";

  // The win-back price, only on the plan it is for and only while the
  // payment the buyer left still earns it (api/_shared.js). Anything else in
  // `offer` is ignored and the normal price is charged.
  let offer = null;
  if (req.body?.offer && plan === MOLLIE_WINBACK.plan) {
    try {
      const check = await mollieWinbackEligibility(String(req.body.offer));
      if (check.eligible) offer = { from: String(req.body.offer) };
    } catch (error) {
      console.error("Mollie win-back check failed:", error);
    }
  }
  const amount = offer ? MOLLIE_WINBACK.price : MOLLIE_PRICES[plan];

  // The site's own address, as this request reached it.
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const base = `https://${host}`;
  try {
    const customerId = await customerFor(knownEmail);
    const claim = randomBytes(18).toString("base64url");
    const payment = await mollieApi("/payments", {
      method: "POST",
      body: {
        amount: { currency: "EUR", value: amount },
        description: MOLLIE_PACK_SIZES[plan] ? `Movento — Pack de ${MOLLIE_PACK_SIZES[plan]} prompts` : plan === "lifetime" ? "Movento — Accès à vie" : `Movento — ${MOLLIE_PLAN_LABELS[plan]}${offer ? " (offre 1re année)" : ""}`,
        customerId,
        // A subscription (3 months, the year) stores the card for the charges
        // that follow; lifetime is charged once.
        sequenceType: plan === "lifetime" || MOLLIE_PACK_SIZES[plan] ? "oneoff" : "first",
        redirectUrl: `${base}/success?provider=mollie&claim=${claim}${knownEmail ? `&email=${encodeURIComponent(knownEmail)}` : ""}`,
        // Back on the pricing page with the claim, which is what lets the page
        // offer the year at the win-back price to someone who left.
        cancelUrl: `${base}/pricing?left=${claim}`,
        webhookUrl: `${base}/api/mollie-webhook`,
        locale: "fr_FR",
        metadata: { plan, claim, ...(offer ? { offer: "winback", offerFrom: offer.from } : {}), ...(knownEmail ? { email: knownEmail } : {}) },
      },
    });
    // Kept 60 days: long enough for a buyer who closes the tab and comes back.
    await Redis.fromEnv().set(`mollie:claim:${claim}`, { paymentId: payment.id, plan }, { ex: 60 * 86400 });
    const checkoutUrl = payment?._links?.checkout?.href;
    if (!checkoutUrl) throw new Error("Mollie returned no checkout link");
    return res.json({ checkoutUrl, claim });
  } catch (error) {
    console.error("Mollie checkout failed:", error);
    return res.status(502).json({ error: "Le paiement n'a pas pu démarrer. Réessaie dans un instant.", errorEn: "The payment could not start. Try again in a moment." });
  }
}

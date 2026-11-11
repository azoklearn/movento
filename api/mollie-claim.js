// The buyer, back from Mollie on /success, says which email the purchase is
// for. POST { claim, email }.
//
// The claim code is the secret put in the return URL when the payment was
// created (api/mollie-checkout.js); it names exactly one payment. The payment
// is read back from Mollie, so only a payment that really is paid unlocks
// anything, and a payment is bound to the first email that claims it: a
// second, different address is refused, so a leaked link cannot move a
// purchase to someone else.
//
// Answers 202 while Mollie has not confirmed the payment yet (the page asks
// again), 200 once the access is granted.
import { Redis } from "@upstash/redis";
import { claimedEmail, grantPaid, wasRefunded } from "./_mollie.js";
import { MOLLIE_PLAN_LABELS, methodNotAllowed, mollieApi, mollieTestMode, normalizeEmail, notifyTelegramOnce } from "./_shared.js";

const looksLikeEmail = (email) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);
  res.setHeader("Cache-Control", "no-store");
  const claim = String(req.body?.claim || "");
  const email = normalizeEmail(req.body?.email);
  if (!looksLikeEmail(email)) return res.status(400).json({ error: "Entre une adresse email valide.", errorEn: "Enter a valid email address." });
  if (!/^[A-Za-z0-9_-]{16,64}$/.test(claim)) return res.status(400).json({ error: "Lien de retour invalide.", errorEn: "Invalid return link." });

  const redis = Redis.fromEnv();
  let entry;
  try {
    entry = await redis.get(`mollie:claim:${claim}`);
    if (typeof entry === "string") entry = JSON.parse(entry);
  } catch {
    entry = null;
  }
  if (!entry?.paymentId) {
    return res.status(404).json({ error: "Ce lien de paiement est introuvable ou a expiré. Écris-nous à movento.dev@gmail.com avec ton reçu.", errorEn: "This payment link is unknown or expired. Email movento.dev@gmail.com with your receipt." });
  }

  let payment;
  try {
    payment = await mollieApi(`/payments/${encodeURIComponent(entry.paymentId)}`);
  } catch (error) {
    console.error("Mollie claim lookup failed:", error);
    return res.status(502).json({ error: "Vérification impossible pour le moment. Réessaie.", errorEn: "Unable to verify right now. Please retry." });
  }
  // The claim code must be the one this payment was created with.
  if (payment.metadata?.claim !== claim) return res.status(404).json({ error: "Lien de retour invalide.", errorEn: "Invalid return link." });

  if (payment.status === "open" || payment.status === "pending" || payment.status === "authorized") {
    return res.status(202).json({ pending: true });
  }
  if (payment.status !== "paid") {
    return res.status(409).json({ error: "Ce paiement n'a pas abouti : rien n'a été prélevé. Tu peux réessayer depuis la page des offres.", errorEn: "This payment did not go through: nothing was charged. You can try again from the pricing page.", status: payment.status });
  }
  if (await wasRefunded(payment.id)) return res.status(409).json({ error: "Ce paiement a été remboursé.", errorEn: "This payment was refunded." });

  // Bound to the first email that claims it.
  const already = await claimedEmail(payment.id);
  if (already && already !== email) {
    return res.status(409).json({ error: "Ce paiement est déjà associé à une autre adresse. Utilise celle-là pour te connecter, ou écris-nous.", errorEn: "This payment is already tied to another address. Use that one to sign in, or write to us." });
  }
  if (!already) {
    const first = await redis.set(`mollie:claimed:${payment.id}`, email, { nx: true });
    if (!first && (await claimedEmail(payment.id)) !== email) {
      return res.status(409).json({ error: "Ce paiement est déjà associé à une autre adresse.", errorEn: "This payment is already tied to another address." });
    }
  }

  try {
    const { plan, subscriptionId } = await grantPaid(payment, email);
    // The email on Mollie's side too: on the customer (receipts, the
    // dashboard) and on the subscription the renewals come from.
    if (payment.customerId) {
      await mollieApi(`/customers/${encodeURIComponent(payment.customerId)}`, { method: "PATCH", body: { email } }).catch((e) => console.error("Mollie customer email update failed:", e));
      if (subscriptionId) {
        await mollieApi(`/customers/${encodeURIComponent(payment.customerId)}/subscriptions/${encodeURIComponent(subscriptionId)}`, { method: "PATCH", body: { metadata: { plan, email } } }).catch((e) => console.error("Mollie subscription metadata update failed:", e));
      }
    }
    if (!already) {
      await notifyTelegramOnce(`mollie:${payment.id}:claimed`, `${mollieTestMode() || payment.mode === "test" ? "🧪 TEST · " : ""}✉️ Email reçu pour la vente Mollie — ${MOLLIE_PLAN_LABELS[plan] || plan}\n${email}`);
    }
    return res.json({ ok: true, email });
  } catch (error) {
    console.error("Mollie claim grant failed:", error);
    return res.status(500).json({ error: "L'accès n'a pas pu être ouvert. Réessaie dans un instant.", errorEn: "Access could not be opened. Try again in a moment." });
  }
}

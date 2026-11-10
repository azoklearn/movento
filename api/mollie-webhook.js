// Mollie's payment notifications. Mollie posts only a payment id ("id=tr_…");
// everything acted on is read back from Mollie's API with the secret key, so
// a forged call can only make the site look at a real payment's real status.
// That is Mollie's own security model, and why there is no signature here.
//
// What each payment does:
//   paid, first payment of the month  → access for a month (+ grace), and the
//                                        subscription created on the stored card
//   paid, monthly charge               → access extended a month
//   paid, lifetime                     → access for good
//   refunded in full or charged back   → access taken back, subscription
//                                        cancelled, payment remembered as refunded
//   failed monthly charge              → a ping; the access runs out by itself
//                                        at the end of its grace period
//
// The buyer gives their email after paying, so a payment can be paid before
// anyone knows whose it is. Then the subscription is still set up and the
// sale still pinged, and the access is granted when the buyer claims the
// payment on /success (api/mollie-claim.js).
//
// Mollie calls again on every status change, and retries a call that did not
// get a 200, so all of this is idempotent.
import { emailForPayment, ensureSubscription, grantPaid, wasRefunded } from "./_mollie.js";
import {
  formatMinorAmount,
  MOLLIE_PLAN_LABELS,
  mollieApi,
  mollieTestMode,
  methodNotAllowed,
  notifyTelegramOnce,
  recordWebhookStatus,
  redisClearAccess,
  redisGetAccessRecord,
} from "./_shared.js";
import { Redis } from "@upstash/redis";

const cents = (amount) => Math.round(Number(amount?.value || 0) * 100);
const money = (amount) => formatMinorAmount(cents(amount), amount?.currency || "EUR");

async function readId(req) {
  const body = req.body;
  if (body && typeof body === "object" && !Buffer.isBuffer(body)) return String(body.id || "");
  let text = typeof body === "string" ? body : Buffer.isBuffer(body) ? body.toString("utf8") : "";
  if (!text && typeof req[Symbol.asyncIterator] === "function") {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    text = Buffer.concat(chunks).toString("utf8");
  }
  return String(new URLSearchParams(text).get("id") || "");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);
  const id = await readId(req);
  const done = async (code, outcome, telegram = "aucun message prévu", body = { ok: code < 400 }) => {
    await recordWebhookStatus("mollie", { code, event: id, outcome, telegram });
    return res.status(code).json(body);
  };
  // Subscriptions and other objects are not acted on; only payments are.
  if (!id.startsWith("tr_")) return done(200, "ignoré : pas un paiement");

  let payment;
  try {
    payment = await mollieApi(`/payments/${encodeURIComponent(id)}`);
  } catch (error) {
    console.error("Mollie payment lookup failed:", id, error);
    // 500 so Mollie retries: the payment may be paid, and must not be lost.
    return done(500, `lecture du paiement impossible : ${error.message}`);
  }

  const plan = payment.metadata?.plan || (payment.subscriptionId ? "m1" : "");
  if (plan !== "m1" && plan !== "lifetime") return done(200, "ignoré : pas une offre Movento");
  const email = await emailForPayment(payment);
  const test = mollieTestMode() || payment.mode === "test" ? "🧪 TEST · " : "";
  const label = MOLLIE_PLAN_LABELS[plan];
  const who = email || "email pas encore donné par le client";

  try {
    // Refunds and chargebacks first: a refunded payment still reads "paid".
    const refundedInFull = cents(payment.amountRefunded) > 0 && cents(payment.amountRefunded) >= cents(payment.amount);
    const chargedBack = cents(payment.amountChargedBack) > 0;
    if (refundedInFull || chargedBack) {
      await Redis.fromEnv().set(`mollierefund:${payment.id}`, new Date().toISOString()).catch(() => {});
      const previous = email ? await redisGetAccessRecord(email) : null;
      const ours = previous?.provider === "mollie" && (previous.transactionId === payment.id || (plan === "m1" && previous.kind === "m1"));
      if (ours) {
        if (previous.subscriptionId && previous.customerId) {
          await mollieApi(`/customers/${encodeURIComponent(previous.customerId)}/subscriptions/${encodeURIComponent(previous.subscriptionId)}`, { method: "DELETE" }).catch((e) => console.error("Mollie subscription cancel after refund failed:", e));
        }
        await redisClearAccess(email);
      }
      const sent = await notifyTelegramOnce(`mollie:${payment.id}:${chargedBack ? "chargeback" : "refund"}`, `${test}${chargedBack ? "⚠️ Litige bancaire (chargeback)" : "↩️ Remboursement"} Mollie — ${label}\n${money(chargedBack ? payment.amountChargedBack : payment.amountRefunded)}\n${who}`);
      return done(200, ours ? "remboursé : accès retiré" : "remboursé : aucun accès lié", sent ? "envoyé" : "non envoyé");
    }

    if (payment.status === "paid") {
      if (await wasRefunded(payment.id)) return done(200, "ignoré : paiement déjà remboursé");
      const renewal = payment.sequenceType === "recurring" || Boolean(payment.subscriptionId);
      let outcome;
      if (email) {
        await grantPaid(payment, email);
        outcome = renewal ? "renouvellement : accès prolongé" : "vente : accès accordé";
      } else {
        // Paid, owner unknown until the buyer claims it. The card is set up
        // for the month now, so nothing is lost if the claim comes later.
        if (payment.sequenceType === "first") await ensureSubscription(payment, "");
        outcome = "vente : en attente de l'email du client";
      }
      const sent = await notifyTelegramOnce(`mollie:${payment.id}:paid`, `${test}${renewal ? "🔁 Renouvellement" : "💰 Nouvelle vente"} Mollie — ${label}\n${money(payment.amount)}\n${who}`);
      return done(200, outcome, sent ? "envoyé" : "non envoyé (déjà envoyé ou Telegram non configuré)");
    }

    if (payment.status === "failed" && (payment.sequenceType === "recurring" || payment.subscriptionId)) {
      const previous = email ? await redisGetAccessRecord(email) : null;
      const sent = await notifyTelegramOnce(`mollie:${payment.id}:failed`, `${test}💳 Paiement mensuel échoué — Mollie\nL'accès s'arrêtera le ${previous?.accessUntil ? new Date(previous.accessUntil).toLocaleDateString("fr-FR") : "?"} sans nouveau paiement.\n${who}`);
      return done(200, "prélèvement échoué", sent ? "envoyé" : "non envoyé");
    }

    // open, pending, expired, canceled first payments: an abandoned checkout.
    return done(200, `ignoré : statut ${payment.status}`);
  } catch (error) {
    console.error("Mollie webhook handling failed:", id, error);
    return done(500, `erreur : ${error.message}`, undefined, { error: "Traitement impossible." });
  }
}

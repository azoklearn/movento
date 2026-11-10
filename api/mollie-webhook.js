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
// Mollie calls again on every status change, and retries a call that did not
// get a 200, so all of this is idempotent.
import { Redis } from "@upstash/redis";
import {
  formatMinorAmount,
  MOLLIE_PLAN_LABELS,
  MOLLIE_PRICES,
  mollieAccessRecord,
  mollieApi,
  mollieMonthAccessUntil,
  mollieTestMode,
  methodNotAllowed,
  normalizeEmail,
  notifyTelegramOnce,
  recordWebhookStatus,
  redisClearAccess,
  redisGetAccessRecord,
  redisSetAccess,
} from "./_shared.js";

const cents = (amount) => Math.round(Number(amount?.value || 0) * 100);
const money = (amount) => formatMinorAmount(cents(amount), amount?.currency || "EUR");

// Mollie wants a calendar date for the subscription's first charge: a month
// after the payment that stored the card.
function nextMonthDate(from) {
  const d = new Date(from || Date.now());
  d.setUTCMonth(d.getUTCMonth() + 1);
  return d.toISOString().slice(0, 10);
}

async function emailOf(payment) {
  const fromMeta = normalizeEmail(payment.metadata?.email);
  if (fromMeta) return fromMeta;
  if (!payment.customerId) return "";
  try {
    const customer = await mollieApi(`/customers/${encodeURIComponent(payment.customerId)}`);
    return normalizeEmail(customer.email);
  } catch {
    return "";
  }
}

// The subscription for a first payment, created once even if Mollie calls
// twice at the same moment: a short lock, released if creation fails so the
// retry can try again.
async function ensureSubscription(payment, email) {
  const redis = Redis.fromEnv();
  const doneKey = `mollie:subfor:${payment.id}`;
  const existing = await redis.get(doneKey).catch(() => null);
  if (existing) return String(existing);
  const lock = `mollie:sublock:${payment.id}`;
  const got = await redis.set(lock, 1, { nx: true, ex: 60 }).catch(() => "OK");
  if (!got) throw new Error("subscription creation already in progress");
  try {
    const sub = await mollieApi(`/customers/${encodeURIComponent(payment.customerId)}/subscriptions`, {
      method: "POST",
      body: {
        amount: { currency: "EUR", value: MOLLIE_PRICES.m1 },
        interval: "1 month",
        startDate: nextMonthDate(payment.paidAt),
        description: "Movento — Mensuel",
        webhookUrl: payment.webhookUrl,
        metadata: { plan: "m1", email },
      },
    });
    await redis.set(doneKey, sub.id).catch(() => {});
    return sub.id;
  } finally {
    await redis.del(lock).catch(() => {});
  }
}

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
  const email = await emailOf(payment);
  if (!email) return done(500, "email introuvable", undefined, { error: "Email introuvable." });

  const test = mollieTestMode() || payment.mode === "test" ? "🧪 TEST · " : "";
  const label = MOLLIE_PLAN_LABELS[plan];
  const previous = await redisGetAccessRecord(email);
  const redis = Redis.fromEnv();

  try {
    // Refunds and chargebacks first: a refunded payment still reads "paid".
    const refundedInFull = cents(payment.amountRefunded) > 0 && cents(payment.amountRefunded) >= cents(payment.amount);
    const chargedBack = cents(payment.amountChargedBack) > 0;
    if (refundedInFull || chargedBack) {
      await redis.set(`mollierefund:${payment.id}`, new Date().toISOString()).catch(() => {});
      const ours = previous?.provider === "mollie" && (previous.transactionId === payment.id || (plan === "m1" && previous.kind === "m1"));
      if (ours) {
        if (previous.subscriptionId && previous.customerId) {
          await mollieApi(`/customers/${encodeURIComponent(previous.customerId)}/subscriptions/${encodeURIComponent(previous.subscriptionId)}`, { method: "DELETE" }).catch((e) => console.error("Mollie subscription cancel after refund failed:", e));
        }
        await redisClearAccess(email);
      }
      const sent = await notifyTelegramOnce(`mollie:${payment.id}:${chargedBack ? "chargeback" : "refund"}`, `${test}${chargedBack ? "⚠️ Litige bancaire (chargeback)" : "↩️ Remboursement"} Mollie — ${label}\n${money(chargedBack ? payment.amountChargedBack : payment.amountRefunded)}\n${email}`);
      return done(200, ours ? "remboursé : accès retiré" : "remboursé : aucun accès lié", sent ? "envoyé" : "non envoyé");
    }

    if (payment.status === "paid") {
      if (await redis.get(`mollierefund:${payment.id}`).catch(() => null)) return done(200, "ignoré : paiement déjà remboursé");
      const renewal = payment.sequenceType === "recurring" || Boolean(payment.subscriptionId);
      if (previous?.kind === "lifetime" && plan !== "lifetime") {
        // A lifetime member keeps the lifetime; the payment is still reported.
      } else if (plan === "lifetime") {
        await redisSetAccess(email, mollieAccessRecord({ kind: "lifetime", paymentId: payment.id, customerId: payment.customerId }));
      } else {
        const subscriptionId = payment.subscriptionId || (payment.sequenceType === "first" ? await ensureSubscription(payment, email) : previous?.subscriptionId || null);
        // Extended from the later of now and the current end, so a renewal
        // charged a little early never shortens what was already paid for.
        const start = previous?.accessUntil && Date.parse(previous.accessUntil) > Date.now() ? Math.max(Date.parse(payment.paidAt || Date.now()), Date.now()) : Date.parse(payment.paidAt || Date.now());
        await redisSetAccess(email, mollieAccessRecord(
          { kind: "m1", paymentId: payment.id, customerId: payment.customerId, subscriptionId, accessUntil: mollieMonthAccessUntil(new Date(start)) },
          previous?.provider === "mollie" && previous.grantedAt ? { grantedAt: previous.grantedAt } : {},
        ));
      }
      const sent = await notifyTelegramOnce(`mollie:${payment.id}:paid`, `${test}${renewal ? "🔁 Renouvellement" : "💰 Nouvelle vente"} Mollie — ${label}\n${money(payment.amount)}\n${email}`);
      return done(200, renewal ? "renouvellement : accès prolongé" : "vente : accès accordé", sent ? "envoyé" : "non envoyé (déjà envoyé ou Telegram non configuré)");
    }

    if (payment.status === "failed" && (payment.sequenceType === "recurring" || payment.subscriptionId)) {
      const sent = await notifyTelegramOnce(`mollie:${payment.id}:failed`, `${test}💳 Paiement mensuel échoué — Mollie\nL'accès s'arrêtera le ${previous?.accessUntil ? new Date(previous.accessUntil).toLocaleDateString("fr-FR") : "?"} sans nouveau paiement.\n${email}`);
      return done(200, "prélèvement échoué", sent ? "envoyé" : "non envoyé");
    }

    // open, pending, expired, canceled first payments: an abandoned checkout.
    return done(200, `ignoré : statut ${payment.status}`);
  } catch (error) {
    console.error("Mollie webhook handling failed:", id, error);
    return done(500, `erreur : ${error.message}`, undefined, { error: "Traitement impossible." });
  }
}

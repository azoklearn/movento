// What the Mollie webhook and the post-payment email claim share: finding who
// a payment belongs to, setting up the month's subscription, and turning a
// paid payment into access. Kept apart from both so the two paths grant the
// same way.
//
// Who a payment belongs to. The buyer gives their email AFTER paying (asking
// before was friction), so a payment can be paid with no email known yet.
// It then belongs to whoever comes back with its claim code (api/mollie-
// claim.js), which records the email against the payment here.
import { Redis } from "@upstash/redis";
import {
  MOLLIE_PRICES,
  mollieAccessRecord,
  mollieApi,
  mollieMonthAccessUntil,
  normalizeEmail,
  redisGetAccessRecord,
  redisSetAccess,
} from "./_shared.js";

const redis = () => Redis.fromEnv();

// Mollie wants a calendar date for the subscription's first charge: a month
// after the payment that stored the card.
export function nextMonthDate(from) {
  const d = new Date(from || Date.now());
  d.setUTCMonth(d.getUTCMonth() + 1);
  return d.toISOString().slice(0, 10);
}

export async function claimedEmail(paymentId) {
  try { return normalizeEmail(await redis().get(`mollie:claimed:${paymentId}`)); } catch { return ""; }
}

// The payment's email, from wherever it is known: given at checkout,
// claimed after it, or known for the customer from an earlier claim (which
// is how a monthly charge, created by Mollie with no metadata of ours, finds
// its subscriber).
export async function emailForPayment(payment) {
  const fromMeta = normalizeEmail(payment.metadata?.email);
  if (fromMeta) return fromMeta;
  const claimed = await claimedEmail(payment.id);
  if (claimed) return claimed;
  if (!payment.customerId) return "";
  try {
    const known = normalizeEmail(await redis().get(`mollie:customer-email:${payment.customerId}`));
    if (known) return known;
  } catch {}
  try {
    const customer = await mollieApi(`/customers/${encodeURIComponent(payment.customerId)}`);
    return normalizeEmail(customer.email);
  } catch {
    return "";
  }
}

export async function wasRefunded(paymentId) {
  try { return Boolean(await redis().get(`mollierefund:${paymentId}`)); } catch { return false; }
}

// The subscription for a first payment, created once even if Mollie calls
// twice at the same moment: a short lock, released if creation fails so the
// retry can try again.
export async function ensureSubscription(payment, email) {
  const r = redis();
  const doneKey = `mollie:subfor:${payment.id}`;
  const existing = await r.get(doneKey).catch(() => null);
  if (existing) return String(existing);
  const lock = `mollie:sublock:${payment.id}`;
  const got = await r.set(lock, 1, { nx: true, ex: 60 }).catch(() => "OK");
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
        metadata: { plan: "m1", ...(email ? { email } : {}) },
      },
    });
    await r.set(doneKey, sub.id).catch(() => {});
    return sub.id;
  } finally {
    await r.del(lock).catch(() => {});
  }
}

// A paid payment, turned into access for `email`. Idempotent: called again
// for the same payment it writes the same record.
export async function grantPaid(payment, email) {
  const plan = payment.metadata?.plan || (payment.subscriptionId ? "m1" : "");
  const previous = await redisGetAccessRecord(email);
  const renewal = payment.sequenceType === "recurring" || Boolean(payment.subscriptionId);
  // Remembered for the customer, so the monthly charges that follow find
  // their subscriber without asking Mollie each time.
  if (payment.customerId) await redis().set(`mollie:customer-email:${payment.customerId}`, email).catch(() => {});

  if (plan === "lifetime") {
    await redisSetAccess(email, mollieAccessRecord({ kind: "lifetime", paymentId: payment.id, customerId: payment.customerId }));
    return { plan, renewal };
  }
  const subscriptionId = payment.subscriptionId || (payment.sequenceType === "first" ? await ensureSubscription(payment, email) : previous?.subscriptionId || null);
  // A lifetime member keeps the lifetime; the month is still set up and paid.
  if (previous?.kind === "lifetime") return { plan, renewal, subscriptionId };
  await redisSetAccess(email, mollieAccessRecord(
    { kind: "m1", paymentId: payment.id, customerId: payment.customerId, subscriptionId, accessUntil: mollieMonthAccessUntil(new Date(payment.paidAt || Date.now())) },
    previous?.provider === "mollie" && previous.grantedAt ? { grantedAt: previous.grantedAt } : {},
  ));
  return { plan, renewal, subscriptionId };
}

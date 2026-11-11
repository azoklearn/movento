import {
  customerHasWhopAccess,
  findGumroadSubscriber,
  findWhopMembership,
  isAdminAuthorized,
  membershipPlanKind,
  normalizeEmail,
  redisClearAccess,
  redisGetAccessRecord,
  redisGetOwnedPrompts,
  redisGetPromptCredits,
  redisIsBlocked,
  redisSetAccess,
  redisUnblockEmail,
  whopConfigured,
} from "./_shared.js";

// What an admin may grant: the two plans on sale, and lifetime for a gift.
const GRANT_PLANS = new Set(["m1", "m3", "m12", "lifetime"]);

async function buildLookup(email) {
  const [redisRecord, owned, credits, hasAccess, blocked] = await Promise.all([
    redisGetAccessRecord(email),
    redisGetOwnedPrompts(email),
    redisGetPromptCredits(email),
    customerHasWhopAccess(email),
    redisIsBlocked(email),
  ]);

  let membership = null;
  let whopError = null;
  if (whopConfigured()) {
    try {
      membership = await findWhopMembership(email);
    } catch (error) {
      whopError = error.message;
    }
  }

  const membershipKind = membership ? membershipPlanKind(membership) : null;

  // Gumroad's own answer, so a buyer the site has no record for can be told
  // apart from someone who never paid. Null when GUMROAD_ACCESS_TOKEN is unset.
  const gumroad = await findGumroadSubscriber(email).catch(() => null);

  // The one-line answer to "how does he have access without paying" — every
  // other field here is what backs this up.
  let reason = "none";
  // Reported ahead of everything else because it overrides everything else:
  // customerHasWhopAccess refuses a blocked email whatever the records below say.
  if (blocked) reason = "blocked";
  else if (redisRecord) reason = "redis_grant";
  else if (membership?.status === "trialing") reason = "whop_free_trial";
  else if (membership && membershipKind !== "pack") reason = "whop_membership";
  else if (credits > 0 || owned.length > 0) reason = "pack_only";

  return {
    email,
    hasAccess,
    blocked,
    reason,
    redis: redisRecord
      ? {
          plan: redisRecord.plan || null,
          kind: redisRecord.kind || null,
          type: redisRecord.type || null,
          status: redisRecord.status || null,
          membershipId: redisRecord.membershipId || null,
          provider: redisRecord.provider || null,
          grantedAt: redisRecord.grantedAt || null,
        }
      : null,
    gumroad: {
      configured: Boolean(process.env.GUMROAD_ACCESS_TOKEN),
      found: Boolean(gumroad),
      kind: gumroad?.kind || null,
      status: gumroad?.status || null,
    },
    packCredits: credits,
    ownedPrompts: owned,
    whop: {
      configured: whopConfigured(),
      error: whopError,
      found: Boolean(membership),
      id: membership?.id || null,
      status: membership?.status || null,
      planId: membership?.plan?.id || membership?.plan_id || null,
      planKind: membershipKind,
      product: membership?.product?.title || null,
      renewalPeriodEnd: membership?.renewal_period_end || null,
      cancelAtPeriodEnd: Boolean(membership?.cancel_at_period_end),
    },
    // No secret configured means the webhook accepts unsigned requests — worth
    // seeing on every lookup, not just this one.
    webhookSecretConfigured: Boolean(process.env.WHOP_WEBHOOK_SECRET),
  };
}

// GET  — answers "why does this email have access", by reading every source
// customerHasWhopAccess itself reads: the Redis grant written by the webhook,
// then the live Whop membership.
//
// POST { email, action } — "revoke" (the default) or "grant".
//
// revoke only ever deletes our own access:{email} record; it never touches
// Whop. A live Whop membership (a trial included) re-grants itself through the
// very fallback this endpoint reads from, the next time that email is checked
// — so revoking here is the fix for a stray Redis record, not a substitute for
// canceling the membership on Whop when one exists.
//
// grant writes the record a purchase writes, on the plan given in `plan`:
// "m1" (monthly, the default), "m3" (3 months), "m12" (annual) or "lifetime". The holder gets
// the catalogue and the bonus ebook — a Gumroad buyer whose sale did not reach
// the site, a gift, a tester. A monthly or annual grant is recorded as a
// Gumroad subscription, which is where those plans are sold, so "My
// subscription" sends the holder to Gumroad to manage it. It also lifts a block on that
// email: blocks are checked before anything else, so granting to a blocked
// address would otherwise write a record that changes nothing.
//
// The response after a POST is a fresh lookup, so the caller sees immediately
// what the account looks like now.
//
// Both ADMIN_TOKEN-gated like /api/leads — this hands out, and can end, a
// customer's access.
export default async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  res.setHeader("Cache-Control", "no-store");

  if (!isAdminAuthorized(req)) {
    return res.status(401).json({ error: "Non autorisé." });
  }

  const email = normalizeEmail(req.method === "GET" ? req.query?.email : req.body?.email);
  if (!email) {
    return res.status(400).json({ error: "Email requis." });
  }

  const action = req.method === "POST" ? String(req.body?.action || "revoke") : null;
  if (action && action !== "revoke" && action !== "grant") {
    return res.status(400).json({ error: "Action invalide." });
  }

  const grantPlan = action === "grant" ? String(req.body?.plan || "m1") : null;
  if (grantPlan && !GRANT_PLANS.has(grantPlan)) {
    return res.status(400).json({ error: "Offre invalide." });
  }

  try {
    if (action === "grant") {
      await redisUnblockEmail(email);
      const lifetime = grantPlan === "lifetime";
      // The Gumroad subscription id, when there is one, ties the grant to the
      // purchase it stands in for.
      const gumroad = lifetime ? null : await findGumroadSubscriber(email).catch(() => null);
      await redisSetAccess(email, {
        plan: lifetime ? "admin_grant" : `admin_grant_${grantPlan}`,
        kind: grantPlan,
        type: lifetime ? "lifetime" : "subscription",
        status: "active",
        membershipId: gumroad?.id || null,
        ...(lifetime ? {} : { provider: "gumroad" }),
        grantedAt: new Date().toISOString(),
      });
      console.log("Access granted via admin lookup:", email, grantPlan);
    } else if (action === "revoke") {
      await redisClearAccess(email);
      console.log("Access revoked via admin lookup:", email);
    }

    const result = await buildLookup(email);
    if (action === "revoke") result.revoked = true;
    if (action === "grant") result.granted = true;
    return res.json(result);
  } catch (error) {
    console.error("Admin lookup failed:", error);
    return res.status(500).json({ error: "Lecture impossible." });
  }
}

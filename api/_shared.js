import { Redis } from "@upstash/redis";

export const PROMPTS_REPO = "https://raw.githubusercontent.com/aayushsoam/motionsites.ai/main/prompts/";
export const CUSTOM_PROMPTS_REPO = "https://raw.githubusercontent.com/azoklearn/movento/main/prompts/";
// Prompts served without a purchase. Keep identical to FREE_PROMPT_FILES in
// src/App.jsx: the client uses it to unlock the copy button, this one decides
// whether /api/prompt actually hands the markdown over.
export const FREE_PROMPT_FILES = new Set([
  "Picway_Gallery_Hero.md",
  "Boomerang_Landing.md",
  "Mapple_Headphone_Store.md",
  "Healcure_Medical_Hero.md",
  "Lumina_Vision_Hero.md",
  "Qumica_Infrastructure_Hero.md",
  "Aesthetic_Login_Screen.md",
  "Adventra_Travel_Hero.md",
]);

// The prompts live in this repo. While it is public, anyone can download the
// whole catalogue straight from raw.githubusercontent.com and the paywall counts
// for nothing — so the repo is meant to be private, and the API reads it with a
// server-side token that never reaches the browser.
const PROMPTS_GITHUB_REPO = process.env.PROMPTS_GITHUB_REPO || "azoklearn/movento";
const PROMPTS_GITHUB_REF = process.env.PROMPTS_GITHUB_REF || "main";

// Fetches a prompt's markdown: the private repo through the authenticated GitHub
// API when a token is configured, then the public raw URLs. Returns null when no
// source has the file. Keeping the public paths as a fallback means adding the
// token and flipping the repo to private can happen in either order without
// locking paying customers out.
export async function fetchPromptMarkdown(file) {
  const token = process.env.GITHUB_TOKEN;
  const sources = [];

  if (token) {
    sources.push({
      url: `https://api.github.com/repos/${PROMPTS_GITHUB_REPO}/contents/prompts/${encodeURIComponent(file)}?ref=${encodeURIComponent(PROMPTS_GITHUB_REF)}`,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.raw",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "movento",
      },
    });
  }
  sources.push({ url: CUSTOM_PROMPTS_REPO + encodeURIComponent(file) });
  sources.push({ url: PROMPTS_REPO + encodeURIComponent(file) });

  for (const source of sources) {
    try {
      const response = await fetch(source.url, { headers: source.headers });
      if (response.ok) return await response.text();
    } catch (error) {
      console.error("Prompt source failed:", source.url.split("?")[0], error);
    }
  }

  return null;
}

const WHOP_API = "https://api.whop.com/api/v1";

// Hosted Whop checkout links, one per plan (set in Vercel env).
// A .../checkout/plan_xxx link powers the on-site EMBEDDED checkout: the plan id
// is read straight out of it. A product-page link would only power the REDIRECT
// flow, which is why both fallbacks below are checkout links.
const MONTHLY_FALLBACK_URL = "https://whop.com/checkout/plan_pAiB9wlNdjRGF";
const YEARLY_FALLBACK_URL = "https://whop.com/checkout/plan_Yj3NE8r5Jj0E1";

// The links we ship with. An env var overrides them, but see resolvePlanId: a
// product-page env var must not cost us the embedded checkout these provide.
const fallbackUrls = {
  monthly: MONTHLY_FALLBACK_URL,
  yearly: YEARLY_FALLBACK_URL,
};

export const checkoutUrls = {
  monthly: process.env.WHOP_MONTHLY_URL || MONTHLY_FALLBACK_URL,
  yearly: process.env.WHOP_YEARLY_URL || YEARLY_FALLBACK_URL,
  lifetime: process.env.WHOP_LIFETIME_URL,
};

// Whop plan IDs (plan_xxx), one per plan — required for the on-site EMBEDDED
// checkout (no redirect). Set these in Vercel env, or leave them empty and use a
// checkout-link of the form https://whop.com/checkout/plan_xxx as the *_URL above
// (we extract the id from it below). If neither is available, the client falls
// back to the hosted redirect flow.
const planIdEnv = {
  monthly: process.env.WHOP_MONTHLY_PLAN_ID,
  yearly: process.env.WHOP_YEARLY_PLAN_ID,
  lifetime: process.env.WHOP_LIFETIME_PLAN_ID,
};

// Returns the plan_xxx id for embedded checkout, or null when only a product-page
// link is configured (in which case the caller redirects to the hosted page).
export function resolvePlanId(plan) {
  const explicit = planIdEnv[plan];
  if (explicit && /^plan_[A-Za-z0-9]+$/.test(explicit.trim())) return explicit.trim();
  const fromEnvUrl = String(checkoutUrls[plan] || "").match(/plan_[A-Za-z0-9]+/);
  if (fromEnvUrl) return fromEnvUrl[0];
  // An env var pointing at a product page (a leftover from before the plan had a
  // checkout link) would otherwise silently downgrade the buyer to a redirect.
  const fromFallback = String(fallbackUrls[plan] || "").match(/plan_[A-Za-z0-9]+/);
  return fromFallback ? fromFallback[0] : null;
}

// The URL to send a buyer to when we redirect rather than embed. A plan checkout
// link beats a product page: it lands on the right plan in one hop.
export function bestCheckoutUrl(plan) {
  const configured = checkoutUrls[plan];
  if (configured && /plan_[A-Za-z0-9]+/.test(configured)) return configured;
  const planId = resolvePlanId(plan);
  return planId ? `https://whop.com/checkout/${planId}` : configured || null;
}

// Which of our plans a Whop plan_xxx belongs to ("monthly" | "yearly" |
// "lifetime"), or null when it matches none. This is the reliable way to tell a
// lifetime purchase from a subscription — the bonus ebook depends on it.
export function planKindFromPlanId(planId) {
  const id = String(planId || "").trim();
  if (!id) return null;
  return ["monthly", "yearly", "lifetime"].find((kind) => resolvePlanId(kind) === id) || null;
}

// Whop credits an affiliate through the "a" query parameter. Carrying it onto the
// hosted checkout preserves the commission whenever we redirect rather than embed.
export function appendAffiliate(url, ref) {
  const code = String(ref || "").trim().slice(0, 64).replace(/[^a-zA-Z0-9_-]/g, "");
  if (!url || !code) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("a", code);
    return parsed.toString();
  } catch {
    return url;
  }
}

// Where customers manage/cancel their membership.
export const WHOP_PORTAL_URL = process.env.WHOP_PORTAL_URL || "https://whop.com/orders/";

// Whop membership statuses that grant access. "canceling" is still valid until
// the period ends; "completed" covers one-time (lifetime) purchases.
const ACCESS_STATUSES = new Set(["active", "trialing", "past_due", "canceling", "completed"]);

// Pushes a line to Telegram. Silent no-op when the bot is not configured, and
// never throws: a notification failing must not cost a visitor their prompt or
// a customer their purchase. Times out so a hanging Telegram cannot hold the
// serverless response open.
export async function notifyTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) console.error("Telegram notify failed:", response.status, await response.text().catch(() => ""));
    return response.ok;
  } catch (error) {
    console.error("Telegram notify failed:", error);
    return false;
  }
}

export function normalizeEmail(email) {
  // Strip every whitespace/zero-width char (mobile autocomplete can inject a
  // non-breaking or zero-width space that trim() leaves behind).
  return String(email || "").replace(/[\s\u00AD\u200B-\u200D\u2060\uFEFF]/g, "").toLowerCase();
}

export function isSafePromptFile(file) {
  return typeof file === "string" && /^[a-zA-Z0-9_.-]+\.md$/.test(file);
}

export function getClientUrl(req) {
  const configured = process.env.CLIENT_URL || process.env.VERCEL_URL;
  if (configured) {
    return configured.startsWith("http") ? configured : `https://${configured}`;
  }

  const proto = req.headers["x-forwarded-proto"] || "https";
  return `${proto}://${req.headers.host}`;
}

export function extractPrompt(md) {
  const heading = md.match(/^##\s*.*Prompt\s*$/im);
  if (!heading || heading.index === undefined) return md.trimEnd();
  let after = md.slice(heading.index + heading[0].length);
  const end = after.indexOf("* * *");
  if (end >= 0) after = after.slice(0, end);
  return after
    .replace(/^\s*\n/, "")
    .replace(/\n\*?Generated by MotionSites Export Tool\*?[\s\S]*$/g, "")
    .replace(/\n---\s*$/g, "")
    .replace(/^```(?:text)?\s*\n/i, "")
    .replace(/\n```\s*$/g, "")
    .trimEnd();
}

// The grant written by the webhook at purchase. Upstash deserializes JSON on the
// way out, but a record stored as a raw string still comes back as one.
export async function redisGetAccessRecord(normalizedEmail) {
  try {
    const redis = Redis.fromEnv();
    const record = await redis.get(`access:${normalizedEmail}`);
    if (!record) return null;
    if (typeof record === "string") {
      try { return JSON.parse(record); } catch { return {}; }
    }
    return record;
  } catch {
    return null;
  }
}

async function redisGetAccess(normalizedEmail) {
  return Boolean(await redisGetAccessRecord(normalizedEmail));
}

export async function redisSetAccess(normalizedEmail, record) {
  const redis = Redis.fromEnv();
  await redis.set(`access:${normalizedEmail}`, record);
}

export async function redisClearAccess(normalizedEmail) {
  try {
    const redis = Redis.fromEnv();
    await redis.del(`access:${normalizedEmail}`);
  } catch {
    // Redis unavailable — nothing to clear.
  }
}

function whopConfigured() {
  return Boolean(process.env.WHOP_API_KEY && process.env.WHOP_COMPANY_ID);
}

// Whop's memberships endpoint has NO email filter, so we page through the
// access-granting statuses and match the email ourselves. Pages are capped so a
// large membership list can't hang the request.
async function findWhopMembership(normalizedEmail) {
  if (!whopConfigured()) return null;

  let after = null;
  for (let page = 0; page < 20; page++) {
    const params = new URLSearchParams({ company_id: process.env.WHOP_COMPANY_ID, first: "100" });
    for (const status of ACCESS_STATUSES) params.append("statuses[]", status);
    if (after) params.set("after", after);

    const response = await fetch(`${WHOP_API}/memberships?${params}`, {
      headers: { Authorization: `Bearer ${process.env.WHOP_API_KEY}` },
    });
    if (!response.ok) {
      throw new Error(`Whop API ${response.status}: ${await response.text()}`);
    }

    const body = await response.json();
    const match = (body.data || []).find(
      (m) => normalizeEmail(m.user?.email) === normalizedEmail && ACCESS_STATUSES.has(m.status)
    );
    if (match) return match;

    if (!body.page_info?.has_next_page) break;
    after = body.page_info.end_cursor;
  }

  return null;
}

export async function customerHasWhopAccess(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return false;

  // Fast path: the grant written by the Whop webhook at purchase. Never deleted
  // here, so a Whop API hiccup can't lock out paying customers.
  if (await redisGetAccess(normalizedEmail)) return true;

  try {
    return Boolean(await findWhopMembership(normalizedEmail));
  } catch (error) {
    console.error("Whop access check failed:", error);
    return false;
  }
}

// Returns the membership backing an email, for the "My subscription" page.
export async function getMembershipInfo(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return { found: false, active: false };

  let membership = null;
  try {
    membership = await findWhopMembership(normalizedEmail);
  } catch (error) {
    console.error("Whop membership lookup failed:", error);
  }

  if (!membership) {
    // Redis still knows about the purchase even if the API lookup failed. The
    // webhook records the plan type at purchase, so a lifetime buyer keeps their
    // bonus ebook here instead of falling through as "unknown".
    const record = await redisGetAccessRecord(normalizedEmail);
    if (record) {
      return { found: true, active: true, type: record.type || "unknown", kind: record.kind || null, plan: "Movento", portalUrl: WHOP_PORTAL_URL, source: "redis" };
    }
    return { found: false, active: false };
  }

  const isLifetime = membership.status === "completed" || !membership.renewal_period_end;
  // Fall back to the webhook record when the API response carries no plan id —
  // "kind" is what tells a monthly trial from a yearly subscription.
  const record = await redisGetAccessRecord(normalizedEmail);
  return {
    found: true,
    active: true,
    type: isLifetime ? "lifetime" : "subscription",
    kind: planKindFromPlanId(membership.plan?.id || membership.plan_id) || record?.kind || null,
    status: membership.status,
    plan: membership.product?.title || "Movento",
    cancelAtPeriodEnd: Boolean(membership.cancel_at_period_end) || membership.status === "canceling",
    renewalDate: membership.renewal_period_end || null,
    portalUrl: WHOP_PORTAL_URL,
    source: "whop",
  };
}

// Cancels the subscription behind an email at the end of the current period
// (Whop's default). Lifetime purchases have nothing to cancel. Returns a small
// result object the API route maps to an HTTP response.
export async function cancelWhopMembership(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return { ok: false, reason: "no_email" };
  if (!whopConfigured()) return { ok: false, reason: "not_configured" };

  let membership;
  try {
    membership = await findWhopMembership(normalizedEmail);
  } catch (error) {
    console.error("Whop membership lookup failed (cancel):", error);
    return { ok: false, reason: "lookup_failed" };
  }
  if (!membership) return { ok: false, reason: "not_found" };

  const isLifetime = membership.status === "completed" || !membership.renewal_period_end;
  if (isLifetime) return { ok: false, reason: "lifetime" };

  const renewalDate = membership.renewal_period_end || null;
  if (membership.cancel_at_period_end || membership.status === "canceling") {
    return { ok: true, alreadyCanceled: true, renewalDate };
  }

  try {
    const response = await fetch(`${WHOP_API}/memberships/${membership.id}/cancel`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHOP_API_KEY}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      console.error(`Whop cancel failed ${response.status}: ${await response.text()}`);
      return { ok: false, reason: "cancel_failed" };
    }
  } catch (error) {
    console.error("Whop cancel request error:", error);
    return { ok: false, reason: "cancel_failed" };
  }

  return { ok: true, renewalDate };
}

export function methodNotAllowed(res, allowed = "POST") {
  res.setHeader("Allow", allowed);
  return res.status(405).json({ error: "Méthode non autorisée." });
}

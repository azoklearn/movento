import { Redis } from "@upstash/redis";
import crypto from "node:crypto";

export const PROMPTS_REPO = "https://raw.githubusercontent.com/aayushsoam/motionsites.ai/main/prompts/";
export const CUSTOM_PROMPTS_REPO = "https://raw.githubusercontent.com/azoklearn/movento/main/prompts/";
// Prompts served without a purchase. Keep identical to FREE_PROMPT_FILES in
// src/App.jsx: the client uses it to unlock the copy button, this one decides
// whether /api/prompt actually hands the markdown over.
export const FREE_PROMPT_FILES = new Set([]);

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
const YEARLY_FALLBACK_URL = "https://whop.com/checkout/plan_rP9Yq4HOSgHCZ";
// Full access, one payment (Whop product prod_YWF4xcOs3RFv9). Shipped here
// rather than left to WHOP_LIFETIME_URL alone: without a checkout link the plan
// id cannot be resolved, and the buyer was redirected to Whop instead of paying
// on the site like every other plan.
const LIFETIME_FALLBACK_URL = "https://whop.com/checkout/plan_jbsdSaI7sNSof";
// A pack of prompts, bought without the catalogue (Whop product
// prod_zZlcqsSutlXvW). One purchase, PROMPT_PACK_SIZE prompts of your choice.
const PACK_FALLBACK_URL = "https://whop.com/checkout/plan_duNdZcsNAOPSx";

// How many prompts one pack unlocks. The webhook credits this many, and the
// buyer spends them one prompt at a time.
export const PROMPT_PACK_SIZE = 3;

// The links we ship with. An env var overrides them, but see resolvePlanId: a
// product-page env var must not cost us the embedded checkout these provide.
const fallbackUrls = {
  monthly: MONTHLY_FALLBACK_URL,
  yearly: YEARLY_FALLBACK_URL,
  lifetime: LIFETIME_FALLBACK_URL,
  pack: PACK_FALLBACK_URL,
};

export const checkoutUrls = {
  monthly: process.env.WHOP_MONTHLY_URL || MONTHLY_FALLBACK_URL,
  yearly: process.env.WHOP_YEARLY_URL || YEARLY_FALLBACK_URL,
  lifetime: process.env.WHOP_LIFETIME_URL || LIFETIME_FALLBACK_URL,
  // A pack of prompts. One Whop product covers the whole catalogue: the buyer
  // picks which prompts after paying, so there is nothing to create per prompt
  // and nothing to round-trip through checkout metadata.
  pack: process.env.WHOP_PACK_URL || PACK_FALLBACK_URL,
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
  pack: process.env.WHOP_PACK_PLAN_ID,
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

// Plans that are no longer on sale. They stay fully configured above so an
// existing subscriber's plan_xxx still resolves to a kind — that is what gates
// their access and the bonus ebook — but no new checkout may be opened on them.
// This mirrors `hidden: true` in the front-end plan list; the button is gone
// there, and this is what stops a hand-made request from reaching the old one.
export const RETIRED_PLANS = new Set(["monthly", "yearly"]);

// Which of our plans a Whop plan_xxx belongs to ("monthly" | "yearly" |
// "lifetime"), or null when it matches none. This is the reliable way to tell a
// lifetime purchase from a subscription — the bonus ebook depends on it.
export function planKindFromPlanId(planId) {
  const id = String(planId || "").trim();
  if (!id) return null;
  return ["monthly", "yearly", "lifetime", "pack"].find((kind) => resolvePlanId(kind) === id) || null;
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

// Discount applied for the buyer instead of being typed by them. The code has
// to exist in Whop with this exact spelling — an unknown code is ignored at
// checkout, so the buyer simply pays full price with no error shown anywhere.
// Set it to "" to stop applying one.
export const CHECKOUT_PROMO_CODE = process.env.WHOP_PROMO_CODE ?? "";

// Whop reads the promo from the checkout URL. Both spellings are sent: the
// hosted checkout has used camelCase and snake_case at different times, and an
// unread parameter is harmless while a missing one costs the buyer the discount.
export function appendPromo(url, code = CHECKOUT_PROMO_CODE) {
  const clean = String(code || "").trim().slice(0, 64).replace(/[^a-zA-Z0-9_-]/g, "");
  if (!url || !clean) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("promoCode", clean);
    parsed.searchParams.set("promo_code", clean);
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

// ---------------------------------------------------------------------------
// Prompt-pack purchases.
//
// A pack buyer must NOT get the catalogue, so these live outside the
// access:{email} record that means "everything is unlocked". Two keys:
//
//   credits:{email} — prompts paid for but not yet chosen (a number)
//   prompts:{email} — the files already claimed (an array)
//
// One Whop product covers every prompt: the buyer pays, then claims the ones
// they want. That is why credits exist at all — the purchase and the choice of
// prompts happen at different moments, and Whop never has to know which prompt
// was meant.
// ---------------------------------------------------------------------------

export async function redisGetPromptCredits(normalizedEmail) {
  try {
    const redis = Redis.fromEnv();
    const value = await redis.get(`credits:${normalizedEmail}`);
    const count = Number(value);
    return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
  } catch {
    return 0;
  }
}

export async function redisAddPromptCredit(normalizedEmail, amount = 1) {
  const redis = Redis.fromEnv();
  return await redis.incrby(`credits:${normalizedEmail}`, amount);
}

export async function redisGetOwnedPrompts(normalizedEmail) {
  try {
    const redis = Redis.fromEnv();
    const value = await redis.get(`prompts:${normalizedEmail}`);
    if (!value) return [];
    // Upstash deserializes JSON on the way out, but a value stored as a raw
    // string still comes back as one — same defensive read as the access record.
    const list = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(list) ? list.filter(isSafePromptFile) : [];
  } catch {
    return [];
  }
}

// Spends one credit on one prompt. Returns what happened so the caller can tell
// "already yours" (no credit spent) from "no credit left" (nothing to spend).
export async function redisClaimPrompt(normalizedEmail, file) {
  // Checked here rather than only in the handler: this is the one function that
  // turns a credit into a prompt, so a block cannot be spent around.
  if (await redisIsBlocked(normalizedEmail)) return { ok: false, reason: "blocked", owned: [] };

  const owned = await redisGetOwnedPrompts(normalizedEmail);
  if (owned.includes(file)) return { ok: true, alreadyOwned: true, owned };

  const redis = Redis.fromEnv();
  // Decrement first: two clicks in flight at once would otherwise both read a
  // credit of 1 and both claim. A decrement that lands below zero is put back.
  const left = await redis.decrby(`credits:${normalizedEmail}`, 1);
  if (left < 0) {
    await redis.incrby(`credits:${normalizedEmail}`, 1);
    return { ok: false, reason: "no_credit", owned };
  }

  const next = [...owned, file];
  await redis.set(`prompts:${normalizedEmail}`, next);
  return { ok: true, alreadyOwned: false, owned: next };
}

export async function customerOwnsPrompt(email, file) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !isSafePromptFile(file)) return false;
  if (await redisIsBlocked(normalizedEmail)) return false;
  return (await redisGetOwnedPrompts(normalizedEmail)).includes(file);
}

export async function redisClearAccess(normalizedEmail) {
  try {
    const redis = Redis.fromEnv();
    await redis.del(`access:${normalizedEmail}`);
  } catch {
    // Redis unavailable — nothing to clear.
  }
}

// ---------------------------------------------------------------------------
// Blocked emails.
//
// Stronger than clearing the access record, and for a different problem.
// redisClearAccess only deletes what the webhook wrote; a live Whop membership
// re-grants itself through the fallback in customerHasWhopAccess the next time
// that email is checked. A block is consulted BEFORE either source, so it holds
// whatever Whop says — a chargeback, a shared login, an account that should
// never have got in.
//
// One sorted set rather than a key per email: the check is a single ZSCORE, and
// the admin list wants them ordered by when they were blocked.
// ---------------------------------------------------------------------------
const BLOCKED_KEY = "blocked";

export async function redisIsBlocked(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return false;
  try {
    const redis = Redis.fromEnv();
    return (await redis.zscore(BLOCKED_KEY, normalizedEmail)) !== null;
  } catch {
    // Fails OPEN, on purpose. A blocklist that cannot be read must not lock out
    // every paying customer — the same call the rest of this file makes, where
    // an unreachable Redis reads as "no record" rather than an error. A handful
    // of blocked people getting through a Redis outage is the lesser problem.
    return false;
  }
}

export async function redisBlockEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return false;
  const redis = Redis.fromEnv();
  await redis.zadd(BLOCKED_KEY, { score: Date.now(), member: normalizedEmail });
  return true;
}

export async function redisUnblockEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return false;
  const redis = Redis.fromEnv();
  await redis.zrem(BLOCKED_KEY, normalizedEmail);
  return true;
}

export async function redisListBlocked(limit = 500) {
  try {
    const redis = Redis.fromEnv();
    const entries = await redis.zrange(BLOCKED_KEY, 0, limit - 1, { rev: true, withScores: true });
    const list = [];
    for (let i = 0; i < entries.length; i += 2) {
      const at = Number(entries[i + 1]);
      list.push({ email: String(entries[i]), blockedAt: Number.isFinite(at) ? new Date(at).toISOString() : null });
    }
    return list;
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Admin overview: every email with something on record.
//
// Scans the keyspace rather than reading an index. Every grant written before
// today predates any index we could add, so an index would show a partial list
// and quietly look complete — worse than a scan that is simply slower. At this
// scale one bounded pass costs a few round trips.
// ---------------------------------------------------------------------------
async function scanKeys(redis, match, cap) {
  const keys = [];
  let cursor = "0";
  // Page cap as well as a key cap: SCAN gives no guarantee about how much
  // ground a single call covers, and a cursor that never comes back to "0"
  // must not spin here.
  for (let page = 0; page < 40; page++) {
    const [next, batch] = await redis.scan(cursor, { match, count: 500 });
    keys.push(...batch);
    cursor = String(next);
    if (cursor === "0" || keys.length >= cap) break;
  }
  return keys.slice(0, cap);
}

export async function redisListAllAccess(cap = 1000) {
  const redis = Redis.fromEnv();
  const [accessKeys, creditKeys, promptKeys, blocked] = await Promise.all([
    scanKeys(redis, "access:*", cap),
    scanKeys(redis, "credits:*", cap),
    scanKeys(redis, "prompts:*", cap),
    redisListBlocked(cap),
  ]);

  const rows = new Map();
  const row = (email) => {
    if (!rows.has(email)) {
      rows.set(email, { email, fullAccess: false, plan: null, kind: null, type: null, grantedAt: null, credits: 0, owned: 0, blocked: false });
    }
    return rows.get(email);
  };

  const parse = (value) => {
    if (!value) return null;
    if (typeof value !== "string") return value;
    try { return JSON.parse(value); } catch { return null; }
  };

  if (accessKeys.length) {
    const values = await redis.mget(...accessKeys);
    accessKeys.forEach((key, i) => {
      const entry = row(key.slice("access:".length));
      const record = parse(values[i]) || {};
      entry.fullAccess = true;
      entry.plan = record.plan || null;
      entry.kind = record.kind || null;
      entry.type = record.type || null;
      entry.grantedAt = record.grantedAt || null;
    });
  }

  if (creditKeys.length) {
    const values = await redis.mget(...creditKeys);
    creditKeys.forEach((key, i) => {
      const count = Number(values[i]);
      if (Number.isFinite(count) && count > 0) row(key.slice("credits:".length)).credits = Math.floor(count);
    });
  }

  if (promptKeys.length) {
    const values = await redis.mget(...promptKeys);
    promptKeys.forEach((key, i) => {
      const list = parse(values[i]);
      if (Array.isArray(list) && list.length) row(key.slice("prompts:".length)).owned = list.length;
    });
  }

  // A blocked email may have nothing else on record — blocked before it ever
  // bought, or blocked and then cleared — and still has to appear in the list,
  // or unblocking it from here would be impossible.
  for (const { email } of blocked) row(email).blocked = true;

  // Full access first, then the biggest pack holders, then most recent. The
  // list is read to find someone, and those are the rows worth finding.
  return [...rows.values()].sort((a, b) => {
    if (a.fullAccess !== b.fullAccess) return a.fullAccess ? -1 : 1;
    if (a.credits + a.owned !== b.credits + b.owned) return b.credits + b.owned - (a.credits + a.owned);
    return String(b.grantedAt || "").localeCompare(String(a.grantedAt || ""));
  });
}

// The company id is not a secret (it is the same one Whop puts in public
// checkout URLs), so it ships with a default. Only the API key has to live in
// the environment — and without this default, a deploy that has the key but not
// the id silently falls back to Redis-only access checks.
const WHOP_COMPANY_ID = process.env.WHOP_COMPANY_ID || "biz_2CQPz7bDNhG3va";

export function whopConfigured() {
  return Boolean(process.env.WHOP_API_KEY && WHOP_COMPANY_ID);
}

// Whop's memberships endpoint has NO email filter, so every lookup here pages
// through the access-granting statuses and matches emails locally.
//
// `onPage` decides when to stop: returning a value ends the walk and that value
// is what comes back. Pages are capped so a large membership list can't hang
// the request.
async function walkWhopMemberships(onPage) {
  if (!whopConfigured()) return null;

  let after = null;
  for (let page = 0; page < 20; page++) {
    const params = new URLSearchParams({ company_id: WHOP_COMPANY_ID, first: "100" });
    for (const status of ACCESS_STATUSES) params.append("statuses[]", status);
    if (after) params.set("after", after);

    const response = await fetch(`${WHOP_API}/memberships?${params}`, {
      headers: { Authorization: `Bearer ${process.env.WHOP_API_KEY}` },
    });
    if (!response.ok) {
      throw new Error(`Whop API ${response.status}: ${await response.text()}`);
    }

    const body = await response.json();
    const stop = onPage(body.data || []);
    if (stop !== undefined) return stop;

    if (!body.page_info?.has_next_page) break;
    after = body.page_info.end_cursor;
  }

  return null;
}

export async function findWhopMembership(normalizedEmail) {
  return walkWhopMemberships((rows) =>
    rows.find((m) => normalizeEmail(m.user?.email) === normalizedEmail && ACCESS_STATUSES.has(m.status)),
  );
}

// Every access-granting membership Whop knows about, keyed by email.
//
// One walk instead of one per address: the audit compares a whole list of
// emails against Whop, and calling findWhopMembership per row would re-page the
// entire membership list for each one.
export async function fetchWhopMembershipsByEmail() {
  const byEmail = new Map();
  await walkWhopMemberships((rows) => {
    for (const m of rows) {
      const email = normalizeEmail(m.user?.email);
      if (!email || !ACCESS_STATUSES.has(m.status)) continue;
      // First one wins: the walk is newest-first, and a customer who rebought
      // should be judged on the membership that is live now.
      if (!byEmail.has(email)) byEmail.set(email, m);
    }
    return undefined; // never stop early — we want the whole list
  });
  return byEmail;
}

// Which of our plans a Whop membership was bought on, or null when the payload
// carries no plan we recognise.
export function membershipPlanKind(membership) {
  return planKindFromPlanId(membership?.plan?.id || membership?.plan_id || membership?.plan);
}

export async function customerHasWhopAccess(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return false;

  // Before either source below, which is the whole point of a block: clearing
  // the access record alone is undone by the Whop fallback further down.
  if (await redisIsBlocked(normalizedEmail)) return false;

  // Fast path: the grant written by the Whop webhook at purchase. Never deleted
  // here, so a Whop API hiccup can't lock out paying customers.
  if (await redisGetAccess(normalizedEmail)) return true;

  try {
    const membership = await findWhopMembership(normalizedEmail);
    if (!membership) return false;
    // A pack buys a few prompts, NOT the catalogue. Whop creates a membership
    // for it like any other purchase, so without this check the fallback below
    // handed the whole catalogue to a pack buyer.
    //
    // Every other membership still passes, including one whose plan we cannot
    // identify: this path exists so a lifetime buyer is not locked out when the
    // webhook fails, and an unfamiliar payload must not cost them their access.
    return membershipPlanKind(membership) !== "pack";
  } catch (error) {
    console.error("Whop access check failed:", error);
    return false;
  }
}

// Grants a pack's credits straight from the Whop API, for when the webhook
// never landed — misconfigured, rejected, or simply late. Without this a paying
// customer sits on "access is activating" with nothing anyone can do.
//
// Idempotent on the membership id rather than the email: SET NX means the first
// caller wins, so two tabs, or a webhook arriving mid-check, cannot both pay out.
export async function syncPackCreditsFromWhop(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !whopConfigured()) return 0;
  // Same reasoning as customerHasWhopAccess: this reads Whop directly, so
  // without the check a blocked email would be handed credits from there.
  if (await redisIsBlocked(normalizedEmail)) return 0;

  let membership = null;
  try {
    membership = await findWhopMembership(normalizedEmail);
  } catch (error) {
    console.error("Whop pack lookup failed:", error);
    return 0;
  }
  if (!membership || membershipPlanKind(membership) !== "pack") return 0;

  const membershipId = String(membership.id || "");
  if (!membershipId) return 0;

  // Deliberately conservative. The webhook identifies a purchase by the id in
  // its own payload, which is not necessarily the membership id the API returns,
  // so the two paths cannot share one guard key. Anything this buyer already has
  // — an unspent credit, a prompt already claimed — means a payout already
  // happened and this must keep its hands off. Paying out twice for one sale is
  // worse than a rare case that needs a human.
  const [credits, owned] = await Promise.all([
    redisGetPromptCredits(normalizedEmail),
    redisGetOwnedPrompts(normalizedEmail),
  ]);
  if (credits > 0 || owned.length > 0) return 0;

  try {
    const redis = Redis.fromEnv();
    // SET NX: the first caller wins, so two tabs cannot both pay out.
    const claimed = await redis.set(`packsync:${membershipId}`, new Date().toISOString(), { nx: true });
    if (!claimed) return 0;
    await redisAddPromptCredit(normalizedEmail, PROMPT_PACK_SIZE);
    console.log("Pack credited from the Whop API (webhook did not land):", normalizedEmail, membershipId);
    return PROMPT_PACK_SIZE;
  } catch (error) {
    console.error("Pack credit grant failed:", error);
    return 0;
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

// Shared by every admin-only endpoint (/api/leads, /api/admin-lookup): fails
// closed when ADMIN_TOKEN is not configured, rather than letting everyone in.
export function isAdminAuthorized(req) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return false;

  const header = String(req.headers?.authorization || "");
  const provided = header.startsWith("Bearer ") ? header.slice(7) : String(req.query?.token || "");
  if (!provided) return false;

  // Same length before comparing: timingSafeEqual throws on a length mismatch,
  // and the lengths themselves are not worth leaking.
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function methodNotAllowed(res, allowed = "POST") {
  res.setHeader("Allow", allowed);
  return res.status(405).json({ error: "Méthode non autorisée.", errorEn: "Method not allowed." });
}

// ---------------------------------------------------------------------------
// Payment audit.
//
// Answers "who actually paid" by comparing what our Redis says with what Whop
// says. The two can disagree in both directions and each disagreement means
// something different:
//
//   paid        — a live membership on a plan we sell. Real money.
//   trial       — a membership that has not been billed yet. Access is
//                 legitimate; the payment has simply not happened.
//   past_due    — paid before, the renewal is failing now.
//   canceling   — paid, running out at the end of the period.
//   unpaid      — access on our side with NO membership behind it. Either the
//                 membership was removed on Whop and our record outlived it,
//                 or the record was never backed by a purchase at all. This is
//                 the one worth looking at by hand.
//   blocked     — reported first, since the block overrides everything else.
//
// A row can be "unpaid" for an innocent reason (a comp, a refund already
// handled) — this classifies, it does not accuse.
// ---------------------------------------------------------------------------
export function classifyPayment(row, membership) {
  if (row.blocked) return "blocked";
  if (!membership) return "unpaid";

  const kind = membershipPlanKind(membership);
  if (membership.status === "trialing") return "trial";
  if (membership.status === "past_due") return "past_due";
  if (membership.status === "canceling") return "canceling";
  if (kind === "pack") return "paid_pack";
  return "paid";
}

// The access list, each row marked with what Whop says about the payment.
// Falls back to the plain list — every row marked "unknown" — when no Whop API
// key is configured, so the caller never mistakes "could not check" for "did
// not pay".
export async function auditAccessPayments(cap = 1000) {
  const rows = await redisListAllAccess(cap);

  if (!whopConfigured()) {
    return { rows: rows.map((r) => ({ ...r, payment: "unknown" })), checked: false, error: null };
  }

  let byEmail;
  try {
    byEmail = await fetchWhopMembershipsByEmail();
  } catch (error) {
    console.error("Whop payment audit failed:", error);
    return { rows: rows.map((r) => ({ ...r, payment: "unknown" })), checked: false, error: error.message };
  }

  const audited = rows.map((row) => {
    const membership = byEmail.get(row.email) || null;
    return {
      ...row,
      payment: classifyPayment(row, membership),
      whopStatus: membership?.status || null,
      whopPlanKind: membership ? membershipPlanKind(membership) : null,
      whopProduct: membership?.product?.title || null,
      renewalDate: membership?.renewal_period_end || null,
    };
  });

  // Someone can be paying on Whop while having nothing on our side — a webhook
  // that never landed. They are not in `rows` at all, so they would be invisible
  // in an audit built only from our own records. That is the opposite failure
  // from an unpaid grant and just as worth seeing.
  const known = new Set(rows.map((r) => r.email));
  for (const [email, membership] of byEmail) {
    if (known.has(email)) continue;
    audited.push({
      email,
      fullAccess: false,
      plan: null,
      kind: null,
      type: null,
      grantedAt: null,
      credits: 0,
      owned: 0,
      blocked: false,
      missingRecord: true,
      payment: classifyPayment({ blocked: false }, membership),
      whopStatus: membership.status || null,
      whopPlanKind: membershipPlanKind(membership),
      whopProduct: membership.product?.title || null,
      renewalDate: membership.renewal_period_end || null,
    });
  }

  return { rows: audited, checked: true, error: null };
}

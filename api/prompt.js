import { Redis } from "@upstash/redis";
import {
  FAIR_USE_DAILY_COPIES,
  FAIR_USE_KINDS,
  customerAccessLevel,
  customerOwnsPrompt,
  extractPrompt,
  fetchPromptMarkdown,
  FREE_PROMPT_FILES,
  isSafePromptFile,
  methodNotAllowed,
  normalizeEmail,
  promptAllowedFor,
  redisGetAccessRecord,
} from "./_shared.js";

// The day in Paris, so the allowance resets at the buyer's midnight.
const parisDay = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(new Date());

// Fair use on the 3-month plan: FAIR_USE_DAILY_COPIES different prompts a day.
// Copying one already taken today again is free. Answers null when the copy
// may go ahead, or the refusal to send. A Redis failure lets the copy through:
// a paying customer is not refused because the counter could not be read.
async function fairUseRefusal(email, file) {
  let record;
  try { record = await redisGetAccessRecord(email); } catch { return null; }
  // Only the 3 months sold from now on. The older 3-month plan sold on Whop
  // (its records carry a Whop plan id) was bought as unlimited and stays so.
  if (!FAIR_USE_KINDS.has(record?.kind) || !/^(mollie|paddle|gumroad|admin_grant)_/.test(String(record.plan || ""))) return null;
  try {
    const redis = Redis.fromEnv();
    const key = `fairuse:${email}:${parisDay()}`;
    if (await redis.sismember(key, file)) return null;
    if ((await redis.scard(key)) >= FAIR_USE_DAILY_COPIES) {
      return {
        error: `Tu as copié tes ${FAIR_USE_DAILY_COPIES} prompts du jour (offre 3 mois). Reviens demain, ou passe à l'annuel ou à vie pour des copies illimitées.`,
        errorEn: `You have copied your ${FAIR_USE_DAILY_COPIES} prompts for today (3-month plan). Come back tomorrow, or move to the annual or lifetime plan for unlimited copies.`,
        fairUse: true,
      };
    }
    await redis.sadd(key, file);
    await redis.expire(key, 2 * 86400);
  } catch (error) {
    console.error("Fair use counter failed:", error);
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);

  const { file } = req.body || {};
  const email = normalizeEmail(req.body?.email);
  const isFreePrompt = FREE_PROMPT_FILES.has(file);

  if (!isSafePromptFile(file)) {
    return res.status(400).json({ error: "Invalid prompt." });
  }

  // Who they are, then whether that entitles them to this file. The rules are
  // in promptAllowedFor; this only gathers what they need.
  const level = await customerAccessLevel(email);
  const onTrial = level === "trial";
  // customerOwnsPrompt is the one expensive input, so it is only read when the
  // cheap ones have not already settled it.
  const owns = isFreePrompt || level === "full" ? false : await customerOwnsPrompt(email, file);

  if (!promptAllowedFor({ level, file, isFreePrompt, owns })) {
    // A trial member is a customer, not a stranger: tell them this one is
    // waiting rather than that they need to buy something they already have.
    if (onTrial) {
      return res.status(403).json({
        error: "Ce prompt arrive à la fin de ton essai.",
        errorEn: "This prompt unlocks when your trial ends.",
        trial: true,
      });
    }
    return res.status(403).json({ error: "Premium access required." });
  }

  // Only for those who hold the catalogue through the 3-month plan: a free
  // prompt, or one bought on its own, is never counted.
  if (level === "full" && !isFreePrompt) {
    const refusal = await fairUseRefusal(email, file);
    if (refusal) return res.status(429).json(refusal);
  }

  try {
    const md = await fetchPromptMarkdown(file);
    if (md === null) return res.status(404).json({ error: "Prompt not found." });

    return res.json({ prompt: extractPrompt(md) });
  } catch (error) {
    console.error("Prompt fetch failed:", error);
    return res.status(500).json({ error: "Unable to load prompt." });
  }
}

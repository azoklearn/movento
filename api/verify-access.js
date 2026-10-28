import { customerAccessLevel, methodNotAllowed, normalizeEmail, redisGetOwnedPrompts, redisGetPromptCredits, redisIsBlocked, syncPackCreditsFromWhop, TRIAL_PROMPT_FILES } from "./_shared.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);

  const email = normalizeEmail(req.body?.email);
  if (!email) {
    return res.status(400).json({ error: "Email requis." });
  }

  try {
    // customerAccessLevel already refuses a blocked email, but the pack lists
    // below are read straight from Redis. Without this they would still show
    // credits, send the visitor to /choose, and only fail at the claim — so a
    // blocked email is answered as if it had never bought anything.
    if (await redisIsBlocked(email)) return res.json({ hasAccess: false, trial: false, owned: [], credits: 0 });

    const level = await customerAccessLevel(email);
    // Someone with full access owns everything, so the per-prompt lists are only
    // worth reading for everyone else. `credits` lets the gallery offer the
    // claim to a buyer who paid but has not picked their prompt yet.
    if (level === "full") return res.json({ hasAccess: true, trial: false, owned: [], credits: 0 });

    const onTrial = level === "trial";
    let [owned, credits] = await Promise.all([redisGetOwnedPrompts(email), redisGetPromptCredits(email)]);

    // The trial's prompts ride the same channel a pack's do. The gallery
    // already unlocks whatever comes back in `owned`, so the trial needs no new
    // idea on the page — only the flag that says why those four are open and
    // the rest are not.
    if (onTrial) owned = [...new Set([...owned, ...TRIAL_PROMPT_FILES])];

    // Nothing on record but the payment went through? Ask Whop directly. This
    // is what a buyer hits when the webhook never landed, and without it they
    // are told "access is activating" forever with no way out. Skipped on the
    // trial, where the membership has already been found and is not a pack.
    if (!onTrial && !credits && !owned.length) {
      const granted = await syncPackCreditsFromWhop(email);
      if (granted) credits = granted;
    }

    return res.json({ hasAccess: false, trial: onTrial, owned, credits });
  } catch (error) {
    console.error("Access verification failed:", error);
    return res.status(500).json({ error: "Impossible de vérifier l’accès.", errorEn: "Unable to verify access." });
  }
}

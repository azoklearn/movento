import { customerHasWhopAccess, methodNotAllowed, normalizeEmail, redisGetOwnedPrompts, redisGetPromptCredits } from "./_shared.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);

  const email = normalizeEmail(req.body?.email);
  if (!email) {
    return res.status(400).json({ error: "Email requis." });
  }

  try {
    const hasAccess = await customerHasWhopAccess(email);
    // Someone with full access owns everything, so the per-prompt lists are only
    // worth reading for everyone else. `credits` lets the gallery offer the
    // claim to a buyer who paid but has not picked their prompt yet.
    if (hasAccess) return res.json({ hasAccess: true, owned: [], credits: 0 });

    const [owned, credits] = await Promise.all([redisGetOwnedPrompts(email), redisGetPromptCredits(email)]);
    return res.json({ hasAccess: false, owned, credits });
  } catch (error) {
    console.error("Access verification failed:", error);
    return res.status(500).json({ error: "Impossible de vérifier l’accès.", errorEn: "Unable to verify access." });
  }
}

import {
  extractPrompt,
  fetchPromptMarkdown,
  isSafePromptFile,
  methodNotAllowed,
  normalizeEmail,
  redisClaimPrompt,
  redisGetOwnedPrompts,
  redisGetPromptCredits,
} from "./_shared.js";

// Spends one single-prompt credit on the prompt the buyer picks.
//
// GET  { email }        → what they have: credits left and prompts already owned
// POST { email, file }  → claims that prompt and returns it
export default async function handler(req, res) {
  const email = normalizeEmail(req.method === "GET" ? req.query?.email : req.body?.email);
  if (!email) return res.status(400).json({ error: "Email requis.", errorEn: "Email required." });

  if (req.method === "GET") {
    try {
      const [credits, owned] = await Promise.all([redisGetPromptCredits(email), redisGetOwnedPrompts(email)]);
      return res.json({ credits, owned });
    } catch (error) {
      console.error("Credit lookup failed:", error);
      return res.status(500).json({ error: "Impossible de lire tes achats.", errorEn: "Unable to read your purchases." });
    }
  }

  if (req.method !== "POST") return methodNotAllowed(res);

  const { file } = req.body || {};
  if (!isSafePromptFile(file)) {
    return res.status(400).json({ error: "Prompt invalide.", errorEn: "Invalid prompt." });
  }

  try {
    // Fetch the markdown BEFORE spending the credit. A prompt that cannot be
    // read would otherwise burn the credit and hand back nothing.
    const md = await fetchPromptMarkdown(file);
    if (md === null) {
      return res.status(404).json({ error: "Prompt introuvable.", errorEn: "Prompt not found." });
    }

    const result = await redisClaimPrompt(email, file);
    if (!result.ok) {
      return res.status(403).json({
        error: "Aucun prompt à débloquer. Achète un prompt à l'unité d'abord.",
        errorEn: "No prompt to unlock. Buy a single prompt first.",
      });
    }

    const credits = await redisGetPromptCredits(email);
    return res.json({ prompt: extractPrompt(md), owned: result.owned, credits, alreadyOwned: result.alreadyOwned });
  } catch (error) {
    console.error("Prompt claim failed:", error);
    return res.status(500).json({ error: "Impossible de débloquer ce prompt.", errorEn: "Unable to unlock this prompt." });
  }
}

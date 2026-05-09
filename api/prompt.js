import {
  customerHasStripeAccess,
  extractPrompt,
  FREE_PROMPT_FILE,
  isSafePromptFile,
  methodNotAllowed,
  normalizeEmail,
  PROMPTS_REPO,
} from "./_shared.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);

  const { file } = req.body || {};
  const email = normalizeEmail(req.body?.email);
  const isFreePrompt = file === FREE_PROMPT_FILE;

  if (!isSafePromptFile(file)) {
    return res.status(400).json({ error: "Prompt invalide." });
  }

  if (!isFreePrompt && !(await customerHasStripeAccess(email))) {
    return res.status(403).json({ error: "Accès premium requis." });
  }

  try {
    const response = await fetch(PROMPTS_REPO + encodeURIComponent(file));
    if (!response.ok) return res.status(404).json({ error: "Prompt introuvable." });

    const md = await response.text();
    return res.json({ prompt: extractPrompt(md) });
  } catch (error) {
    console.error("Prompt fetch failed:", error);
    return res.status(500).json({ error: "Impossible de charger le prompt." });
  }
}

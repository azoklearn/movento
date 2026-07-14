import {
  customerHasWhopAccess,
  CUSTOM_PROMPTS_REPO,
  extractPrompt,
  FREE_PROMPT_FILES,
  isSafePromptFile,
  methodNotAllowed,
  normalizeEmail,
  PROMPTS_REPO,
} from "./_shared.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);

  const { file } = req.body || {};
  const email = normalizeEmail(req.body?.email);
  const isFreePrompt = FREE_PROMPT_FILES.has(file);

  if (!isSafePromptFile(file)) {
    return res.status(400).json({ error: "Invalid prompt." });
  }

  if (!isFreePrompt && !(await customerHasWhopAccess(email))) {
    return res.status(403).json({ error: "Premium access required." });
  }

  try {
    // Try custom (movento) repo first, then fall back to motionsites.ai repo
    let response = await fetch(CUSTOM_PROMPTS_REPO + encodeURIComponent(file));
    if (!response.ok) {
      response = await fetch(PROMPTS_REPO + encodeURIComponent(file));
    }
    if (!response.ok) return res.status(404).json({ error: "Prompt not found." });

    const md = await response.text();
    return res.json({ prompt: extractPrompt(md) });
  } catch (error) {
    console.error("Prompt fetch failed:", error);
    return res.status(500).json({ error: "Unable to load prompt." });
  }
}

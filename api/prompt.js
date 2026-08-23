import {
  customerHasWhopAccess,
  customerOwnsPrompt,
  extractPrompt,
  fetchPromptMarkdown,
  FREE_PROMPT_FILES,
  isSafePromptFile,
  methodNotAllowed,
  normalizeEmail,
} from "./_shared.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);

  const { file } = req.body || {};
  const email = normalizeEmail(req.body?.email);
  const isFreePrompt = FREE_PROMPT_FILES.has(file);

  if (!isSafePromptFile(file)) {
    return res.status(400).json({ error: "Invalid prompt." });
  }

  // Three ways in: the prompt is free, the customer has full access, or they
  // bought this one prompt on its own.
  if (!isFreePrompt && !(await customerHasWhopAccess(email)) && !(await customerOwnsPrompt(email, file))) {
    return res.status(403).json({ error: "Premium access required." });
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

import {
  customerAccessLevel,
  customerOwnsPrompt,
  extractPrompt,
  fetchPromptMarkdown,
  FREE_PROMPT_FILES,
  isSafePromptFile,
  methodNotAllowed,
  normalizeEmail,
  promptAllowedFor,
} from "./_shared.js";

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

  try {
    const md = await fetchPromptMarkdown(file);
    if (md === null) return res.status(404).json({ error: "Prompt not found." });

    return res.json({ prompt: extractPrompt(md) });
  } catch (error) {
    console.error("Prompt fetch failed:", error);
    return res.status(500).json({ error: "Unable to load prompt." });
  }
}

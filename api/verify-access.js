import { customerHasWhopAccess, methodNotAllowed, normalizeEmail } from "./_shared.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);

  const email = normalizeEmail(req.body?.email);
  if (!email) {
    return res.status(400).json({ error: "Email requis." });
  }

  try {
    return res.json({ hasAccess: await customerHasWhopAccess(email) });
  } catch (error) {
    console.error("Access verification failed:", error);
    return res.status(500).json({ error: "Impossible de vérifier l’accès." });
  }
}

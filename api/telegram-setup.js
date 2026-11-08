// Registers api/telegram-webhook.js with Telegram and publishes the command
// menu, so the bot answers /ventes. Called once from the button in /admin;
// harmless to call again. ADMIN_TOKEN-gated: it points the bot somewhere.
import { isAdminAuthorized, methodNotAllowed } from "./_shared.js";
import { telegramWebhookSecret } from "./telegram-webhook.js";

const COMMANDS = [
  { command: "ventes", description: "Ventes du jour, de la semaine et du mois" },
  { command: "derniers", description: "Les derniers paiements" },
  { command: "abonnes", description: "Abonnés actifs et résiliations" },
  { command: "aide", description: "Les commandes" },
];

async function telegram(method, body) {
  const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.ok) throw new Error(`${method}: ${data.description || response.status}`);
  return data;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);
  res.setHeader("Cache-Control", "no-store");
  if (!isAdminAuthorized(req)) return res.status(401).json({ error: "Non autorisé." });
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    return res.status(400).json({ error: "TELEGRAM_BOT_TOKEN ou TELEGRAM_CHAT_ID manque dans Vercel." });
  }

  // The site's own address, as this request reached it.
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const url = `https://${host}/api/telegram-webhook`;
  try {
    await telegram("setWebhook", { url, secret_token: telegramWebhookSecret(), allowed_updates: ["message", "edited_message"], drop_pending_updates: true });
    await telegram("setMyCommands", { commands: COMMANDS });
    return res.json({ ok: true, url });
  } catch (error) {
    console.error("Telegram setup failed:", error);
    return res.status(502).json({ error: `Telegram a refusé : ${error.message}` });
  }
}

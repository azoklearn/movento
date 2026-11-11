// The Telegram bot's commands: the owner types /ventes in the chat and gets
// the day's, the week's and the month's sales back, read live from Paddle.
//
// Telegram calls this URL for every message sent to the bot, once it has been
// registered (api/telegram-setup.js, the button in /admin). Two locks:
//   - the X-Telegram-Bot-Api-Secret-Token header must carry the secret given
//     at registration, derived from the bot token (telegramWebhookSecret);
//   - only messages from TELEGRAM_CHAT_ID are answered. The bot's username is
//     public, and sales figures are not for whoever finds it.
// Anything else gets a silent 200, so Telegram does not keep retrying it.
import { createHash, timingSafeEqual } from "node:crypto";
import { formatMinorAmount, methodNotAllowed, mollieApi, paddleApi, paddlePlanOfItems, paddlePriceIds } from "./_shared.js";

export function telegramWebhookSecret(botToken = process.env.TELEGRAM_BOT_TOKEN) {
  if (!botToken) return "";
  // Telegram allows A-Z, a-z, 0-9, _ and -, up to 256 characters: hex fits.
  return createHash("sha256").update(`movento-telegram:${botToken}`).digest("hex").slice(0, 48);
}

const PLAN_NAMES = { m1: "Mensuel", m3: "3 mois", m12: "Annuel", lifetime: "À vie", sub: "Abonnement" };

// Midnight in Paris, as a UTC instant, for today or the first of the month.
export function parisStart(now = new Date(), { month = false } = {}) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  const offsetHours = (new Date(now.toLocaleString("en-US", { timeZone: "Europe/Paris" })) - new Date(now.toLocaleString("en-US", { timeZone: "UTC" }))) / 3600000;
  const y = Number(parts.year);
  const m = Number(parts.month);
  const d = month ? 1 : Number(parts.day);
  return new Date(Date.UTC(y, m - 1, d) - offsetHours * 3600000);
}

// Every page of a Paddle list, following its own "next" link. Page sizes are
// kept within Paddle's limits (transactions: 30) and the walk is capped: a
// command must answer in seconds.
async function paddleList(path, maxPages = 10) {
  const rows = [];
  let next = path;
  for (let page = 0; next && page < maxPages; page += 1) {
    const res = await paddleApi(next);
    rows.push(...(res.data || []));
    const link = res.meta?.pagination?.has_more ? res.meta.pagination.next : "";
    next = link ? (() => { const u = new URL(link); return `${u.pathname}${u.search}`; })() : "";
  }
  return rows;
}

// One completed transaction, as the bot counts it. Null when it is not one of
// our prices (anything else sold on the same Paddle account).
export function saleOf(txn) {
  const kind = paddlePlanOfItems(txn.items);
  if (!kind) return null;
  const totals = txn.details?.totals || {};
  return {
    kind,
    at: txn.billed_at || txn.created_at || "",
    currency: txn.currency_code || "EUR",
    paid: Number(totals.grand_total ?? totals.total ?? 0),
    net: Number(totals.earnings ?? 0),
    renewal: txn.origin === "subscription_recurring",
    email: txn.customer?.email || "",
  };
}

// Amounts per currency, added up and written out: "59,98 €" or "59,98 € + 30,00 $US".
function sumText(sales, field) {
  const byCurrency = {};
  for (const s of sales) byCurrency[s.currency] = (byCurrency[s.currency] || 0) + s[field];
  const parts = Object.entries(byCurrency).map(([cur, v]) => formatMinorAmount(v, cur)).filter(Boolean);
  return parts.length ? parts.join(" + ") : formatMinorAmount(0, "EUR");
}

export function salesReport(sales, now = new Date(), source = "Paddle") {
  const windows = [
    ["Aujourd'hui", parisStart(now)],
    ["7 derniers jours", new Date(now.getTime() - 7 * 86400000)],
    ["Ce mois-ci", parisStart(now, { month: true })],
  ];
  const lines = [`📊 Ventes ${source}`];
  for (const [label, since] of windows) {
    const inWindow = sales.filter((s) => s.at && new Date(s.at) >= since);
    const fresh = inWindow.filter((s) => !s.renewal).length;
    const renewals = inWindow.length - fresh;
    const byPlan = Object.entries(inWindow.filter((s) => !s.renewal).reduce((acc, s) => ({ ...acc, [s.kind]: (acc[s.kind] || 0) + 1 }), {}))
      .map(([k, n]) => `${n} ${PLAN_NAMES[k] || k}`)
      .join(", ");
    lines.push(
      "",
      `${label}`,
      inWindow.length
        ? `${fresh} nouvelle${fresh > 1 ? "s" : ""} vente${fresh > 1 ? "s" : ""}${byPlan ? ` (${byPlan})` : ""} · ${renewals} renouvellement${renewals > 1 ? "s" : ""}`
        : "Aucune vente",
      ...(inWindow.length ? [`${sumText(inWindow, "paid")} encaissés${inWindow.every((s) => Number.isFinite(s.net)) ? ` · net ${sumText(inWindow, "net")}` : ""}`] : []),
    );
  }
  return lines.join("\n");
}

export function latestReport(sales) {
  const latest = [...sales].sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 8);
  if (!latest.length) return "🧾 Aucun paiement ces 31 derniers jours.";
  const when = (iso) => new Date(iso).toLocaleString("fr-FR", { timeZone: "Europe/Paris", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  return ["🧾 Derniers paiements", ...latest.map((s) => `${when(s.at)} · ${s.renewal ? "🔁" : "💰"} ${PLAN_NAMES[s.kind] || s.kind} · ${formatMinorAmount(s.paid, s.currency)}${s.email ? ` · ${s.email}` : ""}`)].join("\n");
}

// Mollie's side of the same three reports: payments read from Mollie, in the
// shape saleOf gives Paddle's. No net figure: Mollie's fees are settled apart.
export function mollieSaleOf(p) {
  if (p.status !== "paid") return null;
  // A renewal may carry no plan of ours: it is still a subscription payment.
  const plan = p.metadata?.plan || (p.subscriptionId ? "sub" : "");
  if (!PLAN_NAMES[plan]) return null;
  const paid = Math.round((Number(p.amount?.value || 0) - Number(p.amountRefunded?.value || 0)) * 100);
  return { kind: plan, at: p.paidAt || p.createdAt || "", currency: p.amount?.currency || "EUR", paid, net: NaN, renewal: p.sequenceType === "recurring" || Boolean(p.subscriptionId), email: p.metadata?.email || "" };
}

async function mollieList(path, until, maxPages = 10) {
  const rows = [];
  let next = path;
  for (let page = 0; next && page < maxPages; page += 1) {
    const res = await mollieApi(next);
    const items = Object.values(res._embedded || {})[0] || [];
    rows.push(...items);
    // Newest first: stop once the page reaches back past the window.
    if (until && items.length && new Date(items[items.length - 1].createdAt) < until) break;
    const href = res._links?.next?.href;
    next = href ? (() => { const u = new URL(href); return `${u.pathname.replace(/^\/v2/, "")}${u.search}`; })() : "";
  }
  return rows;
}

export function mollieSubscribersReport(subs) {
  const ours = subs.filter((s) => ["m1", "m3", "m12"].includes(s.metadata?.plan || "m1"));
  const active = ours.filter((s) => s.status === "active");
  const suspended = ours.filter((s) => s.status === "suspended");
  const byPlan = ["m3", "m12", "m1"].map((k) => [k, active.filter((s) => (s.metadata?.plan || "m1") === k).length]).filter(([, n]) => n);
  return [
    "👥 Abonnés Mollie",
    `${active.length} actif${active.length > 1 ? "s" : ""}${byPlan.length ? ` (${byPlan.map(([k, n]) => `${n} ${PLAN_NAMES[k]}`).join(", ")})` : ""}`,
    `${suspended.length} suspendu${suspended.length > 1 ? "s" : ""} (prélèvements en échec)`,
  ].join("\n");
}

export function subscribersReport(subs) {
  const ours = subs.filter((s) => paddlePlanOfItems(s.items));
  const active = ours.filter((s) => s.status === "active" || s.status === "trialing");
  const pastDue = ours.filter((s) => s.status === "past_due");
  const leaving = active.filter((s) => s.scheduled_change?.action === "cancel");
  return [
    "👥 Abonnés Paddle",
    `${active.length} actif${active.length > 1 ? "s" : ""}${leaving.length ? `, dont ${leaving.length} résiliation${leaving.length > 1 ? "s" : ""} programmée${leaving.length > 1 ? "s" : ""}` : ""}`,
    `${pastDue.length} en échec de paiement`,
  ].join("\n");
}

const HELP = [
  "Commandes Movento :",
  "/ventes — ventes du jour, de la semaine et du mois",
  "/derniers — les derniers paiements",
  "/abonnes — abonnés actifs et résiliations",
  "",
  "Tu reçois aussi une notification à chaque paiement.",
].join("\n");

async function answer(command) {
  // Whoever sells reports: Mollie when the site sells through it.
  if (String(process.env.CHECKOUT_PROVIDER || "").trim().toLowerCase() === "mollie") {
    if (!process.env.MOLLIE_API_KEY) return "MOLLIE_API_KEY n'est pas configurée : impossible de lire Mollie.";
    if (command === "/ventes" || command === "/derniers") {
      const now = new Date();
      const since = new Date(Math.min(parisStart(now, { month: true }).getTime(), now.getTime() - (command === "/derniers" ? 31 : 7) * 86400000));
      const sales = (await mollieList("/payments?limit=250", since)).map(mollieSaleOf).filter(Boolean);
      return command === "/ventes" ? salesReport(sales, now, "Mollie") : latestReport(sales).replace("Derniers paiements", "Derniers paiements Mollie");
    }
    if (command === "/abonnes") return mollieSubscribersReport(await mollieList("/subscriptions?limit=250"));
    return HELP;
  }
  if (!process.env.PADDLE_API_KEY) return "PADDLE_API_KEY n'est pas configurée : impossible de lire Paddle.";
  if (!paddlePriceIds().m1 && !paddlePriceIds().lifetime) return "Aucun prix Paddle configuré.";
  if (command === "/ventes" || command === "/derniers") {
    // One read covers every window: the month, or 7 days when the month is
    // younger than that, and 31 days for the latest list.
    const now = new Date();
    const since = new Date(Math.min(parisStart(now, { month: true }).getTime(), now.getTime() - (command === "/derniers" ? 31 : 7) * 86400000));
    const txns = await paddleList(`/transactions?status=completed&billed_at[GTE]=${encodeURIComponent(since.toISOString())}&order_by=billed_at[DESC]&per_page=30&include=customer`, 20);
    const sales = txns.map(saleOf).filter(Boolean);
    return command === "/ventes" ? salesReport(sales, now) : latestReport(sales);
  }
  if (command === "/abonnes") {
    const subs = await paddleList("/subscriptions?status=active,trialing,past_due&per_page=50", 20);
    return subscribersReport(subs);
  }
  return HELP;
}

async function reply(chatId, text) {
  const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) console.error("Telegram reply failed:", response.status, await response.text().catch(() => ""));
}

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);
  const expected = telegramWebhookSecret();
  const given = String(req.headers["x-telegram-bot-api-secret-token"] || "");
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (!expected || a.length !== b.length || !timingSafeEqual(a, b)) return res.status(401).json({ error: "Non autorisé." });

  const message = req.body?.message || req.body?.edited_message;
  const chatId = String(message?.chat?.id || "");
  if (!message?.text || chatId !== String(process.env.TELEGRAM_CHAT_ID || "")) {
    if (message?.text) console.log("Telegram command from an unknown chat ignored:", chatId);
    return res.json({ ok: true });
  }

  // "/ventes@MonBot argument" → "/ventes"
  const command = message.text.trim().split(/\s+/)[0].split("@")[0].toLowerCase();
  let text;
  try {
    text = await answer(command);
  } catch (error) {
    console.error("Telegram command failed:", command, error);
    text = "Impossible de lire Paddle pour le moment. Réessaie dans un instant.";
  }
  try {
    await reply(chatId, text);
  } catch (error) {
    console.error("Telegram reply failed:", error);
  }
  return res.json({ ok: true });
}

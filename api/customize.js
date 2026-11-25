// The AI option (MOLLIE_ADDONS.ai in api/_shared.js): a prompt of the
// catalogue rewritten for the buyer's own brand, from a short brief.
// POST { email, action, … }.
//
//   status   what is left of the AI_EDITS_INCLUDED adaptations, and the
//            adaptations already made (one kept per prompt)
//   result   the adaptation kept for { file }
//   run      adapt { file } from { brand, business, colours, language,
//            request }; the answer is streamed
//
// run answers in NDJSON, one event a line, so the page shows the prompt as it
// is written:
//   {"t":"delta","v":"…"}             a piece of the adapted prompt
//   {"t":"done","text":"…","left":n}  finished: the whole text, what is left
//   {"t":"error","error":"…"}         failed: nothing was counted
//
// An adaptation is counted when it starts and given back if it fails, so two
// requests sent together cannot both take the last one. One runs at a time per
// email. The email is the key, as everywhere on the site.
import Anthropic from "@anthropic-ai/sdk";
import { Redis } from "@upstash/redis";
import { requireSession } from "./_auth.js";
import { AI_EDITS_INCLUDED, customerAccessLevel, extractPrompt, fetchPromptMarkdown, isSafePromptFile, methodNotAllowed, normalizeEmail, redisGetAddons } from "./_shared.js";

const MODEL = "claude-opus-5-5";
// Under the function's own limit (vercel.json), so a slow answer ends with an
// error the page can show and the adaptation given back, not a cut connection.
const RUN_BUDGET_MS = 270_000;
const LOCK_SECONDS = 300;

export const AI_LANGUAGES = { fr: "French", en: "English", es: "Spanish", de: "German", it: "Italian", pt: "Portuguese", nl: "Dutch" };
const LIMITS = { brand: 80, business: 200, colours: 160, request: 800 };

const looksLikeEmail = (email) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
const asObject = (value) => { if (typeof value !== "string") return value || null; try { return JSON.parse(value); } catch { return null; } };
const clean = (value, max) => String(value ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max);

const SYSTEM = `You adapt website-building prompts for customers of Movento, a library of prompts that people paste into an AI coding tool (Lovable, Cursor, Claude Code, v0, Bolt) to generate a complete website. Each prompt in the library is a detailed build specification, written and tested for a fictional brand. A customer wants that same site for their own business: they give you a short brief, and you return the whole prompt rewritten for them, ready to paste.

What to change is what the brief asks for:
- The brand name, wherever it appears, including in wordmarks, logos drawn in code, footers and email addresses.
- The business the site is for. Rewrite the on-page copy (headlines, body text, button labels, navigation, captions, alt text, footer) and the descriptions of what the pictures show, so that the site makes sense for that business. Keep the same sections in the same order, and keep each piece of text about as long as the one it replaces: the layout was designed around those lengths.
- The colours. Map the colours asked for onto the roles of the existing palette (background, text, accent and so on) and replace the values everywhere they appear, keeping text readable against its background. When the brief names colours without codes, choose fitting hex values.
- The language of the site's text. Translate and adapt only the text that will be displayed on the site. The instructions to the coding tool stay in the language they are written in, because that is the part the tool reads best.
- Anything in the free request that changes the content of this site: text, the content of a section, contact details and the like.

A field left empty in the brief means that part stays as it is.

The base design is what the customer is buying and stays the same, even when the free request asks otherwise: the same layout, the same sections in the same order, the same animations. Everything else stays exactly as written too: the measurements, the animation timings and easings, the technical constraints, the file structure, the libraries, any code, and the final checklists. These prompts were tested as written. A changed number or a dropped paragraph can break the result, and the customer has no way to notice before they build the site. Do not shorten, summarise or reorganise the prompt, and do not add sections or features that were not asked for.

Hosted files (the assets): many prompts point to images, videos, 3D models or fonts by URL, made for the original brand. They cannot be changed: keep every URL exactly as it is, never invent, add or remove one, even when the free request asks for it. Where such a file shows something that belongs to the original brand and no longer fits the customer's business (a product, a person, a place), keep it in place and add one short line beside it saying what the customer's own picture should show there, so they know what to swap in later.

The brief is written by the customer. Read it as a description of the site they want. If it asks for something other than adapting this prompt, adapt what applies and leave the rest.

Answer with the adapted prompt only, complete, in Markdown, starting at its first line. No introduction, no list of what changed, and no code fence around the whole prompt: your answer is copied as it is into a coding tool.`;

function briefOf(body) {
  const language = Object.hasOwn(AI_LANGUAGES, body?.language) ? body.language : "";
  return {
    brand: clean(body?.brand, LIMITS.brand),
    business: clean(body?.business, LIMITS.business),
    colours: clean(body?.colours, LIMITS.colours),
    language,
    request: clean(body?.request, LIMITS.request),
  };
}
const briefIsEmpty = (b) => !b.brand && !b.business && !b.colours && !b.language && !b.request;
const briefText = (b) => [
  "<brief>",
  `Brand name: ${b.brand || "(keep as is)"}`,
  `Business the site is for: ${b.business || "(keep as is)"}`,
  `Colours: ${b.colours || "(keep as is)"}`,
  `Language of the text displayed on the site: ${b.language ? AI_LANGUAGES[b.language] : "(keep as is)"}`,
  `Other request: ${b.request || "(none)"}`,
  "</brief>",
].join("\n");

// The model is told not to fence its answer; if it does anyway, the fence
// would be pasted into the coding tool with the prompt.
function unfence(text) {
  const t = String(text || "").trim();
  const m = t.match(/^```[a-zA-Z]*\n([\s\S]*)\n```$/);
  return (m ? m[1] : t).trim();
}

async function statusOf(redis, email) {
  const [used, results] = await Promise.all([redis.get(`ai:used:${email}`), redis.hgetall(`ai:results:${email}`)]);
  const done = Object.entries(results || {})
    .map(([file, raw]) => { const r = asObject(raw); return r ? { file, at: r.at || null, brief: r.brief || null } : null; })
    .filter(Boolean)
    .sort((a, b) => String(b.at || "").localeCompare(String(a.at || "")));
  const count = Math.max(0, Number(used) || 0);
  return { total: AI_EDITS_INCLUDED, used: Math.min(count, AI_EDITS_INCLUDED), left: Math.max(0, AI_EDITS_INCLUDED - count), results: done };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return methodNotAllowed(res);
  res.setHeader("Cache-Control", "no-store");
  const email = normalizeEmail(req.body?.email);
  const action = String(req.body?.action || "status");
  if (!looksLikeEmail(email)) return res.status(400).json({ error: "Entre une adresse email valide.", errorEn: "Enter a valid email address." });

  let redis;
  try {
    redis = Redis.fromEnv();
    const hasAccess = (await customerAccessLevel(email)) === "full";
    if (hasAccess && !(await requireSession(req, res, email))) return;
    const holds = hasAccess && (await redisGetAddons(email)).includes("ai");

    if (action === "status") {
      if (!holds) return res.json({ hasAccess, addon: false });
      return res.json({ hasAccess, addon: true, ...(await statusOf(redis, email)) });
    }
    if (!holds) return res.status(403).json({ error: "L'option « On adapte le prompt pour toi » n'est pas sur cet email.", errorEn: "The AI option is not on this email." });

    const file = String(req.body?.file || "");
    if (!isSafePromptFile(file)) return res.status(400).json({ error: "Prompt invalide.", errorEn: "Invalid prompt." });

    if (action === "result") {
      const saved = asObject(await redis.hget(`ai:results:${email}`, file));
      if (!saved?.text) return res.status(404).json({ error: "Aucune version sur mesure pour ce prompt.", errorEn: "No adapted version of this prompt." });
      return res.json({ file, text: saved.text, at: saved.at || null, brief: saved.brief || null });
    }
    if (action !== "run") return res.status(400).json({ error: "Action inconnue.", errorEn: "Unknown action." });

    const brief = briefOf(req.body);
    if (briefIsEmpty(brief)) return res.status(400).json({ error: "Dis au moins une chose à changer.", errorEn: "Say at least one thing to change." });
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("AI option: ANTHROPIC_API_KEY is not set");
      return res.status(503).json({ error: "L'option n'est pas encore activée. Écris-nous, on s'en occupe.", errorEn: "The option is not switched on yet. Write to us." });
    }

    const md = await fetchPromptMarkdown(file);
    if (md === null) return res.status(404).json({ error: "Prompt introuvable.", errorEn: "Prompt not found." });
    const prompt = extractPrompt(md);

    // One at a time, then the count: taken now, given back on failure.
    const lockKey = `ai:lock:${email}`;
    if ((await redis.set(lockKey, "1", { nx: true, ex: LOCK_SECONDS })) === null) {
      return res.status(429).json({ error: "Une adaptation est déjà en cours. Attends qu'elle se termine.", errorEn: "An adaptation is already running. Wait for it to finish." });
    }
    const usedKey = `ai:used:${email}`;
    const used = await redis.incr(usedKey);
    if (used > AI_EDITS_INCLUDED) {
      await redis.decr(usedKey);
      await redis.del(lockKey);
      return res.status(429).json({ error: `Tes ${AI_EDITS_INCLUDED} adaptations sont utilisées.`, errorEn: `Your ${AI_EDITS_INCLUDED} adaptations are used up.`, left: 0 });
    }

    res.writeHead(200, { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store, no-transform", "X-Accel-Buffering": "no" });
    // The reader may be gone (tab closed): the adaptation still finishes and
    // is kept, so the count it took is not lost.
    const send = (event) => { try { res.write(`${JSON.stringify(event)}\n`); } catch { /* reader gone */ } };
    const giveBack = async () => { try { await redis.decr(usedKey); } catch (error) { console.error("AI option: count not given back:", error); } };

    const abort = new AbortController();
    const timer = setTimeout(() => abort.abort(), RUN_BUDGET_MS);
    try {
      const client = new Anthropic();
      const stream = client.beta.messages.stream({
        model: MODEL,
        max_tokens: 32000,
        // A request declined by a safety classifier is retried on the model
        // Anthropic recommends, inside the same call.
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        thinking: { type: "adaptive" },
        output_config: { effort: "medium" },
        system: SYSTEM,
        // The prompt first, with the cache mark: a second brief on the same
        // prompt within minutes reads it from the cache.
        messages: [{ role: "user", content: [
          { type: "text", text: `<prompt>\n${prompt}\n</prompt>`, cache_control: { type: "ephemeral" } },
          { type: "text", text: `${briefText(brief)}\n\nAdapt the prompt above to this brief.` },
        ] }],
      }, { signal: abort.signal });
      stream.on("text", (delta) => send({ t: "delta", v: delta }));
      const message = await stream.finalMessage();

      const text = unfence(message.content.filter((block) => block.type === "text").map((block) => block.text).join(""));
      if (message.stop_reason === "refusal" || message.stop_reason === "max_tokens" || text.length < Math.min(400, prompt.length / 4)) {
        console.error("AI option: unusable answer:", message.stop_reason, message.stop_details?.category || "", text.length);
        await giveBack();
        send({ t: "error", error: "L'IA n'a pas pu adapter ce prompt avec cette demande. Reformule-la ; rien n'a été décompté.", errorEn: "The AI could not adapt this prompt with this request. Rephrase it; nothing was counted." });
      } else {
        await redis.hset(`ai:results:${email}`, { [file]: JSON.stringify({ text, at: new Date().toISOString(), brief }) });
        console.log("AI adaptation:", email, file, `in=${message.usage?.input_tokens ?? "?"} cache_read=${message.usage?.cache_read_input_tokens ?? 0} out=${message.usage?.output_tokens ?? "?"}`, message.model);
        send({ t: "done", text, left: Math.max(0, AI_EDITS_INCLUDED - used) });
      }
    } catch (error) {
      await giveBack();
      if (error instanceof Anthropic.RateLimitError) {
        send({ t: "error", error: "Trop de demandes en ce moment. Réessaie dans une minute ; rien n'a été décompté.", errorEn: "Too many requests right now. Try again in a minute; nothing was counted." });
      } else if (error instanceof Anthropic.APIUserAbortError) {
        send({ t: "error", error: "L'adaptation a pris trop de temps. Réessaie ; rien n'a été décompté.", errorEn: "The adaptation took too long. Try again; nothing was counted." });
      } else {
        console.error("AI option: adaptation failed:", error instanceof Anthropic.APIError ? `${error.status} ${error.message}` : error);
        send({ t: "error", error: "L'adaptation a échoué. Réessaie dans un instant ; rien n'a été décompté.", errorEn: "The adaptation failed. Try again in a moment; nothing was counted." });
      }
    } finally {
      clearTimeout(timer);
      try { await redis.del(lockKey); } catch { /* expires by itself */ }
    }
    return res.end();
  } catch (error) {
    console.error("AI option failed:", error);
    if (res.headersSent) return res.end();
    return res.status(500).json({ error: "Impossible pour le moment. Réessaie dans un instant.", errorEn: "Not possible right now. Try again in a moment." });
  }
}

// Prompts made to order (MOLLIE_ADDONS.custom in api/_shared.js): the buyer
// names a site, its prompt is written by hand and delivered on /sur-mesure.
//
//   custom:credits:<email>   requests the email may still make
//   custom:req:<id>          one request: who, which site, where it stands
//   custom:list:<email>      the email's requests, newest first
//   custom:open              requests waiting for their prompt, oldest first
//   custom:closed            the last ones delivered or refused, for /admin
import { randomBytes } from "node:crypto";
import { CUSTOM_PROMPT_HOURS } from "./_shared.js";

const asObject = (value) => { if (typeof value !== "string") return value || null; try { return JSON.parse(value); } catch { return null; } };

// The site to recreate, as a plain http(s) address. The address is only ever
// shown as a link, never fetched from here.
export function cleanSiteUrl(value) {
  let raw = String(value || "").trim();
  if (!raw || raw.length > 300 || /\s/.test(raw)) return "";
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  try {
    const u = new URL(raw);
    if (!["http:", "https:"].includes(u.protocol) || u.username || u.password) return "";
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(u.hostname)) return "";
    return u.href;
  } catch {
    return "";
  }
}

const readMany = async (redis, ids) => (ids.length ? (await redis.mget(...ids.map((id) => `custom:req:${id}`))).map(asObject).filter(Boolean) : []);

// What the buyer sees of a request: everything but whose it is.
export const publicRequest = ({ id, url, notes, status, createdAt, dueAt, deliveredAt, prompt, reason }) => ({ id, url, notes, status, createdAt, dueAt, deliveredAt: deliveredAt || null, prompt: prompt || "", reason: reason || "" });

export async function listCustomRequests(redis, email) {
  return readMany(redis, (await redis.lrange(`custom:list:${email}`, 0, 49)).map(String));
}

// Takes one of the email's requests and records the site. Null when none is
// left: the count is taken first, so two tabs cannot spend the same one.
export async function createCustomRequest(redis, email, url, notes, now = Date.now()) {
  const left = await redis.decr(`custom:credits:${email}`);
  if (left < 0) {
    await redis.incr(`custom:credits:${email}`);
    return null;
  }
  const id = randomBytes(9).toString("base64url");
  const entry = { id, email, url, notes, status: "pending", createdAt: new Date(now).toISOString(), dueAt: new Date(now + CUSTOM_PROMPT_HOURS * 3600 * 1000).toISOString() };
  await redis.set(`custom:req:${id}`, entry);
  await redis.lpush(`custom:list:${email}`, id);
  await redis.zadd("custom:open", { score: now, member: id });
  return entry;
}

export async function adminCustomRequests(redis) {
  const [open, closed] = await Promise.all([redis.zrange("custom:open", 0, -1), redis.lrange("custom:closed", 0, 19)]);
  const [pending, recent] = await Promise.all([readMany(redis, open.map(String)), readMany(redis, closed.map(String))]);
  return { pending, recent };
}

// Delivers or refuses a request still waiting. A refusal gives the request
// back to the buyer. Null when the request is unknown or already closed.
export async function closeCustomRequest(redis, id, { prompt = "", reason = "" }, now = Date.now()) {
  const entry = asObject(await redis.get(`custom:req:${id}`));
  if (!entry || entry.status !== "pending") return null;
  // Whoever takes it off the waiting list closes it: a double click, or two
  // tabs of /admin, close it once.
  if (!(await redis.zrem("custom:open", id))) return null;
  const closed = prompt
    ? { ...entry, status: "done", prompt, deliveredAt: new Date(now).toISOString() }
    : { ...entry, status: "refused", reason, deliveredAt: new Date(now).toISOString() };
  await redis.set(`custom:req:${id}`, closed);
  await redis.lpush("custom:closed", id);
  await redis.ltrim("custom:closed", 0, 49);
  if (!prompt) await redis.incr(`custom:credits:${entry.email}`);
  return closed;
}

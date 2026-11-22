// Passwords and sessions. Until now an email alone opened what it had bought;
// now the email names the account and a password proves it.
//
//   auth:<email>        { salt, hash, at }  scrypt of the password
//   session:<sha256>    email               one per signed-in browser, 90 days
//   sessions:<email>    set of those hashes, so they can all be ended at once
//
// The browser holds the session in an HttpOnly cookie: scripts on the page
// cannot read it, and it rides along on every same-origin API call, so the
// pages do not have to pass anything.
//
// There is no email sent from this site, so a password is set by the first
// person to enter the address once it holds a purchase, and a forgotten one is
// reset by hand from /admin (clearPassword), after which the address sets a
// new one.
//
// What an endpoint does with this: it works out, as before, whether the email
// is entitled to what is asked. If it is, it then asks requireSession — the
// answer is the content, or a 401 that tells the page which dialog to open
// ("login": a password exists; "setup": none yet, create one).
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { Redis } from "@upstash/redis";
import { customerAccessLevel, normalizeEmail, redisGetOwnedPrompts, redisGetPromptCredits } from "./_shared.js";

const scrypt = promisify(scryptCallback);
const redis = () => Redis.fromEnv();
const COOKIE = "movento_session";
const SESSION_SECONDS = 90 * 86400;
export const PASSWORD_MIN = 8;
const PASSWORD_MAX = 200;

const asObject = (value) => { if (typeof value !== "string") return value || null; try { return JSON.parse(value); } catch { return null; } };
const tokenKey = (token) => `session:${createHash("sha256").update(token).digest("hex")}`;

export const passwordProblem = (password) => {
  const p = String(password ?? "");
  if (p.length < PASSWORD_MIN) return { error: `Le mot de passe doit faire au moins ${PASSWORD_MIN} caractères.`, errorEn: `The password must be at least ${PASSWORD_MIN} characters.` };
  if (p.length > PASSWORD_MAX) return { error: "Mot de passe trop long.", errorEn: "Password too long." };
  return null;
};

export async function hasPassword(email) {
  return Boolean(asObject(await redis().get(`auth:${email}`))?.hash);
}

// Sets the password. With `onlyIfNone`, only when the address has none yet:
// two people setting it at the same moment cannot both succeed.
export async function setPassword(email, password, { onlyIfNone = false } = {}) {
  const salt = randomBytes(16);
  const hash = await scrypt(String(password), salt, 64);
  const record = JSON.stringify({ salt: salt.toString("base64"), hash: hash.toString("base64"), at: new Date().toISOString() });
  const done = await redis().set(`auth:${email}`, record, onlyIfNone ? { nx: true } : undefined);
  return done !== null;
}

export async function checkPassword(email, password) {
  const record = asObject(await redis().get(`auth:${email}`));
  if (!record?.hash || !record.salt) return false;
  const expected = Buffer.from(record.hash, "base64");
  const given = await scrypt(String(password), Buffer.from(record.salt, "base64"), expected.length);
  return timingSafeEqual(expected, given);
}

function cookieToken(req) {
  const header = String(req.headers?.cookie || "");
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === COOKIE) return part.slice(i + 1).trim();
  }
  return "";
}

const cookieLine = (value, maxAge) => `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;

// The email signed in on this browser, or "".
export async function sessionEmail(req) {
  const token = cookieToken(req);
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(token)) return "";
  try { return normalizeEmail(await redis().get(tokenKey(token))); } catch { return ""; }
}

export async function startSession(res, email) {
  const token = randomBytes(32).toString("base64url");
  const key = tokenKey(token);
  const r = redis();
  await r.set(key, email, { ex: SESSION_SECONDS });
  await r.sadd(`sessions:${email}`, key).catch(() => {});
  res.setHeader("Set-Cookie", cookieLine(token, SESSION_SECONDS));
}

export async function endSession(req, res) {
  const token = cookieToken(req);
  if (token) {
    const key = tokenKey(token);
    const email = await sessionEmail(req);
    await redis().del(key).catch(() => {});
    if (email) await redis().srem(`sessions:${email}`, key).catch(() => {});
  }
  res.setHeader("Set-Cookie", cookieLine("", 0));
}

export async function endAllSessions(email) {
  const r = redis();
  const keys = (await r.smembers(`sessions:${email}`).catch(() => [])) || [];
  if (keys.length) await r.del(...keys).catch(() => {});
  await r.del(`sessions:${email}`).catch(() => {});
}

// The password forgotten: taken off, with every browser signed out. The
// address sets a new one at its next visit.
export async function clearPassword(email) {
  await redis().del(`auth:${email}`, `auth:miss:${email}`);
  await endAllSessions(email);
}

// Whether an address holds anything a password would protect: the catalogue
// (bought, on trial, or through a team), prompts bought one by one, or
// credits not spent yet. `level` is passed when the caller already has it.
export async function isAccount(email, level) {
  const access = level ?? (await customerAccessLevel(email));
  if (access && access !== "none") return true;
  const [owned, credits] = await Promise.all([redisGetOwnedPrompts(email), redisGetPromptCredits(email)]);
  return owned.length > 0 || credits > 0;
}

// For an email already found entitled to what is asked: true when this browser
// is signed in as it. Otherwise the 401 is sent, with the dialog to open, and
// the caller returns.
export async function requireSession(req, res, email) {
  if (email && (await sessionEmail(req)) === email) return true;
  const mode = (await hasPassword(email)) ? "login" : "setup";
  refuse(res, email, mode);
  return false;
}

// Headers as well as the body: the page watches every API answer for them,
// whichever part of it made the call.
export function authHeaders(res, email, mode) {
  res.setHeader("X-Movento-Auth", mode);
  res.setHeader("X-Movento-Auth-Email", encodeURIComponent(email));
}
export function refuse(res, email, mode) {
  authHeaders(res, email, mode);
  res.setHeader("Cache-Control", "no-store");
  return res.status(401).json(mode === "login"
    ? { error: "Entre ton mot de passe pour continuer.", errorEn: "Enter your password to continue.", auth: "login" }
    : { error: "Crée ton mot de passe pour continuer.", errorEn: "Create your password to continue.", auth: "setup" });
}

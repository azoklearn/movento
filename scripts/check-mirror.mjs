// src/App.jsx and api/_shared.js each hold their own copy of two things: how
// many free days the offer has, and which prompts the gallery leads with. They
// have to be copies rather than an import — one is bundled for the browser, the
// other runs on Vercel — and a drift between them is not a cosmetic bug:
//
//   TRIAL_DAYS apart        -> the page promises days the API does not honour
//   FREE_PROMPT_FILES apart -> either a badge on a prompt /api/prompt refuses,
//                              or a paid prompt handed out for free
//
// So the mirror is checked here instead, by reading both files as text. No
// import, on purpose: importing src/App.jsx would pull in JSX and the whole
// front end just to read two constants.
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const app = readFileSync(join(root, "src/App.jsx"), "utf8");
const api = readFileSync(join(root, "api/_shared.js"), "utf8");

const fail = (msg) => { console.error(`  ✗ ${msg}`); process.exitCode = 1; };
const pass = (msg) => console.log(`  ✓ ${msg}`);

const trialOf = (src, label) => {
  const m = src.match(/^(?:export )?const TRIAL_DAYS = (\d+);/m);
  if (!m) { fail(`${label}: no TRIAL_DAYS found`); return null; }
  return Number(m[1]);
};
const showcaseOf = (src, label) => {
  const m = src.match(/const SHOWCASE_FILES = \[([^\]]*)\]/);
  if (!m) { fail(`${label}: no SHOWCASE_FILES found`); return null; }
  return [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
};

const appTrial = trialOf(app, "src/App.jsx");
const apiTrial = trialOf(api, "api/_shared.js");
if (appTrial !== null && apiTrial !== null) {
  if (appTrial === apiTrial) pass(`TRIAL_DAYS = ${appTrial} in both`);
  else fail(`TRIAL_DAYS: src/App.jsx says ${appTrial}, api/_shared.js says ${apiTrial}`);
}

const appShow = showcaseOf(app, "src/App.jsx");
const apiShow = showcaseOf(api, "api/_shared.js");
if (appShow && apiShow) {
  if (appShow.join("|") === apiShow.join("|")) pass(`SHOWCASE_FILES: ${appShow.length} identical entries`);
  else fail(`SHOWCASE_FILES differ:\n      app: ${appShow.join(", ")}\n      api: ${apiShow.join(", ")}`);
}

// Every showcase filename has to be a real prompt, twice over: a catalogue
// entry so the card exists, and a markdown file so the copy button has
// something to hand over. A name missing either is a badge on a card that
// cannot exist, or a free pass for a file /api/prompt will fail to fetch.
if (appShow) {
  // The catalogue lives in App.jsx too, so the SHOWCASE_FILES list itself is
  // cut out first — otherwise every name trivially matches itself.
  const catalogue = app.replace(/const SHOWCASE_FILES = \[[^\]]*\]/, "");
  const unlisted = appShow.filter((f) => !catalogue.includes(`"${f}"`));
  if (unlisted.length) fail(`showcase files with no catalogue entry: ${unlisted.join(", ")}`);
  else pass("every showcase file has a catalogue entry");

  const unwritten = appShow.filter((f) => !existsSync(join(root, "prompts", f)));
  if (unwritten.length) fail(`showcase files with no markdown: ${unwritten.join(", ")}`);
  else pass("every showcase file has its markdown");
}

// The trial is only ever a claim the site makes about a Whop plan. Whop is what
// charges, so a number above 0 here has to have been set there first — this
// cannot check that, and says so rather than implying it did.
if (appTrial > 0) {
  console.log(`\n  ⚠ TRIAL_DAYS is ${appTrial}. This file cannot see Whop.`);
  console.log(`    Confirm the ${appTrial}-day trial is configured on plan_rP9Yq4HOSgHCZ,`);
  console.log(`    or the site promises free days over a plan that charges at once.`);
}
if (process.exitCode) console.error("\n  mirror check FAILED");
else console.log("\n  mirror ok");

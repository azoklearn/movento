// Collects the background clips the prompts point at, for the /backgrounds
// page: every video URL (mp4, webm, mov) found in prompts/*.md, once, with the
// first prompt that uses it. The page keeps only those whose prompt is in the
// catalogue, so a file that is not on sale never shows up there.
//
// Written to src/backgrounds.json and run on every build, so a new prompt's
// clip is listed as soon as the prompt is added.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const dir = join(root, "prompts");
const URL_RE = /https?:\/\/[^\s)"`'<>\]]+/g;
const VIDEO_RE = /\.(mp4|webm|mov)(\?|#|$)/i;

const seen = new Map();
for (const file of readdirSync(dir).filter((f) => f.endsWith(".md")).sort()) {
  const text = readFileSync(join(dir, file), "utf8");
  for (const raw of text.match(URL_RE) || []) {
    const url = raw.replace(/[.,;:*]+$/, "");
    if (!VIDEO_RE.test(url) || seen.has(url)) continue;
    seen.set(url, file);
  }
}

const list = [...seen].map(([url, file]) => ({ url, file }));
writeFileSync(join(root, "src", "backgrounds.json"), `${JSON.stringify(list, null, 1)}\n`);
console.log(`backgrounds: ${list.length} clips from prompts/`);

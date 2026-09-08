// Writes src/prompt-added.json: { "<file>.md": <unix seconds> } — when each
// prompt file first landed in git. The gallery sorts newest first with it.
// Re-run after adding prompts (or don't: a file missing from the map is
// treated as newer than everything in it, which is what a fresh file is).
import { execSync } from "node:child_process";
import { readdirSync, writeFileSync } from "node:fs";

const log = execSync("git log --diff-filter=A --name-only --format=%x00%ct -- prompts/", { encoding: "utf8" });
const added = {};
let ts = 0;
for (const line of log.split("\n")) {
  if (line.startsWith("\0")) { ts = Number(line.slice(1)); continue; }
  const m = line.match(/^prompts\/(.+\.md)$/);
  // git log is newest-first; keep the OLDEST add for a file re-added later.
  if (m) added[m[1]] = ts;
}
const out = {};
for (const f of readdirSync("prompts").filter((f) => f.endsWith(".md")).sort()) if (added[f]) out[f] = added[f];
writeFileSync("src/prompt-added.json", JSON.stringify(out, null, 0) + "\n");
const days = new Set(Object.values(out).map((t) => new Date(t * 1000).toISOString().slice(0, 10)));
console.log(`${Object.keys(out).length} files dated across ${days.size} days`);

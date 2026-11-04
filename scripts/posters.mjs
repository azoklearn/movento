// Writes src/posters.json: the frames that actually exist in public/posters.
// posterFor() checks it before putting a poster on a <video> at all.
//
// Why this file has to exist. A path under public/ that is NOT on disk is not
// a 404 here: the SPA rewrite answers it with index.html, 200 OK, text/html.
// A <video> handed that as its poster downloads 8.7kB of markup, fails to
// decode it as an image, and then — on iOS — falls back to drawing its own
// start-playback button over a blank frame. Only 12 of the 113 clips ship a
// poster, so that was a play glyph on most of the gallery, plus a hundred
// pointless requests competing with the clips themselves.
//
// Re-run after adding posters. A frame missing from this list is simply not
// used, which is the safe direction to fail in.
import { existsSync, readdirSync, writeFileSync } from "node:fs";

const dir = "public/posters";
const names = existsSync(dir)
  ? readdirSync(dir).filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f)).sort()
  : [];
writeFileSync("src/posters.json", JSON.stringify(names, null, 0) + "\n");
console.log(`${names.length} poster frames on disk`);

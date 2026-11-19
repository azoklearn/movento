# GTA 6 — Vice Coast teaser hero (fictional fan concept)

Build a single-file, full-screen fan-concept teaser hero for an open-world crime game set on a sun-soaked Florida-style coast. It is plain HTML, CSS and vanilla JavaScript, with no framework and no build step. The mood is neon sunset, palm trees, humid haze, fast cars and a pink-to-orange sky. This is an unofficial fan concept: use no official logos, trademarks, key art or trailer footage. Every image is a placeholder gradient or a shape drawn in CSS.

---

## 1. Look

- **Palette:**
  - deep night `#0b0614`
  - magenta `#ff2e88`
  - sunset orange `#ff8a3d`
  - gold `#ffd36b`
  - teal water `#18c3c9`
  - cream text `#fff4e6`
- **Fonts** (Google Fonts):
  - **Anton** for the giant title;
  - **Inter** 400–700 for UI text;
  - **Caveat** 600 for the handwritten "Coming soon" tag.
- **Sky:** a full-viewport vertical gradient from `#2a0b3d` at the top, through `#ff2e88` at 55%, to `#ff8a3d` at 80% and `#ffd36b` at the horizon (82% of the height). Below the horizon, a teal sea with thin horizontal light streaks that drift slowly to the left.
- **Sun:** a 38vmin disc centred on the horizon, filled with a gradient from gold to orange. It is cut by six horizontal stripes that get thicker toward the bottom (classic synthwave sun), and it pulses its glow every 4 s.
- **Palms:** two black CSS/SVG palm silhouettes, one on each side, swaying ±2° on 6 s and 7 s loops. They sit in front of the sun.
- **Grain:** an SVG noise overlay at opacity .12 and a soft vignette.

## 2. Layout

- **Nav** (fixed, top, 28 px side padding, 72 px tall):
  - left: the wordmark "VICE COAST" in Inter 700, tracking .3em;
  - centre: links "Trailers", "Characters", "Map", "Pre-order", in Inter 500, cream at 80% (white with a magenta underline on hover);
  - right: a magenta pill button "Watch trailer ▶".
- **Title block** (centred, just above the sun):
  - the giant title "GTA VI" in Anton at `min(26vw, 34vh)`, line-height .85;
  - a gradient fill from gold to magenta;
  - a 4 px cream outline (`-webkit-text-stroke`) and a long magenta glow.
- **Tag:** "Coming soon" in Caveat at 4vmin, rotated −6°, cream, sitting at the bottom right of the title.
- **Subline:** "Two outlaws. One coast. No way back." in Inter 500 at 18 px, cream at 85%, centred under the title.
- **Bottom bar:**
  - left: a "Scroll" cue with an animated line;
  - centre: three platform badges drawn as outlined pills ("Console", "Console", "PC") — generic text only;
  - right: the date "Fall 2026".

## 3. Motion

- **Intro (0–2.4 s):**
  1. the sky fades up from black;
  2. the sun rises 20vh to the horizon with `cubic-bezier(.16,1,.3,1)`;
  3. the palms slide in from the sides;
  4. the title letters slam in one by one from scale 1.6 and blur 12 px (80 ms stagger);
  5. the subline and nav fade in last.
- **Mouse parallax:**
  - the sky moves 0.5%;
  - the sun moves 1%;
  - the palms move 3%;
  - the title moves 1.5% the other way.
- **Scroll:**
  - the title scales down to .6 and pins to the top-left as a small logo;
  - the sea streaks speed up;
  - a dark section rises with three character cards (fictional names "Lena", "Rico", "The Broker"), each a gradient silhouette with a name and a one-line bio.
- **Trailer button:** opens a full-screen modal with a 16:9 placeholder (an animated gradient and the text "Trailer placeholder"). It closes with Esc or the × button.

## 4. Responsive and accessibility

- **Below 760 px:**
  - the nav links collapse into a burger menu;
  - the title becomes `28vw`;
  - the palms shrink to 60%;
  - the platform badges wrap.
- **Reduced motion:** with `prefers-reduced-motion: reduce`, show the final state at once, with no sway, pulse or parallax.
- **No horizontal scroll** at 320, 390, 768, 1024 or 1440 px wide.

## 5. Do not

- No official logos, artwork, screenshots, music or trailer footage.
- No real people.
- Keep it clearly a fan concept: put "Unofficial fan concept" in small text in the footer.

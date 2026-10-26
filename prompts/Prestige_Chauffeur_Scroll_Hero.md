Build a single-page luxury chauffeur website as a React + Vite + Tailwind CSS project. The centrepiece is a scroll-scrubbed cinematic hero: a 650-frame image sequence that plays forward as the visitor scrolls, like a film reel tied to the scrollbar. Dark, editorial, expensive. No video element for the hero — frames only.

This is a TEMPLATE. Every brand name, phone number, address and photograph below is a placeholder: replace them with your own. The design, the layout, the type scale, the colours and the scroll technique are the deliverable.

=====================================================================
1. STACK
=====================================================================
- React 18 + Vite + Tailwind CSS v4 (CSS-first config, @theme block).
- Smooth scrolling via Lenis (lerp-based, ~60fps normalised).
- No animation library needed: everything is CSS transitions plus one requestAnimationFrame loop for the frame sequence.
- Fonts from Google Fonts, preconnected:
  https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap

=====================================================================
2. DESIGN TOKENS (@theme)
=====================================================================
--font-sans:   "Plus Jakarta Sans", system-ui, -apple-system, sans-serif   (body, UI, labels)
--font-serif:  "Playfair Display", Georgia, serif                          (section headings)
--font-cinzel: "Cinzel", serif                                             (logo and eyebrow caps only)

Colours — a near-black maroon ground with one hot crimson accent:
  #0d0606  page ground            #f5ede8  primary text (warm off-white)
  #c81f3a  accent (buttons, rules, active states)
  #e62650  accent-bright (logo star, hovers)      #e63950  accent-hover
  #a89994  muted text             #d6c7c2  muted text hover
  #800020  deep burgundy (gradient stops)         #9b1b34  mid burgundy
  Panel ladder, darkest to lightest:
  #120508  #140608  #160709  #18080c  #1a080c  #2b0a10  #290c13
  Borders: #25080e  #2d0b11  #3a0d14
Selection: background #c81f3a, text white. <html> and <body> carry bg-[#0d0606] text-[#f5ede8] antialiased overflow-x-hidden.

=====================================================================
3. ASSETS YOU MUST SUPPLY (exact specs — shoot, render or generate them)
=====================================================================
Serve everything from /public so the paths below resolve at the site root.

A. HERO FRAME SEQUENCE — the whole point of the page.
   /frames/<sequence-name>/desktop/f_001.webp … f_650.webp   — 1600×900, ~73 KB each (~46 MB total)
   /frames/<sequence-name>/mobile/f_001.webp  … f_650.webp   — 960×540,  ~41 KB each (~26 MB total)
   650 frames, three digits, zero-padded, 1-indexed. Export a 20–26s cinematic clip at ~25–30fps to WebP (quality ~72).
   Suggested narrative arc, which the copy beats below are timed to:
     f_001–f_240  a fleet of dark saloons parked in a lit tunnel, head-on, symmetrical; headlights come up around f_120
     f_241–f_330  the centre car pulls away, out of the tunnel into a wet night street
     f_331–f_500  it draws up outside a grand illuminated building; a chauffeur steps out and opens the rear door
     f_501–f_650  close on the handover — a card, a key, a handshake. Ends on your logo in frame.
B. HERO POSTER (shown until the first frames decode, and as the <img> fallback):
   /assets/hero-poster-1080.webp  1920×1080      /assets/hero-poster-720.webp  1280×720
   Use frame 1 of the sequence, graded identically.
C. FLEET CUTOUTS — three vehicles, transparent background (WebP with alpha, VP8X):
   /assets/car-saloon.webp    2400×1248     three-quarter front, wheels level, lit from the left
   /assets/car-executive.webp 2400×1187
   /assets/car-people.webp    2400×1336
D. ABOUT STILL — the same car in motion on a wet city street at dusk, shallow depth of field:
   /assets/about-still-2560.webp  2560×1440      /assets/about-still-3840.webp  3840×2160
E. RIBBON TRANSITION — a short alpha-channel flourish between the fleet and the about section:
   /assets/ribbon-unfurl.webm  (VP9 + alpha, ~900 KB)   /assets/ribbon-unfurl.mov  (HEVC + alpha, Safari)
   Ship both and put the .webm first in the <video>; Safari takes the .mov.
F. FAVICON — inline SVG data URI, a five-point star in the accent colour:
   <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23c81f3a' d='M12 2l2.9 6.9 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 21.2l1.6-7L2 9.5l7.1-.6z'/%3E%3C/svg%3E" />

=====================================================================
4. THE SCROLL-SCRUBBED HERO (build this first)
=====================================================================
Markup: a tall container — className="relative h-[800vh] md:h-[900vh] bg-[#0d0606] select-none" — holding a position:sticky, h-screen stage with a <canvas> (or a single <img> whose src is swapped; canvas is steadier). Copy blocks sit absolutely over the stage.

Progress:
  const rect = container.getBoundingClientRect();
  const scrollable = rect.height - window.innerHeight;
  const p = scrollable > 0 ? clamp(-rect.top / scrollable, 0, 1) : 0;
  const frame = Math.min(TOTAL - 1, Math.round(p * (TOTAL - 1)));     // TOTAL = 650
Draw on requestAnimationFrame, and only when the frame index actually changed.

Variant and path:
  const variant = window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop";
  const src = (i) => `/frames/${sequence}/${variant}/f_${String(i + 1).padStart(3, "0")}.webp`;

Progressive preload — this is what makes it feel instant. Walk the sequence with decreasing strides [16, 8, 4, 2, 1], queueing each index once (a Set guards repeats). Every pass fills in the gaps of the last, so the scrub is coarse-but-complete within a second and sharpens as the rest arrive. Keep decoded frames in a fixed-length array; never hold two arrays of 650 Images.
Draw the nearest already-loaded frame when the exact one has not arrived, so the canvas never blanks.
Re-evaluate the variant on resize across the 767px boundary and start a fresh preload.

Copy over the stage, each fading in and out across its own slice of p — translate-y-2 and opacity-0 going to translate-y-0 and opacity-100, 900ms cubic-bezier(0.65,0,0.35,1):
  p 0.00–0.18   eyebrow "Chauffeur Travel Services" (font-cinzel, tracking-[0.2em], text-[#c81f3a], 11px caps)
                 headline "<Region>'s leading chauffeur company." (font-serif, clamp 2.5rem–4.5rem, leading-[1.1])
  p 0.22–0.40   "Tailored to you" / "Every journey shaped around your exact requirements."
  p 0.46–0.64   "Business · Airport · Events · Tours" / "Arrive on time and perfectly prepared."
  p 0.72–1.00   "Arrive in style." and the primary call to action
A scroll hint sits bottom-centre and fades out by p 0.06.

=====================================================================
5. PAGE ORDER AND SECTIONS
=====================================================================
NAV — fixed, pointer-events-none on the bar and auto on its children.
  className="bg-gradient-to-b from-black/85 via-black/40 to-transparent py-5 sm:py-6 border-b border-transparent"
  Logo, left, set as text rather than an image: two short words of the brand split by a ★ glyph — <WORD>★<WORD> —
  in font-cinzel font-bold tracking-[0.2em] text-lg sm:text-xl text-[#f5ede8],
  the star text-[#e62650] text-sm sm:text-base mx-1.5, scaling to 125% on group hover over 300ms;
  under it a 9–10px font-sans caps line (the locality). Links right; a filled accent button last.
  Over the hero the bar is transparent; past it, it gains bg-[#0d0606]/90 backdrop-blur and border-[#2d0b11].

BOOKING PANEL — directly under the hero, overlapping it by a negative margin so it reads as one surface.
  Two tabs: "Chauffeur Driven" and "Self-Drive Hire".
    active:   bg-[#290c13] border-[#c81f3a] text-white font-semibold
    inactive: bg-[#140608] border-[#2d0b11] text-[#a89994] hover:text-[#d6c7c2]
  Fields, in a row on md+ and stacked below: "Pickup Location / City", "Destination / Drop-off", date, time, passengers.
    bg-[#140608] border-[#25080e] text-[#a89994] hover:text-white hover:border-[#3a0d14], rounded-xl, h-14.
  Submit: full-width on mobile, bg-[#c81f3a] hover:bg-[#e63950], white, font-semibold, rounded-xl.

SERVICES — "Dedicated chauffeur service" as the eyebrow, then three cards: Airport Transfers, Event Travel, City Tours.
  Section wrapper: className="relative w-full py-24 sm:py-32 bg-[#0d0606]"
  Heading: className="text-4xl sm:text-5xl font-serif font-normal leading-[1.1] tracking-tight text-[#f5ede8] mb-6"

FLEET — three vehicles, each a full-width band: the cutout on one side, the text on the other, alternating.
  Eyebrow in font-cinzel caps: "MERCEDES E-CLASS" → use your own designations.
  Under it a one-line role: "Chauffeur driven saloon" / "Chauffeur driven group travel".
  Two paragraphs each, ~55 and ~50 words: the first on who the car is for, the second on the fitted extras.
  A feature list, 4 items, each with a small accent bullet:
    Black leather interior · Heated seats · On board Wi-Fi · iPhone charger      (saloon)
    Group Travel · Tailored drink options · Surround sound · Privacy glass        (people carrier)
  Pager dots between vehicles: className="w-1.5 h-1.5 rounded-full border border-[#f5ede8]/60 hover:border-[#e62650]"
  The cutout drifts up ~40px across its band as it scrolls past.

RIBBON — the alpha video, full-bleed, autoplay muted playsInline loop, mix-blend-screen over the ground.

ABOUT — className="relative h-[300vh] md:h-[350vh] bg-[#0d0606]" with a sticky stage, the about still behind at
  scale 1.08 easing to 1.0 across the section, a #0d0606/70 scrim over it.
  Heading: "<Region>'s finest luxury chauffeur company." then two paragraphs, ~55 and ~50 words — the first on fleet and
  ethos, the second on customer care and reach. Keep them to that length: the layout is built for it.

FOOTER — four columns on lg: brand block with the logo lockup and a line of legal identity, services, company links,
  contact. Phone and email as tel: and mailto:. A hairline border-[#2d0b11] above. Copyright and a terms link below.

=====================================================================
6. BEHAVIOUR
=====================================================================
- Lenis for smooth scroll; disable it under prefers-reduced-motion and jump the frame sequence to its nearest index
  without the rAF loop.
- Every section reveals with IntersectionObserver at threshold 0.25, adding opacity-100 translate-y-0 over
  opacity-0 translate-y-4, staggered 100ms per child.
- Links underline from the left on hover: a 1.5px currentColor bar, scaleX(0) to scaleX(1), origin-left, 350ms.
- Focus rings in the accent colour; never remove them.
- Below 768px: the nav collapses to the logo and a menu button, the fleet bands stack image-over-text, the hero copy
  moves to the lower third, and the mobile frame variant loads.

=====================================================================
7. ACCEPTANCE
=====================================================================
- Scrolling the hero scrubs the film smoothly both ways, with no blank canvas at any point, including on a cold load.
- The four copy beats appear and leave at the scroll positions listed, each reading cleanly over its frame.
- The page is one continuous near-black surface: no section seam is visible except the hairline rules.
- At 390px nothing overflows horizontally and the mobile frame set is the one being fetched.
- Lighthouse: the hero poster is the LCP element and loads eagerly; the frame sequence never blocks first paint.

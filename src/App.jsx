import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { track } from "./analytics.js";
import { getRef, refProps } from "./affiliate.js";

const VIDEO_ASSETS = "https://raw.githubusercontent.com/aayushsoam/motionsites.ai/main/assets/videos/";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:4242" : "");
const CHECKOUT_API_URL = import.meta.env.VITE_CHECKOUT_API_URL || `${API_BASE_URL}/api/create-checkout-session`;
// Walkthrough video shown under the three steps. TikTok's iframe embed is used
// rather than their embed.js so the page pulls no third-party script.
const TIKTOK_VIDEO_ID = "7670451978840968480";

// Deadline of the launch offer, shown as a live countdown in the bottom banner
// on /pricing. It MUST be a real, fixed date — an ISO string with an offset,
// e.g. "2026-08-31T23:59:59+02:00". Leave it null and the banner falls back to
// the remaining places, which are true whatever the day.
//
// Never make this relative to the visitor's first view: a timer that restarts
// on every reload is a lie the visitor catches the moment they come back, and
// it costs more than the urgency is worth.
const LAUNCH_OFFER_ENDS_AT = null;

// Where lifetime buyers reach a human. Shown on the success page only, to the
// plan that was actually sold direct support.
// WhatsApp in international format, no +, no spaces — wa.me rejects anything
// else. 07 66 87 39 15 (FR) becomes 33766873915.
const SUPPORT_WHATSAPP = "33766873915";
const SUPPORT_HANDLE = "WhatsApp";
// Prefilled so the first message already identifies the buyer's plan.
const supportUrl = () =>
  `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent(
    t("Hi! I have Movento lifetime access and I have a question.", "Salut ! J'ai l'accès à vie Movento et j'ai une question."),
  )}`;
// Free bonus ebook handed to buyers on the post-payment page.
const EBOOK_URL = "https://drive.google.com/file/d/1Rudbr82oNNV1TJ8okGjozPybSxIvAmPs/view?usp=sharing";
// Customer rating, kept in one place: it is shown on the page AND declared as
// AggregateRating in index.html, and Google drops the markup if the two disagree.
// Support address, shown wherever a visitor is told to write to us.
const SUPPORT_EMAIL = "movento.dev@gmail.com";
const RATING_SCORE = "4.8";
const RATING_COUNT = 120;

// French is the default for everyone, English an explicit opt-in via ?lang=en
// (remembered afterwards). Browser detection used to decide this, but crawlers
// browse in en-US: Google was reading an English page that declared lang="fr",
// which no amount of French keywords could rank.
const lang = (() => {
  try {
    const requested = new URLSearchParams(window.location.search).get("lang");
    if (requested === "en" || requested === "fr") {
      window.localStorage.setItem("movento_lang", requested);
      return requested;
    }
    const stored = window.localStorage.getItem("movento_lang");
    if (stored === "en" || stored === "fr") return stored;
    // Nobody chose: follow the browser. Defaulting to French meant every
    // English-speaking visitor landed on a page they could not read, with the
    // only way out a link buried in the footer.
    const preferred = window.navigator.languages?.[0] || window.navigator.language || "";
    if (preferred && !preferred.toLowerCase().startsWith("fr")) return "en";
  } catch {
    // No storage or no navigator — fall through to the default.
  }
  return "fr";
})();
// Keep the declared language in step with what is actually rendered.
try { document.documentElement.lang = lang; } catch { /* no DOM (SSR/tests) */ }
function t(en, fr) { return lang === "fr" ? fr : en; }
// API errors ship in both languages; show the visitor theirs.
function apiError(data, fallback) {
  const message = lang === "fr" ? data?.error : data?.errorEn || data?.error;
  return message || fallback;
}

// Language switch. Lives in the header on every page: buried in the footer it
// was unreachable for the visitor who most needs it — the one who cannot read
// the page. Full reload on purpose, `lang` is resolved once at module load.
function LangSwitch({ className = "" }) {
  const other = lang === "fr" ? "en" : "fr";
  return (
    <a
      href={`?lang=${other}`}
      hrefLang={other}
      aria-label={lang === "fr" ? "Switch to English" : "Passer en français"}
      className={`rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/45 transition hover:border-white/25 hover:text-[#EDE9E0] ${className}`}
    >
      {other}
    </a>
  );
}

const makePreview = (name, ext = "mp4") => `${VIDEO_ASSETS}${name}_0.${ext}`;

const prompts = [
  // Front of the gallery, hand-picked: the newest work first, then motion
  // previews, one per category, so the first screen shows range rather than
  // repetition.
  { title: "Cyber Ronin", category: "Landing Page", type: "Hero", file: "Cyber_Ronin_Spotlight_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/designs/cyber_ronin_ai_robotics.mp4", tags: ["Cyberpunk", "Spotlight", "Video"], gradient: "from-amber-200 via-orange-700 to-[#1a0e06]" },
  { title: "SpaceEdu Planet Switcher", category: "Landing Page", type: "Hero", file: "SpaceEdu_Planet_Switcher_Hero.md", preview: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260827_214822_d89eea51-6973-4221-bfdb-85e06b20c25e.png&w=1280&q=85", tags: ["Space", "Interactive", "Video"], gradient: "from-cyan-200 via-blue-800 to-[#04101f]" },
  { title: "Ducati Superleggera V4", category: "Landing Page", type: "Landing", file: "Ducati_Superleggera_Scroll_Scrub.md", preview: "https://res.cloudinary.com/dk2kai0as/video/upload/vc_h264:baseline:3.1,w_960,q_auto,ac_none/v1787947016/0828_zq63qm.mp4", tags: ["Scroll Scrub", "Cinematic", "Video"], gradient: "from-red-300 via-red-800 to-black" },
  { title: "Fastshot Composer", category: "SaaS", type: "Hero", file: "Fastshot_Composer_Hero.md", preview: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260826_215009_c2ee8663-5c02-4c13-ad50-e578b76c7fb6.png&w=1920&q=85", tags: ["Composer", "Glassmorphism", "Video"], gradient: "from-orange-200 via-slate-600 to-[#0a0d12]" },
  { title: "Apogee Data Hero", category: "SaaS", type: "Hero", file: "Apogee_Data_Hero.md", demo: "https://celestial-apex.lovable.app/", preview: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260815_191439_307f1c76-0696-4003-9186-fdd50bb30540.png&w=1280&q=85", tags: ["Data", "Glassmorphism", "Video"], gradient: "from-indigo-200 via-indigo-800 to-[#080A19]" },
  { title: "Mainframe A.R.I.A. Dark", category: "Agency", type: "Hero", file: "Mainframe_ARIA_Hero_Dark.md", demo: "https://moventoadz.vercel.app/", preview: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd2ol7oe51mr4n9.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2F44eba8ce-fc5f-4fb4-bc19-de013c1d7404.png&w=1920&q=85", tags: ["Agency", "Scrub Video", "Typewriter"], gradient: "from-neutral-300 via-neutral-700 to-black" },
  { title: "SkyElite Private Jet", category: "Landing Page", type: "Hero", file: "SkyElite_Private_Jet_Hero.md", demo: "https://sky-zenith-hero.lovable.app", preview: "https://motionsites.ai/assets/hero-skyelite-preview-DHaZIgUv.gif", tags: ["Aviation", "Luxury", "Video"], gradient: "from-slate-100 via-slate-400 to-[#202A36]" },
  { title: "Angelo Élagage Nancy", category: "Landing Page", type: "Landing", file: "Angelo_Elagage_Nancy_Landing.md", demo: "https://angelo-self.vercel.app/", preview: "https://res.cloudinary.com/du0hbrmvw/image/upload/v1787706054/Capture_d_e%CC%81cran_2026-08-26_a%CC%80_02.59.26_q9ouvp.png", tags: ["Local Business", "Français", "SEO"], gradient: "from-lime-200 via-emerald-800 to-[#12241a]" },
  { title: "Cyber Spotlight Reveal", category: "Landing Page", type: "Hero", file: "Cyber_Spotlight_Reveal_Hero.md", demo: "https://synth-zenith-38.lovable.app/", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(31).webp", tags: ["Cursor Reveal", "Canvas Mask", "Cyberpunk"], gradient: "from-rose-300 via-red-700 to-[#0a0505]" },
  { title: "Vectrus Scroll Video", category: "Landing Page", type: "Landing", file: "Vectrus_Scroll_Tied_Video.md", demo: "https://cine-scrub-react.lovable.app/", preview: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260823_184819_56e1b3c6-fb91-426e-a22f-ba9375448e1f.png&w=1280&q=85", tags: ["Scroll Scrub", "WebCodecs", "Cinematic"], gradient: "from-slate-100 via-slate-400 to-[#1D3045]" },
  { title: "Bali Travel App", category: "Component", type: "Component", file: "Bali_Travel_App_Mockup.md", demo: "https://travel-glow-show.lovable.app/", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/mobile%20apps/balitravel.mp4", tags: ["Mobile App", "Liquid Glass", "Travel"], gradient: "from-orange-200 via-neutral-500 to-[#0a0a0c]" },
  { title: "Love Bag Hero", category: "Landing Page", type: "Landing", file: "Love_Bag_Hero.md", demo: "https://orbit-craft-showcase.lovable.app/", preview: "https://admin.lafys.com/api/media/file/bags_EV1r0FBY.mp4", tags: ["E-commerce", "Scroll", "Video"], gradient: "from-amber-100 via-stone-300 to-neutral-900" },
  { title: "Soda 3D Flavor", category: "E-commerce", type: "Hero", file: "Soda_3D_Flavor_Hero.md", demo: "https://fizzy-display-magic.lovable.app/soda.html", preview: "https://storage.getlayers.ai/templates/soda-preview.mp4", tags: ["Three.js", "Product 3D", "Drink"], gradient: "from-lime-200 via-emerald-500 to-[#062012]" },
  { title: "Aurevon Luxury Brand", category: "Landing Page", type: "Hero", file: "Aurevon_Luxury_Brand_Hero.md", demo: "https://aurevon-entrance.lovable.app/", preview: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260820_090556_3e2783f6-b579-4d92-9a0d-eb720a6f90b9.png&w=1920&q=85", tags: ["Video", "Overlay Menu", "Serif"], gradient: "from-stone-200 via-neutral-600 to-black" },
  { title: "Targo Platform", category: "SaaS", type: "Landing", file: "Targo_Platform_Hero_About.md", demo: "https://targo-hero-about.lovable.app/", preview: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260823_072718_54380a25-d4e6-4eec-bc9d-198a0159595d.png&w=1920&q=85", tags: ["Chamfered", "Video", "Cyan"], gradient: "from-cyan-200 via-cyan-500 to-[#1a1c1e]" },
  { title: "JWT 3D Card Carousel", category: "Component", type: "Component", file: "JWT_3D_Card_Carousel.md", demo: "https://spin-card.lovable.app/", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/animated%20(8).webp", tags: ["3D", "Carousel", "Cards"], gradient: "from-sky-200 via-fuchsia-600 to-black" },
  // Same Cloudinary account and the same kind of source as Vanta below — a
  // macOS screen recording — so it ships with the transformations already on
  // rather than waiting for the card to go blank on a phone first.
  { title: "Fiamma Pizzeria", category: "Landing Page", type: "Landing", file: "Fiamma_Pizzeria_Scrollytelling_3D.md", demo: "https://pizza-jade-ten.vercel.app/", preview: "https://res.cloudinary.com/du0hbrmvw/video/upload/vc_h264:baseline:3.1,w_960,q_auto,ac_none/v1787413782/Enregistrement_de_l_e%CC%81cran_2026-08-22_a%CC%80_17.48.26_online-video-cutter.com_spwzdm.mp4", tags: ["Three.js", "Scrollytelling", "Restaurant"], gradient: "from-amber-100 via-red-600 to-[#1C1A17]" },
  // The only preview in the catalogue that carries Cloudinary transformations,
  // and they are the point: the untransformed clip played on every desktop and
  // on no phone. vc_h264:baseline:3.1 forces the one H.264 profile every phone
  // decodes inline, w_960 and q_auto cut the weight for mobile data, ac_none
  // drops the audio track a preview never needs. If this card ever goes blank
  // again, drop a baseline-encoded file in public/previews/ and point here at
  // /previews/vanta.mp4 instead — same effect, served from our own origin.
  { title: "Vanta Haute Horlogerie", category: "E-commerce", type: "Landing", file: "Vanta_Haute_Horlogerie_Scroll.md", demo: "https://vanta-scroll-art.lovable.app/", preview: "https://res.cloudinary.com/du0hbrmvw/video/upload/vc_h264:baseline:3.1,w_960,q_auto,ac_none/v1787221958/venta_rlsafx.mp4", tags: ["Three.js", "Scroll Scrub", "Luxury"], gradient: "from-white via-neutral-500 to-black" },
  { title: "Orbit Secure System", category: "Landing Page", type: "Hero", file: "Orbit_Secure_System_Poster.md", demo: "https://petal-wipe-effect.lovable.app/", preview: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260813_012454_d8334c3b-0475-40ff-a5e6-483fe41af52d.png&w=1280&q=85", tags: ["Poster", "Canvas Mask", "Pixel Art"], gradient: "from-pink-200 via-fuchsia-500 to-[#161616]" },
  { title: "Baseline Tennis Club", category: "Landing Page", type: "Landing", file: "Baseline_Tennis_Club.md", demo: "https://court-craft-html.lovable.app", preview: "https://storage.getlayers.ai/templates/baseline-preview.mp4", tags: ["Sport", "Club", "Editorial"], gradient: "from-emerald-200 via-teal-600 to-[#04120e]" },
  { title: "Beauty Categories Grid", category: "E-commerce", type: "Component", file: "Beauty_Categories_Grid.md", demo: "https://radiant-reveal-blocks.lovable.app/", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/animated%20(67).webp", tags: ["Beauty", "Video", "Scroll Reveal"], gradient: "from-rose-100 via-neutral-400 to-[#111]" },
  { title: "Photographer Portfolio", category: "Portfolio", type: "Landing", file: "Valmax_Hero.md", demo: "https://valmax-bloom.lovable.app", preview: "https://admin.lafys.com/api/media/file/valmax_NCXFcrZo.mp4", tags: ["Photography", "Stars", "Video"], gradient: "from-lime-300 via-neutral-700 to-black" },
  { title: "Nexum AI Ops", category: "AI / SaaS", type: "Hero", file: "Nexum_AI_Ops_Hero.md", demo: "https://nexum-cinematic-hub.lovable.app", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/a/Agent%20Grove.mp4", tags: ["AI Agents", "Glass", "Video"], gradient: "from-neutral-200 via-neutral-600 to-[#010101]" },
  { title: "Fearless Studio Hero", category: "Agency", type: "Hero", file: "Fearless_Studio_Hero.md", demo: "https://elevate-reality.lovable.app/", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(71).webp", tags: ["Studio", "Bold", "Video"], gradient: "from-violet-400 via-purple-700 to-black" },
  { title: "Gulfselite Private Jet", category: "Landing Page", type: "Hero", file: "Gulfselite_Jet_Hero.md", demo: "https://jetcrest-hero-showcase.lovable.app/", preview: "https://cdn.sceneai.art/landing-pages/42ce5ea2-d807-4a5f-90a9-0f3082988c1b.mov", tags: ["Luxury", "Aviation", "Serif"], gradient: "from-sky-100 via-slate-400 to-slate-900" },
  { title: "Velorah", category: "Agency", type: "Landing", file: "Velorah.md", demo: "https://dream-rise-studio.lovable.app/", preview: "https://motionsites.ai/assets/hero-velorah-preview-CJNTtbpd.gif", tags: ["Agency", "Premium", "Motion"], gradient: "from-pink-300 via-purple-500 to-black" },
  { title: "Mostar Cinematic Scroll", category: "Landing Page", type: "Landing", file: "Mostar_Cinematic_Scroll.md", demo: "https://river-scroll-dream.lovable.app", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/a/CleanShot%202026-07-31%20at%2007.43.14.mp4", tags: ["Cinematic", "Scroll", "Parallax"], gradient: "from-sky-200 via-cyan-600 to-[#0b1110]" },
  { title: "Hunsy Car Rental", category: "Landing Page", type: "Hero", file: "Hunsy_Car_Rental_Hero.md", demo: "https://grand-ride-intro.lovable.app", preview: "https://cdn.sceneai.art/landing-pages/abaa1a2b-c06b-49d5-a2c9-986674b6cdb7.mp4", tags: ["Automotive", "Video", "Glass"], gradient: "from-slate-200 via-slate-600 to-[#04060b]" },
  { title: "Picway Gallery", category: "Landing Page", type: "Hero", file: "Picway_Gallery_Hero.md", demo: "https://apricot-memory-glow.lovable.app", preview: "https://cdn.5sdesign.art/projects/picway.mp4", tags: ["WebGL", "Editorial", "Gallery"], gradient: "from-orange-100 via-amber-200 to-neutral-800" },
  { title: "Lumora Studio", category: "Agency", type: "Landing", file: "Lumora_Studio_Landing.md", demo: "https://lumora-render.lovable.app/lumora.html", preview: "https://storage.getlayers.ai/templates/lumora-preview.mp4", tags: ["Studio", "GSAP", "Editorial"], gradient: "from-amber-100 via-neutral-500 to-[#0b0b0c]" },
  { title: "NeuralKinetics Hero", category: "Fintech", type: "Hero", file: "NeuralKinetics_Hero.md", demo: "https://nexus-canvas-06.lovable.app/", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/prompts%20(i've%20added%20them%20to%20the%20motionsites)/132Area.mp4", tags: ["Fintech", "Video", "Minimal"], gradient: "from-zinc-200 via-slate-400 to-black" },
  { title: "Vesper AI Infrastructure", category: "AI / SaaS", type: "Hero", file: "Vesper_AI_Operational_Infrastructure.md", demo: "https://vesper-one-page-shine.lovable.app/vesper.html", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/a/darkgradientwhitelineArea.mp4", tags: ["Liquid Metal", "Video", "Dark"], gradient: "from-slate-100 via-neutral-500 to-black" },
  { title: "CozyPaws Pet Store", category: "E-commerce", type: "Hero", file: "CozyPaws_Pet_Store_Hero.md", demo: "https://purrfect-pixel-lab.lovable.app/", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/prompts%20(i've%20added%20them%20to%20the%20motionsites)/petsArea.mp4", tags: ["Pets", "Serif", "Playful"], gradient: "from-lime-100 via-emerald-600 to-[#0d2410]" },
  { title: "Laocoön Bronze Scroll", category: "Portfolio", type: "Landing", file: "Laocoon_Bronze_Scroll.md", demo: "https://bronze-time-scroll.lovable.app/", preview: "https://storage.getlayers.ai/templates/laocoon-preview.mp4", tags: ["Three.js", "3D", "Art"], gradient: "from-amber-200 via-amber-700 to-[#0a0806]" },
  { title: "Dental Health Clinic", category: "Landing Page", type: "Landing", file: "Dental_Health_Clinic_Landing.md", demo: "https://luminous-clinic-render.lovable.app/", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(12).webp", tags: ["Health", "Mosaic", "Editorial"], gradient: "from-stone-100 via-stone-400 to-stone-800" },
  { title: "Lithos Geology Reveal", category: "Landing Page", type: "Hero", file: "Lithos_Geology_Reveal_Hero.md", demo: "https://lithos-cursor-reveal.lovable.app/", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(7).webp", tags: ["Spotlight", "Serif", "Dark"], gradient: "from-orange-200 via-stone-600 to-[#0c0a09]" },
  { title: "Jack — 3D Creator", category: "Portfolio", type: "Landing", file: "Jack_3D_Creator.md", demo: "https://studio-jack-reel.lovable.app", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/uploaded/jackportofplio.mp4", tags: ["3D", "Portfolio", "Video"], gradient: "from-fuchsia-400 via-purple-600 to-[#0C0C0C]" },
  { title: "Mapple Headphones", category: "Landing Page", type: "Landing", file: "Mapple_Headphone_Store.md", demo: "https://glide-panel-sound.lovable.app", preview: "https://cdn.5sdesign.art/projects/mapple.mp4", tags: ["E-commerce", "Product", "Glass"], gradient: "from-amber-200 via-stone-500 to-[#0e0d0b]" },
  { title: "Coffee Profile Screen", category: "Component", type: "Component", file: "Coffee_Profile_Screen.md", demo: "https://warm-glass-profile.lovable.app/", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/uploaded/coffeorangeArea.mp4", tags: ["Mobile App", "Liquid Glass", "Warm"], gradient: "from-amber-200 via-orange-700 to-[#180a06]" },
  { title: "Vanguard Agency Hero", category: "Agency", type: "Hero", file: "Vanguard_Agency_Video_Hero.md", demo: "https://digital-collective-showcase.lovable.app/", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(10).webp", tags: ["Agency", "Video", "Bold"], gradient: "from-zinc-200 via-zinc-600 to-black" },
  { title: "Serene Wellness", category: "Landing Page", type: "Landing", file: "Serene_Wellness_Landing.md", demo: "https://radiant-serene.lovable.app/", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/uploaded/planetscrollArea.mp4", tags: ["Wellness", "Parallax", "Glass"], gradient: "from-sky-200 via-cyan-700 to-[#010A17]" },
  { title: "Zpeed Motorsport", category: "Landing Page", type: "Hero", file: "Zpeed_Motorsport_Hero.md", demo: "https://zpeed-hero-pulse.lovable.app/", preview: "https://cdn.5sdesign.art/projects/zpeed.mp4", tags: ["Sport", "Editorial", "Video"], gradient: "from-red-300 via-red-700 to-[#181818]" },
  { title: "Graven Drafting Works", category: "Agency", type: "Landing", file: "Graven_Drafting_Works_Scroll.md", preview: "https://www.vividsites.app/media/graven.mp4", tags: ["Scroll Scrub", "Blueprint", "Sticky"], gradient: "from-slate-200 via-slate-600 to-[#0c0f13]" },
  { title: "Meridian Revenue", category: "SaaS", type: "Hero", file: "Meridian_Revenue_Intelligence.md", preview: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260816_024306_e944b7e6-5f27-4960-8e7c-be1edf8ee0db.png&w=1280&q=85", tags: ["Video", "Editorial", "Sharp"], gradient: "from-orange-200 via-blue-700 to-[#0a0a0a]" },
  { title: "Vantage Dashboards", category: "SaaS", type: "Hero", file: "Vantage_Dashboard_Signal_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/a/dataflower.mp4", tags: ["Glass", "Video", "Dark"], gradient: "from-neutral-200 via-neutral-600 to-black" },
  { title: "Signal Falcon Login", category: "SaaS", type: "Component", file: "Signal_Falcon_Login.md", preview: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd2ol7oe51mr4n9.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Ff97e887b-a455-42d1-950c-98cdd971645e.png&w=1280&q=85", tags: ["Login", "Video", "Split"], gradient: "from-amber-100 via-stone-500 to-[#2c3343]" },
  { title: "Evolve AI Platform", category: "AI / SaaS", type: "Hero", file: "Evolve_AI_Platform_Hero.md", preview: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260812_054351_d1d948b3-b00a-4bf2-b434-55f373010de8.png&w=1280&q=85", tags: ["Dot Matrix", "Video", "Stats"], gradient: "from-sky-100 via-slate-600 to-[#050505]" },
  { title: "Echoid Voice ID", category: "SaaS", type: "Hero", file: "Echoid_Voice_Identity.md", preview: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260807_021301_8daf3f52-acef-462d-b14c-0aaca9747f87.png&w=1280&q=85", tags: ["Video", "Waitlist", "Mono"], gradient: "from-white via-neutral-500 to-black" },
  { title: "Kollektiva Studio", category: "Agency", type: "Landing", file: "Kollektiva_Studio_Team.md", preview: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260807_033531_2c5d9aeb-d97f-4a16-bef0-2bd850206a50.png&w=1280&q=85", tags: ["Team", "Portraits", "Editorial"], gradient: "from-neutral-100 via-neutral-400 to-[#0b0b0c]" },
  { title: "Beyond Stacked Type", category: "Landing Page", type: "Hero", file: "Beyond_Hero_Stacked_Type.md", preview: "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260807_010505_d6d4aff0-9f6c-46ca-a1c7-c487a0d4e86f.png&w=1280&q=85", tags: ["Typography", "Scroll", "Marquee"], gradient: "from-lime-200 via-orange-500 to-[#EC612C]" },
  { title: "Basilico Restaurant", category: "Landing Page", type: "Landing", file: "Basilico_Luxury_Restaurant.md", preview: "https://strvid.nyc3.cdn.digitaloceanspaces.com/motionitems/1781521132099-basilico_restaurant.webp", tags: ["Restaurant", "Gold", "GSAP"], gradient: "from-amber-200 via-orange-700 to-[#070707]" },
  { title: "F1 Racing Hub", category: "Landing Page", type: "Hero", file: "F1_Racing_Hub_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/a/F1%20Racing%20HubArea.mp4", tags: ["Sport", "Mobile App", "Count-up"], gradient: "from-yellow-300 via-red-700 to-[#0a0e1c]" },
  { title: "Flowstate Waitlist", category: "SaaS", type: "Hero", file: "Flowstate_Fluid_Waitlist.md", preview: "https://storage.getlayers.ai/templates/flowstate-4c494408e1-preview.mp4", tags: ["WebGL", "Fluid", "Waitlist"], gradient: "from-cyan-300 via-violet-500 to-[#04050c]" },
  { title: "Aurora Weather Dashboard", category: "SaaS", type: "Landing", file: "Aurora_Weather_Dashboard.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/a/wetherappArea.mp4", tags: ["Dashboard", "Liquid Glass", "Weather"], gradient: "from-teal-200 via-slate-600 to-[#04121b]" },
  // Newest first below the hand-picked lead above.
  { title: "Orbis NFT", category: "Web3", type: "Landing", file: "Orbis_NFT_Space_Landing.md", preview: "https://motionsites.ai/assets/hero-orbis-nft-preview-C3wvh77a.gif", tags: ["NFT", "Space", "Liquid Glass"], gradient: "from-lime-300 via-indigo-700 to-[#010828]" },
  { title: "S.P.D Red Manifesto", category: "Landing Page", type: "Component", file: "SPD_Red_Manifesto.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/animated%20(48).webp", tags: ["Editorial", "Bold", "Video"], gradient: "from-red-300 via-red-600 to-[#3a0000]" },
  { title: "Max Reed Bento Features", category: "Portfolio", type: "Component", file: "Max_Reed_Bento_Features.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/animated%20(6).webp", tags: ["Bento", "Marquee", "Liquid Glass"], gradient: "from-teal-200 via-neutral-600 to-[#0a0a0a]" },
  { title: "iOS Dual Device Showcase", category: "Component", type: "Component", file: "iOS_Dual_Device_Showcase.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/a/perplxmobile.mp4", tags: ["Mobile App", "Paywall", "Video"], gradient: "from-sky-100 via-slate-400 to-[#14151d]" },
  { title: "Loopstack", category: "SaaS", type: "Landing", file: "Loopstack_Motion_Landing.md", preview: "https://storage.getlayers.ai/templates/loopstack-preview.mp4", tags: ["Video", "Motion", "Dark"], gradient: "from-rose-200 via-neutral-600 to-[#080808]" },
  { title: "Convix PR Software", category: "SaaS", type: "Hero", file: "Convix_PR_Software_Hero.md", preview: "https://motionsites.ai/assets/convix-software-hero-B6-tdnN6.gif", tags: ["SaaS", "Dashboard", "Video"], gradient: "from-orange-200 via-neutral-400 to-[#0b0f1a]" },
  { title: "Cosmic Portfolio", category: "Portfolio", type: "Landing", file: "Michael_Smith_Portfolio_Landing.md", preview: "https://motionsites.ai/assets/hero-portfolio-cosmic-preview-BpvWJ3Nc.gif", tags: ["Portfolio", "GSAP", "Parallax"], gradient: "from-sky-200 via-slate-600 to-[#0a0a0a]" },
  { title: "Atelier Design Agency", category: "Agency", type: "Hero", file: "Atelier_Design_Agency_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(67).webp", tags: ["Agency", "Serif", "Video"], gradient: "from-neutral-200 via-neutral-500 to-black" },
  { title: "Sentinel AI 3D Hero", category: "SaaS", type: "Hero", file: "Sentinel_AI_Spline_Hero.md", preview: "https://motionsites.ai/assets/hero-sentinel-ai-preview-BXas7Q1_.gif", tags: ["Security", "Spline 3D", "Dark"], gradient: "from-lime-300 via-neutral-700 to-[#141414]" },
  { title: "TinyTrails 404 Screen", category: "Component", type: "Component", file: "TinyTrails_404_Screen.md", preview: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260714_015111_b6301eeb-0a2c-4b2d-b9d2-238eaa3c099e.mp4", tags: ["404", "Kids", "Playful"], gradient: "from-orange-200 via-orange-500 to-[#7a2f0b]" },
  { title: "Alwayzz Creative", category: "Agency", type: "Hero", file: "Alwayzz_Creative_Agency_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/prompts%20(i've%20added%20them%20to%20the%20motionsites)/agencygradientArea.mp4", tags: ["Agency", "Serif", "Minimal"], gradient: "from-white via-neutral-300 to-neutral-700" },
  { title: "Password Vault Hero", category: "SaaS", type: "Hero", file: "Password_Manager_Video_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(68).webp", tags: ["Security", "Video", "Purple"], gradient: "from-violet-200 via-violet-600 to-[#192837]" },
  { title: "VortxLab Immersive", category: "Agency", type: "Landing", file: "VortxLab_Immersive_Landing.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/a/buttterflies%20purpleArea.mp4", tags: ["Studio", "Video", "Glass"], gradient: "from-violet-200 via-purple-700 to-[#0a0510]" },
  { title: "Halo Nutrition Hero", category: "Landing Page", type: "Hero", file: "Halo_Nutrition_Health_Hero.md", preview: "https://cdn.jiro.build/Halo/Video/Nutrition-Health%20Hero%2001%20Halo.mp4", tags: ["Health", "Marquee", "Green"], gradient: "from-lime-100 via-emerald-800 to-[#04231f]" },
  { title: "Strip Juice Header", category: "E-commerce", type: "Hero", file: "Strip_Juice_Header.md", preview: "https://cdn.jiro.build/videos/header/Juice%20Video%20Header.mp4", tags: ["E-commerce", "Video", "Dark"], gradient: "from-orange-200 via-orange-700 to-black" },
  { title: "Kelo AI Support Hero", category: "AI / SaaS", type: "Hero", file: "Kelo_AI_Support_Hero.md", preview: "https://cdn.jiro.build/Kelo/video/AI%20Customer%20Support%20Hero%20Kelo.mp4", tags: ["AI", "Glass", "Dark"], gradient: "from-slate-200 via-slate-600 to-black" },
  { title: "LGPSM Fashion Reveal", category: "Landing Page", type: "Landing", file: "LGPSM_Future_Forward_Fashion.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/a/synthArea.mp4", tags: ["Fashion", "Minimal", "Interactive"], gradient: "from-white via-slate-300 to-slate-600" },
  { title: "Wallet Finance Header", category: "Web3", type: "Hero", file: "Wallet_Finance_Scroll_Header.md", preview: "https://cdn.jiro.build/videos/header/Finance%20Header%20-%20Wallet.mp4", tags: ["Web3", "Scroll Video", "Space"], gradient: "from-indigo-200 via-indigo-800 to-[#05060a]" },
  { title: "Verto Agency Scroll", category: "Agency", type: "Landing", file: "Verto_Scroll_Video_Landing.md", preview: "https://cdn.sceneai.art/landing-pages/f3f4ce4a-8688-4dfc-a147-1ea906ec5a59.mp4", tags: ["Agency", "Scroll Video", "Dark"], gradient: "from-orange-300 via-orange-700 to-[#150a08]" },
  { title: "Dreamy Journal Hero", category: "AI / SaaS", type: "Hero", file: "Dreamy_Journal_Hero.md", preview: "https://cdn.5sdesign.art/projects/dreamy.mp4", tags: ["Wellness", "Glass", "Soft"], gradient: "from-sky-100 via-indigo-200 to-slate-400" },
  { title: "Shelter Secure Files", category: "SaaS", type: "Hero", file: "Shelter_Secure_File_Hero.md", preview: "https://cdn.5sdesign.art/projects/shelter.mp4", tags: ["Typography", "Dark", "GSAP"], gradient: "from-neutral-200 via-neutral-600 to-black" },
  { title: "Bingchiling AI Images", category: "AI / SaaS", type: "Hero", file: "Bingchiling_AI_Hero.md", preview: "https://cdn.5sdesign.art/projects/bingchiling.mp4", tags: ["AI", "Cinematic", "Glass"], gradient: "from-amber-200 via-amber-700 to-[#14100a]" },
  { title: "OMMOD RWA Oracle", category: "Web3", type: "Landing", file: "Ommod_RWA_Oracle.md", preview: "https://cdn.5sdesign.art/projects/ommod.mp4", tags: ["Web3", "3D", "Hairline"], gradient: "from-lime-200 via-slate-600 to-[#08090a]" },
  { title: "Velora Luxury Cars", category: "Landing Page", type: "Hero", file: "Velora_Luxury_Car_Hero.md", preview: "https://cdn.sceneai.art/landing-pages/55730e98-e8a9-438f-b1d9-92c7a3c3440e.mp4", tags: ["Automotive", "Luxury", "Video"], gradient: "from-neutral-300 via-neutral-600 to-[#0a0a0b]" },
  { title: "Seathe Dive Hero", category: "Landing Page", type: "Hero", file: "Seathe_Underwater_Hero.md", preview: "https://cdn.5sdesign.art/projects/seathe.mp4", tags: ["Underwater", "Serif", "Wearable"], gradient: "from-cyan-200 via-teal-800 to-[#050607]" },
  { title: "CloudB Sneakers", category: "Landing Page", type: "Hero", file: "CloudB_Sneaker_Hero.md", preview: "https://cdn.5sdesign.art/projects/cloudb.mp4", tags: ["Sportswear", "GSAP", "Editorial"], gradient: "from-white via-emerald-300 to-[#0a0a0a]" },
  { title: "Labs ISP Hero", category: "Hero Section", type: "Hero", file: "Labs_ISP_Hero.md", preview: "https://cdn.5sdesign.art/projects/labs.mp4", tags: ["Telecom", "Neon", "Dark"], gradient: "from-lime-200 via-lime-600 to-black" },
  { title: "Muse Art Gallery", category: "Landing Page", type: "Landing", file: "Muse_Editorial_Gallery.md", preview: "https://cdn.5sdesign.art/projects/muse.mp4", tags: ["Editorial", "Museum", "Archive"], gradient: "from-orange-100 via-stone-400 to-[#161413]" },
  { title: "Portiva Agency", category: "Agency", type: "Hero", file: "Portiva_Creative_Agency_Hero.md", preview: "https://cdn.sceneai.art/landing-pages/e2747f38-d1b5-4ec1-92da-74efd97dec38.mp4", tags: ["Agency", "Minimal", "Video"], gradient: "from-orange-200 via-orange-700 to-black" },
  { title: "NovaAI Scroll Video", category: "AI / SaaS", type: "Landing", file: "NovaAI_Scroll_Video_Landing.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/a/preview.mp4", tags: ["AI", "Scroll Video", "Glass"], gradient: "from-amber-200 via-slate-500 to-[#0a0a0a]" },
  { title: "Skybridge 404 Screen", category: "Component", type: "Component", file: "Skybridge_404_Screen.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/a/Skybridge%20404Area.mp4", tags: ["404", "Video", "Mono"], gradient: "from-slate-200 via-slate-600 to-black" },
  { title: "1Brain Studio", category: "Agency", type: "Hero", file: "1Brain_Cinematic_Video_Hero.md", preview: "https://cdn.5sdesign.art/projects/1brain.mp4", tags: ["Cinematic", "Scroll Video", "Glass"], gradient: "from-neutral-300 via-neutral-600 to-black" },
  { title: "Moss Sea Moss Store", category: "Landing Page", type: "Landing", file: "Moss_Botanical_Commerce.md", preview: "https://cdn.5sdesign.art/projects/moss.mp4", tags: ["E-commerce", "Dark", "Wellness"], gradient: "from-stone-300 via-emerald-900 to-[#060606]" },
  { title: "Paradiso Newsletter CTA", category: "Component", type: "Component", file: "Paradiso_Newsletter_CTA.md", preview: "https://cdn.sceneai.art/landing-pages/33ca7181-9976-4d1d-94b1-41b9c5b5e488.mov", tags: ["CTA", "Real Estate", "Email"], gradient: "from-emerald-200 via-teal-600 to-slate-900" },
  { title: "Amée Paris Couture", category: "Landing Page", type: "Landing", file: "Amee_Paris_Couture.md", preview: "https://cdn.5sdesign.art/projects/amee-paris.mp4", tags: ["Fashion", "Editorial", "Marquee"], gradient: "from-stone-200 via-neutral-400 to-[#0E0E0E]" },
  { title: "Porgas Step Into Wonder", category: "Landing Page", type: "Landing", file: "Porgas_Step_Into_Wonder.md", preview: "https://cdn.5sdesign.art/projects/porgas.mp4", tags: ["Parallax", "Scroll", "Serif"], gradient: "from-amber-200 via-orange-800 to-[#0a0608]" },
  { title: "Marcus Bennet Portfolio", category: "Portfolio", type: "Hero", file: "Marcus_Bennet_Portfolio.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/a/showcaseareaArea.mp4", tags: ["Portfolio", "Editorial", "Marquee"], gradient: "from-stone-200 via-neutral-500 to-black" },
  { title: "LaunchPad Blog", category: "Component", type: "Component", file: "Launchpad_Insights_Blog.md", preview: "https://cdn.sceneai.art/landing-pages/1947878a-fa95-4ac2-9369-84e343feba2e.mov", tags: ["Blog", "SaaS", "Cards"], gradient: "from-blue-200 via-blue-500 to-slate-900" },
  { title: "Synergeus Fintech", category: "Fintech", type: "Landing", file: "Synergeus_Fintech_Landing.md", preview: "https://admin.lafys.com/api/media/file/synergeus_JaaqgDoA.mp4", tags: ["Fintech", "AI", "Serif"], gradient: "from-lime-200 via-emerald-600 to-black" },
  { title: "Pelmatech Health", category: "Landing Page", type: "Landing", file: "Pelmatech_Health_Landing.md", preview: "https://admin.lafys.com/api/media/file/Pelmatech1.mp4", tags: ["Health", "Editorial", "Carousel"], gradient: "from-stone-200 via-neutral-400 to-neutral-900" },
  { title: "Azaka Creative Director", category: "Portfolio", type: "Hero", file: "Azaka_Creative_Director.md", preview: "https://cdn.5sdesign.art/projects/azaka.mp4", tags: ["Cinematic", "Cursor", "Dark"], gradient: "from-neutral-200 via-neutral-600 to-[#050505]" },
  { title: "Metery Web3", category: "Web3", type: "Hero", file: "Metery_Web3_Hero.md", preview: "https://cdn.5sdesign.art/projects/metery.mp4", tags: ["Web3", "Nature", "Video"], gradient: "from-amber-200 via-lime-600 to-[#0d130f]" },
  { title: "Airlines Travel", category: "Landing Page", type: "Hero", file: "Airlines_Travel_Hero.md", preview: "https://cdn.sceneai.art/landing-pages/9fffaa43-bc70-467c-b53f-f0bd27a5b342.mp4", tags: ["Travel", "Cinematic", "Video"], gradient: "from-sky-200 via-sky-600 to-slate-900" },
  { title: "Farcy AI Agents", category: "AI / SaaS", type: "Hero", file: "Farcy_AI_Agents_Hero.md", preview: "https://cdn.5sdesign.art/projects/farcy.mp4", tags: ["AI", "Glass", "Dark"], gradient: "from-lime-300 via-emerald-700 to-[#0b0d0b]" },
  { title: "Chipmuk Studio", category: "Agency", type: "Hero", file: "Chipmuk_Hero.md", preview: "https://cdn.5sdesign.art/projects/chipmuk.mp4", tags: ["Studio", "Scrub", "Cinematic"], gradient: "from-sky-200 via-blue-700 to-[#010828]" },
  { title: "Relevance AI Search", category: "AI / SaaS", type: "Hero", file: "Relevance_AI_Hero.md", preview: "https://cdn.sceneai.art/landing-pages/856338f8-bbd7-4522-b55b-856e79fe977b.mp4", tags: ["AI", "Search", "Dark"], gradient: "from-zinc-300 via-zinc-600 to-black" },
  { title: "ihouse Smart Home", category: "SaaS", type: "Hero", file: "Ihouse_Smart_Home_Hero.md", preview: "https://cdn.5sdesign.art/projects/ihouse.mp4", tags: ["Smart Home", "Glass", "3D"], gradient: "from-sky-200 via-blue-500 to-[#3f7dd6]" },
  { title: "Norm Architects Studio", category: "Agency", type: "Landing", file: "Norm_Architects_Studio.md", preview: "https://cdn.shipper.now/video/users/cmm7biunr0006k1040dpvere0/1785141891816-6fxw1qs5bfb-Video_Project_10_-_Trim.mp4", tags: ["Studio", "Minimal", "Video"], gradient: "from-stone-200 via-neutral-400 to-neutral-900" },
  { title: "Boomerang", category: "Fintech", type: "Landing", file: "Boomerang_Landing.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/a/trustflowginArea.mp4", tags: ["Fintech", "AI", "Serif"], gradient: "from-stone-100 via-neutral-400 to-[#191919]" },
  { title: "Adam Roberts Portfolio", category: "Portfolio", type: "Landing", file: "Adam_Roberts_Portfolio.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/a/digitaldirector.mp4", tags: ["Portfolio", "Pixel", "Video"], gradient: "from-neutral-200 via-neutral-600 to-black" },
  { title: "Healcure Medical", category: "Landing Page", type: "Hero", file: "Healcure_Medical_Hero.md", preview: "https://cdn.sceneai.art/landing-pages/a2a9ca39-628c-4fc1-b0b3-aff67fedf4c6.mov", tags: ["Health", "Trust", "Editorial"], gradient: "from-teal-200 via-teal-600 to-slate-900" },
  { title: "Pizza Restaurant", category: "Landing Page", type: "Landing", file: "Pizza.md", preview: "https://i.imgur.com/79tTQ9Y.jpeg", tags: ["Restaurant", "Food", "Framer"], gradient: "from-red-300 via-orange-600 to-[#1A0D08]" },
  { title: "Wandor Travel Hero", category: "Landing Page", type: "Hero", file: "Wandor_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/a/where%20willArea.mp4", tags: ["Travel", "Glass", "Video"], gradient: "from-amber-200 via-orange-600 to-[#2A1810]" },
  { title: "Beanro Coffee Shop", category: "Landing Page", type: "Landing", file: "Beanro_Coffee_Shop.md", preview: "https://i.postimg.cc/7LKy8X3y/Capture-d-e-cran-2026-07-19-a-16-34-59.png", tags: ["Coffee Shop", "E-commerce", "Warm"], gradient: "from-amber-200 via-orange-700 to-[#2A1810]" },
  { title: "Aethera Lending Hero", category: "Fintech", type: "Hero", file: "Aethera_Lending_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/a/handstouchgodArea.mp4", tags: ["Fintech", "Editorial", "Video"], gradient: "from-neutral-100 via-stone-400 to-neutral-900" },
  { title: "GlobalBank Projects", category: "SaaS", type: "Hero", file: "Globalbank_Project_Hero.md", preview: "https://cdn.sceneai.art/landing-pages/dcea62ef-17b9-4e8c-8201-2a65f2ed5ef4.mov", tags: ["SaaS", "Light", "Green"], gradient: "from-emerald-100 via-emerald-400 to-emerald-900" },
  { title: "NHM Hero", category: "Landing Page", type: "Landing", file: "NHM_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(75).webp", tags: ["Museum", "Editorial", "Scroll"], gradient: "from-neutral-300 via-stone-600 to-[#0a0a0a]" },
  { title: "Pallet Ross", category: "Landing Page", type: "Landing", file: "Pallet_Ross_Landing.md", preview: "https://admin.lafys.com/api/media/file/4d32e42469657663b66a3c08aeccd70e_1DkflpwZ.mp4", tags: ["Marketplace", "Scroll", "Video"], gradient: "from-teal-200 via-red-400 to-neutral-900" },
  { title: "Vibrant Wellness Hero", category: "Landing Page", type: "Hero", file: "Vibrant_Wellness_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/a/brainhealthArea.mp4", tags: ["Wellness", "Glass", "Video"], gradient: "from-emerald-200 via-teal-500 to-stone-900" },
  { title: "CoreOS Construction", category: "Landing Page", type: "Hero", file: "Coreos_Construction_Hero.md", preview: "https://cdn.sceneai.art/landing-pages/012e77ab-bb14-48ec-ac1e-a2d050b857e6.mov", tags: ["Construction", "Bold", "Video"], gradient: "from-stone-300 via-stone-600 to-black" },
  { title: "Axon Hero", category: "SaaS", type: "Hero", file: "Axon_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/a/naturezoompuirple.mp4", tags: ["AI", "Agents", "Video"], gradient: "from-violet-200 via-purple-500 to-[#1B133C]" },
  { title: "dot. Hero", category: "Landing Page", type: "Hero", file: "Dot_Hero.md", preview: "https://motionsites.ai/assets/dot-hero-Csf49OgS.gif", tags: ["Messaging", "Video", "Minimal"], gradient: "from-blue-200 via-sky-400 to-stone-800" },
  { title: "Mainframe A.R.I.A. Hero", category: "Agency", type: "Hero", file: "Mainframe_ARIA_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(46).webp", tags: ["Agency", "Typewriter", "Video"], gradient: "from-stone-200 via-neutral-500 to-black" },
  { title: "SynapseX Hero", category: "AI / SaaS", type: "Hero", file: "SynapseX_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(33).webp", tags: ["AI", "Neural", "Video"], gradient: "from-zinc-300 via-purple-700 to-black" },
  { title: "Aesthetic Login", category: "Component", type: "Component", file: "Aesthetic_Login_Screen.md", preview: "https://cdn.sceneai.art/landing-pages/f4d65ee1-2ebe-4b2b-b468-f678fa323806.mov", tags: ["Login", "Glass", "Gradient"], gradient: "from-orange-200 via-rose-500 to-[#0c0c0e]" },
  { title: "Urban Bloom Hero", category: "Landing Page", type: "Hero", file: "Urban_Bloom_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(8).webp", tags: ["Scroll", "Glass", "Video"], gradient: "from-emerald-300 via-green-700 to-black" },
  { title: "Flowpath Hero", category: "SaaS", type: "Hero", file: "Flowpath_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/prompts%20(i've%20added%20them%20to%20the%20motionsites)/Wellbeing%20OS.mp4", tags: ["SaaS", "Wellness", "Video"], gradient: "from-amber-200 via-orange-500 to-[#2C221C]" },
  { title: "TerraElix Hero", category: "Landing Page", type: "Hero", file: "TerraElix_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(11).webp", tags: ["Wellness", "E-commerce", "Clean"], gradient: "from-emerald-200 via-lime-400 to-neutral-900" },
  { title: "Aurai Hero", category: "Landing Page", type: "Hero", file: "Aurai_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(32).webp", tags: ["Wellness", "Glass", "Video"], gradient: "from-rose-200 via-violet-400 to-slate-900" },
  { title: "Forma Contact", category: "Agency", type: "Landing", file: "Forma_Contact.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(45).webp", tags: ["Contact", "Form", "Video"], gradient: "from-neutral-200 via-neutral-500 to-black" },
  { title: "Clarion AI Landing", category: "AI / SaaS", type: "Landing", file: "Clarion_AI_Landing.md", preview: "https://cdn.sceneai.art/landing-pages/b75535b0-ccb0-49aa-b8be-9581250029e8.mov", tags: ["AI", "Dark", "Full Page"], gradient: "from-neutral-300 via-neutral-700 to-black" },
  { title: "Foldcraft Hero", category: "Agency", type: "Hero", file: "Foldcraft_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(14).webp", tags: ["Studio", "Video", "Minimal"], gradient: "from-neutral-300 via-neutral-600 to-black" },
  { title: "VaultShield Hero", category: "SaaS", type: "Hero", file: "VaultShield_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(64).webp", tags: ["Security", "Video", "Clean"], gradient: "from-violet-300 via-purple-500 to-[#192837]" },
  { title: "USD Halo", category: "Fintech", type: "Landing", file: "USD_Halo.md", preview: "https://motionsites.ai/assets/halo-usd-hero-CtMXOklk.gif", tags: ["Stablecoin", "DeFi", "Video"], gradient: "from-neutral-200 via-slate-400 to-[#2B2644]" },
  { title: "CargoX Group Hero", category: "Landing Page", type: "Hero", file: "CargoX_Group_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/prompts%20(i've%20added%20them%20to%20the%20motionsites)/carArea.mp4", tags: ["Logistics", "Video", "Dark"], gradient: "from-yellow-400 via-amber-600 to-slate-900" },
  { title: "Peakflow Footer", category: "Component", type: "Component", file: "Peakflow_Footer.md", preview: "https://cdn.sceneai.art/landing-pages/4c8475cc-4811-487f-9386-72a81debca78.mov", tags: ["Footer", "Contact", "Light"], gradient: "from-zinc-200 via-zinc-500 to-[#111111]" },
  { title: "Portal Cinematic", category: "Landing Page", type: "Hero", file: "Portal_Cinematic.md", preview: "https://motionsites.ai/assets/hero-portal-preview-DEscBr2T.gif", tags: ["Cinematic", "Streaming", "Video"], gradient: "from-slate-300 via-indigo-600 to-black" },
  { title: "Equilibrium Hero", category: "Landing Page", type: "Hero", file: "Equilibrium_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(93).webp", tags: ["Wellness", "Glass", "Video"], gradient: "from-emerald-200 via-teal-500 to-slate-900" },
  { title: "Mainframe Hero", category: "Agency", type: "Hero", file: "Mainframe_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(42).webp", tags: ["Interactive", "Typewriter", "Video"], gradient: "from-neutral-200 via-emerald-700 to-black" },
  { title: "Prisma Studio", category: "Agency", type: "Landing", file: "Prisma_Studio.md", preview: "https://motionsites.ai/assets/hero-prisma-preview-D4QeI0Bn.gif", previewPosition: "top", tags: ["Studio", "Cinematic", "Video"], gradient: "from-stone-300 via-neutral-600 to-black" },
  { title: "TOONHUB Carousel", category: "Landing Page", type: "Hero", file: "TOONHUB_Carousel.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(24).webp", tags: ["3D", "Carousel", "Playful"], gradient: "from-orange-300 via-pink-500 to-sky-500" },
  { title: "Tenlas Footer", category: "Component", type: "Component", file: "Tenlas_Footer.md", preview: "https://cdn.sceneai.art/landing-pages/b810914e-d5a5-4cec-b72b-147917ca8e6f.mov", tags: ["Footer", "Neon", "Oversized"], gradient: "from-lime-200 via-lime-500 to-[#050505]" },
  { title: "Axion Studio", category: "Agency", type: "Landing", file: "Axion_Studio.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(27).webp", tags: ["Agency", "Shader", "Clean"], gradient: "from-neutral-200 via-orange-400 to-neutral-900" },
  { title: "prmpt Archive", category: "Portfolio", type: "Landing", file: "prmpt_Archive.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/fe42Area.mp4", tags: ["Scroll", "Fashion", "Cursor"], gradient: "from-neutral-200 via-neutral-500 to-black" },
  { title: "VEX Ventures", category: "Landing Page", type: "Hero", file: "VEX_Ventures.md", preview: "https://motionsites.ai/assets/hero-vex-ventures-preview-BczMFIiw.gif", tags: ["Ventures", "Video", "Bold"], gradient: "from-zinc-100 via-zinc-500 to-black" },
  { title: "Cortexa FAQ", category: "Component", type: "Component", file: "Cortexa_FAQ.md", preview: "https://cdn.sceneai.art/landing-pages/b64f5a41-4690-4a19-99b3-f6a2f102311f.mov", tags: ["FAQ", "Accordion", "Editorial"], gradient: "from-white via-neutral-300 to-neutral-800" },
  { title: "MicroVisuals Hero", category: "AI / SaaS", type: "Hero", file: "MicroVisuals_Hero.md", preview: "https://image.mux.com/i9kUFJpB6GrWoe2UXRZG4lIP02g00LGulS1GTVrMMwZI00/animated.webp?width=640&fps=15", tags: ["AI", "Glass", "Serif"], gradient: "from-zinc-200 via-slate-500 to-black" },
  { title: "LinkFlow Hero", category: "SaaS", type: "Hero", file: "LinkFlow_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(55).webp", tags: ["AI", "Workflow", "Video"], gradient: "from-lime-300 via-emerald-600 to-stone-900" },
  { title: "Lumora Hero", category: "Landing Page", type: "Hero", file: "Lumora_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/prompts%20(i've%20added%20them%20to%20the%20motionsites)/endless.mp4", tags: ["Mindfulness", "Video", "Glass"], gradient: "from-amber-200 via-orange-400 to-stone-900" },
  { title: "Veldara Hero", category: "Landing Page", type: "Landing", file: "Veldara_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(21).webp", tags: ["Scroll", "3D", "Dark"], gradient: "from-blue-400 via-cyan-600 to-black" },
  { title: "Aurelion Blog", category: "Component", type: "Component", file: "Aurelion_Blog_Carousel.md", preview: "https://cdn.sceneai.art/landing-pages/e00d1c5d-731a-48b2-b363-7a6db9cb4027.mov", tags: ["Blog", "Carousel", "Yellow"], gradient: "from-yellow-200 via-yellow-500 to-[#1c1c1c]" },
  { title: "Creative Studio Showcase", category: "Portfolio", type: "Landing", file: "Creative_Studio_Showcase.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/newpsotArea.mp4", tags: ["Studio", "Creative", "Spotlight"], gradient: "from-sky-200 via-cyan-400 to-slate-900" },
  { title: "Wisa Space", category: "Hero Section", type: "Hero", file: "Wisa_Space.md", link: "https://aistudio.google.com/u/1/apps/857d4bc5-1fa0-482d-9bdd-64327801c864?showPreview=true&showAssistant=true", preview: "https://motionsites.ai/assets/hero-wisa-space-preview-CAIFtU8c.gif", tags: ["Space", "3D", "Dark"], gradient: "from-slate-600 via-blue-900 to-black" },
  { title: "PureFlow Air Hero", category: "Landing Page", type: "Landing", file: "PureFlow_Air_Hero.md", preview: "https://image.mux.com/WuNDVUgyyrxFhrn2QxrF1LjMS3nBwrD7xjMNnIEn6nU/animated.webp?width=640&fps=15", tags: ["Product", "Clean", "Spotlight"], gradient: "from-gray-200 via-slate-400 to-black" },
  { title: "AI Automation Hero", category: "AI / SaaS", type: "Hero", file: "AI_Automation_Hero.md", preview: "https://motionsites.ai/assets/hero-synapse-ai-preview-BjBuH68i.gif", tags: ["AI", "Hero", "Dark"], gradient: "from-indigo-500 via-violet-500 to-cyan-400" },
  { title: "AI Designer Agency", category: "Landing Page", type: "Landing", file: "AI_Designer_Agency.md", preview: "https://motionsites.ai/assets/hero-ai-designer-agency-preview-vrAje6Od.gif", tags: ["Agency", "AI", "Premium"], gradient: "from-purple-400 via-fuchsia-500 to-black" },
  { title: "Averra Testimonials", category: "Component", type: "Component", file: "Averra_Testimonials.md", preview: "https://cdn.sceneai.art/landing-pages/c58dbf45-2f60-40e6-b230-4d4272c9bc56.mov", tags: ["Testimonials", "Slider", "Sage"], gradient: "from-lime-100 via-lime-400 to-[#181A15]" },
  { title: "AI Designer Portfolio", category: "Landing Page", type: "Landing", file: "AI_Designer_Portfolio.md", preview: "https://motionsites.ai/assets/hero-vortex-studio-preview-BQyvwopD.gif", tags: ["Portfolio", "AI", "Creative"], gradient: "from-violet-400 via-blue-500 to-black" },
  { title: "AKOR Security", category: "Landing Page", type: "Landing", file: "AKOR_Security.md", preview: "https://motionsites.ai/assets/hero-akor-security-preview-hRrwsPNf.gif", tags: ["Security", "Dark", "Corporate"], gradient: "from-red-400 via-orange-500 to-black" },
  { title: "Aethera Studio", category: "Hero Section", type: "Hero", file: "Aethera_Studio.md", preview: "https://motionsites.ai/assets/hero-aethera-preview-DknSlcTa.gif", tags: ["Studio", "Creative", "Hero"], gradient: "from-sky-300 via-blue-500 to-black" },
  { title: "Apex SaaS", category: "SaaS", type: "Landing", file: "Apex_SaaS.md", preview: "https://motionsites.ai/assets/hero-apex-saas-preview-CbnBKSPv.gif", tags: ["SaaS", "Gradient", "Startup"], gradient: "from-purple-400 via-pink-500 to-slate-950" },
  { title: "Designy Footer", category: "Component", type: "Component", file: "Designy_Footer.md", preview: "https://cdn.sceneai.art/landing-pages/8fc3fa87-0fe1-464d-8daf-b119a4f9d490.mov", tags: ["Footer", "Minimal", "Card"], gradient: "from-white via-zinc-300 to-zinc-800" },
  { title: "Asme", category: "Hero Section", type: "Hero", file: "Asme.md", preview: "https://motionsites.ai/assets/hero-asme-preview-B_nGDnTP.gif", tags: ["Hero", "Minimal", "Modern"], gradient: "from-zinc-100 via-zinc-500 to-black" },
  { title: "Automation Machines", category: "Hero Section", type: "Hero", file: "Automation_Machines.md", preview: "https://motionsites.ai/assets/hero-automation-machines-preview-DlTveRIN.gif", tags: ["Automation", "Industry", "Hero"], gradient: "from-amber-300 via-orange-600 to-black" },
  { title: "Bionova Biotech", category: "SaaS", type: "Landing", file: "Bionova_Biotech.md", preview: "https://motionsites.ai/assets/hero-bionova-preview-Sk76d0_D.gif", tags: ["Biotech", "SaaS", "Clean"], gradient: "from-emerald-300 via-teal-500 to-black" },
  { title: "Bloom AI", category: "Hero Section", type: "Hero", file: "Bloom_AI.md", preview: "https://motionsites.ai/assets/hero-bloom-ai-preview-g6RcYLTl.gif", tags: ["AI", "Hero", "Soft"], gradient: "from-pink-300 via-rose-500 to-black" },
  { title: "Bold Portfolio Hero", category: "Portfolio", type: "Hero", file: "Bold_Portfolio_Hero.md", preview: "https://motionsites.ai/assets/hero-portfolio-bold-preview-9Yfbi-Wg.gif", tags: ["Portfolio", "Bold", "Creative"], gradient: "from-red-400 via-orange-500 to-black" },
  { title: "Buzzentic Agency", category: "Agency", type: "Landing", file: "Buzzentic_Agency.md", preview: "https://motionsites.ai/assets/hero-buzzentic-preview-CbopM29R.gif", tags: ["Agency", "Video", "Brand"], gradient: "from-yellow-300 via-orange-500 to-black" },
  { title: "ClearInvoice SaaS Hero", category: "SaaS", type: "Hero", file: "ClearInvoice_SaaS_Hero.md", preview: "https://motionsites.ai/assets/hero-clearinvoice-preview-l3q8sam6.gif", tags: ["Invoice", "SaaS", "Clean"], gradient: "from-blue-300 via-cyan-500 to-black" },
  { title: "ClubX Investors", category: "Landing Page", type: "Landing", file: "ClubX_Investors.md", preview: "https://motionsites.ai/assets/hero-clubx-preview-CpKCe8yV.gif", tags: ["Private Club", "Luxury", "Video"], gradient: "from-amber-200 via-orange-500 to-neutral-950" },
  { title: "CodeNest Coding Platform", category: "Landing Page", type: "Landing", file: "CodeNest_Coding_Platform.md", preview: "https://motionsites.ai/assets/hero-codenest-preview-Cgppc2qV.gif", tags: ["Code", "Platform", "Developer"], gradient: "from-lime-300 via-green-500 to-black" },
  { title: "Planor Planner", category: "Landing Page", type: "Hero", file: "Planor_Planner_Hero.md", preview: "https://cdn.sceneai.art/landing-pages/40582b96-cec9-40e6-8d32-d9ecf7399f7a.mov", tags: ["Planner", "Serif", "Rounded"], gradient: "from-stone-200 via-stone-400 to-black" },
  { title: "Dark Portfolio Hero", category: "Portfolio", type: "Hero", file: "Dark_Portfolio_Hero.md", preview: "https://motionsites.ai/assets/hero-portfolio-dark-preview-RZYzJHIL.gif", tags: ["Portfolio", "Dark", "Hero"], gradient: "from-zinc-200 via-zinc-600 to-black" },
  { title: "Datacore Booking", category: "SaaS", type: "Landing", file: "Datacore_Booking.md", preview: "https://motionsites.ai/assets/hero-datacore-booking-preview-B3t9SRK6.gif", tags: ["Booking", "SaaS", "Data"], gradient: "from-cyan-300 via-blue-500 to-black" },
  { title: "Datacore SaaS Hero", category: "SaaS", type: "Hero", file: "Datacore_SaaS_Hero.md", preview: "https://motionsites.ai/assets/hero-datacore-preview-DWeq7Ls3.gif", tags: ["Data", "SaaS", "Hero"], gradient: "from-blue-400 via-indigo-500 to-black" },
  { title: "DesignPro Academy", category: "Hero Section", type: "Hero", file: "DesignPro_Academy.md", preview: "https://motionsites.ai/assets/hero-designpro-preview-D8c5_een.gif", tags: ["Academy", "Design", "Hero"], gradient: "from-orange-300 via-pink-500 to-black" },
  { title: "Digitwist AI Builder", category: "SaaS", type: "Landing", file: "Digitwist_AI_Builder.md", preview: "https://motionsites.ai/assets/hero-digitwist-preview-s2pJetjQ.gif", tags: ["AI Builder", "SaaS", "No-code"], gradient: "from-violet-300 via-purple-600 to-black" },
  { title: "Adventra Travel", category: "Landing Page", type: "Hero", file: "Adventra_Travel_Hero.md", preview: "https://cdn.sceneai.art/landing-pages/5c7ef3b2-1bf0-4dc6-b3c9-f1b94f154ffd.mov", tags: ["Travel", "App", "Cinematic"], gradient: "from-emerald-200 via-emerald-700 to-black" },
  { title: "E-commerce Website", category: "Landing Page", type: "Landing", file: "E-commerce_Website.md", preview: "https://motionsites.ai/assets/hero-ecommerce-website-preview-D7j_TrNR.gif", tags: ["Shop", "Commerce", "Landing"], gradient: "from-rose-300 via-fuchsia-500 to-black" },
  { title: "EVR Ventures", category: "Hero Section", type: "Hero", file: "EVR_Ventures.md", preview: "https://motionsites.ai/assets/hero-evr-ventures-preview-DZxeVFEX.gif", tags: ["Venture", "Hero", "Premium"], gradient: "from-blue-200 via-indigo-500 to-black" },
  { title: "Finlytic AI Agent", category: "SaaS", type: "Landing", file: "Finlytic_AI_Agent.md", preview: "https://motionsites.ai/assets/hero-finlytic-preview-CV9g0FHP.gif", tags: ["Finance", "AI Agent", "SaaS"], gradient: "from-emerald-300 via-cyan-500 to-black" },
  { title: "Framelix 3D Studios", category: "Agency", type: "Landing", file: "Framelix_3D_Studios.md", preview: "https://motionsites.ai/assets/hero-framelix-preview-DsyIImVY.gif", tags: ["3D", "Studio", "Agency"], gradient: "from-fuchsia-300 via-purple-500 to-black" },
  { title: "Cliently Testimonials", category: "Component", type: "Component", file: "Cliently_Testimonials.md", preview: "https://cdn.sceneai.art/landing-pages/0009a539-0061-40dd-a795-c970a279ef27.mov", tags: ["Testimonials", "Carousel", "Agency"], gradient: "from-white via-zinc-400 to-zinc-900" },
  { title: "Glassmorphism Agency Hero", category: "Agency", type: "Hero", file: "Glassmorphism_Agency_Hero.md", preview: "https://motionsites.ai/assets/hero-glassmorphism-agency-preview-CGqeRoqP.gif", tags: ["Glass", "Agency", "Hero"], gradient: "from-cyan-300 via-violet-500 to-black" },
  { title: "Grow AI Talent Platform", category: "SaaS", type: "Landing", file: "Grow_AI_Talent_Platform.md", preview: "https://motionsites.ai/assets/hero-grow-ai-preview-BlQ8tAQ-.gif", tags: ["Talent", "AI", "SaaS"], gradient: "from-green-300 via-emerald-500 to-black" },
  { title: "HR SaaS Hero", category: "SaaS", type: "Hero", file: "HR_SaaS_Hero.md", preview: "https://motionsites.ai/assets/hero-hr-saas-preview-Cf365Y1O.gif", tags: ["HR", "SaaS", "Hero"], gradient: "from-indigo-300 via-blue-500 to-black" },
  { title: "Investor Deck", category: "Presentation", type: "Deck", file: "Investor_Deck.md", preview: "https://motionsites.ai/assets/hero-deck-preview-CbidQJxW.gif", tags: ["Deck", "Investor", "Slides"], gradient: "from-amber-200 via-yellow-500 to-black" },
  { title: "Liquid Glass Agency", category: "Landing Page", type: "Landing", file: "Liquid_Glass_Agency.md", preview: "https://motionsites.ai/assets/hero-liquid-glass-agency-preview-Cr5Q9-lc.gif", tags: ["Glass", "Agency", "Premium"], gradient: "from-fuchsia-400 via-violet-500 to-indigo-950" },
  { title: "Zyphor Productivity", category: "SaaS", type: "Hero", file: "Zyphor_Productivity_Hero.md", preview: "https://cdn.sceneai.art/landing-pages/1642e396-b3b0-4de5-b338-c82c2de9ebd8.mov", tags: ["SaaS", "Dashboard", "Purple"], gradient: "from-violet-300 via-violet-700 to-[#0b0c10]" },
  { title: "Loader Animation", category: "Component", type: "Component", file: "Loader_Animation.md", preview: "https://motionsites.ai/assets/hero-loader-animation-preview-C3_SX_Io.gif", tags: ["Loader", "Animation", "Component"], gradient: "from-white via-zinc-400 to-black" },
  { title: "Logoisum Video Agency", category: "Agency", type: "Landing", file: "Logoisum_Video_Agency.md", preview: "https://motionsites.ai/assets/hero-logoisum-preview-yhpSc7Yy.gif", tags: ["Video", "Agency", "Brand"], gradient: "from-red-300 via-pink-500 to-black" },
  { title: "Mindloop", category: "SaaS", type: "Landing", file: "Mindloop.md", preview: "https://motionsites.ai/assets/hero-mindloop-preview-BR8xW6xW.gif", tags: ["SaaS", "AI", "Dark"], gradient: "from-violet-300 via-indigo-500 to-black" },
  { title: "Mindloop Landing", category: "Landing Page", type: "Landing", file: "Mindloop_Landing.md", preview: "https://motionsites.ai/assets/hero-mindloop-landing-preview-Bqnstohr.gif", tags: ["Landing", "AI", "Modern"], gradient: "from-blue-300 via-purple-500 to-black" },
  { title: "Alertix Price Alerts", category: "SaaS", type: "Hero", file: "Alertix_Price_Alerts_Hero.md", preview: "https://cdn.sceneai.art/landing-pages/3c3df161-10a0-466a-86dc-302fe6fb5942.mov", tags: ["E-commerce", "Dark", "Serif"], gradient: "from-cyan-200 via-cyan-700 to-[#0a0f14]" },
  { title: "NOVA Space Systems", category: "Landing Page", type: "Landing", file: "NOVA_Space_Systems.md", preview: "https://motionsites.ai/assets/hero-nova-space-preview-ej0OOJ0M.gif", tags: ["Space", "Systems", "Landing"], gradient: "from-cyan-300 via-blue-600 to-black" },
  { title: "NeoVision", category: "Landing Page", type: "Landing", file: "NeoVision.md", preview: "https://motionsites.ai/assets/hero-neovision-preview-qwRNOas1.gif", tags: ["Vision", "AI", "Landing"], gradient: "from-fuchsia-300 via-violet-500 to-black" },
  { title: "Neuralyn", category: "SaaS", type: "Landing", file: "Neuralyn.md", preview: "https://motionsites.ai/assets/hero-neuralyn-preview-Br4FRDQA.gif", tags: ["AI", "Neural", "SaaS"], gradient: "from-purple-300 via-blue-500 to-black" },
  { title: "New Era Automotive Hero", category: "Automotive", type: "Hero", file: "New_Era_Automotive_Hero.md", preview: "https://motionsites.ai/assets/hero-new-era-auto-preview-W56vp0xD.gif", tags: ["Automotive", "Hero", "Premium"], gradient: "from-zinc-100 via-red-500 to-black" },
  { title: "New Era Bold Hero", category: "Agency", type: "Hero", file: "New_Era_Bold_Hero.md", preview: "https://motionsites.ai/assets/hero-new-era-preview-CocuDUm9.gif", tags: ["Bold", "Agency", "Hero"], gradient: "from-orange-300 via-red-500 to-black" },
  { title: "Brightly Productivity", category: "SaaS", type: "Hero", file: "Brightly_Productivity_Hero.md", preview: "https://cdn.sceneai.art/landing-pages/78cdc20b-4df2-471d-a0e0-0c0544c2615a.mov", tags: ["Productivity", "Cinematic", "Gradient"], gradient: "from-orange-300 via-rose-600 to-[#050505]" },
  { title: "Nexora Automation", category: "SaaS", type: "Landing", file: "Nexora_Automation.md", preview: "https://motionsites.ai/assets/hero-nexora-preview-cx5HmUgo.gif", tags: ["Automation", "SaaS", "AI"], gradient: "from-sky-300 via-indigo-500 to-black" },
  { title: "Nexus IT Solutions", category: "Hero Section", type: "Hero", file: "Nexus_IT_Solutions.md", preview: "https://motionsites.ai/assets/hero-nexus-preview-74RfhYpA.gif", tags: ["B2B", "IT", "Clean"], gradient: "from-blue-400 via-sky-500 to-slate-950" },
  { title: "Nickel Payments", category: "SaaS", type: "Landing", file: "Nickel_Payments.md", preview: "https://motionsites.ai/assets/hero-nickel-preview-CnRoBZt5.gif", tags: ["Payments", "Fintech", "SaaS"], gradient: "from-yellow-300 via-amber-500 to-black" },
  { title: "Alumica Fintech", category: "Fintech", type: "Hero", file: "Alumica_Fintech_Hero.md", preview: "https://cdn.sceneai.art/landing-pages/4ce5fb8c-0747-4df8-b614-94606be69465.mov", tags: ["Fintech", "Glass", "Orange"], gradient: "from-amber-300 via-orange-700 to-black" },
  { title: "Orbit Engineers", category: "Agency", type: "Landing", file: "Orbit_Engineers.md", preview: makePreview("Orbit_Engineers"), tags: ["Engineering", "Agency", "Orbit"], gradient: "from-blue-300 via-cyan-500 to-black" },
  { title: "Orbit Web3", category: "Web3", type: "Landing", file: "Orbit_Web3.md", preview: "https://motionsites.ai/assets/hero-orbit-web3-preview-BXt4OttD.gif", tags: ["Web3", "Crypto", "Orbit"], gradient: "from-indigo-300 via-violet-500 to-black" },
  { title: "Planet Orbit", category: "SaaS", type: "Landing", file: "Planet_Orbit.md", preview: "https://motionsites.ai/assets/hero-planet-orbit-preview-DWAP8Z1P.gif", tags: ["Orbit", "SaaS", "Space"], gradient: "from-cyan-300 via-indigo-600 to-black" },
  { title: "Portfolio Cosmic", category: "Portfolio", type: "Portfolio", file: "Portfolio_Cosmic.md", preview: "https://motionsites.ai/assets/hero-portfolio-cosmic-preview-BpvWJ3Nc.gif", tags: ["Portfolio", "Cosmic", "Personal"], gradient: "from-violet-300 via-blue-500 to-black" },
  { title: "Power AI", category: "Hero Section", type: "Hero", file: "Power_AI.md", preview: "https://motionsites.ai/assets/hero-power-ai-preview-BqpSbx41.gif", tags: ["AI", "Hero", "Energy"], gradient: "from-cyan-300 via-blue-600 to-black" },
  { title: "Scene AI 3D", category: "AI / SaaS", type: "Hero", file: "Scene_AI_Hero.md", preview: "https://cdn.sceneai.art/landing-pages/fc0f74d0-bd55-4ab0-9074-38c7ebbfda7f.mov", tags: ["AI", "3D", "Glass"], gradient: "from-purple-300 via-purple-700 to-black" },
  { title: "Price Calculator", category: "SaaS", type: "Component", file: "Price_Calculator.md", preview: "https://motionsites.ai/assets/hero-price-calculator-preview-Dak8DDgY.gif", tags: ["Calculator", "Conversion", "Dark"], gradient: "from-emerald-400 via-teal-500 to-slate-950" },
  { title: "Railroad.ai", category: "Hero Section", type: "Hero", file: "Railroad.ai.md", preview: "https://motionsites.ai/assets/hero-railroad-preview-CqimSb5d.gif", tags: ["Video", "Cinematic", "Landing"], gradient: "from-zinc-200 via-slate-500 to-blue-700" },
  { title: "SkyElite Private Jets", category: "Landing Page", type: "Landing", file: "SkyElite_Private_Jets.md", preview: "https://motionsites.ai/assets/hero-skyelite-preview-DHaZIgUv.gif", tags: ["Luxury", "Jets", "Landing"], gradient: "from-sky-200 via-blue-500 to-black" },
  { title: "Space Voyage", category: "Landing Page", type: "Landing", file: "Space_Voyage.md", preview: "https://motionsites.ai/assets/hero-space-voyage-preview-eECLH3Yc.gif", tags: ["Space", "Immersive", "Hero"], gradient: "from-cyan-300 via-blue-600 to-black" },
  { title: "Lumina Vision", category: "Agency", type: "Hero", file: "Lumina_Vision_Hero.md", preview: "https://cdn.sceneai.art/landing-pages/d4d77316-49f3-4238-8ed6-2cb5e7a4a1d5.mov", tags: ["Cinematic", "Conic", "Dark"], gradient: "from-blue-300 via-fuchsia-600 to-black" },
  { title: "Stellar AI", category: "Hero Section", type: "Hero", file: "Stellar_AI.md", preview: "https://motionsites.ai/assets/hero-stellar-ai-preview-D3HL6bw1.gif", tags: ["AI", "Stellar", "Hero"], gradient: "from-blue-300 via-violet-500 to-black" },
  { title: "Synapse Dark Hero", category: "SaaS", type: "Hero", file: "Synapse_Dark_Hero.md", preview: "https://motionsites.ai/assets/hero-synapse-preview-CP83ds5W.gif", tags: ["Dark", "AI", "SaaS"], gradient: "from-violet-300 via-purple-600 to-black" },
  { title: "Sync AI", category: "Hero Section", type: "Hero", file: "Sync_AI.md", preview: "https://motionsites.ai/assets/hero-stellar-ai-v2-preview-DjvxjG3C.gif", tags: ["AI", "Sync", "Hero"], gradient: "from-sky-300 via-cyan-500 to-black" },
  { title: "Targo Logistics Hero", category: "SaaS", type: "Hero", file: "Targo_Logistics_Hero.md", preview: "https://motionsites.ai/assets/hero-targo-preview-BF9qQyMr.gif", tags: ["Logistics", "SaaS", "Hero"], gradient: "from-orange-300 via-red-500 to-black" },
  { title: "Taskly", category: "Hero Section", type: "Hero", file: "Taskly.md", preview: "https://motionsites.ai/assets/hero-taskly-preview-Dq2MKaI0.gif", tags: ["Productivity", "Hero", "Dark"], gradient: "from-lime-300 via-green-500 to-black" },
  { title: "Qumica Infrastructure", category: "AI / SaaS", type: "Hero", file: "Qumica_Infrastructure_Hero.md", preview: "https://cdn.sceneai.art/landing-pages/9db75e93-c07f-4a60-933c-8a8c6ecb730a.mov", tags: ["Automation", "Glass", "Marquee"], gradient: "from-orange-300 via-purple-600 to-black" },
  { title: "Taskora SaaS Hero", category: "SaaS", type: "Hero", file: "Taskora_SaaS_Hero.md", preview: "https://motionsites.ai/assets/hero-taskora-preview-BlRBv8IU.gif", tags: ["Tasks", "SaaS", "Hero"], gradient: "from-blue-300 via-indigo-500 to-black" },
  { title: "Terra Geo Map", category: "SaaS", type: "Landing", file: "Terra_Geo_Map.md", preview: "https://motionsites.ai/assets/hero-terra-preview-BFjrCr7T.gif", tags: ["Map", "Geo", "SaaS"], gradient: "from-emerald-300 via-teal-500 to-black" },
  { title: "Transform Data", category: "Hero Section", type: "Hero", file: "Transform_Data.md", preview: "https://motionsites.ai/assets/hero-transform-data-preview-Cx5OU29N.gif", tags: ["Data", "Hero", "B2B"], gradient: "from-cyan-300 via-blue-500 to-black" },
  { title: "Scalable Analytics", category: "SaaS", type: "Hero", file: "Scalable_Saas_Hero.md", preview: "https://cdn.sceneai.art/landing-pages/89c8a5cc-2198-4623-afcb-5d020e8e95b6.mov", tags: ["Analytics", "Dashboard", "oklch"], gradient: "from-indigo-300 via-indigo-700 to-[#0a0a0c]" },
  { title: "Viktor Portfolio", category: "Portfolio", type: "Portfolio", file: "Viktor_Portfolio.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(89).webp", tags: ["Personal", "Creative", "Motion"], gradient: "from-lime-300 via-green-600 to-black" },
  { title: "Wealth Video Hero", category: "Fintech", type: "Hero", file: "Wealth_Video_Hero.md", preview: "https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif", tags: ["Finance", "Video", "Hero"], gradient: "from-emerald-300 via-green-600 to-black" },
  { title: "Web3 EOS Hero", category: "Web3", type: "Hero", file: "Web3_EOS_Hero.md", preview: "https://motionsites.ai/assets/hero-web3-eos-poster-DF0_WdVS.png", tags: ["Web3", "EOS", "Hero"], gradient: "from-purple-300 via-indigo-500 to-black" },
  { title: "Weblex Dark Hero", category: "Landing Page", type: "Hero", file: "Weblex_Dark_Hero.md", preview: "https://motionsites.ai/assets/hero-weblex-preview-BoIbrUHI.gif", tags: ["Dark", "Agency", "Hero"], gradient: "from-zinc-100 via-zinc-500 to-black" },
  { title: "xPortfolio Hero", category: "Hero Section", type: "Hero", file: "xPortfolio_Hero.md", preview: "https://motionsites.ai/assets/hero-xportfolio-preview-D4A8maiC.gif", tags: ["Portfolio", "Hero", "Creative"], gradient: "from-fuchsia-300 via-violet-500 to-black" },
  // Kept at the end on request — the gallery renders this array in order.
  { title: "Maison Horlogerie", category: "E-commerce", type: "Landing", file: "Maison_Horlogerie_Luxury_Watch.md", preview: "https://strvid.nyc3.cdn.digitaloceanspaces.com/motionitems/1780917018587-Maison-watch.webp", tags: ["Luxury", "GSAP", "Pinned Scroll"], gradient: "from-amber-200 via-slate-600 to-black" },
  { title: "Pixzen AI Agency", category: "Agency", type: "Landing", file: "Pixzen_AI_Agency.md", preview: "https://strvid.nyc3.cdn.digitaloceanspaces.com/motionitems/1781522720269-Pixzen.webp", tags: ["Editorial", "Monochrome", "GSAP"], gradient: "from-stone-100 via-stone-400 to-[#0A0A0A]" },
  { title: "Creative Developer Portfolio", category: "Portfolio", type: "Hero", file: "Creative_Developer_Portfolio_Hero.md", preview: "https://strvid.nyc3.cdn.digitaloceanspaces.com/motionitems/1782992185168-my_portfolio_hero.webp", tags: ["Portfolio", "Glass", "Video"], gradient: "from-violet-300 via-indigo-600 to-[#030305]" },
];

// Only prompts whose .md is actually hosted in azoklearn/movento/prompts/ (or that open an
// external link) are shown. Add a filename here as its content is added to the repo.
const AVAILABLE_FILES = new Set([
  "Cyber_Ronin_Spotlight_Hero.md",
  "SpaceEdu_Planet_Switcher_Hero.md",
  "Ducati_Superleggera_Scroll_Scrub.md",
  "Fastshot_Composer_Hero.md",
  "Apogee_Data_Hero.md",
  "Mainframe_ARIA_Hero_Dark.md",
  "Angelo_Elagage_Nancy_Landing.md",
  "Jack_3D_Creator.md",
  "Pizza.md",
  "Wandor_Hero.md",
  "Beanro_Coffee_Shop.md",
  "Aethera_Lending_Hero.md",
  "NHM_Hero.md",
  "Love_Bag_Hero.md",
  "Pallet_Ross_Landing.md",
  "Valmax_Hero.md",
  "Vibrant_Wellness_Hero.md",
  "Axon_Hero.md",
  "Dot_Hero.md",
  "Mainframe_ARIA_Hero.md",
  "SynapseX_Hero.md",
  "Urban_Bloom_Hero.md",
  "Viktor_Portfolio.md",
  "Flowpath_Hero.md",
  "Aethera_Studio.md",
  "TerraElix_Hero.md",
  "Aurai_Hero.md",
  "Forma_Contact.md",
  "Foldcraft_Hero.md",
  "VaultShield_Hero.md",
  "USD_Halo.md",
  "Mainframe_Hero.md",
  "Prisma_Studio.md",
  "TOONHUB_Carousel.md",
  "Axion_Studio.md",
  "Power_AI.md",
  "NeuralKinetics_Hero.md",
  "prmpt_Archive.md",
  "VEX_Ventures.md",
  "Portal_Cinematic.md",
  "Velorah.md",
  "Equilibrium_Hero.md",
  "Fearless_Studio_Hero.md",
  "MicroVisuals_Hero.md",
  "LinkFlow_Hero.md",
  "CargoX_Group_Hero.md",
  "Veldara_Hero.md",
  "Creative_Studio_Showcase.md",
  "Lumora_Hero.md",
  "PureFlow_Air_Hero.md",
  "Adam_Roberts_Portfolio.md",
  "Boomerang_Landing.md",
  "Norm_Architects_Studio.md",
  "Ihouse_Smart_Home_Hero.md",
  "Chipmuk_Hero.md",
  "Zpeed_Motorsport_Hero.md",
  "Mapple_Headphone_Store.md",
  "Farcy_AI_Agents_Hero.md",
  "Metery_Web3_Hero.md",
  "Azaka_Creative_Director.md",
  "Picway_Gallery_Hero.md",
  "Pelmatech_Health_Landing.md",
  "Synergeus_Fintech_Landing.md",
  "Marcus_Bennet_Portfolio.md",
  "Serene_Wellness_Landing.md",
  "Porgas_Step_Into_Wonder.md",
  "Amee_Paris_Couture.md",
  "Moss_Botanical_Commerce.md",
  "1Brain_Cinematic_Video_Hero.md",
  "Mostar_Cinematic_Scroll.md",
  "Skybridge_404_Screen.md",
  "NovaAI_Scroll_Video_Landing.md",
  "Dreamy_Journal_Hero.md",
  "Shelter_Secure_File_Hero.md",
  "Bingchiling_AI_Hero.md",
  "Ommod_RWA_Oracle.md",
  "Seathe_Underwater_Hero.md",
  "CloudB_Sneaker_Hero.md",
  "Labs_ISP_Hero.md",
  "Muse_Editorial_Gallery.md",
  "Orbis_NFT_Space_Landing.md",
  "Echoid_Voice_Identity.md",
  "Kollektiva_Studio_Team.md",
  "Beyond_Hero_Stacked_Type.md",
  "Orbit_Secure_System_Poster.md",
  "Vesper_AI_Operational_Infrastructure.md",
  "Graven_Drafting_Works_Scroll.md",
  "Meridian_Revenue_Intelligence.md",
  "Vantage_Dashboard_Signal_Hero.md",
  "Signal_Falcon_Login.md",
  "Evolve_AI_Platform_Hero.md",
  "Basilico_Luxury_Restaurant.md",
  "Maison_Horlogerie_Luxury_Watch.md",
  "Vanta_Haute_Horlogerie_Scroll.md",
  "Pixzen_AI_Agency.md",
  "Creative_Developer_Portfolio_Hero.md",
  "Beauty_Categories_Grid.md",
  "SPD_Red_Manifesto.md",
  "Max_Reed_Bento_Features.md",
  "Aurora_Weather_Dashboard.md",
  "Bali_Travel_App_Mockup.md",
  "F1_Racing_Hub_Hero.md",
  "iOS_Dual_Device_Showcase.md",
  "Coffee_Profile_Screen.md",
  "Cyber_Spotlight_Reveal_Hero.md",
  "Vectrus_Scroll_Tied_Video.md",
  "Nexum_AI_Ops_Hero.md",
  "Hunsy_Car_Rental_Hero.md",
  "Lumora_Studio_Landing.md",
  "Flowstate_Fluid_Waitlist.md",
  "Laocoon_Bronze_Scroll.md",
  "Loopstack_Motion_Landing.md",
  "Soda_3D_Flavor_Hero.md",
  "Aurevon_Luxury_Brand_Hero.md",
  "Targo_Platform_Hero_About.md",
  "JWT_3D_Card_Carousel.md",
  "Fiamma_Pizzeria_Scrollytelling_3D.md",
  "Baseline_Tennis_Club.md",
  "Convix_PR_Software_Hero.md",
  "Michael_Smith_Portfolio_Landing.md",
  "Atelier_Design_Agency_Hero.md",
  "Sentinel_AI_Spline_Hero.md",
  "TinyTrails_404_Screen.md",
  "SkyElite_Private_Jet_Hero.md",
  "Alwayzz_Creative_Agency_Hero.md",
  "Password_Manager_Video_Hero.md",
  "Lithos_Geology_Reveal_Hero.md",
  "Vanguard_Agency_Video_Hero.md",
  "VortxLab_Immersive_Landing.md",
  "Dental_Health_Clinic_Landing.md",
  "CozyPaws_Pet_Store_Hero.md",
  "Halo_Nutrition_Health_Hero.md",
  "Strip_Juice_Header.md",
  "Kelo_AI_Support_Hero.md",
  "LGPSM_Future_Forward_Fashion.md",
  "Wallet_Finance_Scroll_Header.md",
  "Verto_Scroll_Video_Landing.md",
  "Velora_Luxury_Car_Hero.md",
  "Portiva_Creative_Agency_Hero.md",
  "Paradiso_Newsletter_CTA.md",
  "Launchpad_Insights_Blog.md",
  "Airlines_Travel_Hero.md",
  "Relevance_AI_Hero.md",
  "Healcure_Medical_Hero.md",
  "Globalbank_Project_Hero.md",
  "Coreos_Construction_Hero.md",
  "Aesthetic_Login_Screen.md",
  "Clarion_AI_Landing.md",
  "Peakflow_Footer.md",
  "Tenlas_Footer.md",
  "Cortexa_FAQ.md",
  "Aurelion_Blog_Carousel.md",
  "Averra_Testimonials.md",
  "Designy_Footer.md",
  "Gulfselite_Jet_Hero.md",
  "Planor_Planner_Hero.md",
  "Adventra_Travel_Hero.md",
  "Cliently_Testimonials.md",
  "Zyphor_Productivity_Hero.md",
  "Alertix_Price_Alerts_Hero.md",
  "Brightly_Productivity_Hero.md",
  "Alumica_Fintech_Hero.md",
  "Scene_AI_Hero.md",
  "Lumina_Vision_Hero.md",
  "Qumica_Infrastructure_Hero.md",
  "Scalable_Saas_Hero.md",
]);

function isPromptAvailable(item) {
  return Boolean(item.link) || AVAILABLE_FILES.has(item.file);
}

// The only list the site is allowed to show or count. `prompts` still holds
// entries whose markdown was never added to the repo — they must not be
// rendered, opened by URL, featured in the showcase, or counted in the copy
// that promises how many prompts a buyer gets.
const availablePrompts = prompts.filter(isPromptAvailable);

// Nothing is given away any more: every prompt sits behind the paywall.
// Putting a filename back here re-opens that prompt, and it must be added to
// the same set in api/_shared.js, which is what actually enforces access.
const FREE_PROMPT_FILES = new Set([]);

// Order here is the order every pricing grid renders in, so lifetime leads:
// it is the offer that converts, and the two subscriptions read as the
// alternatives to it rather than the other way round.
// The three prices live here rather than inside the cards, because they refer
// to each other: the annual card quotes the monthly one, and its headline is
// the annual divided by twelve. Change a number here and every mention follows.
const PRICE_LIFETIME = 89;
// Struck-through anchor on the lifetime card and in the bottom banner. The
// badge is computed from the pair, never typed, so it cannot claim a discount
// the two numbers do not support.
const PRICE_LIFETIME_ANCHOR = 159;
const PRICE_YEARLY = 99;
const PRICE_MONTHLY = 21.99;
const eur = (n) => t(`${n}€`, `${String(n).replace(".", ",")}€`);
const YEARLY_PER_MONTH = (PRICE_YEARLY / 12).toFixed(2);
const LIFETIME_DISCOUNT = Math.round((1 - PRICE_LIFETIME / PRICE_LIFETIME_ANCHOR) * 100);

// The discount announced on /pricing. It must match CHECKOUT_PROMO_CODE in
// api/_shared.js, which is what actually gets applied — announcing a code the
// checkout does not add is the one failure mode that costs trust. Set the code
// to "" here and there to stop announcing and applying it.
const PROMO_CODE = "";
const PROMO_PERCENT = 10;

// A pack of prompts, without the catalogue. One Whop product covers every
// prompt: the buyer pays once, then picks which prompts the purchase unlocks,
// one at a time.
//
// OFF — not on sale anywhere: not the plan grid, not the prompt popup, not the
// paywall trip.
//
// This switch only controls where it is OFFERED. Every path that spends a
// credit already bought (the /choose screen, the "il te reste N prompts"
// banner, the copy button) keys off promptCredits instead, and the API side is
// untouched, so anyone holding an unspent pack keeps it and can still claim.
//
// Turning it back on is one word. The checkout link ships in api/_shared.js
// (Whop plan_duNdZcsNAOPSx); WHOP_PACK_URL only overrides it. PROMPT_PACK_SIZE
// must match the constant of the same name in api/_shared.js, which is what
// actually credits the buyer — announcing three and crediting one is the one
// failure mode that costs trust.
const PROMPT_PACK_ENABLED = false;

// The "Voir le site en ligne" button in the prompt popup, which opens the built
// demo (lovable.app, vercel.app…).
//
// OFF. Nothing is deleted: the `demo:` URL stays on every entry it was added
// to, so the links survive and this is one word away from coming back. The
// gallery's front block is still ordered by which prompts have one, which now
// simply reads as a curation order.
const SHOW_DEMO_LINKS = false;
const PROMPT_PACK_SIZE = 3;
const PROMPT_PACK_PRICE = 19.99;

const plans = [
  {
    id: "yearly",
    // Retired from the grid. Kept defined so existing yearly subscribers still
    // resolve, and so bringing it back is one word.
    hidden: true,
    name: t("Yearly", "Annuel"),
    price: eur(PRICE_YEARLY),
    period: t("/ yr", "/ an"),
    // The card leads with the per-month figure — that is what a visitor
    // compares against the monthly card — and states the amount really charged
    // right underneath. Both are derived, so neither can drift from the price.
    //
    // No percentage on purpose: against any monthly price this plan has been
    // compared to, the discount computes past 60%, and a number that large
    // reads as an inflated monthly rather than a generous annual. Quoting the
    // two prices side by side makes the case without asking to be believed.
    priceMonthly: eur(YEARLY_PER_MONTH),
    priceMonthlyPeriod: t("/ mo", "/ mois"),
    billedNote: t(`${eur(PRICE_YEARLY)} billed once a year`, `${eur(PRICE_YEARLY)} facturé une fois par an`),
    subPrice: t(`instead of ${eur(PRICE_MONTHLY)}/mo`, `au lieu de ${eur(PRICE_MONTHLY)}/mois`),
    badge: t("Best value", "Meilleur rapport"),
    description: t("Build premium AI websites all year long.", "Créez des sites premium toute l'année."),
    cta: t("Get the annual plan", "Prendre l'offre annuelle"),
    featured: false,
    bonus: t("Free bonus ebook included", "Ebook offert inclus"),
    bonusDesc: t("Learn to build your site, sell it, land clients and manage it — A to Z.", "Apprends à créer ton site, le vendre, trouver des clients et le gérer — de A à Z."),
    features: [t("Full Movento catalog", "Catalogue Movento complet"), t("Year-round updates", "Mises à jour toute l'année"), t("New premium categories", "Nouvelles catégories premium"), t("Optimized for Lovable, Cursor, Claude & Shopify", "Optimisé pour Lovable, Cursor, Claude & Shopify"), t("Cancel anytime", "Résiliez à tout moment")],
  },
  {
    id: "lifetime",
    hidden: false,
    name: t("Lifetime", "À vie"),
    price: eur(PRICE_LIFETIME),
    originalPrice: eur(PRICE_LIFETIME_ANCHOR),
    discountBadge: `-${LIFETIME_DISCOUNT}%`,
    period: t("forever", "à vie"),
    badge: t("One shot", "Une fois pour toutes"),
    description: t("Unlock unlimited web creation, once and for all.", "Débloquez la création web sans limites, une fois pour toutes."),
    cta: t("Get lifetime access", "Obtenir l'accès à vie"),
    featured: true,
    // What lifetime has that the subscription does not, stated plainly.
    perk: t("Direct support included", "Support direct inclus"),
    perkDesc: t("A question, a prompt that will not behave, a second look at your site — write and a real person answers.", "Une question, un prompt qui ne veut pas, un avis sur ton site — tu écris et une vraie personne te répond."),
    bonus: t("Free bonus ebook included", "Ebook offert inclus"),
    bonusDesc: t("Learn to build your site, sell it, land clients and manage it — A to Z.", "Apprends à créer ton site, le vendre, trouver des clients et le gérer — de A à Z."),
    features: [t("High-value prompts", "Prompts à forte valeur ajoutée"), t("Unlimited lifetime access", "Accès illimité à vie"), t("Considerable savings vs agencies", "Économies considérables vs agences"), t("Professional-grade design & UX", "Création professionnelle"), t("Continuous learning & updates", "Apprentissage continu")],
  },
  {
    id: "pack",
    // On sale in the plan grid, alongside lifetime and on the same terms as
    // every other surface that offers it — the popup and the paywall trip.
    // Follows the kill switch so turning the pack off removes it everywhere at
    // once rather than leaving a card that cannot be bought.
    hidden: !PROMPT_PACK_ENABLED,
    name: t(`${PROMPT_PACK_SIZE} prompts`, `${PROMPT_PACK_SIZE} prompts`),
    price: eur(PROMPT_PACK_PRICE),
    period: t("once", "une fois"),
    description: t(`${PROMPT_PACK_SIZE} prompts of your choice, yours forever.`, `${PROMPT_PACK_SIZE} prompts de ton choix, à toi pour toujours.`),
    cta: t("Get the pack", "Prendre le pack"),
    featured: false,
    features: [t(`${PROMPT_PACK_SIZE} prompts of your choice`, `${PROMPT_PACK_SIZE} prompts de ton choix`), t("Pick them after checkout", "Tu les choisis après paiement"), t("Yours forever", "À toi pour toujours"), t("Instant access", "Accès immédiat"), t("No subscription", "Sans abonnement")],
  },
  {
    id: "monthly",
    // Back on sale beside lifetime: a subscription for anyone not ready to pay
    // once. Keep in step with RETIRED_PLANS in api/_shared.js — a card here
    // whose plan is retired there is a button the checkout refuses.
    hidden: false,
    name: t("Monthly", "Mensuel"),
    price: eur(PRICE_MONTHLY),
    period: t("/ mo", "/ mois"),
    subPrice: t("No commitment — cancel anytime", "Sans engagement — résiliable à tout moment"),
    badge: t("Flexible", "Flexible"),
    description: t("Full access to the catalog, billed monthly. Cancel anytime.", "Accès complet au catalogue, facturé chaque mois. Résiliez à tout moment."),
    cta: t("Get the monthly plan", "Prendre l'offre mensuelle"),
    featured: false,
    features: [t("Access to all prompts", "Accès à tous les prompts"), t("New prompts added regularly", "Nouveaux prompts ajoutés régulièrement"), t("One-click prompt copy", "Copie en un clic"), t("Cancel anytime", "Résiliez à tout moment")],
  },
];

// Plans without a configured Whop checkout link are hidden rather than shown
// with a button that would fail.
const visiblePlans = plans.filter((plan) => !plan.hidden);
// Tailwind only sees literal class names, so pick whole strings.
// Two plans sit side by side from 640px up — the whole decision is a
// comparison, and stacking them puts scrolling between the two prices. Below
// that they stack: the two cards on sale are nowhere near the same height
// (lifetime carries five features plus support and the ebook, the pack three
// lines), and at 375px the pair rendered as two narrow columns with the CTA
// broken over three lines and a hand's depth of empty card beside it.
const planGridBase = visiblePlans.length === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1";
const planGridMd = visiblePlans.length === 1 ? "md:grid-cols-1" : visiblePlans.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3";
const planGridLg = visiblePlans.length === 1 ? "lg:grid-cols-1" : visiblePlans.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3";
// Two cards stretched over the three-card width read as oversized banners, so
// the row narrows with the number of plans on sale.
const planGridWidth = visiblePlans.length === 1 ? "max-w-sm lg:max-w-2xl" : visiblePlans.length === 2 ? "max-w-3xl lg:max-w-5xl" : "max-w-5xl";
// With one offer on sale there is nothing to choose between and nothing to be
// the best value of, so the comparison copy steps aside. Derived rather than
// hardcoded: bringing a plan back out of hiding restores it on its own.
const isSinglePlan = visiblePlans.length === 1;
// Looked up by id rather than taken from visiblePlans: the popup and the
// paywall trip offer it on their own, whether or not it is currently in the
// grid.
const packPlan = plans.find((plan) => plan.id === "pack");
const lifetimePlan = plans.find((plan) => plan.id === "lifetime" && !plan.hidden);
const monthlyPlan = plans.find((plan) => plan.id === "monthly" && !plan.hidden);

// Pricing card used across every purchase surface (paywall modal, pricing
// section, /pricing page). Laid out in four quiet bands — identity, price,
// action, then what you get — separated by hairlines rather than by boxes, so
// nothing is dropped to make it look calm.
function PlanCard({ plan, onBuy, loading, featured }) {
  return (
    <div className={`relative flex flex-col rounded-[22px] px-4 pb-4 pt-9 transition sm:rounded-[28px] sm:p-8 lg:p-5 ${featured ? "border border-white/25 bg-[#141417] shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)]" : "border border-white/10 bg-[#121214] shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]"}`}>
      {featured && !isSinglePlan && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#08080A] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm shadow-black/40">{t("Best value", "Meilleur choix")}</span>}

      <div className="flex items-start justify-between gap-1.5 sm:gap-3">
        <h3 className="text-base font-semibold tracking-tight text-[#EDE9E0] sm:text-xl">{plan.name}</h3>
        {plan.discountBadge && <span className="mt-0.5 flex-none rounded-full bg-emerald-400/15 px-1.5 py-0.5 text-[10px] font-semibold leading-4 text-emerald-300 sm:mt-1 sm:px-2.5 sm:text-[11px]">{plan.discountBadge}</span>}
      </div>
      {/* Reserved height for the longest description in the grid, so the rule,
          the price and the button land on the same line across the cards. A
          lone card has nothing to line up with, and the reserve then only
          pushes the rest of it further down the screen — same below sm, where
          the cards stack and each one is on its own. */}
      {plan.description && <p className={isSinglePlan ? "mt-2 text-[12.5px] leading-5 text-white/45 sm:text-sm sm:leading-6 lg:text-[13px] lg:leading-5" : "mt-2 text-[12.5px] leading-5 text-white/45 sm:min-h-[4.5rem] sm:text-sm sm:leading-6 lg:min-h-[2.5rem] lg:text-[13px] lg:leading-5"}>{plan.description}</p>}

      <div className="my-4 border-t border-dashed border-white/[0.14] sm:my-6 lg:my-4" />

      {/* A plan billed yearly leads with its monthly equivalent — that is the
          number a visitor compares against the monthly card. The amount really
          charged stays right underneath, never hidden. */}
      {/* Wraps on purpose: at 320px the period label sat 14px past the card and
          pushed the page into horizontal scroll. */}
      <div className="flex min-h-[3.25rem] flex-wrap items-end gap-x-1.5 gap-y-0.5 sm:min-h-0 sm:gap-x-2">
        <span className="text-[32px] font-bold leading-none tracking-[-0.05em] text-[#EDE9E0] sm:text-[52px] lg:text-[42px]">{plan.priceMonthly || plan.price}</span>
        <span className="pb-0.5 text-xs text-white/40 sm:pb-1 sm:text-sm">{plan.priceMonthly ? plan.priceMonthlyPeriod : plan.period}</span>
      </div>
      {/* Same reasoning as the description: the plans carry a different number
          of price lines, and without a floor the buttons sit at different
          heights. Dropped for a lone card and below sm, same as above. */}
      <div className={isSinglePlan ? "mt-3 space-y-1 lg:mt-2" : "mt-3 space-y-1 sm:min-h-[2.75rem] lg:mt-2 lg:min-h-[2rem]"}>
        {plan.billedNote && <p className="text-xs text-white/45 sm:text-sm">{plan.billedNote}</p>}
        {plan.originalPrice && <p className="text-xs text-white/35 line-through sm:text-sm">{plan.originalPrice}</p>}
        {plan.subPrice && <p className="text-xs font-medium text-emerald-300 sm:text-sm">{plan.subPrice}</p>}
      </div>

      <button
        onClick={() => onBuy(plan)}
        disabled={loading}
        className={`group mt-5 flex w-full items-center justify-center gap-1.5 rounded-full px-3 py-3 text-[13px] font-bold sm:mt-7 sm:gap-2 sm:px-5 sm:py-3.5 sm:text-sm lg:mt-4 lg:py-3 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 ${featured ? "bg-[#EDE9E0] text-[#0A0A0B] hover:bg-white" : "border border-white/15 bg-transparent text-[#EDE9E0] hover:border-white/35 hover:bg-white/[0.05]"}`}
      >
        {loading ? t("Loading…", "Chargement…") : plan.cta}
        <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" />
      </button>

      {/* Every feature, not the first four: the lifetime plan lists five and the
          fifth used to be dropped silently. */}
      <ul className="mt-6 space-y-3 sm:mt-8 sm:space-y-3.5 lg:mt-4 lg:grid lg:grid-cols-2 lg:gap-x-5 lg:gap-y-2 lg:space-y-0">
        {plan.features.map((feat) => (
          <li key={feat} className="flex items-start gap-2 text-[12.5px] leading-5 text-white/65 sm:gap-3 sm:text-sm sm:leading-6 lg:text-[13px] lg:leading-5">
            <Icon name="check" className="mt-1 h-4 w-4 flex-none text-white/70" /> {feat}
          </li>
        ))}
      </ul>
      {/* Both extras keep their colour — they are what separates the plans —
          but they now read as continuations of the feature list rather than as
          two boxes stacked at the bottom. */}
      {plan.perk && (
        <div className="mt-6 border-t border-dashed border-white/[0.14] pt-5 sm:mt-7 sm:pt-6 lg:mt-3 lg:pt-3">
          <div className="flex items-start gap-3">
            <Icon name="chat" className="mt-0.5 h-4 w-4 flex-none text-emerald-300" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-emerald-200">{plan.perk}</p>
              {plan.perkDesc && <p className="mt-1 text-[13px] leading-6 lg:text-xs lg:leading-[1.35] text-emerald-100/60">{plan.perkDesc}</p>}
            </div>
          </div>
        </div>
      )}
      {plan.bonus && (
        <div className="mt-6 border-t border-dashed border-white/[0.14] pt-5 sm:mt-7 sm:pt-6 lg:mt-2.5 lg:border-t-0 lg:pt-0">
          <div className="flex items-start gap-3">
            <Icon name="gift" className="mt-0.5 h-4 w-4 flex-none text-amber-300" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-amber-200">{plan.bonus}</p>
              {plan.bonusDesc && <p className="mt-1 text-[13px] leading-6 lg:text-xs lg:leading-[1.35] text-amber-100/60">{plan.bonusDesc}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Mounts Whop's embedded checkout INLINE (no redirect). Whop's loader.js scans the
// DOM (and observes mutations) for [data-whop-checkout-plan-id] and renders the
// checkout in an iframe inside this div. skip-redirect + on-complete keep the user
// on our page and let us react when payment succeeds.
const WHOP_LOADER_SRC = "https://js.whop.com/static/checkout/loader.js";
let whopCbSeq = 0;

function WhopCheckoutEmbed({ planId, prefillEmail, promoCode, onComplete }) {
  const cbName = useMemo(() => `moventoWhopComplete_${++whopCbSeq}`, []);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    window[cbName] = (pid, receiptId) => onCompleteRef.current?.(pid, receiptId);
    if (!document.querySelector(`script[src="${WHOP_LOADER_SRC}"]`)) {
      const s = document.createElement("script");
      s.src = WHOP_LOADER_SRC;
      s.async = true;
      s.defer = true;
      document.head.appendChild(s);
    }
    return () => { try { delete window[cbName]; } catch { window[cbName] = undefined; } };
  }, [cbName]);

  // Whop has used both spellings for the promo attribute across versions of the
  // loader. An attribute it does not read is inert; a missing one silently costs
  // the buyer the discount, so both are set.
  const promoAttrs = promoCode
    ? { "data-whop-checkout-promo-code": promoCode, "data-whop-checkout-promocode": promoCode }
    : {};

  return (
    <div
      key={planId}
      data-whop-checkout-plan-id={planId}
      data-whop-checkout-theme="light"
      data-whop-checkout-theme-accent-color="blue"
      data-whop-checkout-skip-redirect="true"
      data-whop-checkout-on-complete={cbName}
      {...(prefillEmail ? { "data-whop-checkout-prefill-email": prefillEmail } : {})}
      {...promoAttrs}
      className="min-h-[540px] w-full overflow-hidden rounded-2xl bg-white/[0.03]"
    />
  );
}

const cleanEmail = (v) => String(v).replace(/[\s­​-‍⁠﻿]/g, "").toLowerCase();

// Shown right after the embedded payment completes: the buyer's checkout email is
// their access key, so we confirm access on this device with a single field.
function CheckoutSuccess({ plan, prefillEmail, onUnlocked }) {
  // A pack purchase never grants full access, so waiting for hasAccess would
  // leave the buyer stuck on "activating" forever.
  const pack = plan?.id === "pack";
  const [email, setEmail] = useState(prefillEmail || "");
  const [st, setSt] = useState({ loading: false, error: "" });

  async function submit(e) {
    e.preventDefault();
    const norm = cleanEmail(email);
    if (!norm) { setSt({ loading: false, error: t("Enter the email used at checkout.", "Entre l'email utilisé au paiement.") }); return; }
    setSt({ loading: true, error: "" });
    try {
      const r = await fetch(`${API_BASE_URL}/api/verify-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: norm }),
      });
      const d = await r.json().catch(() => ({}));
      const recognised = d.hasAccess || Number(d.credits) > 0 || (Array.isArray(d.owned) && d.owned.length > 0);
      if (r.ok && recognised) { onUnlocked(norm, { pack: !d.hasAccess }); return; }
      setSt({ loading: false, error: t("Access is activating — this can take a moment. Retry in a few seconds.", "L'accès s'active — cela peut prendre un instant. Réessaie dans quelques secondes.") });
    } catch {
      setSt({ loading: false, error: t("Unable to verify right now. Please retry.", "Vérification impossible pour le moment. Réessaie.") });
    }
  }

  return (
    <div className="py-4 text-center">
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-400/[0.1]0 text-white"><Icon name="check" className="h-6 w-6" /></div>
      <h3 className="text-xl font-semibold tracking-tight text-[#EDE9E0]">{t("Payment confirmed 🎉", "Paiement confirmé 🎉")}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/55">{pack ? t(`Confirm the email you paid with, then pick your ${PROMPT_PACK_SIZE} prompts.`, `Confirme l'email utilisé au paiement, puis choisis tes ${PROMPT_PACK_SIZE} prompts.`) : t("Confirm the email you paid with to unlock the full catalog on this device.", "Confirme l'email utilisé au paiement pour débloquer tout le catalogue sur cet appareil.")}</p>
      <form onSubmit={submit} className="mx-auto mt-5 flex max-w-sm flex-col gap-3 sm:flex-row">
        <input autoFocus value={email} onChange={(e) => setEmail(e.target.value)} type="email" inputMode="email" autoComplete="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="email@example.com" className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#121214] px-4 py-3 text-sm text-[#EDE9E0] outline-none placeholder:text-white/40 focus:border-white/35 focus:ring-4 focus:ring-white/10" />
        <button type="submit" disabled={st.loading} className="rounded-2xl bg-[#08080A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#141418] hover:scale-[1.01] disabled:opacity-60">{st.loading ? t("Checking…", "Vérification…") : t("Unlock", "Débloquer")}</button>
      </form>
      {st.error && <p className="mx-auto mt-3 flex max-w-sm items-start gap-2 text-left text-xs leading-5 text-amber-300"><Icon name="alert" className="mt-0.5 h-3.5 w-3.5 flex-none" />{st.error}</p>}
    </div>
  );
}

// Full-screen overlay that runs the whole purchase ON-SITE: fetch the plan id,
// mount the embedded Whop checkout, then confirm access — never leaving the page.
// Falls back to the hosted redirect only when no plan_xxx id is configured.
function CheckoutOverlay({ plan, prefillEmail, onClose, onUnlocked }) {
  const [load, setLoad] = useState({ loading: true, planId: "", promoCode: "", error: "" });
  const [done, setDone] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoad({ loading: true, planId: "", promoCode: "", error: "" });
    (async () => {
      try {
        const r = await fetch(CHECKOUT_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: plan.id, ref: getRef() }),
        });
        let d = {};
        try { d = await r.json(); } catch { d = {}; }
        if (!r.ok) throw new Error(apiError(d, t(`Payment server error (${r.status}).`, `Erreur serveur paiement (${r.status}).`)));
        // Referred visitors go to Whop's hosted checkout even when the embed is
        // available: the affiliate code rides on the URL (a=...), which is the
        // only path that credits the commission for certain.
        if (d.checkoutUrl && getRef()) { track("checkout_redirected", { plan: plan.id, ...refProps() }); window.location.assign(d.checkoutUrl); return; }
        if (d.planId) { if (alive) setLoad({ loading: false, planId: d.planId, promoCode: d.promoCode || "", error: "" }); return; }
        // No embeddable plan id configured — gracefully use the hosted page.
        if (d.checkoutUrl) { window.location.assign(d.checkoutUrl); return; }
        throw new Error(t("Checkout is unavailable for this plan.", "Checkout indisponible pour cette offre."));
      } catch (e) {
        if (alive) setLoad({ loading: false, planId: "", promoCode: "", error: getCheckoutErrorMessage(e) });
      }
    })();
    return () => { alive = false; };
  }, [plan.id]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center px-3 py-4 sm:px-4 sm:py-8" onClick={onClose}>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }} transition={{ type: "spring", stiffness: 300, damping: 26 }} className="relative flex max-h-[94dvh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#121214] shadow-2xl shadow-black/60 sm:rounded-[32px]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-4 sm:px-6">
          <div>
            <p className="text-sm font-semibold text-[#EDE9E0]">{plan.name}</p>
            <p className="text-xs text-white/55">{plan.price} <span className="text-white/40">{plan.period}</span></p>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-[#121214] text-white/55 transition hover:border-white/25 hover:text-[#EDE9E0]"><Icon name="close" className="h-4 w-4" /></button>
        </div>
        <div className="overflow-y-auto overscroll-contain p-4 sm:p-6">
          {done ? (
            <CheckoutSuccess plan={plan} prefillEmail={prefillEmail} onUnlocked={onUnlocked} />
          ) : load.loading ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 text-center">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white/70" />
              <p className="text-sm text-white/55">{t("Loading secure checkout…", "Chargement du paiement sécurisé…")}</p>
            </div>
          ) : load.error ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 px-4 text-center">
              <div className="grid h-11 w-11 place-items-center rounded-full border border-red-400/25 bg-red-400/[0.08] text-red-300"><Icon name="alert" className="h-5 w-5" /></div>
              <p className="max-w-sm text-sm leading-6 text-red-300">{load.error}</p>
              <button onClick={() => setLoad((s) => ({ ...s }))} className="rounded-full bg-[#08080A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#141418]">{t("Retry", "Réessayer")}</button>
            </div>
          ) : (
            <WhopCheckoutEmbed planId={load.planId} prefillEmail={prefillEmail} promoCode={load.promoCode} onComplete={() => { track("checkout_completed", { plan: plan.id, ...refProps() }); setDone(true); }} />
          )}
        </div>
        {/* Stated, not silent: the buyer should see the discount is on before
            they read the total, and notice if it is not. */}
        {load.promoCode && !done && (
          <div className="flex items-center justify-center gap-1.5 border-t border-emerald-400/20 bg-emerald-400/[0.06] px-5 py-2.5 text-[11px] font-semibold text-emerald-300">
            <Icon name="check" className="h-3 w-3" /> {t(`Code ${load.promoCode} applied automatically`, `Code ${load.promoCode} appliqué automatiquement`)}
          </div>
        )}
        <div className="flex items-center justify-center gap-1.5 border-t border-white/[0.07] px-5 py-3 text-[11px] text-white/40">
          <Icon name="shield" className="h-3 w-3 text-white/45" /> {t("Secure payment via Whop", "Paiement sécurisé via Whop")}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Reassurance strip shown next to the buy buttons. Every claim here must stay true.
function Reassurance({ className = "" }) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] text-white/40 ${className}`}>
      <span className="flex items-center gap-1.5"><Icon name="shield" className="h-3 w-3 text-white/45" /> {t("Secure payment via Whop", "Paiement sécurisé via Whop")}</span>
      <span className="flex items-center gap-1.5"><Icon name="zap" className="h-3 w-3 text-amber-500" /> {t("Instant access", "Accès immédiat")}</span>
      <span className="flex items-center gap-1.5"><Icon name="check" className="h-3 w-3 text-emerald-500" /> {t("New prompts included", "Nouveaux prompts inclus")}</span>
    </div>
  );
}

function Icon({ name, className = "h-4 w-4" }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  let children = null;

  // Filled star: ratings read as solid marks, so it overrides the outline preset.
  if (name === "star") return <svg {...common} fill="currentColor" stroke="none"><path d="M12 2.6l2.9 5.88 6.5.95-4.7 4.58 1.11 6.47L12 17.43l-5.81 3.05 1.11-6.47-4.7-4.58 6.5-.95z" /></svg>;
  if (name === "menu") children = <><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></>;
  if (name === "search") children = <><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>;
  if (name === "copy") children = <><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>;
  if (name === "check") children = <path d="M20 6 9 17l-5-5" />;
  if (name === "sparkles") children = <><path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z" /></>;
  if (name === "play") children = <path d="M8 5v14l11-7z" />;
  if (name === "arrow") children = <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>;
  if (name === "zap") children = <path d="M13 2 3 14h8l-1 8 10-12h-8l1-8z" />;
  if (name === "code") children = <><path d="m16 18 6-6-6-6" /><path d="m8 6-6 6 6 6" /></>;
  if (name === "layers") children = <><path d="m12 2 10 6-10 6L2 8l10-6z" /><path d="m2 17 10 6 10-6" /><path d="m2 12 10 6 10-6" /></>;
  if (name === "alert") children = <><path d="M12 9v4" /><path d="M12 17h.01" /><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></>;
  if (name === "close") children = <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>;
  if (name === "shield") children = <><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></>;
  if (name === "lock") children = <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>;
  if (name === "gift") children = <><path d="M20 12v10H4V12" /><path d="M2 7h20v5H2z" /><path d="M12 22V7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></>;
  if (name === "download") children = <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" /></>;
  if (name === "chat") children = <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.9 8.9 0 0 1-4.1-1L3 20l1.1-4.6A8.4 8.4 0 0 1 3 11.4a8.4 8.4 0 0 1 8.5-8.4h.5a8.4 8.4 0 0 1 9 8.5z" />;
  if (name === "clock") children = <><circle cx="12" cy="12" r="9" /><path d="M12 7.2V12l3.2 2" /></>;

  return <svg {...common}>{children}</svg>;
}

// Used in the navbar, the mobile menu, every page header and the footer — one
// change here swaps the mark everywhere. The file is /public/logo.png, shared
// with the favicon, and versioned so a swap is not served from cache.
// Colour band sweeping across the top-right of a page: cool blue on the left,
// warm amber where it leaves the frame. Blurred hard and masked at both ends so
// it dissolves into the page instead of finishing on a line. Sits inside the
// pointer-events-none backdrop of whichever page mounts it.
function AuroraBand() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-x-[-30%] top-[-24%] h-[300px] -rotate-[20deg] opacity-[0.9] blur-[45px] sm:h-[420px] sm:blur-[70px]"
      style={{
        backgroundImage:
          "linear-gradient(94deg, rgba(24,40,150,0) 10%, rgba(40,72,235,0.55) 30%, rgba(88,84,240,0.6) 43%, rgba(176,104,180,0.55) 55%, rgba(238,126,80,0.68) 66%, rgba(255,170,74,0.82) 74%, rgba(255,226,158,0.72) 82%, rgba(255,226,158,0) 93%)",
        maskImage: "linear-gradient(to bottom, transparent 2%, #000 34%, #000 64%, transparent 98%)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 2%, #000 34%, #000 64%, transparent 98%)",
      }}
    />
  );
}

// Glowing tail of the hero headline: same font and weight as the rest of the
// sentence, tinted with a gradient clipped to the glyphs and haloed. Everything
// visual lives in .hl-mark (index.css) — including the fallback colour for
// engines without background-clip: text, and the reduced-motion variant, which
// keeps the look and drops the movement.
function Highlight({ children }) {
  return <span className="hl-mark">{children}</span>;
}

function Logo() {
  return (
    <span className="flex items-center gap-2.5 select-none">
      {/* The mark ships black and white, so no filter: greyscaling it now would
          only wash out the ribbon and lift the black tile off the page. */}
      <img src="/logo.png?v=3" alt="" aria-hidden="true" width="36" height="36" className="h-9 w-9 flex-none object-contain" />
      <span className="text-[22px] font-bold tracking-[-0.03em] text-[#EDE9E0]">Movento</span>
    </span>
  );
}

// Cheap, network-free placeholder shown until a card scrolls near the viewport.
function PreviewSkeleton({ item }) {
  return <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-20`} />;
}

// Local static poster (a frame grabbed at ~3s) for a video preview, generated
// into /public/posters. Only 12 of the 100 video previews actually have one, so
// this is a nicety on the <video>, never something the card depends on: the
// SPA rewrite answers a missing poster with index.html, which no browser can
// decode as an image, and the clip paints regardless.
// Shared by the card and the popup so the two can never disagree on what a
// given preview is.
// Stable, readable identifier for a prompt's shareable URL. Accents are stripped
// so "Jack — 3D Creator" becomes "jack-3d-creator".
const slugify = (value) =>
  String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
const promptPath = (item) => `/prompt/${slugify(item.title)}`;

// Query strings are matched too: CDNs hand out URLs like ".../clip.mp4?tag=29",
// which an endsWith check alone would misread as "not a video".
const hasPreviewExt = (url, exts) => Boolean(url) && exts.some((ext) => url.endsWith(ext) || url.includes(`${ext}?`));

// Some previews arrive through a resizing proxy that puts the real file in a
// query parameter and ends on the proxy's own options:
// "https://images.higgs.ai/?output=webp&url=<encoded original>&w=1280&q=85".
// The outer URL has no extension at all, so it has to be unwrapped first —
// otherwise the card silently falls back to the generated gradient.
const proxiedPreview = (url) => {
  const q = url ? url.indexOf("?") : -1;
  if (q < 0) return "";
  try {
    return new URLSearchParams(url.slice(q + 1)).get("url") || "";
  } catch {
    return "";
  }
};

const isVideoPreview = (url) => hasPreviewExt(url, [".mp4", ".webm", ".mov"]) || hasPreviewExt(proxiedPreview(url), [".mp4", ".webm", ".mov"]);
const isImagePreview = (url) => hasPreviewExt(url, [".png", ".jpg", ".jpeg", ".gif", ".webp"]) || hasPreviewExt(proxiedPreview(url), [".png", ".jpg", ".jpeg", ".gif", ".webp"]);
// .gif and .webp are deliberately absent: those two carry their own animation,
// and drifting a clip that is already moving reads as a glitch.
const isStillPreview = (url) => hasPreviewExt(url, [".png", ".jpg", ".jpeg"]) || hasPreviewExt(proxiedPreview(url), [".png", ".jpg", ".jpeg"]);

function posterFor(previewUrl) {
  // Name the poster after the real file, not after the proxy's option string.
  const source = proxiedPreview(previewUrl) || previewUrl;
  const base = decodeURIComponent(source.split("/").pop().split("?")[0]).replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
  return `/posters/${base}.jpg`;
}

function GeneratedPreview({ item }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className={`absolute -left-10 -top-10 h-56 w-56 rounded-full bg-gradient-to-br ${item.gradient} opacity-45 blur-3xl`} />
      <div className={`absolute -bottom-16 right-0 h-72 w-72 rounded-full bg-gradient-to-br ${item.gradient} opacity-35 blur-3xl`} />
      <div className="absolute inset-5 rounded-[22px] border border-white/70 bg-white/[0.04] p-4 backdrop-blur-xl shadow-sm">
        <div className="mb-4 flex items-center justify-between"><div className="h-3 w-20 rounded-full bg-white/15" /><div className="flex gap-1.5"><div className="h-2 w-2 rounded-full bg-white/15" /><div className="h-2 w-2 rounded-full bg-white/10" /><div className="h-2 w-2 rounded-full bg-white/[0.07]" /></div></div>
        <div className="grid h-[78%] grid-cols-[0.9fr_1.1fr] gap-3">
          <div className="space-y-3"><div className="h-5 w-24 rounded-full bg-white/15" /><div className="h-16 rounded-2xl bg-white/[0.06]" /><div className="h-3 w-28 rounded-full bg-white/10" /><div className="h-3 w-20 rounded-full bg-white/[0.06]" /><div className="mt-4 h-9 w-24 rounded-full bg-white/20" /></div>
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="relative rounded-[24px] border border-white/70 bg-white/[0.05] p-3 shadow-lg shadow-black/50">
            <div className="mb-3 h-4 w-24 rounded-full bg-white/15" />
            <div className="space-y-2">{[72, 48, 88, 58].map((w, i) => <div key={i} className="flex items-center gap-2"><div className="h-7 w-7 rounded-xl bg-white/[0.07]" /><div className="h-2 rounded-full bg-white/12" style={{ width: `${w}%` }} /></div>)}</div>
            <div className="absolute bottom-3 right-3 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2 text-[10px] text-white/55 backdrop-blur">Preview</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function PreviewCard({ item, badge, onClick, onPreview }) {
  const [previewFailed, setPreviewFailed] = useState(false);
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(false);
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const hasVideo = !previewFailed && isVideoPreview(item.preview);
  const hasImage = !previewFailed && isImagePreview(item.preview);
  // Every preview is shown whole. "cover" crops whatever does not match the
  // card's ratio, and what it crops is always the navbar and the footer of the
  // design — the two parts a buyer looks at first. An item can still ask for
  // previewFit: "cover" if its clip really is 1.35 and edge-to-edge.
  const fitClass = item.previewFit === "cover" ? "object-cover" : "object-contain";
  // Only drift the stills, and only while the card is actually on screen — an
  // off-screen animation still costs a compositor layer on every card.
  const driftClass = hasImage && visible && isStillPreview(item.preview) ? "mv-kenburns" : "";

  // Mobile killer: 40 autoplaying previews loading at once. Only mount the heavy
  // media once a card nears the viewport (inView, sticky), and track whether it is
  // currently on screen (visible) — so the first paint loads just the few cards
  // actually shown.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") { setInView(true); setVisible(true); return; }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setInView(true);
      setVisible(entry.isIntersecting);
    }, { rootMargin: "300px 0px", threshold: 0.01 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Play only the previews on screen, so a phone never decodes 40 clips at once.
  // Runs after render, so videoRef is always mounted when this fires.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (!visible) { v.pause?.(); return; }
    v.play?.().catch(() => {
      // Autoplay can still be refused — iOS Low Power Mode is the common one.
      // Nudge the playhead so the element paints a frame instead of staying an
      // empty rectangle, which is exactly the failure this card had on phones.
      try { if (v.readyState >= 1 && !v.currentTime) v.currentTime = 0.1; } catch { /* seek not ready */ }
    });
  }, [visible, inView]);

  // Every card opens the preview popup — the visitor sees the design play at a
  // usable size before deciding, and copies from there. Copying straight from
  // the grid gave no way to actually look at what you were taking.
  const handleClick = () => {
    if (onPreview) onPreview(item);
    else onClick?.();
  };

  return (
    <motion.div layout whileHover={{ y: -6 }} onClick={handleClick} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleClick(); } }} className="group relative cursor-pointer overflow-hidden rounded-[20px] border border-white/10 bg-[#121214] shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)]">
      {/* 1.35 is the measured ratio of the preview clips (11 of 12 land between
          1.333 and 1.379), so with object-contain the letterbox is under 2% on
          almost every card — and the odd 16:9 or portrait clip is shown whole
          instead of being cropped. The bars pick up the card's own surface. */}
      <div ref={containerRef} className="relative aspect-[1.35] overflow-hidden bg-[#0B0B0D]">
      {/* One <video> for every viewport. Phones used to get a separate path —
          the static poster instead of the clip, to save bandwidth — but with a
          poster missing for 88 of the 100 clips that path degraded to an empty
          rectangle on real devices, so the gallery simply had no previews on
          mobile. Streaming the on-screen clips costs data; showing nothing
          costs the sale. The IntersectionObserver above still keeps it to the
          two or three cards actually on screen. */}
        {!inView ? <PreviewSkeleton item={item} /> : hasVideo ? <video ref={videoRef} src={item.preview} poster={posterFor(item.preview)} className={`h-full w-full ${fitClass} transition duration-500`} style={{ objectPosition: item.previewPosition || "center" }} autoPlay loop muted playsInline preload="metadata" onError={() => setPreviewFailed(true)} /> : hasImage ? <img className={`h-full w-full ${fitClass} ${driftClass} transition duration-500`} style={{ objectPosition: item.previewPosition || "center" }} src={item.preview} alt={`${item.title} preview`} loading="lazy" decoding="async" onError={() => setPreviewFailed(true)} /> : <GeneratedPreview item={item} />}
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-4 sm:py-3.5">
        <div className="min-w-0">
          <h3 className="truncate text-[13.5px] font-semibold tracking-tight text-[#EDE9E0] sm:text-[15px]">{item.title}</h3>
          <p className="mt-0.5 truncate text-[11px] text-white/40 sm:text-xs">{item.category}</p>
        </div>
        {badge}
      </div>
    </motion.div>
  );
}

function extractPrompt(md) {
  const heading = md.match(/^##\s*.*Prompt\s*$/im);
  if (!heading || heading.index === undefined) return md.trimEnd();
  let after = md.slice(heading.index + heading[0].length);
  const end = after.indexOf("* * *");
  if (end >= 0) after = after.slice(0, end);
  return after
    .replace(/^\s*\n/, "")
    .replace(/\n\*?Generated by MotionSites Export Tool\*?[\s\S]*$/g, "")
    .replace(/\n---\s*$/g, "")
    .replace(/^```(?:text)?\s*\n/i, "")
    .replace(/\n```\s*$/g, "")
    .trimEnd();
}

function validatePlanId(planId) {
  return visiblePlans.some((plan) => plan.id === planId);
}

function getCheckoutErrorMessage(error) {
  if (error?.name === "TypeError") {
    return t("The Whop payment service cannot be reached. Check the Whop checkout links in the Vercel variables.", "Le service de paiement Whop n'est pas joignable. Vérifie les liens de checkout Whop dans les variables Vercel.");
  }
  return error?.message || t("Unable to start the payment right now.", "Impossible de lancer le paiement pour le moment.");
}

function getStoredAccessEmail() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("movento_access_email") || "";
}

function getStoredLeadEmail() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("movento_lead_email") || "";
}

function fetchPromptText(item, email) {
  return fetch(`${API_BASE_URL}/api/prompt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file: item.file, email }),
  }).then(async (response) => {
    if (!response.ok) throw new Error("Prompt not found");
    const data = await response.json();
    return data.prompt;
  });
}

async function copyTextToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    try {
      return document.execCommand("copy");
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

function runSelfTests() {
  console.assert(validatePlanId("monthly"), "monthly is on sale again and must be purchasable");
  console.assert(!validatePlanId("yearly"), "yearly is retired and should not be purchasable");
  console.assert(validatePlanId("lifetime"), "lifetime should be valid");
  console.assert(!validatePlanId("weekly"), "weekly should be invalid");
  // On sale in the grid while the kill switch is on, and off it entirely when
  // it is not — the card and the checkout must never disagree.
  console.assert(validatePlanId("pack") === PROMPT_PACK_ENABLED, "the pack must be purchasable exactly when it is enabled");
  console.assert(plans.some((plan) => plan.id === "pack"), "the prompt pack must stay defined");
  console.assert(extractPrompt("# Test\n\n## Prompt\nhello\n* * *\nfooter") === "hello", "extractPrompt should parse prompt block");
  console.assert(extractPrompt("plain text") === "plain text", "extractPrompt should fallback to full markdown");
}

if (typeof window !== "undefined" && !window.__MOVENTO_TESTS_RAN__) {
  window.__MOVENTO_TESTS_RAN__ = true;
  runSelfTests();
}

export default function MoventoSite() {
  const [query, setQuery] = useState("");
  const [copiedCard, setCopiedCard] = useState("");
  const [copyError, setCopyError] = useState("");
  const [unlockNotice, setUnlockNotice] = useState("");
  const [accessEmail, setAccessEmail] = useState(getStoredAccessEmail);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  // Prompts bought one at a time, and purchases not yet spent on one.
  const [ownedPrompts, setOwnedPrompts] = useState(() => new Set());
  const [promptCredits, setPromptCredits] = useState(0);
  const [accessStatus, setAccessStatus] = useState({ loading: false, message: "", error: "" });
  const [checkoutPlan, setCheckoutPlan] = useState(null); // plan being purchased in the embedded overlay
  const [leadEmail, setLeadEmail] = useState(getStoredLeadEmail);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [pendingFreeItem, setPendingFreeItem] = useState(null);
  const [leadEmailInput, setLeadEmailInput] = useState("");
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [previewItem, setPreviewItem] = useState(null); // prompt preview popup

  // Each prompt still has its own /prompt/<slug> address, so the URL bar can be
  // shared even without a copy button. Opening the popup pushes that URL and
  // closing it puts the gallery back, so the back button closes the popup
  // rather than leaving the site.
  const openPreview = (item) => {
    setPreviewItem(item);
    if (item && typeof window !== "undefined") window.history.pushState({}, "", promptPath(item));
  };
  const closePreview = () => {
    setPreviewItem(null);
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/prompt/")) {
      window.history.pushState({}, "", "/");
    }
  };

  useEffect(() => {
    const syncFromUrl = () => {
      const slug = (window.location.pathname.match(/^\/prompt\/([^/?#]+)/) || [])[1];
      setPreviewItem(slug ? availablePrompts.find((p) => slugify(p.title) === decodeURIComponent(slug).toLowerCase()) || null : null);
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  const isSuccessPage = typeof window !== "undefined" && window.location.pathname === "/success";
  const isMentionsPage = typeof window !== "undefined" && window.location.pathname === "/mentions-legales";
  const isPricingPage = typeof window !== "undefined" && window.location.pathname === "/pricing";
  const isSubscriptionPage = typeof window !== "undefined" && window.location.pathname === "/subscription";
  const isAdminPage = typeof window !== "undefined" && window.location.pathname === "/admin";
  const isTikTokPage = typeof window !== "undefined" && window.location.pathname === "/tiktok";
  const isChoosePage = typeof window !== "undefined" && window.location.pathname === "/choose";

  useEffect(() => {
    const savedEmail = getStoredAccessEmail();
    if (!savedEmail) return;

    verifyAccess(savedEmail, { silent: true });
  }, []);

  useEffect(() => {
    if (!isSuccessPage || typeof window === "undefined") return;

    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (!sessionId) return;

    async function confirmCheckoutSession() {
      setAccessStatus({ loading: true, message: t("Confirming your Whop payment…", "Confirmation du paiement Whop…"), error: "" });

      try {
        const response = await fetch(`${API_BASE_URL}/api/checkout-session?session_id=${encodeURIComponent(sessionId)}`);
        const data = await response.json();

        if (!response.ok || !data.hasAccess) throw new Error(apiError(data, t("Payment not confirmed.", "Paiement non confirmé.")));

        window.localStorage.setItem("movento_access_email", data.email);
        setAccessEmail(data.email);
        setHasPremiumAccess(true);
        setAccessStatus({ loading: false, message: `Accès premium activé pour ${data.email}.`, error: "" });
      } catch (error) {
        console.error("Erreur confirmation paiement", error);
        setAccessStatus({ loading: false, message: "", error: error.message || "Impossible de confirmer le paiement." });
      }
    }

    confirmCheckoutSession();
  }, [isSuccessPage]);

  const filtered = useMemo(() => {
    // availablePrompts is already in display order: live-demo cards first,
    // then newest-first (new entries are added at the top of `prompts`).
    return availablePrompts.filter((p) =>
      `${p.title} ${p.category} ${p.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase()),
    );
  }, [query]);

  async function verifyAccess(email = accessEmail, options = {}) {
    // Emails never contain whitespace, so strip every whitespace/zero-width char
    // (mobile autocomplete often injects a non-breaking or zero-width space that trim() misses).
    const normalizedEmail = String(email).replace(/[\s\u00AD\u200B-\u200D\u2060\uFEFF]/g, "").toLowerCase();
    if (!normalizedEmail) {
      setAccessStatus({ loading: false, message: "", error: "Enter the email used at checkout." });
      return false;
    }

    if (!options.silent) {
      setAccessStatus({ loading: true, message: "", error: "" });
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/verify-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(apiError(data, t("Unable to verify access.", "Impossible de vérifier l'accès.")));

      setHasPremiumAccess(Boolean(data.hasAccess));
      setAccessEmail(normalizedEmail);
      const owned = Array.isArray(data.owned) ? data.owned : [];
      const credits = Number(data.credits) || 0;
      setOwnedPrompts(new Set(owned));
      setPromptCredits(credits);

      if (data.hasAccess) {
        window.localStorage.setItem("movento_access_email", normalizedEmail);
        // Only count a deliberate unlock, not the silent re-check on every load.
        if (!options.silent) track("access_unlocked");
        if (!options.silent) setAccessStatus({ loading: false, message: "Premium access activated on this device.", error: "" });
        return true;
      }

      // Someone who bought a single prompt has no full access, but the email is
      // still theirs and still unlocks what they paid for. Forgetting it here
      // would lock them out of the prompt they own on every reload.
      if (owned.length || credits) {
        window.localStorage.setItem("movento_access_email", normalizedEmail);
        if (!options.silent) track("single_access_recognised", { owned: owned.length, credits });
        if (!options.silent) {
          setAccessStatus({
            loading: false,
            message: credits
              ? t(`Purchase found — ${credits} prompt${credits > 1 ? "s" : ""} left to pick.`, `Achat trouvé — ${credits} prompt${credits > 1 ? "s" : ""} à choisir.`)
              : t("Your purchased prompts are unlocked on this device.", "Tes prompts achetés sont débloqués sur cet appareil."),
            error: "",
          });
        }
        return true;
      }

      window.localStorage.removeItem("movento_access_email");
      // A paying customer failing here is the outage signal worth watching.
      if (!options.silent) track("unlock_failed");
      if (!options.silent) setAccessStatus({ loading: false, message: "", error: `No payment found for "${normalizedEmail}". Make sure it matches your checkout email exactly.` });
      return false;
    } catch (error) {
      console.error("Access verification error", error);
      if (!options.silent) setAccessStatus({ loading: false, message: "", error: error.message || "Unable to verify access." });
      return false;
    }
  }

  function reportCopyError(error) {
    console.error("Prompt copy error", error);
    setCopiedCard("Error");
    setTimeout(() => setCopiedCard(""), 1600);

    const name = error?.name || "";
    const msg = String(error?.message || "");
    let message;
    if (msg === "Prompt not found") {
      message = t("Prompt not found on the server (404). This is not your clipboard — please let us know.", "Prompt introuvable sur le serveur (erreur 404). Ce n'est pas votre presse-papiers — signalez-le nous.");
    } else if (name === "TypeError" || msg.toLowerCase().includes("fetch") || msg.toLowerCase().includes("network")) {
      message = t("Cannot reach the server. Check your connection and try again.", "Connexion au serveur impossible. Vérifiez votre réseau et réessayez.");
    } else {
      message = `Copie bloquée par votre navigateur (${name || "NotAllowedError"}). Réessayez, ou copiez depuis un autre navigateur (Chrome).`;
    }
    setCopyError(message);
    setTimeout(() => setCopyError(""), 8000);
  }

  async function fetchAndCopyPrompt(item, emailOverride) {
    const email = emailOverride || accessEmail || leadEmail;
    setCopyError("");
    const textPromise = fetchPromptText(item, email);
    textPromise.catch(() => {}); // avoid unhandled-rejection noise

    // Primary: ClipboardItem with a Promise keeps the click gesture valid across
    // the network round-trip (Safari/iOS/Chrome). Must run synchronously from the
    // click — no await before it.
    try {
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard && navigator.clipboard.write) {
        await navigator.clipboard.write([
          new ClipboardItem({ "text/plain": textPromise.then((t) => new Blob([t], { type: "text/plain" })) }),
        ]);
        track("prompt_copied", { prompt: item.title, category: item.category });
        setCopiedCard(item.title);
        setTimeout(() => setCopiedCard(""), 1600);
        return;
      }
    } catch {
      // Fall through — resolve the text to tell a 404 apart from a clipboard block.
    }

    let text;
    try {
      text = await textPromise;
    } catch (error) {
      reportCopyError(error); // server "Prompt not found" / network
      return;
    }

    try {
      const copied = await copyTextToClipboard(text);
      if (!copied) throw Object.assign(new Error("Copy denied by browser"), { name: "NotAllowedError" });
      track("prompt_copied", { prompt: item.title, category: item.category });
      setCopiedCard(item.title);
      setTimeout(() => setCopiedCard(""), 1600);
    } catch (error) {
      reportCopyError(error); // clipboard blocked by browser
    }
  }

  async function copyPrompt(item) {
    const isFree = FREE_PROMPT_FILES.has(item.file);

    // Already bought on its own: the server serves it like any unlocked prompt.
    if (!isFree && !hasPremiumAccess && ownedPrompts.has(item.file)) {
      await fetchAndCopyPrompt(item);
      return;
    }

    // Paid for a pack but has not picked yet: take them to the selection screen
    // with this prompt already ticked, rather than spending a credit on a single
    // click. A credit is spent for good and there is no way back from a misclick.
    if (!isFree && !hasPremiumAccess && promptCredits > 0) {
      window.location.assign(`/choose?pick=${encodeURIComponent(slugify(item.title))}`);
      return;
    }

    if (!isFree && !hasPremiumAccess) {
      track("paywall_shown", { prompt: item.title, category: item.category, ...refProps() });
      // The offer lives on one page. A modal put a second, slightly different
      // pricing surface in front of the buyer and left them on a page they then
      // had to leave anyway.
      window.location.assign(`/pricing?from=${encodeURIComponent(slugify(item.title))}`);
      return;
    }

    if (isFree && !accessEmail && !leadEmail) {
      // The preview popup no longer closes itself on copy, so close it here:
      // this is the one branch that answers with another modal, and two of them
      // stacked is a dead end — the lead form sits under the preview.
      closePreview();
      setPendingFreeItem(item);
      setShowLeadModal(true);
      return;
    }

    if (item.link) {
      window.open(item.link, "_blank", "noopener,noreferrer");
      return;
    }

    await fetchAndCopyPrompt(item);
  }

  async function submitLeadEmail(e) {
    e.preventDefault();
    const email = leadEmailInput.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;

    setLeadSubmitting(true);
    try {
      await fetch(`${API_BASE_URL}/api/collect-lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, prompt: pendingFreeItem?.title || null, ref: getRef() }),
      });
    } catch (_) {}

    window.localStorage.setItem("movento_lead_email", email);
    setLeadEmail(email);
    setShowLeadModal(false);
    setLeadSubmitting(false);

    if (pendingFreeItem) {
      await fetchAndCopyPrompt(pendingFreeItem, email);
      setPendingFreeItem(null);
    }
  }

  // Opens the on-site embedded checkout overlay (no redirect). The overlay itself
  // fetches the plan id and mounts the Whop checkout inline.
  function startCheckout(plan) {
    track("checkout_started", { plan: plan.id, ...refProps() });
    setCheckoutPlan(plan);
  }

  // Called once the buyer confirms their access email after paying inline.
  function handleUnlocked(email, info = {}) {
    window.localStorage.setItem("movento_access_email", email);
    setAccessEmail(email);
    setCheckoutPlan(null);
    setPaywallItem(null);
    // A pack buyer must not be marked as having the catalogue, and has nothing
    // unlocked yet — take them to the screen where they pick their prompts.
    if (info.pack) {
      track("pack_purchased");
      window.location.assign("/choose");
      return;
    }
    setHasPremiumAccess(true);
    track("access_unlocked");
  }

  if (isAdminPage) return <AdminLeadsPage />;
  if (isMentionsPage) return <MentionsLegales />;
  if (isPricingPage) return <PricingPage />;
  if (isTikTokPage) return <TikTokPage />;
  if (isChoosePage) return <ChoosePromptsPage />;
  if (isSubscriptionPage) return <SubscriptionPage />;
  if (isSuccessPage) return <SuccessPage />;

  return (
    <main className="min-h-screen overflow-hidden bg-[#0A0A0B] text-[#EDE9E0]">
      <AnimatePresence>
        {showLeadModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setShowLeadModal(false)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="relative w-full max-w-md rounded-[28px] border border-white/10 bg-[#121214] p-8 shadow-2xl shadow-black/60" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setShowLeadModal(false)} className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-[#121214] text-white/40 transition hover:text-[#EDE9E0]"><Icon name="close" className="h-4 w-4" /></button>
              <div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-[#EDE9E0] shadow-none"><Icon name="sparkles" className="h-5 w-5" /></div>
              <h2 className="text-2xl font-bold tracking-tight text-[#EDE9E0]">{t("Access free prompts", "Accéder aux prompts gratuits")}</h2>
              <p className="mt-2 text-sm leading-6 text-white/55">{t("Enter your email to copy free prompts. No spam, ever.", "Entrez votre email pour copier les prompts gratuits. Jamais de spam.")}</p>
              <form onSubmit={submitLeadEmail} className="mt-6 flex flex-col gap-3">
                <input autoFocus value={leadEmailInput} onChange={(e) => setLeadEmailInput(e.target.value)} type="email" required placeholder="you@example.com" className="w-full rounded-2xl border border-white/10 bg-[#121214] px-4 py-3 text-sm text-[#EDE9E0] outline-none placeholder:text-white/40 focus:border-white/35 focus:ring-4 focus:ring-white/10" />
                <button type="submit" disabled={leadSubmitting} className="w-full rounded-2xl bg-[#08080A] py-3 text-sm font-semibold text-white transition hover:bg-[#141418] hover:scale-[1.01] disabled:opacity-60">{leadSubmitting ? t("Just a moment...", "Un instant...") : t("Copy free prompt →", "Copier le prompt gratuit →")}</button>
              </form>
              <p className="mt-4 text-center text-xs text-white/40">{t("Your data will never be shared.", "Vos données ne seront jamais partagées.")}</p>
              <div className="mt-5 border-t border-white/[0.07] pt-4 text-center">
                <button onClick={() => { setShowLeadModal(false); setShowUnlockModal(true); }} className="text-xs text-white/40 transition hover:text-white/75">{t("Already purchased? Unlock your access", "Déjà client ? Déverrouille ton accès")}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {checkoutPlan && (
          <CheckoutOverlay
            plan={checkoutPlan}
            prefillEmail={leadEmail || accessEmail}
            onClose={() => setCheckoutPlan(null)}
            onUnlocked={handleUnlocked}
          />
        )}
        {showUnlockModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setShowUnlockModal(false)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="relative w-full max-w-md rounded-[28px] border border-white/10 bg-[#121214] p-8 shadow-2xl shadow-black/60" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setShowUnlockModal(false)} className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-[#121214] text-white/40 transition hover:text-[#EDE9E0]"><Icon name="close" className="h-4 w-4" /></button>
              <div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.05] text-white/70"><Icon name="lock" className="h-5 w-5" /></div>
              <h2 className="text-2xl font-bold tracking-tight text-[#EDE9E0]">{t("Unlock your access", "Déverrouille ton accès")}</h2>
              <p className="mt-2 text-sm leading-6 text-white/55">{t("For customers who already purchased. Enter the email used at checkout.", "Réservé aux clients ayant déjà payé. Entre l'email utilisé lors de l'achat.")}</p>
              <form onSubmit={async (e) => { e.preventDefault(); const ok = await verifyAccess(); if (ok) setShowUnlockModal(false); }} className="mt-6 flex flex-col gap-3">
                <input autoFocus value={accessEmail} onChange={(e) => setAccessEmail(e.target.value)} type="email" inputMode="email" autoComplete="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} required placeholder="email@example.com" className="w-full rounded-2xl border border-white/10 bg-[#121214] px-4 py-3 text-sm text-[#EDE9E0] outline-none placeholder:text-white/40 focus:border-white/35 focus:ring-4 focus:ring-white/10" />
                <button type="submit" disabled={accessStatus.loading} className="w-full rounded-2xl bg-[#08080A] py-3 text-sm font-semibold text-white transition hover:bg-[#141418] hover:scale-[1.01] disabled:opacity-60">{accessStatus.loading ? t("Verifying...", "Vérification...") : t("Unlock", "Déverrouiller")}</button>
              </form>
              {accessStatus.error && <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-red-300"><Icon name="alert" className="mt-0.5 h-3.5 w-3.5 flex-none" />{accessStatus.error}</p>}
              <div className="mt-5 border-t border-white/[0.07] pt-4 text-center">
                <a href="/pricing" className="text-xs text-white/40 transition hover:text-white/75">{t("Not a customer yet? See the offer", "Pas encore client ? Voir l'offre")}</a>
              </div>
            </motion.div>
          </motion.div>
        )}
        {previewItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" onClick={closePreview}>
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#121214] shadow-2xl shadow-black/60" onClick={(e) => e.stopPropagation()}>
              <button onClick={closePreview} className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur transition hover:bg-black/80"><Icon name="close" className="h-4 w-4" /></button>
              {/* The popup now opens for every card, so it has to render whatever
                  the preview happens to be — clip, animated image, or nothing. */}
              {isVideoPreview(previewItem.preview) ? (
                <video key={previewItem.file} src={previewItem.preview} poster={posterFor(previewItem.preview)} autoPlay loop muted playsInline className="w-full flex-none bg-[#0B0B0D] object-contain" style={{ aspectRatio: "1.35", objectPosition: previewItem.previewPosition || "center" }} />
              ) : isImagePreview(previewItem.preview) ? (
                <img key={previewItem.file} src={previewItem.preview} alt={`${previewItem.title} preview`} className="w-full flex-none bg-[#0B0B0D] object-contain" style={{ aspectRatio: "1.35", objectPosition: previewItem.previewPosition || "center" }} />
              ) : (
                <div className="relative w-full flex-none overflow-hidden bg-[#0B0B0D]" style={{ aspectRatio: "1.35" }}><GeneratedPreview item={previewItem} /></div>
              )}
              {/* Everything under the media scrolls: four steps plus the title
                  row overflow a short phone in landscape, and the popup itself
                  is clipped to 92dvh. */}
              <div className="flex min-h-0 flex-col overflow-y-auto">
                <div className="flex items-center justify-between gap-3 p-5">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-[#EDE9E0]">{previewItem.title}</h3>
                    <p className="mt-0.5 text-xs text-white/40">{previewItem.category}</p>
                    {/* Deliberately not `link`, which REPLACES the copy action.
                        A demo is the finished site to look at before copying —
                        the prompt still has to end up on the clipboard. */}
                    {SHOW_DEMO_LINKS && previewItem.demo && (
                      <a href={previewItem.demo} target="_blank" rel="noopener noreferrer" onClick={() => track("prompt_demo_opened", { prompt: previewItem.title, category: previewItem.category })} className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white/70 transition hover:border-white/25 hover:text-[#EDE9E0]">
                        <Icon name="arrow" className="h-3 w-3 -rotate-45" /> {t("See the live site", "Voir le site en ligne")}
                      </a>
                    )}
                  </div>
                  {/* Copying no longer closes the popup. The visitor came here to
                      read the preview; throwing them back to the grid the moment
                      they take the prompt loses their place for nothing. The
                      button confirms in place and the toast says what happened. */}
                  <button onClick={() => copyPrompt(previewItem)} className={`flex flex-none items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold transition hover:scale-[1.02] ${copiedCard === previewItem.title ? "bg-emerald-400/15 text-emerald-300" : "bg-[#08080A] text-white hover:bg-[#141418]"}`}>
                    {copiedCard === previewItem.title ? <><Icon name="check" className="h-4 w-4" /> {t("Copied", "Copié")}</> : hasPremiumAccess || ownedPrompts.has(previewItem.file) ? <><Icon name="copy" className="h-4 w-4" /> {t("Copy", "Copier")}</> : FREE_PROMPT_FILES.has(previewItem.file) ? <><Icon name="gift" className="h-4 w-4" /> {t("Copy for free", "Copier gratuitement")}</> : promptCredits > 0 ? <><Icon name="gift" className="h-4 w-4" /> {t("Choose it", "Le choisir")}</> : <><Icon name="lock" className="h-4 w-4" /> {t("Unlock", "Débloquer")}</>}
                  </button>
                </div>
                {/* Two ways in, in the order the visitor should weigh them:
                    the one payment first, the subscription second. Only for a
                    locked prompt: someone with full access, a free prompt, a
                    prompt already bought or an unspent purchase all have
                    nothing to buy here. */}
                {!hasPremiumAccess && !FREE_PROMPT_FILES.has(previewItem.file) && !ownedPrompts.has(previewItem.file) && promptCredits === 0 && (lifetimePlan || monthlyPlan || (PROMPT_PACK_ENABLED && packPlan)) && (
                  <div className="space-y-2.5 border-t border-white/[0.07] px-5 pb-4 pt-4">
                    {lifetimePlan && (
                      <button
                        onClick={() => { track("lifetime_offer_clicked", { prompt: previewItem.title, category: previewItem.category, source: "prompt_popup" }); startCheckout(lifetimePlan); }}
                        disabled={Boolean(checkoutPlan)}
                        // The launch banner's gradient, so the best offer reads
                        // as the same thing the visitor has already seen selling
                        // it at the bottom of every page.
                        className="group flex w-full items-center justify-between gap-3 rounded-2xl bg-[linear-gradient(100deg,#ef6f5c_0%,#e0625f_14%,#5f6ff2_44%,#7a63ef_62%,#a874f0_80%,#d79bf5_100%)] px-4 py-3 text-left transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span className="min-w-0">
                          <span className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{t("Unlock every prompt", "Débloquer tous les prompts")}</span>
                            <span className="flex-none rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">{t("Best value", "Le plus avantageux")}</span>
                          </span>
                          <span className="mt-0.5 block text-xs leading-5 text-white/85">{t(`All ${availablePrompts.length} prompts + free ebook + 7/7 support.`, `Les ${availablePrompts.length} prompts + ebook offert + support 7j/7.`)}</span>
                        </span>
                        <span className="flex flex-none items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#0A0A0B]">
                          {eur(PRICE_LIFETIME)}
                          <Icon name="arrow" className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                        </span>
                      </button>
                    )}
                    {monthlyPlan && (
                      <button
                        onClick={() => { track("monthly_offer_clicked", { prompt: previewItem.title, category: previewItem.category, source: "prompt_popup" }); startCheckout(monthlyPlan); }}
                        disabled={Boolean(checkoutPlan)}
                        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/[0.09] bg-white/[0.03] px-4 py-3 text-left transition hover:border-white/25 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span className="min-w-0">
                          <span className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-[#EDE9E0]">{t("Monthly access", "Accès mensuel")}</span>
                            <span className="flex-none rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/45">{t("Flexible", "Flexible")}</span>
                          </span>
                          <span className="mt-0.5 block text-xs leading-5 text-white/45">{t("The same full catalogue. Stop whenever you like.", "Le même catalogue complet. Tu arrêtes quand tu veux.")}</span>
                        </span>
                        {/* The period is part of the price here, not a detail:
                            21,99€ sitting alone next to 89€ reads as the cheaper
                            one-off rather than as a recurring charge. */}
                        <span className="flex-none rounded-full bg-[#EDE9E0] px-4 py-2 text-sm font-bold text-[#0A0A0B]">
                          {eur(PRICE_MONTHLY)}<span className="font-semibold text-[#0A0A0B]/55">{t("/mo", "/mois")}</span>
                        </span>
                      </button>
                    )}
                    {PROMPT_PACK_ENABLED && packPlan && (
                      <button
                        onClick={() => { track("prompt_pack_offer_clicked", { prompt: previewItem.title, category: previewItem.category }); startCheckout(packPlan); }}
                        disabled={Boolean(checkoutPlan)}
                        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/[0.09] bg-white/[0.03] px-4 py-3 text-left transition hover:border-white/25 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <span className="min-w-0">
                          <span className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-[#EDE9E0]">{t(`Pack of ${PROMPT_PACK_SIZE} prompts`, `Pack de ${PROMPT_PACK_SIZE} prompts`)}</span>
                            <span className="flex-none rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/45">{t("Budget", "Éco")}</span>
                          </span>
                          <span className="mt-0.5 block text-xs leading-5 text-white/45">{t("This one and two more of your choice, yours forever.", "Celui-ci et deux autres de ton choix, à toi pour toujours.")}</span>
                        </span>
                        <span className="flex-none rounded-full bg-[#EDE9E0] px-4 py-2 text-sm font-bold text-[#0A0A0B]">{eur(PROMPT_PACK_PRICE)}</span>
                      </button>
                    )}
                  </div>
                )}
                {/* The one moment the visitor actually needs the instructions:
                    they are holding the prompt and have nowhere to put it. */}
                <div className="border-t border-white/[0.07] px-5 pb-5 pt-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">{t("How to use it", "Comment l'utiliser")}</p>
                  <ol className="mt-3 space-y-2.5">
                    {[
                      // Deliberately does not name the button: it reads "Copy",
                      // "Copy for free" or "Unlock" depending on the visitor.
                      t("Copy the prompt in one click — it goes to your clipboard.", "Copie le prompt en un clic — il part dans ton presse-papiers."),
                      t("Paste it into Lovable, v0, Bolt, Cursor or Claude.", "Colle-le dans Lovable, v0, Bolt, Cursor ou Claude."),
                      t("Let the AI generate the whole site.", "Laisse l'IA générer le site en entier."),
                      t("Then ask it for your changes: name, copy, images.", "Demande-lui ensuite tes modifications : nom, textes, images."),
                    ].map((step, i) => (
                      <li key={step} className="flex gap-3 text-sm leading-snug text-white/60">
                        <span className="mt-px grid h-5 w-5 flex-none place-items-center rounded-full bg-white/[0.07] text-[11px] font-semibold text-white/70">{i + 1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* One line, no buttons, gone in a second and a half. Above the checkout
          modal (z-70) so it is never the thing hidden behind something else,
          and clear of the fixed launch banner at the very bottom.
          pointer-events-none: it must never swallow a click meant for the
          popup it appears on top of. */}
      <AnimatePresence>
        {copiedCard && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none fixed inset-x-0 bottom-20 z-[80] flex justify-center px-4"
            role="status"
            aria-live="polite"
          >
            {/* Cream on dark, not another dark pill: it lands on top of the
                preview popup, whose card is #121214 — a #141418 toast over that
                is a two-value difference and reads as nothing at all. */}
            <span className="flex items-center gap-2 rounded-full bg-[#EDE9E0] px-4 py-2.5 text-sm font-semibold text-[#0A0A0B] shadow-[0_18px_44px_-16px_rgba(0,0,0,0.95)]">
              <Icon name="check" className="h-4 w-4" /> {t("Prompt copied", "Prompt copié")}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <AuroraBand />
        <div className="mv-aurora absolute left-1/2 top-[-30%] h-[620px] w-[900px] -translate-x-1/2 rounded-full bg-white/[0.045] blur-[150px]" />
        <div className="absolute inset-0 opacity-100" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.055) 1px, transparent 0)", backgroundSize: "38px 38px", maskImage: "radial-gradient(ellipse 80% 55% at 50% 0%, #000 30%, transparent 100%)", WebkitMaskImage: "radial-gradient(ellipse 80% 55% at 50% 0%, #000 30%, transparent 100%)" }} />
      </div>

      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium text-white/55 md:flex">
          <a href="#prompts" className="transition hover:text-[#EDE9E0]">Prompts</a>
          <a href="/pricing" className="transition hover:text-[#EDE9E0]">{t("Pricing", "Tarifs")}</a>
          <a href="/tiktok" className="transition hover:text-[#EDE9E0]">{t("Monetize TikTok", "Monétise TikTok")}</a>
          <a href="/subscription" className="transition hover:text-[#EDE9E0]">{t("My subscription", "Mon abonnement")}</a>
          <a href="#how" className="transition hover:text-[#EDE9E0]">{t("Guide", "Guide")}</a>
          <a href="#faq" className="transition hover:text-[#EDE9E0]">FAQ</a>
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <LangSwitch />
          <a href="/pricing" className="rounded-full border border-white/15 bg-[#08080A] px-5 py-2.5 text-sm font-semibold text-[#EDE9E0] transition hover:border-white/30 hover:bg-[#141418]">{t("Get started", "Commencer")}</a>
        </div>
        <button onClick={() => setMobileMenuOpen((open) => !open)} aria-label={t("Menu", "Menu")} aria-expanded={mobileMenuOpen} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-[#121214] text-white/60 shadow-sm transition hover:border-white/25 md:hidden">
          <Icon name={mobileMenuOpen ? "close" : "menu"} className="h-5 w-5" />
        </button>
        {/* Full-height panel sliding in from the right, rather than a dropdown
            under the header: on a phone the links get room to breathe and the
            call to action sits where the thumb already is. */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
              />
              <motion.nav
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                className="fixed right-0 top-0 z-50 flex h-[100dvh] w-[78%] max-w-xs flex-col border-l border-white/10 bg-[#131315] md:hidden"
              >
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label={t("Close", "Fermer")}
                  className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/[0.06] text-white transition hover:bg-white/[0.14]"
                >
                  <Icon name="close" className="h-4 w-4" />
                </button>

                <div className="flex flex-col gap-1 px-6 pt-24">
                  {[
                    { href: "#prompts", label: "Prompts" },
                    { href: "/pricing", label: t("Pricing", "Tarifs") },
                    { href: "/tiktok", label: t("Monetize TikTok", "Monétise TikTok") },
                    { href: "/subscription", label: t("My subscription", "Mon abonnement") },
                    { href: "#how", label: t("Guide", "Guide") },
                    { href: "#faq", label: "FAQ" },
                  ].map((link, i) => (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      initial={{ opacity: 0, x: 22 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: 0.1 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                      className="rounded-2xl px-2 py-3.5 text-lg font-medium text-white/70 transition hover:bg-white/[0.05] hover:text-[#EDE9E0]"
                    >
                      {link.label}
                    </motion.a>
                  ))}
                </div>

                <div className="mt-auto px-6 pb-10">
                  <div className="mb-4 flex justify-start"><LangSwitch /></div>
                  <a
                    href="/pricing"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-full bg-[#EDE9E0] px-5 py-3.5 text-center text-sm font-bold text-[#0A0A0B] transition hover:bg-white"
                  >
                    {t("Get started", "Commencer")}
                  </a>
                </div>
              </motion.nav>
            </>
          )}
        </AnimatePresence>
      </header>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-12 pb-4 text-center lg:px-8 lg:pt-20">
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }} className="mx-auto max-w-3xl text-4xl font-bold leading-[1.02] tracking-[-0.04em] text-[#EDE9E0] md:text-6xl">
          {t("Premium websites,", "Des sites premium,")}
          {/* Narrow screens otherwise strand the first word of the highlighted
              phrase at the end of the previous line. */}
          <br className="sm:hidden" />{" "}
          <Highlight>{t("one prompt away", "en un seul prompt")}</Highlight>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.12 }} className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/55 md:text-lg">
          {t("Copy a prompt, paste it into Lovable, v0, Bolt, Cursor, Claude or Shopify, and ship a modern site in minutes. No code.", "Copie un prompt, colle-le dans Lovable, v0, Bolt, Cursor, Claude ou Shopify, et obtiens un site moderne en quelques minutes. Sans coder.")}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.19 }} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href="#prompts" className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#08080A] px-6 py-3 text-sm font-semibold text-[#EDE9E0] transition hover:border-white/30 hover:bg-[#141418]">{t("Browse the prompts", "Voir les prompts")} <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-0.5" /></a>
          <a href="/pricing" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#121214] px-6 py-3 text-sm font-semibold text-white/75 transition hover:border-white/25 hover:text-[#EDE9E0]">{t("See pricing", "Voir les tarifs")}</a>
        </motion.div>
      </section>

      <section id="prompts" className="relative z-10 mx-auto max-w-[1560px] px-6 pt-10 pb-24 lg:px-8 lg:pt-14">
        {hasPremiumAccess ? (
          <div className="mb-8 flex items-center gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.07] p-4 text-sm">
            <div className="grid h-8 w-8 flex-none place-items-center rounded-full bg-emerald-400/[0.1]0 text-white"><Icon name="check" className="h-4 w-4" /></div>
            <p className="text-white/75">{t("Premium access active", "Accès premium actif")} — <span className="text-white/40">{accessEmail}</span></p>
          </div>
        ) : (
          <button onClick={() => setShowUnlockModal(true)} className="mb-8 flex w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#121214] px-5 py-4 text-left shadow-sm transition hover:border-white/20 hover:shadow-md">
            <span className="flex items-center gap-3">
              <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-white/[0.05] text-white/70"><Icon name="lock" className="h-4 w-4" /></span>
              <span>
                <span className="block text-sm font-semibold text-[#EDE9E0]">{t("Already purchased?", "Déjà client ?")}</span>
                <span className="block text-xs text-white/55">{t("Unlock your access with your checkout email.", "Déverrouille ton accès avec ton email d'achat.")}</span>
              </span>
            </span>
            <span className="flex flex-none items-center gap-1.5 rounded-full bg-white/[0.05] px-3.5 py-2 text-xs font-semibold text-white/80">{t("Unlock", "Déverrouiller")} <Icon name="arrow" className="h-3.5 w-3.5" /></span>
          </button>
        )}
        {(accessStatus.message || accessStatus.error) && !isSuccessPage && <div className={`mb-8 flex items-start gap-3 rounded-2xl border p-4 text-sm leading-6 ${accessStatus.error ? "border-red-400/25 bg-red-400/[0.08] text-red-300" : "border-emerald-400/25 bg-emerald-400/[0.07] text-emerald-300"}`}><Icon name={accessStatus.error ? "alert" : "check"} className="mt-1 h-4 w-4 flex-none" /><p>{accessStatus.error || accessStatus.message}</p></div>}
        {unlockNotice && <div className="mb-8 flex items-start gap-3 rounded-2xl border border-white/12 bg-white/[0.05] p-4 text-sm leading-6 text-white/80"><Icon name="sparkles" className="mt-1 h-4 w-4 flex-none" /><p>{unlockNotice}</p></div>}
        {copyError && <div className="mb-8 flex items-start gap-3 rounded-2xl border border-red-400/25 bg-red-400/[0.08] p-4 text-sm leading-6 text-red-300"><Icon name="alert" className="mt-1 h-4 w-4 flex-none" /><p>{copyError}</p></div>}
        {/* Someone who paid for a prompt but has not picked one yet would
            otherwise land on a wall of locked cards with no idea the purchase
            is waiting for them. */}
        {promptCredits > 0 && !hasPremiumAccess && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.07] p-4 text-sm leading-6 text-emerald-300">
            <Icon name="gift" className="mt-1 h-4 w-4 flex-none" />
            <p>
              {promptCredits > 1
                ? t(`You have ${promptCredits} prompts left to pick.`, `Il te reste ${promptCredits} prompts à choisir.`)
                : t("You have one prompt left to pick.", "Il te reste un prompt à choisir.")}{" "}
              <a href="/choose" className="font-semibold text-emerald-200 underline underline-offset-4 transition hover:text-white">{t("Choose them now", "Les choisir maintenant")}</a>
              <span className="text-emerald-200/70">{t(" — or pick any prompt below.", " — ou clique sur un prompt ci-dessous.")}</span>
            </p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
          <AnimatePresence>
            {filtered.map((item) => {
              const isFree = FREE_PROMPT_FILES.has(item.file);
              const ownedAlone = ownedPrompts.has(item.file);
              const unlocked = hasPremiumAccess || isFree || ownedAlone;
              return (
                <motion.div key={item.title} layout initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }} className="relative">
                  <PreviewCard item={item} onClick={() => copyPrompt(item)} onPreview={openPreview} badge={
                    // Two cards per row on a phone leaves no space for a
                    // labelled pill, so below sm the badge keeps the icon and
                    // drops the word.
                    <span className={`flex flex-none items-center gap-1.5 rounded-full px-2 py-2 text-xs font-semibold transition sm:px-3.5 ${copiedCard === item.title ? "bg-emerald-400/15 text-emerald-300" : copiedCard === "Error" ? "bg-red-400/15 text-red-300" : !unlocked ? "border border-white/10 bg-white/[0.04] text-white/60 group-hover:border-white/25 group-hover:bg-white/[0.1] group-hover:text-white" : isFree && !hasPremiumAccess ? "bg-emerald-400/[0.1] text-emerald-300 group-hover:bg-emerald-600 group-hover:text-white" : "border border-white/10 bg-white/[0.06] text-white/80 group-hover:border-white/25 group-hover:bg-white/[0.12] group-hover:text-white"}`}>
                      {copiedCard === item.title ? <><Icon name="check" className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{t("Copied", "Copié")}</span></> : copiedCard === "Error" ? <><Icon name="alert" className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{t("Error", "Erreur")}</span></> : !unlocked && promptCredits > 0 ? <><Icon name="gift" className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{t("Choose it", "Le choisir")}</span></> : !unlocked ? <><Icon name="lock" className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Premium</span></> : isFree && !hasPremiumAccess ? <><Icon name="gift" className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{t("Free", "Gratuit")}</span></> : item.link ? <><Icon name="arrow" className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{t("Open", "Ouvrir")}</span></> : <><Icon name="copy" className="h-3.5 w-3.5" /> <span className="hidden sm:inline">{t("Copy", "Copier")}</span></>}
                    </span>
                  } />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </section>

      <section id="how" className="relative z-10 mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="overflow-hidden rounded-[36px] border border-white/10 bg-[#121214] p-8 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] md:p-12"><div className="grid gap-10 md:grid-cols-3">{[t("Choose a style", "Choisir un style"), t("Copy the prompt", "Copier le prompt"), t("Generate your site", "Générer votre site")].map((step, i) => <div key={step}><div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-[#08080A] text-sm font-bold text-white shadow-none">0{i + 1}</div><h3 className="text-xl font-semibold text-[#EDE9E0]">{step}</h3><p className="mt-3 text-sm leading-6 text-white/55">{i === 0 ? t("Browse previews and find a design direction that suits your offer.", "Parcourez les aperçus et trouvez une direction design adaptée à votre offre.") : i === 1 ? t("The prompt is loaded directly from the source to stay intact.", "Le prompt est chargé directement depuis la source pour rester intact.") : t("Paste it into your favorite AI tool and customize the result.", "Collez-le dans votre outil IA préféré et personnalisez le résultat.")}</p></div>)}</div></div>
      </section>

      {/* Right after "how it works": the visitor now knows the mechanic, this
          is what the mechanic is FOR. */}
      <BusinessLadder onPick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth", block: "start" })} />

      {/* The walkthrough sits after the catalogue, not before it: the designs are
          what sell, and a vertical video between the hero and the gallery pushed
          the prompts a full screen down on mobile. */}
      <section id="video" className="relative z-10 mx-auto max-w-7xl px-6 pt-12 pb-4 text-center lg:px-8 lg:pt-16">
        <h2 className="text-3xl font-bold tracking-[-0.04em] text-[#EDE9E0] md:text-5xl">{t("What is Movento?", "Movento, c'est quoi ?")}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/55 md:mt-4 md:text-base md:leading-7">{t("A minute to see how it works, from the prompt to the finished site.", "Une minute pour voir comment ça marche, du prompt au site fini.")}</p>
        <div className="mx-auto mt-6 w-full max-w-[325px] overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.03] shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] md:mt-8">
          <iframe
            src={`https://www.tiktok.com/embed/v2/${TIKTOK_VIDEO_ID}`}
            title={t("How Movento works", "Comment fonctionne Movento")}
            // Height follows the viewport so the vertical video never overflows a
            // phone screen, bounded so it stays watchable on short and tall ones.
            className="block h-[78vh] max-h-[740px] min-h-[480px] w-full border-0"
            loading="lazy"
            allow="encrypted-media; picture-in-picture; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </section>


      <Testimonials />

      <section id="pricing" className="relative z-10 mx-auto max-w-7xl px-6 pb-28 pt-10 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-[-0.04em] text-[#EDE9E0] md:text-6xl">{isSinglePlan ? t("One payment, forever", "Un paiement, à vie") : t("Choose your plan", "Choisissez votre offre")}</h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-7 text-white/55">{isSinglePlan ? t("Access every premium prompt. Yours for good.", "Accède à tous les prompts premium. À toi pour de bon.") : t("The whole catalogue either way. One payment, or a subscription you stop whenever you like.", "Le catalogue entier dans les deux cas. Un paiement unique, ou un abonnement que tu arrêtes quand tu veux.")}</p>
          {/* The rating is declared as AggregateRating in index.html; Google only
              honours that markup when the same figure is visible on the page. */}
          <div className="mt-5 flex items-center justify-center gap-2">
            <span className="flex items-center gap-0.5 text-amber-400">{[0, 1, 2, 3, 4].map((i) => <Icon key={i} name="star" className="h-4 w-4" />)}</span>
            <span className="text-sm font-semibold text-[#EDE9E0]">{RATING_SCORE}/5</span>
            <span className="text-sm text-white/40">· {t(`${RATING_COUNT}+ reviews`, `+${RATING_COUNT} avis`)}</span>
          </div>
        </div>

        <div className={`mx-auto mt-12 grid gap-3 sm:gap-5 ${planGridWidth} ${planGridBase} ${visiblePlans.length === 1 ? "" : planGridLg}`}>
          {visiblePlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} featured={plan.featured} loading={Boolean(checkoutPlan)} onBuy={startCheckout} />
          ))}
        </div>

        <Reassurance className="mt-8" />
      </section>

      <section id="faq" className="relative z-10 mx-auto max-w-7xl px-6 pb-28 lg:px-8">
        <div className="mb-14 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">FAQ</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#EDE9E0] md:text-5xl">{t("Questions, answered", "Vos questions, nos réponses")}</h2>
        </div>
        <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
          {[
            { q: t("How does it work?", "Comment ça marche ?"), a: t("Pick a prompt in the gallery, copy it in one click, paste it into Lovable, v0, Bolt, Cursor, Claude or Shopify. The AI generates the full site — you just customize the content.", "Choisissez un prompt dans la galerie, copiez-le en un clic, collez-le dans Lovable, v0, Bolt, Cursor, Claude ou Shopify. L'IA génère le site complet — il ne vous reste qu'à personnaliser le contenu.") },
            { q: t("Which tools are supported?", "Quels outils sont compatibles ?"), a: t("Any AI tool that accepts a text prompt: Lovable, v0, Bolt, Cursor, Claude, Shopify, ChatGPT... The prompts describe every detail (fonts, colors, animations) so the result stays faithful.", "Tous les outils IA qui acceptent un prompt texte : Lovable, v0, Bolt, Cursor, Claude, Shopify, ChatGPT... Les prompts décrivent chaque détail (polices, couleurs, animations) pour un résultat fidèle.") },
            { q: t("Is there anything to cancel?", "Y a-t-il quelque chose à résilier ?"), a: t("No. Access is a single payment, with no subscription and nothing billed again. An older monthly subscription can still be cancelled anytime from the My subscription page or directly on Whop.", "Non. L'accès est un paiement unique, sans abonnement et sans rien qui se représente. Un ancien abonnement mensuel reste résiliable à tout moment depuis la page Mon abonnement ou directement sur Whop.") },
            { q: t("How do I access prompts after paying?", "Comment j'accède aux prompts après paiement ?"), a: t("The email you used at checkout is your access key. Enter it in the gallery on any device and every prompt unlocks instantly.", "L'email utilisé au paiement est votre clé d'accès. Entrez-le dans la galerie sur n'importe quel appareil et tous les prompts se débloquent instantanément.") },
            { q: t("Is the catalog updated?", "Le catalogue est-il mis à jour ?"), a: t("Yes — new premium prompts are added regularly, and they're all included in your plan at no extra cost.", "Oui — de nouveaux prompts premium sont ajoutés régulièrement, et ils sont tous inclus dans votre accès sans surcoût.") },
            { q: t("Can I use the sites commercially?", "Puis-je utiliser les sites commercialement ?"), a: t("Yes. The sites you generate from our prompts are yours — client projects, portfolios, product launches, anything.", "Oui. Les sites que vous générez à partir de nos prompts vous appartiennent — projets clients, portfolios, lancements de produits, tout est permis.") },
          ].map((item) => (
            <div key={item.q} className="border-t border-white/10 pt-6">
              <h3 className="text-base font-semibold text-[#EDE9E0]">{item.q}</h3>
              <p className="mt-3 max-w-lg text-sm leading-7 text-white/55">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-28 lg:px-8">
        <div className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[#121214] px-8 py-16 text-center shadow-2xl shadow-black/40 md:py-20">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-white/[0.06] blur-[100px]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />
          <h2 className="relative mx-auto max-w-2xl text-3xl font-bold tracking-tight text-[#EDE9E0] md:text-5xl">{t("Your next site is one prompt away.", "Votre prochain site est à un prompt près.")}</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-sm leading-7 text-white/60 md:text-base">{t("One great prompt saves hours of design, integration and client back-and-forth.", "Un bon prompt vous économise des heures de design, d'intégration et d'allers-retours client.")}</p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="/pricing" className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#08080A] px-8 py-3.5 text-sm font-bold text-[#EDE9E0] transition hover:border-white/30 hover:bg-[#141418]">{t("See plans", "Voir les offres")} <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" /></a>
            <span className="text-xs text-white/50">{t("One payment, lifetime access", "Un paiement, accès à vie")}</span>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row lg:px-8">
          <Logo />
          <p className="text-sm text-white/40">© {new Date().getFullYear()} Movento. {t("All rights reserved.", "Tous droits réservés.")}</p>
          <div className="flex items-center gap-5">
            <a href="/tiktok" className="text-sm text-white/40 transition hover:text-[#EDE9E0]">{t("Monetize TikTok", "Monétise TikTok")}</a>
            <a href="/subscription" className="text-sm text-white/40 transition hover:text-[#EDE9E0]">{t("My subscription", "Mon abonnement")}</a>
            <a href="/mentions-legales" className="text-sm text-white/40 transition hover:text-[#EDE9E0]">{t("Legal notice", "Mentions légales")}</a>
            {/* Full reload on purpose: `lang` is resolved once at module load. */}
            <a href={`?lang=${lang === "fr" ? "en" : "fr"}`} className="text-sm font-medium text-white/40 transition hover:text-[#EDE9E0]" hrefLang={lang === "fr" ? "en" : "fr"}>{lang === "fr" ? "English" : "Français"}</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

// The ebook ships with lifetime, not with the monthly plan — the same rule the
// cards advertise. A plan we failed to identify still gets it: refusing a
// paid-for bonus because a lookup came back empty is the worse mistake.
function earnedEbook(info) {
  return info?.kind !== "monthly";
}

// Direct support is a lifetime perk. Unlike the ebook this does NOT fail open:
// an unidentified plan must not be handed a private phone number we did not
// sell them.
function earnedSupport(info) {
  return info?.kind === "lifetime" || info?.type === "lifetime";
}

// How a lifetime buyer reaches a human. Shown on /success and on "My
// subscription", so closing the success tab does not cost them the link.
function SupportCard({ className = "" }) {
  return (
    <div className={`rounded-[28px] border border-emerald-400/25 bg-emerald-400/[0.06] p-6 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] md:p-7 ${className}`}>
      <div className="flex items-center gap-3">
        <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-emerald-400 text-[#04150d]"><Icon name="chat" className="h-4 w-4" /></span>
        <h2 className="text-lg font-semibold text-[#EDE9E0]">{t("Your direct support", "Ton support direct")}</h2>
      </div>
      <p className="mt-3 text-sm leading-6 text-white/60">
        {t(
          "Write whenever you're stuck — a prompt that won't behave, a site to review, a question about the catalogue. A real person answers.",
          "Écris dès que tu bloques — un prompt qui ne veut pas, un site à relire, une question sur le catalogue. Une vraie personne te répond.",
        )}
      </p>
      <a
        href={supportUrl()}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("support_opened", { ...refProps() })}
        className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-6 py-3 text-sm font-bold text-[#04150d] transition hover:bg-emerald-300 hover:scale-[1.02]"
      >
        <Icon name="chat" className="h-4 w-4" /> {t(`Message me on ${SUPPORT_HANDLE}`, `M'écrire sur ${SUPPORT_HANDLE}`)}
      </a>
    </div>
  );
}

// Shown on /success right after the purchase AND on "My subscription", because
// a buyer who closes the success tab had no other way to get the ebook back.
function EbookCard({ className = "" }) {
  return (
    <div className={`rounded-[28px] border border-amber-400/25 bg-amber-400/[0.06] p-6 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] md:p-7 ${className}`}>
      <div className="flex items-center gap-3">
        <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-amber-400 text-[#1a1400]"><Icon name="gift" className="h-4 w-4" /></span>
        <h2 className="text-lg font-semibold text-[#EDE9E0]">{t("Your free bonus ebook", "Ton ebook bonus offert")}</h2>
      </div>
      <p className="mt-3 text-sm leading-6 text-white/60">{t("The full playbook: build your site, sell it, find clients and manage everything — from A to Z.", "Le guide complet : créer ton site, le vendre, trouver des clients et tout gérer — de A à Z.")}</p>
      <a
        href={EBOOK_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track("ebook_opened", { ...refProps() })}
        className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 text-sm font-semibold text-[#1a1400] transition hover:bg-amber-300 hover:scale-[1.02]"
      >
        <Icon name="download" className="h-4 w-4" /> {t("Download the ebook", "Télécharger l'ebook")}
      </a>
    </div>
  );
}

function SuccessPage() {
  const [email, setEmail] = useState(getStoredAccessEmail);
  const [status, setStatus] = useState({ loading: false, ok: false, error: "" });
  // The bonus ebook ships with lifetime, not with the monthly plan.
  // Unknown plans get it: a paying customer must never be denied by a lookup
  // that merely failed to identify their plan.
  const [ebookEarned, setEbookEarned] = useState(true);
  // Direct support is a lifetime perk, so an unidentified plan does NOT get the
  // contact block — promising support we did not sell is the worse mistake here.
  const [supportEarned, setSupportEarned] = useState(false);

  // Prefill from ?email= if the checkout redirect carried it, and log a custom
  // event (separate from the automatic /success pageview) so purchase landings
  // are easy to isolate in Vercel Analytics.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("email");
    if (fromUrl && !email) setEmail(fromUrl);
    track("success_page_viewed", { fromCheckout: params.get("checkout_status") === "success" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clean = (v) => String(v).replace(/[\s\u00AD\u200B-\u200D\u2060\uFEFF]/g, "").toLowerCase();

  async function unlock(e) {
    if (e) e.preventDefault();
    const normalized = clean(email);
    if (!normalized) { setStatus({ loading: false, ok: false, error: t("Enter the email used at checkout.", "Entre l'email utilisé lors de l'achat.") }); return; }
    setStatus({ loading: true, ok: false, error: "" });
    try {
      const response = await fetch(`${API_BASE_URL}/api/verify-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "error");
      if (data.hasAccess) {
        window.localStorage.setItem("movento_access_email", normalized);
        setStatus({ loading: false, ok: true, error: "" });
        try {
          const sub = await fetch(`${API_BASE_URL}/api/subscription-status`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: normalized }),
          });
          const subData = await sub.json().catch(() => ({}));
          setEbookEarned(earnedEbook(subData));
          setSupportEarned(earnedSupport(subData));
        } catch { setEbookEarned(true); }
      } else {
        setStatus({ loading: false, ok: false, error: t("No access found for this email yet. If you just paid, wait a minute and retry — activation can take a moment.", "Aucun accès trouvé pour cet email pour l'instant. Si tu viens de payer, patiente une minute et réessaie — l'activation peut prendre un instant.") });
      }
    } catch (_) {
      setStatus({ loading: false, ok: false, error: t("Unable to verify right now. Please retry.", "Vérification impossible pour le moment. Réessaie.") });
    }
  }

  return (
    <main className="min-h-screen bg-[#0A0A0B] text-[#EDE9E0]">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-20%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-white/[0.05] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] h-[400px] w-[400px] rounded-full bg-white/[0.04] blur-[120px]" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <a href="/"><Logo /></a>
        <div className="flex items-center gap-3">
          <LangSwitch />
          <a href="/#prompts" className="rounded-full border border-white/10 bg-[#121214] px-5 py-2.5 text-sm font-medium text-white/75 shadow-sm transition hover:border-white/25 hover:text-[#EDE9E0]">{t("Go to the gallery", "Aller à la galerie")} →</a>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-2xl px-6 pb-24 pt-8 lg:px-8">
        <div className="text-center">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-400/[0.1]0 text-white shadow-lg shadow-emerald-500/25"><Icon name="check" className="h-6 w-6" /></div>
          <h1 className="text-3xl font-bold tracking-tight text-[#EDE9E0] md:text-5xl">{t("Payment confirmed 🎉", "Paiement confirmé 🎉")}</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/55 md:text-base">{t("Thank you for your purchase! Unlock your access below.", "Merci pour ton achat ! Débloque ton accès ci-dessous.")}</p>
        </div>

        {/* Step 1 — unlock access */}
        <div className="mt-8 rounded-[28px] border border-white/10 bg-[#121214] p-6 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] md:p-7">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-[#08080A] text-sm font-bold text-white">1</span>
            <h2 className="text-lg font-semibold text-[#EDE9E0]">{t("Unlock your prompts", "Débloque tes prompts")}</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/55">{t("Enter the email you used at checkout. It unlocks the full catalog on this device — and on any device, anytime.", "Entre l'email que tu as utilisé au paiement. Il débloque tout le catalogue sur cet appareil — et sur n'importe quel appareil, à tout moment.")}</p>
          {status.ok ? (
            <div className="mt-5 flex flex-col items-start gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.07] p-4 text-sm leading-6 text-emerald-300 sm:flex-row sm:items-center sm:justify-between">
              <span className="flex items-center gap-2"><Icon name="check" className="h-4 w-4 flex-none" /> {t("Access unlocked on this device!", "Accès débloqué sur cet appareil !")}</span>
              <a href="/#prompts" className="inline-flex flex-none items-center gap-2 rounded-full bg-[#08080A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#141418] hover:scale-[1.02]">{t("Copy prompts", "Copier les prompts")} <Icon name="arrow" className="h-4 w-4" /></a>
            </div>
          ) : (
            <>
              <form onSubmit={unlock} className="mt-5 flex flex-col gap-3 sm:flex-row">
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" inputMode="email" autoComplete="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="email@example.com" className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#121214] px-4 py-3 text-sm text-[#EDE9E0] outline-none placeholder:text-white/40 focus:border-white/35 focus:ring-4 focus:ring-white/10" />
                <button type="submit" disabled={status.loading} className="rounded-2xl bg-[#08080A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#141418] hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60">{status.loading ? t("Checking...", "Vérification...") : t("Unlock", "Débloquer")}</button>
              </form>
              {status.error && <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-amber-300"><Icon name="alert" className="mt-0.5 h-3.5 w-3.5 flex-none" />{status.error}</p>}
            </>
          )}
        </div>

        {/* Bonus ebook — lifetime only */}
        {status.ok && ebookEarned && <EbookCard className="mt-4" />}

        {status.ok && supportEarned && <SupportCard className="mt-4" />}

        <p className="mt-6 text-center text-xs leading-5 text-white/40">{t("Keep this email address — it's your key to access Movento anytime.", "Garde bien cet email — c'est ta clé pour accéder à Movento à tout moment.")}</p>
      </section>

      <footer className="relative z-10 border-t border-white/10 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row lg:px-8">
          <Logo />
          <p className="text-sm text-white/40">© {new Date().getFullYear()} Movento. {t("All rights reserved.", "Tous droits réservés.")}</p>
          <a href="/subscription" className="text-sm text-white/40 transition hover:text-[#EDE9E0]">{t("My subscription", "Mon abonnement")}</a>
        </div>
      </footer>
    </main>
  );
}

// Creator programme: Movento supplies the footage, the creator edits and posts
// it on their own TikTok and is paid on views. Deliberately a plain page with a
// mailto rather than a form — the first step really is a conversation with
// support, and a form would promise an automated onboarding that does not exist.
function TikTokPage() {
  const RATE = t("€0.50 per 1,000 views", "0,50 € pour 1 000 vues");
  const mailSubject = encodeURIComponent(t("Movento TikTok programme", "Programme TikTok Movento"));
  const mailBody = encodeURIComponent(
    t(
      "Hi,\n\nI would like to join the Movento TikTok programme (face cam).\n\nMy TikTok account: @\n\nThanks!",
      "Bonjour,\n\nJe souhaite rejoindre le programme TikTok Movento (face cam).\n\nMon compte TikTok : @\n\nMerci !",
    ),
  );
  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${mailSubject}&body=${mailBody}`;

  const steps = [
    {
      title: t("Contact support", "Contacte le support"),
      body: t(
        `Write to ${SUPPORT_EMAIL} with your TikTok handle. We answer and walk you through the whole thing.`,
        `Écris à ${SUPPORT_EMAIL} avec ton pseudo TikTok. On te répond et on t'explique tout.`,
      ),
    },
    {
      title: t("Get your talking points", "Reçois les points à dire"),
      body: t(
        "We send you what to cover about Movento. You say it in your own words — nothing is scripted for you.",
        "On t'envoie ce qu'il faut aborder sur Movento. Tu le dis avec tes mots — rien n'est écrit à ta place.",
      ),
    },
    {
      title: t("Film and post", "Filme et poste"),
      body: t(
        "You film yourself on camera and post on your own TikTok account. A phone is enough.",
        "Tu te filmes face caméra et tu postes sur ton propre compte TikTok. Un téléphone suffit.",
      ),
    },
    {
      title: t("Get paid on views", "Sois payé aux vues"),
      body: t(`${RATE} on the videos you post.`, `${RATE} sur les vidéos que tu publies.`),
    },
  ];

  // Deliberately does NOT include "your face" or "your voice": the programme is
  // face cam only, so those are the one thing it does ask for.
  const noNeed = [
    t("An existing audience", "Une audience déjà faite"),
    t("Any equipment beyond a phone", "Du matériel au-delà d'un téléphone"),
    t("Editing experience", "De l'expérience en montage"),
    t("Any money upfront", "De l'argent à avancer"),
  ];

  return (
    <main className="min-h-screen bg-[#0A0A0B] text-[#EDE9E0]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-20%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-white/[0.05] blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] h-[400px] w-[400px] rounded-full bg-white/[0.04] blur-[120px]" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <a href="/" className="transition hover:opacity-80"><Logo /></a>
        <div className="flex items-center gap-2">
          <a href="/#prompts" className="hidden rounded-full px-4 py-2.5 text-sm font-medium text-white/55 transition hover:text-[#EDE9E0] sm:inline-block">{t("Catalog", "Catalogue")}</a>
          <LangSwitch />
          <a href="/" className="rounded-full border border-white/10 bg-[#121214] px-5 py-2.5 text-sm font-medium text-white/75 shadow-sm transition hover:border-white/25 hover:text-[#EDE9E0]">← {t("Back", "Retour")}</a>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-3xl px-6 pb-16 pt-8 text-center lg:px-8 lg:pt-12">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.05] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80 backdrop-blur">
          <Icon name="zap" className="h-3 w-3" /> {t("Creator programme", "Programme créateurs")}
        </span>
        <h1 className="mt-6 text-[2.6rem] font-bold leading-[1.05] tracking-[-0.045em] text-[#EDE9E0] md:text-6xl">
          {t("Monetize TikTok", "Monétise TikTok")}{" "}
          <span className="text-white/45">{t("with Movento", "avec Movento")}</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-white/55">
          {t(
            "We are looking for creators to film themselves on camera talking about Movento. You post on your own account and you are paid on the views the videos make.",
            "On cherche des créateurs pour se filmer face caméra en parlant de Movento. Tu postes sur ton propre compte et tu es payé sur les vues que font les vidéos.",
          )}
        </p>

        {/* The rate is the offer, so it is the biggest thing on the page. */}
        <div className="mx-auto mt-9 w-full max-w-sm rounded-[28px] border border-white/12 bg-[#121214] p-7 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">{t("What you earn", "Ce que tu gagnes")}</p>
          <p className="mt-3 text-[54px] font-bold leading-none tracking-[-0.05em] text-[#EDE9E0]">{t("€0.50", "0,50 €")}</p>
          <p className="mt-2 text-sm text-white/50">{t("per 1,000 views", "pour 1 000 vues")}</p>
        </div>

        <a
          href={mailto}
          onClick={() => track("tiktok_contact_clicked", { placement: "hero" })}
          className="group mt-8 inline-flex items-center gap-2 rounded-full bg-[#EDE9E0] px-8 py-3.5 text-sm font-bold text-[#0A0A0B] transition hover:bg-white hover:scale-[1.02]"
        >
          {t("Contact support", "Contacter le support")} <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" />
        </a>
        <p className="mt-3 text-xs text-white/40">{SUPPORT_EMAIL}</p>
      </section>

      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-16 lg:px-8">
        <h2 className="text-center text-2xl font-bold tracking-tight text-[#EDE9E0] md:text-3xl">{t("The format", "Le format")}</h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-sm leading-6 text-white/55">
          {t("Face cam, and only face cam — you on camera, talking about the product.", "Face cam, et rien d'autre — toi à l'écran, en train de parler du produit.")}
        </p>
        <div className="mx-auto mt-8 max-w-2xl rounded-[28px] border border-white/20 bg-[#141417] p-7 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)] md:p-9">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EDE9E0] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#0A0A0B]">
            <Icon name="chat" className="h-3 w-3" /> {t("What we are recruiting for", "Ce qu'on recherche")}
          </span>
          <h3 className="mt-4 text-2xl font-bold tracking-tight text-[#EDE9E0]">{t("Face cam", "Face cam")}</h3>
          <p className="mt-3 text-sm leading-6 text-white/60">
            {t(
              "You film yourself and talk about Movento: what it is, what you built with it, why it is worth it. Your face, your voice, your words.",
              "Tu te filmes et tu parles de Movento : ce que c'est, ce que tu as créé avec, pourquoi ça vaut le coup. Ton visage, ta voix, tes mots.",
            )}
          </p>
          <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {[
              t("You appear on camera and speak", "Tu apparais à l'écran et tu parles"),
              t("We send the points to cover — you say them your way", "On t'envoie les points à aborder — tu les dis à ta façon"),
              t("A phone is enough, no studio needed", "Un téléphone suffit, pas besoin de studio"),
              t("You show what you actually built with the prompts", "Tu montres ce que tu as réellement créé avec les prompts"),
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm leading-6 text-white/70">
                <Icon name="check" className="mt-1 h-4 w-4 flex-none text-emerald-300" /> {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-16 lg:px-8">
        <h2 className="text-center text-2xl font-bold tracking-tight text-[#EDE9E0] md:text-3xl">{t("How it works", "Comment ça marche")}</h2>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="rounded-[22px] border border-white/10 bg-[#121214] p-5 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#08080A] text-sm font-bold text-white">{i + 1}</span>
              <h3 className="mt-4 text-base font-semibold text-[#EDE9E0]">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-16 lg:px-8">
        <div className="rounded-[28px] border border-white/10 bg-[#121214] p-7 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] md:p-9">
          <h2 className="text-2xl font-bold tracking-tight text-[#EDE9E0] md:text-3xl">{t("What you do not need", "Ce dont tu n'as pas besoin")}</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">
            {t(
              "None of this is required to start. Being willing to talk on camera is.",
              "Rien de tout ça n'est nécessaire pour commencer. Accepter de parler face caméra, si.",
            )}
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {noNeed.map((item) => (
              <li key={item} className="flex items-center gap-2.5 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3 text-sm text-white/70">
                <Icon name="close" className="h-4 w-4 flex-none text-white/35" /> {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-3xl px-6 pb-20 lg:px-8">
        <h2 className="text-2xl font-bold tracking-tight text-[#EDE9E0] md:text-3xl">{t("Questions", "Questions")}</h2>
        <div className="mt-7 space-y-6">
          {[
            {
              q: t("Do I have to show my face?", "Faut-il montrer son visage ?"),
              a: t(
                "Yes. This programme is face cam only — you on camera, talking. If you would rather not appear, this is not the right fit.",
                "Oui. Ce programme est uniquement du face cam — toi à l'écran, en train de parler. Si tu préfères ne pas apparaître, ce n'est pas fait pour toi.",
              ),
            },
            {
              q: t("What do I film exactly?", "Je filme quoi exactement ?"),
              a: t(
                "You film yourself. We send the points to cover about Movento and you say them in your own words — nothing is scripted for you, and a phone is enough.",
                "Tu te filmes toi-même. On t'envoie les points à aborder sur Movento et tu les dis avec tes mots — rien n'est écrit à ta place, et un téléphone suffit.",
              ),
            },
            {
              q: t("Do I need an existing audience?", "Faut-il déjà avoir une audience ?"),
              a: t("No. You post from your own account and you are paid on the views the videos make.", "Non. Tu postes depuis ton propre compte et tu es payé sur les vues que font les vidéos."),
            },
            {
              q: t("How do I get started?", "Comment je commence ?"),
              a: t(
                `Email ${SUPPORT_EMAIL} with your TikTok handle. We answer and explain the whole process, step by step.`,
                `Écris à ${SUPPORT_EMAIL} avec ton pseudo TikTok. On te répond et on t'explique tout le processus, étape par étape.`,
              ),
            },
          ].map((item) => (
            <div key={item.q}>
              <h3 className="text-base font-semibold text-[#EDE9E0]">{item.q}</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-3xl px-6 pb-24 text-center lg:px-8">
        <div className="rounded-[28px] border border-white/12 bg-[#121214] p-9 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)]">
          <h2 className="text-2xl font-bold tracking-tight text-[#EDE9E0] md:text-3xl">{t("Ready to start?", "Prêt à commencer ?")}</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/55">
            {t("Send us a message with your TikTok handle. We explain the rest.", "Envoie-nous un message avec ton pseudo TikTok. On t'explique la suite.")}
          </p>
          <a
            href={mailto}
            onClick={() => track("tiktok_contact_clicked", { placement: "footer" })}
            className="group mt-6 inline-flex items-center gap-2 rounded-full bg-[#EDE9E0] px-8 py-3.5 text-sm font-bold text-[#0A0A0B] transition hover:bg-white hover:scale-[1.02]"
          >
            {t("Contact support", "Contacter le support")} <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" />
          </a>
          <p className="mt-3 text-xs text-white/40">{SUPPORT_EMAIL}</p>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/10 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row lg:px-8">
          <Logo />
          <p className="text-sm text-white/40">© {new Date().getFullYear()} Movento. {t("All rights reserved.", "Tous droits réservés.")}</p>
          <a href="/mentions-legales" className="text-sm text-white/40 transition hover:text-[#EDE9E0]">{t("Legal notice", "Mentions légales")}</a>
        </div>
      </footer>
    </main>
  );
}

// Where a pack buyer picks their prompts.
//
// Deliberately a separate screen rather than a claim on every card: a credit is
// spent for good, and one stray click on a card that says "use my purchase"
// used to burn a third of the purchase with no confirmation and no way back.
// Here the choice is reviewed as a set, and nothing is spent until Confirm.
function ChoosePromptsPage() {
  const [email, setEmail] = useState(getStoredAccessEmail);
  const [emailInput, setEmailInput] = useState(getStoredAccessEmail() || "");
  const [state, setState] = useState({ loading: true, credits: 0, owned: [], error: "" });
  const [picked, setPicked] = useState(() => {
    // Arriving from a card carries that prompt through, so the visitor does not
    // have to find again the prompt they were just looking at.
    if (typeof window === "undefined") return new Set();
    const slug = new URLSearchParams(window.location.search).get("pick");
    const match = slug && availablePrompts.find((p) => slugify(p.title) === slug.toLowerCase());
    return new Set(match ? [match.file] : []);
  });
  const [query, setQuery] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [claimed, setClaimed] = useState([]); // files unlocked in this session
  const [copiedFile, setCopiedFile] = useState("");

  const load = React.useCallback(async (address) => {
    if (!address) { setState({ loading: false, credits: 0, owned: [], error: "" }); return; }
    setState((s) => ({ ...s, loading: true, error: "" }));
    try {
      const response = await fetch(`${API_BASE_URL}/api/claim-prompt?email=${encodeURIComponent(address)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(apiError(data, t("Unable to read your purchase.", "Impossible de lire ton achat.")));
      setState({ loading: false, credits: Number(data.credits) || 0, owned: Array.isArray(data.owned) ? data.owned : [], error: "" });
    } catch (error) {
      setState({ loading: false, credits: 0, owned: [], error: error.message });
    }
  }, []);

  useEffect(() => { load(email); }, [email, load]);

  const owned = new Set(state.owned);
  const remaining = state.credits;
  // Never offer a prompt they already own — it would look like a slot spent on
  // something they can already copy.
  const pickable = availablePrompts.filter((p) => !owned.has(p.file));
  const shown = query.trim()
    ? pickable.filter((p) => `${p.title} ${p.category} ${(p.tags || []).join(" ")}`.toLowerCase().includes(query.trim().toLowerCase()))
    : pickable;

  function toggle(file) {
    setPicked((current) => {
      const next = new Set(current);
      if (next.has(file)) next.delete(file);
      else if (next.size < remaining) next.add(file);
      return next;
    });
  }

  async function confirm() {
    if (!picked.size || confirming) return;
    setConfirming(true);
    setState((s) => ({ ...s, error: "" }));
    const done = [];
    try {
      // One request per prompt: each claim is atomic server-side, so a failure
      // half way leaves the prompts already claimed claimed, and the rest of the
      // credits untouched.
      for (const file of picked) {
        const response = await fetch(`${API_BASE_URL}/api/claim-prompt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, file }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(apiError(data, t("Unable to unlock this prompt.", "Impossible de débloquer ce prompt.")));
        done.push({ file, prompt: data.prompt });
        track("prompt_pack_claimed", { prompt: file });
      }
      setClaimed(done);
      setPicked(new Set());
      await load(email);
    } catch (error) {
      setState((s) => ({ ...s, error: error.message }));
      setClaimed(done);
      await load(email);
    } finally {
      setConfirming(false);
    }
  }

  async function copyClaimed(entry) {
    const copied = await copyTextToClipboard(entry.prompt);
    if (!copied) return;
    setCopiedFile(entry.file);
    setTimeout(() => setCopiedFile(""), 1600);
  }

  return (
    <main className="min-h-screen bg-[#0A0A0B] text-[#EDE9E0]">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-20%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-white/[0.05] blur-[120px]" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <a href="/" className="transition hover:opacity-80"><Logo /></a>
        <div className="flex items-center gap-2">
          <LangSwitch />
          <a href="/#prompts" className="rounded-full border border-white/10 bg-[#121214] px-5 py-2.5 text-sm font-medium text-white/75 shadow-sm transition hover:border-white/25 hover:text-[#EDE9E0]">← {t("Catalog", "Catalogue")}</a>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-24 pt-4 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-[-0.03em] text-[#EDE9E0] md:text-5xl">{t("Choose your prompts", "Choisis tes prompts")}</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/55">
            {t("Pick them, review your choice, then confirm. Nothing is spent until you do.", "Sélectionne-les, vérifie ton choix, puis confirme. Rien n'est consommé avant.")}
          </p>
        </div>

        {/* No email on this device: the purchase is tied to the address used at
            checkout, so that is the way in. */}
        {!email && (
          <form
            onSubmit={(e) => { e.preventDefault(); const clean = cleanEmail(emailInput); if (!clean) return; window.localStorage.setItem("movento_access_email", clean); setEmail(clean); }}
            className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input value={emailInput} onChange={(e) => setEmailInput(e.target.value)} type="email" inputMode="email" autoComplete="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="email@example.com" className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#121214] px-4 py-3 text-sm text-[#EDE9E0] outline-none placeholder:text-white/40 focus:border-white/35 focus:ring-4 focus:ring-white/10" />
            <button type="submit" className="rounded-2xl bg-[#EDE9E0] px-6 py-3 text-sm font-bold text-[#0A0A0B] transition hover:bg-white">{t("Continue", "Continuer")}</button>
          </form>
        )}

        {email && state.loading && <p className="mt-10 text-center text-sm text-white/45">{t("Loading your purchase…", "Chargement de ton achat…")}</p>}

        {email && !state.loading && (
          <>
            {claimed.length > 0 && (
              <div className="mt-8 rounded-[24px] border border-emerald-400/25 bg-emerald-400/[0.07] p-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                  <Icon name="check" className="h-4 w-4" /> {claimed.length > 1 ? t(`${claimed.length} prompts unlocked — they are yours for good.`, `${claimed.length} prompts débloqués — ils sont à toi pour de bon.`) : t("Prompt unlocked — it is yours for good.", "Prompt débloqué — il est à toi pour de bon.")}
                </p>
                {/* The same cards again, not a list of names: this is the
                    moment the buyer sees what they just bought, and the whole
                    card copies so the button is a reminder, not the only way. */}
                <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                  {claimed.map((entry) => {
                    const item = availablePrompts.find((p) => p.file === entry.file);
                    if (!item) return null;
                    return (
                      <PreviewCard
                        key={entry.file}
                        item={item}
                        onClick={() => copyClaimed(entry)}
                        badge={
                          <span className={`flex flex-none items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition ${copiedFile === entry.file ? "bg-emerald-400/15 text-emerald-300" : "bg-[#EDE9E0] text-[#0A0A0B]"}`}>
                            {copiedFile === entry.file ? <><Icon name="check" className="h-3.5 w-3.5" /> {t("Copied", "Copié")}</> : <><Icon name="copy" className="h-3.5 w-3.5" /> {t("Copy", "Copier")}</>}
                          </span>
                        }
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {state.error && (
              <p className="mt-6 flex items-start gap-2 rounded-2xl border border-red-400/25 bg-red-400/[0.08] p-4 text-sm leading-6 text-red-300">
                <Icon name="alert" className="mt-1 h-4 w-4 flex-none" />{state.error}
              </p>
            )}

            {remaining === 0 ? (
              <div className="mt-10 rounded-[24px] border border-white/10 bg-[#121214] p-7 text-center">
                <p className="text-sm leading-6 text-white/60">
                  {state.owned.length
                    ? t("Nothing left to pick. Your prompts are unlocked in the catalog.", "Plus rien à choisir. Tes prompts sont débloqués dans le catalogue.")
                    : t("No purchase found for this email. Check it matches the one you paid with.", "Aucun achat trouvé pour cet email. Vérifie qu'il correspond à celui du paiement.")}
                </p>
                <a href="/#prompts" className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#EDE9E0] px-6 py-3 text-sm font-bold text-[#0A0A0B] transition hover:bg-white">
                  {t("Back to the catalog", "Retour au catalogue")} <Icon name="arrow" className="h-4 w-4" />
                </a>
              </div>
            ) : (
              <>
                {/* Sticky so the count and the confirm button stay in reach while
                    scrolling a long catalogue. */}
                <div className="sticky top-3 z-20 mt-8 flex flex-col gap-3 rounded-2xl border border-white/12 bg-[#121214]/95 p-4 shadow-[0_18px_44px_-20px_rgba(0,0,0,0.9)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#EDE9E0]">
                      {t(`${picked.size} of ${remaining} selected`, `${picked.size} sur ${remaining} sélectionné${picked.size > 1 ? "s" : ""}`)}
                    </p>
                    <p className="mt-0.5 text-xs text-white/45">
                      {picked.size < remaining
                        ? t(`You can still pick ${remaining - picked.size}.`, `Tu peux encore en choisir ${remaining - picked.size}.`)
                        : t("That is your full pack.", "C'est ton pack complet.")}
                    </p>
                  </div>
                  <button
                    onClick={confirm}
                    disabled={!picked.size || confirming}
                    className="flex-none rounded-full bg-[#EDE9E0] px-6 py-3 text-sm font-bold text-[#0A0A0B] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {confirming ? t("Unlocking…", "Déblocage…") : picked.size > 1 ? t(`Unlock these ${picked.size} prompts`, `Débloquer ces ${picked.size} prompts`) : t("Unlock this prompt", "Débloquer ce prompt")}
                  </button>
                </div>

                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  type="search"
                  placeholder={t("Search a prompt…", "Chercher un prompt…")}
                  className="mt-5 w-full rounded-2xl border border-white/10 bg-[#121214] px-4 py-3 text-sm text-[#EDE9E0] outline-none placeholder:text-white/40 focus:border-white/35 focus:ring-4 focus:ring-white/10"
                />

                {/* The real preview cards, not a list of titles: nobody picks
                    three prompts out of a hundred and fifty from their names.
                    PreviewCard is reused as-is so the previews keep their lazy
                    mounting — without it a phone would decode every clip in the
                    catalogue at once. Passing onClick and no onPreview turns the
                    whole card into the toggle. */}
                <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
                  {shown.map((item) => {
                    const isPicked = picked.has(item.file);
                    const full = !isPicked && picked.size >= remaining;
                    return (
                      <div
                        key={item.file}
                        aria-pressed={isPicked}
                        role="button"
                        className={`rounded-[22px] transition ${isPicked ? "ring-2 ring-emerald-400" : ""} ${full ? "pointer-events-none opacity-35" : ""}`}
                      >
                        <PreviewCard
                          item={item}
                          onClick={() => toggle(item.file)}
                          badge={
                            <span className={`grid h-6 w-6 flex-none place-items-center rounded-full border transition ${isPicked ? "border-emerald-400 bg-emerald-400 text-[#04150d]" : "border-white/25 text-transparent"}`}>
                              <Icon name="check" className="h-3.5 w-3.5" />
                            </span>
                          }
                        />
                      </div>
                    );
                  })}
                </div>
                {!shown.length && <p className="mt-8 text-center text-sm text-white/45">{t("No prompt matches that search.", "Aucun prompt ne correspond à cette recherche.")}</p>}
              </>
            )}
          </>
        )}
      </section>
    </main>
  );
}

function MentionsLegales() {
  return (
    <main className="min-h-screen bg-[#0A0A0B] text-[#EDE9E0]">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-20%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-white/[0.05] blur-[120px]" />
      </div>
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <a href="/"><Logo /></a>
        <div className="flex items-center gap-3">
          <LangSwitch />
          <a href="/" className="rounded-full border border-white/10 bg-[#121214] px-5 py-2.5 text-sm font-medium text-white/75 shadow-sm transition hover:border-white/25 hover:text-[#EDE9E0]">← {t("Back", "Retour")}</a>
        </div>
      </header>
      <section className="relative z-10 mx-auto max-w-3xl px-6 pb-24 pt-12 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-[#EDE9E0] md:text-5xl">{t("Legal notice", "Mentions légales")}</h1>
        <p className="mt-3 text-sm text-white/40">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="mt-12 space-y-10 text-sm leading-7 text-white/60">
          <div>
            <h2 className="mb-3 text-base font-semibold text-[#EDE9E0]">1. Website publisher</h2>
            <p>This website <strong className="text-white/75">movento.dev</strong> is published by <span className="text-white/75">Movento</span>.</p>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-[#EDE9E0]">2. Hosting</h2>
            <p>This website is hosted by <span className="text-white/75">Vercel Inc.</span> — 340 S Lemon Ave #4133, Walnut, CA 91789, United States — vercel.com</p>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-[#EDE9E0]">3. Intellectual property</h2>
            <p>All content on Movento (text, prompts, visuals, structure) is the exclusive property of the publisher and is protected by applicable intellectual property laws. Any reproduction, even partial, is strictly prohibited without prior authorization.</p>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-[#EDE9E0]">4. Personal data</h2>
            <p>Movento collects your email address to manage access to content. Payment data is processed by <span className="text-white/75">Whop</span> and is not stored by Movento. Your data is never sold to third parties. You may request access, correction or deletion by contacting us.</p>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-[#EDE9E0]">5. Payment</h2>
            <p>Payments are securely processed by <span className="text-white/75">Whop</span>. Monthly and annual subscriptions can be cancelled at any time from your Whop account. Lifetime access is a one-time purchase with no subscription.</p>
            <p className="mt-3">You can cancel your subscription at any time from your Whop account, or by emailing <span className="text-white/75">movento.dev@gmail.com</span> from the address used at checkout.</p>
            <p className="mt-3">Movento reserves the right to modify subscription prices at any time.</p>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-[#EDE9E0]">6. Cookies</h2>
            <p>Movento only uses data stored locally on your device (localStorage) to remember your access and email. No third-party tracking cookies are used.</p>
            <p className="mt-3">We measure audience with <span className="text-white/75">Vercel Web Analytics</span>, which is cookieless and does not track you across websites or build a personal profile. It records anonymous page views and product events (for example, opening the pricing modal) so we can improve the site.</p>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-[#EDE9E0]">7. Contact</h2>
            <p>For any questions: <span className="text-white/75">movento.dev@gmail.com</span></p>
          </div>
        </div>
      </section>
      <footer className="relative z-10 border-t border-white/10 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row lg:px-8">
          <Logo />
          <p className="text-sm text-white/40">© {new Date().getFullYear()} Movento. {t("All rights reserved.", "Tous droits réservés.")}</p>
          <a href="/" className="text-sm text-white/40 transition hover:text-[#EDE9E0]">{t("Back to home", "Retour à l'accueil")}</a>
        </div>
      </footer>
    </main>
  );
}

// Eight designs pulled straight from the catalogue so the pricing page shows
// the actual product rather than a description of it. Titles, not indexes: the
// prompts array gets reordered every time a new prompt ships.
const SHOWCASE_TITLES = [
  "Jack — 3D Creator",
  "Adam Roberts Portfolio",
  "Serene Wellness",
  "Synergeus Fintech",
  "Marcus Bennet Portfolio",
  "Boomerang",
  "Photographer Portfolio",
  "Wandor Travel Hero",
];

// Real customer quotes only, reproduced as they were written and attributed to
// buyers who agreed to be named. The section hides itself while this list is
// empty, so nothing invented ever ends up on the page.
// Every quote here is a real message from a buyer, reproduced word for word.
// Entries without a name are published unattributed rather than signed with an
// invented one; `highlight` only ever restates a figure the quote itself gives.
const TESTIMONIALS = [
  {
    id: "vente-800",
    name: null,
    highlight: t("First site sold €800", "Premier site vendu 800 €"),
    quote: "Je n'avais jamais codé de ma vie. Après avoir utilisé les prompts de Movento, j'ai créé mon premier site et je l'ai vendu 800 €. Je ne pensais vraiment pas que c'était possible.",
    quoteEn: "I had never written a line of code in my life. After using Movento's prompts I built my first site and sold it for €800. I really did not think that was possible.",
  },
  {
    id: "vente-1000",
    name: null,
    highlight: t("€1,000 for a first project", "1 000 € pour un premier projet"),
    quote: "Je partais de zéro en développement. Grâce aux prompts, j'ai pu livrer un site professionnel à un client et encaisser 1 000 € pour mon premier projet.",
    quoteEn: "I was starting from zero in development. Thanks to the prompts I delivered a professional site to a client and took €1,000 for my first project.",
  },
  {
    id: "vente-900",
    name: null,
    highlight: t("First sale at €900", "Première vente à 900 €"),
    quote: "J'ai lancé mon activité sans compétences techniques. Les prompts m'ont permis de créer des sites que mes clients adorent, et j'ai signé ma première vente à 900 €.",
    quoteEn: "I started my business with no technical skills. The prompts let me build sites my clients love, and I closed my first sale at €900.",
  },
  {
    id: "plusieurs-projets",
    name: null,
    highlight: t("Several projects sold", "Plusieurs projets vendus"),
    quote: "Avant, je n'osais pas proposer de création de sites parce que je ne savais pas coder. Aujourd'hui, j'ai déjà vendu plusieurs projets en utilisant uniquement les prompts.",
    quoteEn: "I used to avoid offering website work because I could not code. Today I have already sold several projects using nothing but the prompts.",
  },
  {
    id: "thomas-morel",
    name: "Thomas Morel",
    role: t("Freelance web designer", "Freelance web designer"),
    quote: "Franchement impressionné. J'ai créé un site premium avec Claude en moins d'une heure grâce aux prompts de Movento. Le résultat était largement au niveau de ce que je faisais en plusieurs jours. J'ai même signé un client quelques jours après. L'investissement est rentabilisé très vite.",
    quoteEn: "Genuinely impressed. I built a premium site with Claude in under an hour using Movento's prompts. The result easily matched what used to take me several days. I even signed a client a few days later. It pays for itself very quickly.",
  },
  {
    id: "lucas-bernard",
    name: "Lucas Bernard",
    role: t("Web agency", "Agence web"),
    quote: "On utilise Movento pour accélérer la création de maquettes et gagner du temps sur les premiers jets. Les prompts sont très bien structurés et permettent d'obtenir des designs modernes sans partir d'une page blanche. C'est devenu un outil indispensable dans notre workflow.",
    quoteEn: "We use Movento to speed up mockups and save time on first drafts. The prompts are very well structured and produce modern designs without starting from a blank page. It has become essential to our workflow.",
  },
  {
    id: "maxime-rousse",
    name: "Maxime Rousse",
    role: t("Beginner", "Débutant"),
    quote: "Je n'avais quasiment aucune expérience avec Claude avant de découvrir Movento. Les prompts sont simples à utiliser et le rendu est bluffant. J'ai réussi à créer mon premier site professionnel en quelques heures seulement. Je recommande à tous ceux qui veulent vendre des sites rapidement.",
    quoteEn: "I had almost no experience with Claude before finding Movento. The prompts are simple to use and the result is stunning. I built my first professional site in a matter of hours. I recommend it to anyone who wants to sell sites fast.",
  },
];


function PricingShowcase({ onPick }) {
  const items = useMemo(
    () => SHOWCASE_TITLES.map((title) => availablePrompts.find((p) => p.title === title)).filter(Boolean),
    [],
  );
  if (!items.length) return null;

  return (
    <section className="relative z-10 border-y border-white/10 bg-white/[0.02] py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-[#121214] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80 shadow-sm">
            <Icon name="layers" className="h-3 w-3" /> {t("Included in every plan", "Inclus dans chaque offre")}
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-[#EDE9E0] md:text-4xl">
            {t("The designs you unlock", "Les designs que tu débloques")}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base leading-7 text-white/55">
            {t(
              `${availablePrompts.length} premium prompts, each one describing a complete site — fonts, colors, animations, section by section.`,
              `${availablePrompts.length} prompts premium, chacun décrivant un site complet — polices, couleurs, animations, section par section.`,
            )}
          </p>
        </motion.div>

        {/* Staggered so the row assembles itself instead of snapping in — the
            previews are the argument on this page, they deserve the beat. */}
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <motion.div key={item.file} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.45, delay: Math.min(i, 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}>
              <PreviewCard item={item} onClick={onPick} />
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a href="/#prompts" className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#121214] px-6 py-3 text-sm font-semibold text-white/75 shadow-sm transition hover:border-white/25 hover:text-[#EDE9E0]">
            {t("Browse the full catalog", "Voir tout le catalogue")} <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}

const initialsOf = (name) => name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

// One card, two densities: the full one for the standalone block, the compact
// one for the rail that runs alongside the plan cards.
function TestimonialCard({ review, compact = false }) {
  return (
    <figure className={`relative flex h-full flex-col overflow-hidden rounded-[20px] border border-white/10 bg-[#121214] shadow-[0_1px_0_rgba(255,255,255,0.04)_inset] transition hover:-translate-y-1 hover:border-white/25 hover:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.9)] ${compact ? "p-5" : "p-7"}`}>
      {/* Oversized quote mark, kept decorative and behind the text. */}
      {!compact && <span aria-hidden="true" className="pointer-events-none absolute -right-2 -top-6 select-none font-serif text-[110px] leading-none text-white/[0.06]">”</span>}
      <span className="relative flex items-center gap-0.5 text-amber-400">{[0, 1, 2, 3, 4].map((n) => <Icon key={n} name="star" className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />)}</span>
      {/* The amount is the part a visitor scans for, so it gets pulled out
          of the paragraph — never a figure the quote does not state. */}
      {review.highlight && (
        <span className={`relative inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/[0.07] px-3 py-1 font-semibold text-emerald-300 ${compact ? "mt-3 text-[11px]" : "mt-4 text-xs"}`}>
          <Icon name="zap" className="h-3 w-3" /> {review.highlight}
        </span>
      )}
      <blockquote className={`relative flex-1 text-white/75 ${compact ? "mt-3 text-[13px] leading-6" : "mt-4 text-[15px] leading-7"}`}>
        “{lang === "fr" ? review.quote : review.quoteEn || review.quote}”
        {lang !== "fr" && review.quoteEn && <span className="mt-2 block text-[11px] text-white/30">Translated from French</span>}
      </blockquote>
      <figcaption className={`relative flex items-center gap-3 border-t border-white/[0.07] ${compact ? "mt-4 pt-4" : "mt-6 pt-5"}`}>
        <span className={`grid flex-none place-items-center rounded-full bg-white/10 text-[#EDE9E0] ${compact ? "h-8 w-8" : "h-10 w-10"}`}>
          {review.name ? <span className={compact ? "text-[10px] font-bold" : "text-xs font-bold"}>{initialsOf(review.name)}</span> : <span aria-hidden="true" className={`font-serif leading-none ${compact ? "text-lg" : "text-xl"}`}>”</span>}
        </span>
        <span className="min-w-0">
          <span className={`block truncate font-semibold text-[#EDE9E0] ${compact ? "text-[13px]" : "text-sm"}`}>{review.name || t("Movento customer", "Client Movento")}</span>
          {review.role && <span className="block truncate text-xs text-white/40">{review.role}</span>}
        </span>
      </figcaption>
    </figure>
  );
}

function Testimonials({ items = TESTIMONIALS }) {
  if (!items.length) return null;

  // A lone card on the last row of a three-column grid reads as a mistake;
  // nudge it to the middle column so the block does not end lopsided.
  const centerLast = items.length % 3 === 1 ? "[&>*:last-child]:md:col-start-2" : "";

  return (
    <section className="relative z-10 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 shadow-sm backdrop-blur">
            <span className="flex items-center gap-0.5 text-amber-400">{[0, 1, 2, 3, 4].map((i) => <Icon key={i} name="star" className="h-3.5 w-3.5" />)}</span>
            <span className="text-sm font-semibold text-[#EDE9E0]">{RATING_SCORE}/5</span>
            <span className="text-sm text-white/40">· {t(`${RATING_COUNT}+ reviews`, `+${RATING_COUNT} avis`)}</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-[-0.03em] text-[#EDE9E0] md:text-4xl">{t("What buyers say", "Ce que disent les acheteurs")}</h2>
        </motion.div>

        <div className={`mt-12 grid gap-5 md:grid-cols-3 ${centerLast}`}>
          {items.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <TestimonialCard review={review} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Ticks once a second while a real deadline is ahead. Returns null when there
// is no deadline or it has passed, so callers drop the countdown entirely
// rather than freezing on 00:00:00.
function useCountdown(iso) {
  const target = useMemo(() => {
    if (!iso) return null;
    const ms = Date.parse(iso);
    return Number.isNaN(ms) ? null : ms;
  }, [iso]);

  const [left, setLeft] = useState(() => (target ? Math.max(0, target - Date.now()) : 0));

  useEffect(() => {
    if (!target) return;
    setLeft(Math.max(0, target - Date.now()));
    const id = window.setInterval(() => setLeft(Math.max(0, target - Date.now())), 1000);
    return () => window.clearInterval(id);
  }, [target]);

  if (!target || left <= 0) return null;
  const total = Math.floor(left / 1000);
  const pad = (n) => String(n).padStart(2, "0");
  const days = Math.floor(total / 86400);
  const clock = `${pad(Math.floor((total % 86400) / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
  return days > 0 ? `${days}${t("d", "j")} ${clock}` : clock;
}

// Sticky offer bar at the bottom of /pricing. The countdown is appended only
// when a real deadline is configured; otherwise the offer stands on its own
// rather than inventing an urgency.
function PricingBanner({ onPick }) {
  const countdown = useCountdown(LAUNCH_OFFER_ENDS_AT);
  const tail = countdown ? t(`${countdown} left`, `plus que ${countdown}`) : null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <button
        onClick={() => {
          track("pricing_banner_click", { countdown: Boolean(countdown), ...refProps() });
          onPick?.();
        }}
        className="group block w-full bg-[linear-gradient(100deg,#ef6f5c_0%,#e0625f_14%,#5f6ff2_44%,#7a63ef_62%,#a874f0_80%,#d79bf5_100%)] px-4 py-3 text-left transition hover:brightness-110 sm:px-6"
      >
        <span className="mx-auto flex max-w-5xl items-center gap-3">
          <span className="grid h-7 w-7 flex-none place-items-center rounded-full border border-white/45 text-white">
            <Icon name="clock" className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold leading-5 text-white sm:text-[15px]">
            {t("Launch offer", "Offre de lancement")} — <span className="font-normal text-white/70 line-through">{eur(PRICE_LIFETIME_ANCHOR)}</span>{" "}
            {t("now", "maintenant")} <span className="font-bold">{eur(PRICE_LIFETIME)}</span>{tail ? ` — ${tail}` : ""}
          </span>
          <Icon name="arrow" className="ml-auto hidden h-4 w-4 flex-none text-white transition group-hover:translate-x-0.5 sm:block" />
        </span>
      </button>
    </div>
  );
}

// The automatic discount as a popup on /pricing. Shown once per session and
// after a delay, so it lands on a visitor who is already reading rather than
// interrupting the page load — and never again on the same visit.
const PROMO_POPUP_KEY = "movento_promo_popup_seen";

function PromoPopup({ onPick }) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Nothing to announce when no code is being applied.
    if (!PROMO_CODE) return;
    try {
      if (window.sessionStorage.getItem(PROMO_POPUP_KEY)) return;
    } catch {
      /* private mode: fall through and show it, it just won't be remembered */
    }
    const id = window.setTimeout(() => {
      setOpen(true);
      track("promo_popup_shown", { code: PROMO_CODE, ...refProps() });
      try { window.sessionStorage.setItem(PROMO_POPUP_KEY, "1"); } catch { /* ignore */ }
    }, 2600);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function take() {
    track("promo_popup_cta", { code: PROMO_CODE, ...refProps() });
    setOpen(false);
    onPick?.();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-end justify-center px-4 pb-4 sm:items-center sm:pb-0"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="promo-popup-title"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/12 bg-[#121214] p-6 shadow-2xl shadow-black/60 md:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              ref={closeRef}
              onClick={() => setOpen(false)}
              aria-label={t("Close", "Fermer")}
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full border border-white/15 bg-black/50 text-white/70 transition hover:bg-black/80 hover:text-white"
            >
              <Icon name="close" className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 flex-none place-items-center rounded-2xl bg-emerald-400 text-sm font-black text-[#04150d]">-{PROMO_PERCENT}%</span>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300/80">{t("On every plan", "Sur toutes les offres")}</p>
            </div>

            <h2 id="promo-popup-title" className="mt-4 text-xl font-bold tracking-tight text-[#EDE9E0]">
              {t(`Your ${PROMO_PERCENT}% is already applied`, `Tes ${PROMO_PERCENT}% sont déjà appliqués`)}
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/60">
              {t(
                `Nothing to type and nothing to remember: the code is added for you at checkout, whichever plan you pick.`,
                `Rien à saisir, rien à retenir : le code est ajouté pour toi au moment du paiement, quelle que soit l'offre.`,
              )}
            </p>

            <div className="mt-5 flex items-center justify-between gap-3 rounded-2xl border border-dashed border-emerald-400/30 bg-emerald-400/[0.07] px-4 py-3.5">
              <span className="font-mono text-lg font-bold tracking-[0.22em] text-emerald-200">{PROMO_CODE}</span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300/90"><Icon name="check" className="h-3.5 w-3.5" /> {t("Applied automatically", "Appliqué automatiquement")}</span>
            </div>

            <button
              onClick={take}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-6 py-3.5 text-sm font-bold text-[#04150d] transition hover:bg-emerald-300 hover:scale-[1.01]"
            >
              {t("See the plans", "Voir les offres")} <Icon name="arrow" className="h-4 w-4" />
            </button>
            <button onClick={() => setOpen(false)} className="mt-2.5 w-full text-center text-xs text-white/40 transition hover:text-white/70">
              {t("Maybe later", "Plus tard")}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// The two things Movento sells, as a ladder rather than a list: the prompts
// let you deliver, the ebook lets you sell. Colours match the plan cards —
// neutral then amber — so a visitor who has just read them recognises which
// tier each rung belongs to.
//
// Deliberately phrased as capability, never as earnings: "what you can do with
// it", not "what you will make". No figures, no promises.
function BusinessLadder({ onPick }) {
  const steps = [
    {
      key: "prompts",
      label: t("Step 1 — The prompts", "Étape 1 — Les prompts"),
      title: t("You can deliver a site today", "Tu livres un site dès aujourd'hui"),
      body: t(
        "Copy a prompt, paste it into Lovable, Cursor or Claude, and a complete site comes out — fonts, animations, sections. You ship work you could not have coded.",
        "Tu copies un prompt, tu le colles dans Lovable, Cursor ou Claude, et un site complet en sort — polices, animations, sections. Tu livres un travail que tu n'aurais pas su coder.",
      ),
      tag: t("In both plans", "Dans les deux offres"),
      tone: "border-white/12 bg-white/[0.03]",
      accent: "text-white/45",
      icon: "sparkles",
      iconTone: "bg-white/10 text-[#EDE9E0]",
    },
    {
      key: "ebook",
      label: t("Step 2 — Plus the ebook", "Étape 2 — Avec l'ebook"),
      title: t("You can sell what you deliver", "Tu sais vendre ce que tu livres"),
      body: t(
        "Building is half the job. The guide covers the other half: pricing a site, writing the offer, handling the client, delivering and getting paid.",
        "Créer, c'est la moitié du travail. Le guide couvre l'autre moitié : fixer un prix, rédiger l'offre, gérer le client, livrer et te faire payer.",
      ),
      tag: t("Lifetime only", "Uniquement avec l'accès à vie"),
      tone: "border-amber-400/25 bg-amber-400/[0.05]",
      accent: "text-amber-300/80",
      icon: "gift",
      iconTone: "bg-amber-400 text-[#1a1400]",
    },
  ];

  return (
    <section className="relative z-10 mx-auto max-w-6xl px-6 py-16 lg:px-8 lg:py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-2xl text-center"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">{t("Why people buy", "Pourquoi on achète Movento")}</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#EDE9E0] md:text-4xl">
          {t("Enough to start selling websites", "De quoi lancer ton activité de revente de sites")}
        </h2>
        <p className="mt-4 text-sm leading-6 text-white/55">
          {t(
            "Three things, and each one takes you further than the last.",
            "Trois choses, et chacune te mène plus loin que la précédente.",
          )}
        </p>
      </motion.div>

      <ol className="mx-auto mt-12 grid max-w-3xl gap-5 md:grid-cols-2">
        {steps.map((step, i) => (
          <motion.li
            key={step.key}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className={`flex flex-col rounded-[26px] border p-6 md:p-7 ${step.tone}`}
          >
            <div className="flex items-center gap-3">
              <span className={`grid h-8 w-8 flex-none place-items-center rounded-full ${step.iconTone}`}>
                <Icon name={step.icon} className="h-4 w-4" />
              </span>
              <p className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${step.accent}`}>{step.label}</p>
            </div>
            <h3 className="mt-4 text-lg font-semibold leading-snug tracking-tight text-[#EDE9E0]">{step.title}</h3>
            <p className="mt-2.5 text-sm leading-6 text-white/55">{step.body}</p>
            {/* mt-auto, not a fixed margin: the three bodies differ in length and
                the plan labels would otherwise sit at three different heights. */}
            <p className="mt-auto border-t border-white/[0.08] pt-4 text-xs font-medium text-white/40 [margin-top:1.25rem] md:[margin-top:auto]">{step.tag}</p>
          </motion.li>
        ))}
      </ol>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="mt-10 flex flex-col items-center gap-3"
      >
        <button
          onClick={onPick}
          className="inline-flex items-center gap-2 rounded-full bg-[#EDE9E0] px-7 py-3.5 text-sm font-bold text-[#0A0A0B] transition hover:bg-white hover:scale-[1.02]"
        >
          {t("Get all three", "Prendre les trois")} <Icon name="arrow" className="h-4 w-4" />
        </button>
        <p className="text-xs text-white/40">{t("The prompts come with both plans. The ebook only with lifetime.", "Les prompts sont dans les deux offres. L'ebook uniquement à vie.")}</p>
      </motion.div>
    </section>
  );
}

function PricingPage() {
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  // The prompt the visitor was trying to copy, carried over in ?from= so the
  // page answers the click they actually made rather than starting from zero.
  const [fromPrompt] = useState(() => {
    if (typeof window === "undefined") return null;
    const slug = new URLSearchParams(window.location.search).get("from");
    return slug ? availablePrompts.find((p) => slugify(p.title) === slug.toLowerCase()) || null : null;
  });

  function onUnlocked(email, info = {}) {
    window.localStorage.setItem("movento_access_email", email);
    // A pack buyer has nothing unlocked yet — the catalogue would be a wall of
    // locked cards. Send them where the purchase is actually spent.
    if (info.pack) {
      track("pack_purchased");
      window.location.assign("/choose");
      return;
    }
    track("access_unlocked");
    window.location.assign("/#prompts");
  }

  function startCheckout(plan, source) {
    track("checkout_started", { plan: plan.id, source, ...refProps() });
    setCheckoutPlan(plan);
  }

  const scrollToPlans = () => document.getElementById("plans")?.scrollIntoView({ behavior: "smooth", block: "start" });
  // Suppressed while the pack has its own card in the grid above: offering the
  // same thing twice on one screen reads as two different deals.
  const showPackOffer = Boolean(PROMPT_PACK_ENABLED && fromPrompt && packPlan && !visiblePlans.includes(packPlan));

  return (
    <main className="min-h-screen bg-[#0A0A0B] text-[#EDE9E0]">
      <AnimatePresence>
        {checkoutPlan && (
          <CheckoutOverlay
            plan={checkoutPlan}
            prefillEmail={getStoredLeadEmail() || getStoredAccessEmail()}
            onClose={() => setCheckoutPlan(null)}
            onUnlocked={onUnlocked}
          />
        )}
      </AnimatePresence>

      {/* Backdrop: two colour washes plus a faint dot grid that fades out before
          the plan cards, so the cards read as paper on a surface instead of
          floating on flat white. */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <AuroraBand />
        <div className="absolute inset-x-0 top-0 h-[70vh] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:22px_22px] opacity-[0.05] [mask-image:linear-gradient(to_bottom,#000,transparent)]" />
        <div className="absolute left-1/2 top-[-22%] h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-white/[0.05] blur-[130px]" />
      </div>

      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-white/[0.04] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <a href="/" className="transition hover:opacity-80"><Logo /></a>
          <div className="flex items-center gap-2">
            <a href="/#prompts" className="hidden rounded-full px-4 py-2.5 text-sm font-medium text-white/55 transition hover:text-[#EDE9E0] sm:inline-block">{t("Catalog", "Catalogue")}</a>
            <LangSwitch />
            <a href="/" className="rounded-full border border-white/10 bg-[#121214] px-5 py-2.5 text-sm font-medium text-white/75 shadow-sm transition hover:border-white/25 hover:text-[#EDE9E0]">← {t("Back", "Retour")}</a>
          </div>
        </div>
      </header>

      {/* One desktop screen is the rule for the plain pricing page. Arriving
          from a locked prompt adds two rows — which prompt, and the option to
          buy just it — and forcing those into the same height only pushed the
          offer under the launch banner. That trip scrolls instead. */}
      <section className={`relative z-10 mx-auto flex max-w-7xl flex-col justify-center px-6 pb-24 pt-16 lg:px-8 lg:pb-20 lg:pt-4 ${showPackOffer ? "" : "lg:min-h-[calc(100svh-75px)]"}`}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.05]/80 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/80 backdrop-blur">
            <Icon name="sparkles" className="h-3 w-3" /> {t(`${availablePrompts.length} premium prompts`, `${availablePrompts.length} prompts premium`)}
          </span>
          <h1 className="mt-6 text-[2.6rem] font-bold leading-[1.05] tracking-[-0.045em] text-[#EDE9E0] md:text-6xl lg:mt-2 lg:text-[2.2rem]">
            {isSinglePlan ? t("One payment,", "Un paiement,") : t("Choose your", "Choisissez votre")}{" "}
            <span className="text-white/45">{isSinglePlan ? t("forever", "à vie") : t("plan", "offre")}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base leading-7 text-white/55 lg:mt-2 lg:text-[15px] lg:leading-6">{isSinglePlan ? t("Access every premium prompt. Yours for good.", "Accède à tous les prompts premium. À toi pour de bon.") : t("The whole catalogue either way. One payment, or a subscription you stop whenever you like.", "Le catalogue entier dans les deux cas. Un paiement unique, ou un abonnement que tu arrêtes quand tu veux.")}</p>
          {fromPrompt && (
            <p className="mx-auto mt-3 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs text-white/60">
              <Icon name="lock" className="h-3 w-3" /> {t(`To copy “${fromPrompt.title}”`, `Pour copier « ${fromPrompt.title} »`)}
            </p>
          )}
          {/* The rating is declared as AggregateRating in index.html; Google only
              honours that markup when the same figure is visible on the page. */}
          <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 shadow-sm backdrop-blur lg:mt-2">
            <span className="flex items-center gap-0.5 text-amber-400">{[0, 1, 2, 3, 4].map((i) => <Icon key={i} name="star" className="h-3.5 w-3.5" />)}</span>
            <span className="text-sm font-semibold text-[#EDE9E0]">{RATING_SCORE}/5</span>
            <span className="text-sm text-white/40">· {t(`${RATING_COUNT}+ reviews`, `+${RATING_COUNT} avis`)}</span>
          </div>
        </motion.div>

        {/* One column, centred: the offer is the page. Proof lives further down
            so nothing competes with the cards at the moment of the decision. */}
        <div className="mt-14 lg:mt-4">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }} id="plans" className={`mx-auto grid scroll-mt-24 gap-3 sm:gap-5 ${planGridWidth} ${planGridBase} ${visiblePlans.length === 1 ? "" : planGridLg}`}>
            {visiblePlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} featured={plan.featured} loading={Boolean(checkoutPlan)} onBuy={(p) => startCheckout(p, "plan_card")} />
            ))}
          </motion.div>
          {/* Only when the visitor arrived from a specific prompt. Without one
              there is nothing to buy on its own, and a price with no prompt
              attached would just read as a cheaper catalogue. */}
          {showPackOffer && (
            <div className="mx-auto mt-6 w-full max-w-sm lg:mt-1 lg:max-w-2xl">
              {/* Tight on lg: the extra rows of the paywall trip otherwise put
                  this row's last pixels behind the fixed launch banner. */}
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/[0.09] bg-white/[0.03] px-5 py-4 text-center sm:flex-row sm:justify-between sm:text-left lg:py-3">
                <div>
                  <p className="text-sm font-semibold text-[#EDE9E0]">{t("Don't need the whole catalogue?", "Tu ne veux pas tout le catalogue ?")}</p>
                  <p className="mt-0.5 text-xs leading-5 text-white/50">{t(`“${fromPrompt.title}” and ${PROMPT_PACK_SIZE - 1} more of your choice, yours forever.`, `« ${fromPrompt.title} » et ${PROMPT_PACK_SIZE - 1} autres de ton choix, à toi pour toujours.`)}</p>
                </div>
                <button
                  onClick={() => startCheckout(packPlan, "prompt_pack")}
                  disabled={Boolean(checkoutPlan)}
                  className="flex-none rounded-full border border-white/15 bg-transparent px-5 py-2.5 text-sm font-semibold text-[#EDE9E0] transition hover:border-white/35 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t(`Get ${PROMPT_PACK_SIZE} for ${eur(PROMPT_PACK_PRICE)}`, `En prendre ${PROMPT_PACK_SIZE} pour ${eur(PROMPT_PACK_PRICE)}`)}
                </button>
              </div>
            </div>
          )}
          <Reassurance className={showPackOffer ? "mt-9 lg:mt-2" : "mt-9 lg:mt-3"} />
        </div>
      </section>

      <PromoPopup onPick={scrollToPlans} />

      <BusinessLadder onPick={scrollToPlans} />

      <PricingShowcase onPick={scrollToPlans} />

      <Testimonials />

      <footer className="relative z-10 border-t border-white/10 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row lg:px-8">
          <Logo />
          <p className="text-sm text-white/40">© {new Date().getFullYear()} Movento. {t("All rights reserved.", "Tous droits réservés.")}</p>
          <a href="/" className="text-sm text-white/40 transition hover:text-[#EDE9E0]">{t("Back to home", "Retour à l'accueil")}</a>
        </div>
      </footer>

      {/* The banner is fixed, so without this the last rows of the footer sit
          under it once the page is scrolled to the bottom. */}
      <div aria-hidden="true" className="h-16" />
      <PricingBanner onPick={scrollToPlans} />
    </main>
  );
}

function formatDate(value) {
  if (!value) return "";
  // Whop sends ISO strings; older records may still be unix seconds.
  const date = typeof value === "number" ? new Date(value * 1000) : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { year: "numeric", month: "long", day: "numeric" });
}

// Live view of the emails captured for the free prompts. Unlisted, gated by
// ADMIN_TOKEN server-side, and never linked from the site: the API is what
// actually protects the data, this page only carries the token.
function AdminLeadsPage() {
  const [token, setToken] = useState(() => {
    try { return window.localStorage.getItem("movento_admin_token") || ""; } catch { return ""; }
  });
  const [input, setInput] = useState("");
  const [state, setState] = useState({ loading: false, error: "", total: 0, leads: [], fetchedAt: null });
  const [live, setLive] = useState(true);
  // Emails that showed up while the page was open, so a new signup is visible
  // at a glance instead of silently appearing in the list.
  const seenRef = useRef(null);
  const [fresh, setFresh] = useState(() => new Set());

  // "Why does this email have access" for a support case: reads the same
  // sources the site itself checks (the Redis grant, then the live Whop
  // membership) so the answer traces back to a specific reason instead of a
  // guess.
  const [lookupEmail, setLookupEmail] = useState("");
  const [lookup, setLookup] = useState({ loading: false, error: "", data: null });
  // Two clicks to actually delete something: the first arms it, the second (on
  // the same email) fires. Same shape as the subscription page's cancel flow.
  const [revoke, setRevoke] = useState({ confirming: false, loading: false, error: "" });

  async function fetchLookup(value) {
    setLookup({ loading: true, error: "", data: null });
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin-lookup?email=${encodeURIComponent(value)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 401) {
        setLookup({ loading: false, error: "Token refusé.", data: null });
        return;
      }
      if (!response.ok) throw new Error(data.error || "Recherche impossible.");
      setLookup({ loading: false, error: "", data });
    } catch (error) {
      setLookup({ loading: false, error: error.message, data: null });
    }
  }

  async function runLookup(e) {
    e.preventDefault();
    const value = lookupEmail.trim();
    if (!value) return;
    setRevoke({ confirming: false, loading: false, error: "" });
    await fetchLookup(value);
  }

  async function runRevoke() {
    if (!revoke.confirming) {
      setRevoke({ confirming: true, loading: false, error: "" });
      return;
    }
    setRevoke({ confirming: true, loading: true, error: "" });
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin-lookup`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: lookup.data.email }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Retrait impossible.");
      setLookup({ loading: false, error: "", data });
      setRevoke({ confirming: false, loading: false, error: "" });
    } catch (error) {
      setRevoke({ confirming: false, loading: false, error: error.message });
    }
  }

  const LOOKUP_REASONS = {
    blocked: { label: "Bloqué — l'accès est refusé quoi que dise Whop", tone: "text-red-300" },
    redis_grant: { label: "Accès accordé via le webhook Whop", tone: "text-emerald-300" },
    whop_free_trial: { label: "Essai gratuit Whop en cours — pas encore facturé", tone: "text-amber-300" },
    whop_membership: { label: "Adhésion Whop active (achat ou ajout manuel)", tone: "text-emerald-300" },
    pack_only: { label: "A acheté le pack de prompts, pas l'accès complet", tone: "text-white/70" },
    none: { label: "Aucun accès trouvé", tone: "text-white/40" },
  };

  // The full access list, and the block switch that goes with it. Blocking is
  // the durable one: revoking above only deletes our record, which a live Whop
  // membership rewrites on the next check.
  const [access, setAccess] = useState({ loading: false, error: "", rows: [], blocked: [], loaded: false, audited: false });

  // What Whop says about each row's payment. "unpaid" is the one that matters:
  // access on our side with no membership behind it.
  const PAYMENT_LABELS = {
    paid: { label: "payé", tone: "text-emerald-300" },
    paid_pack: { label: "pack payé", tone: "text-emerald-300" },
    trial: { label: "essai — pas encore payé", tone: "text-amber-300" },
    past_due: { label: "impayé — renouvellement en échec", tone: "text-amber-300" },
    canceling: { label: "payé — se termine bientôt", tone: "text-white/50" },
    unpaid: { label: "aucun paiement trouvé", tone: "text-red-300" },
    blocked: { label: "bloqué", tone: "text-white/40" },
    unknown: { label: "non vérifié", tone: "text-white/40" },
  };
  const [accessQuery, setAccessQuery] = useState("");
  const [busyEmail, setBusyEmail] = useState("");
  const [showAccess, setShowAccess] = useState(false);

  async function callAccess(method, body, audit) {
    const response = await fetch(`${API_BASE_URL}/api/admin-access${audit ? "?audit=1" : ""}`, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) throw new Error("Token refusé.");
    if (!response.ok) throw new Error(data.error || "Lecture impossible.");
    return data;
  }

  async function loadAccess(audit = access.audited) {
    setAccess((a) => ({ ...a, loading: true, error: "" }));
    try {
      const data = await callAccess("GET", null, audit);
      setAccess({
        loading: false,
        error: data.auditError ? `Whop: ${data.auditError}` : "",
        rows: data.rows || [],
        blocked: data.blocked || [],
        loaded: true,
        audited: Boolean(data.audited),
      });
    } catch (error) {
      setAccess((a) => ({ ...a, loading: false, error: error.message }));
    }
  }

  async function toggleBlock(email, blocked) {
    setBusyEmail(email);
    try {
      // Carries the audit flag through, so blocking someone does not silently
      // drop the payment column the list was just showing.
      const data = await callAccess("POST", { email, action: blocked ? "unblock" : "block" }, access.audited);
      setAccess({ loading: false, error: "", rows: data.rows || [], blocked: data.blocked || [], loaded: true, audited: Boolean(data.audited) });
      // Keep the single-email panel above honest if it is showing this address.
      // Re-read it rather than patching the fields by hand: unblocking restores
      // whatever access was underneath, and only the server knows what that is.
      if (lookup.data?.email === email) await fetchLookup(email);
    } catch (error) {
      setAccess((a) => ({ ...a, error: error.message }));
    } finally {
      setBusyEmail("");
    }
  }

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;

    async function load() {
      setState((s) => ({ ...s, loading: true }));
      try {
        const response = await fetch(`${API_BASE_URL}/api/leads?limit=500`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await response.json().catch(() => ({}));
        if (cancelled) return;
        if (response.status === 401) {
          setState({ loading: false, error: "Token refusé.", total: 0, leads: [], fetchedAt: null });
          return;
        }
        if (!response.ok) throw new Error(data.error || "Lecture impossible.");

        const leads = data.leads || [];
        if (seenRef.current) {
          const added = leads.map((l) => l.email).filter((e) => !seenRef.current.has(e));
          if (added.length) setFresh((prev) => new Set([...prev, ...added]));
        }
        seenRef.current = new Set(leads.map((l) => l.email));
        setState({ loading: false, error: "", total: data.total || leads.length, leads, fetchedAt: new Date() });
      } catch (error) {
        if (!cancelled) setState((s) => ({ ...s, loading: false, error: error.message }));
      }
    }

    load();
    if (!live) return () => { cancelled = true; };
    const id = window.setInterval(load, 10000);
    return () => { cancelled = true; window.clearInterval(id); };
  }, [token, live]);

  function saveToken(e) {
    e.preventDefault();
    const value = input.trim();
    if (!value) return;
    try { window.localStorage.setItem("movento_admin_token", value); } catch (_) {}
    setToken(value);
    setInput("");
  }

  function forget() {
    try { window.localStorage.removeItem("movento_admin_token"); } catch (_) {}
    setToken("");
    setState({ loading: false, error: "", total: 0, leads: [], fetchedAt: null });
    seenRef.current = null;
    setFresh(new Set());
  }

  function exportCsv() {
    const rows = [["email", "date", "prompt", "ref"]].concat(
      state.leads.map((l) => [l.email, l.registeredAt || "", l.prompt || "", l.ref || ""]),
    );
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "movento-leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const ago = (iso) => {
    if (!iso) return "";
    const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
    if (seconds < 60) return `il y a ${seconds}s`;
    if (seconds < 3600) return `il y a ${Math.round(seconds / 60)} min`;
    if (seconds < 86400) return `il y a ${Math.round(seconds / 3600)} h`;
    return `il y a ${Math.round(seconds / 86400)} j`;
  };

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const today = state.leads.filter((l) => l.registeredAt && new Date(l.registeredAt) >= startOfDay).length;
  const last24h = state.leads.filter((l) => l.registeredAt && Date.now() - new Date(l.registeredAt).getTime() < 86400000).length;

  if (!token) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#0A0A0B] px-6 text-[#EDE9E0]">
        <form onSubmit={saveToken} className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#121214] p-8 shadow-sm">
          <Logo />
          <h1 className="mt-6 text-xl font-bold tracking-tight text-[#EDE9E0]">Emails en direct</h1>
          <p className="mt-2 text-sm leading-6 text-white/55">Colle le token d'administration pour voir les inscriptions aux prompts gratuits.</p>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="ADMIN_TOKEN"
            className="mt-5 w-full rounded-2xl border border-white/10 px-4 py-3 text-sm outline-none transition focus:border-white/35 focus:ring-4 focus:ring-white/10"
          />
          <button type="submit" className="mt-3 w-full rounded-2xl bg-[#08080A] py-3 text-sm font-semibold text-white transition hover:bg-[#141418]">Entrer</button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0A0B] pb-24 text-[#EDE9E0]">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-white/[0.05] backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-4">
          <a href="/" className="transition hover:opacity-80"><Logo /></a>
          <div className="flex items-center gap-2">
            <button onClick={() => setLive((v) => !v)} className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition ${live ? "border-emerald-400/25 bg-emerald-400/[0.07] text-emerald-300" : "border-white/10 bg-[#121214] text-white/55"}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${live ? "animate-pulse bg-emerald-400/[0.1]0" : "bg-slate-300"}`} />
              {live ? "En direct" : "En pause"}
            </button>
            <button onClick={exportCsv} className="rounded-full border border-white/10 bg-[#121214] px-3.5 py-2 text-xs font-semibold text-white/60 transition hover:text-[#EDE9E0]">CSV</button>
            <button onClick={forget} className="rounded-full border border-white/10 bg-[#121214] px-3.5 py-2 text-xs font-semibold text-white/40 transition hover:text-[#EDE9E0]">Quitter</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 pt-10">
        <h1 className="text-3xl font-bold tracking-[-0.03em] text-[#EDE9E0]">Emails collectés</h1>
        <p className="mt-2 text-sm text-white/55">
          {state.fetchedAt ? `Actualisé à ${state.fetchedAt.toLocaleTimeString("fr-FR")}` : "Chargement…"}
          {live && " · rafraîchissement toutes les 10 s"}
        </p>

        {state.error && <div className="mt-6 rounded-2xl border border-red-400/25 bg-red-400/[0.08] p-4 text-sm text-red-300">{state.error}</div>}

        <div className="mt-6 grid grid-cols-3 gap-3">
          {[["Total", state.total], ["Aujourd'hui", today], ["24 h", last24h]].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-[#121214] p-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-white/40">{label}</p>
              <p className="mt-1 text-2xl font-bold text-[#EDE9E0]">{value}</p>
            </div>
          ))}
        </div>

        <form onSubmit={runLookup} className="mt-6 rounded-2xl border border-white/10 bg-[#121214] p-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-white/40">Pourquoi cet email a-t-il accès ?</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            <input
              type="email"
              value={lookupEmail}
              onChange={(e) => setLookupEmail(e.target.value)}
              placeholder="client@exemple.com"
              className="min-w-[220px] flex-1 rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2.5 text-sm outline-none transition focus:border-white/35 focus:ring-4 focus:ring-white/10"
            />
            <button type="submit" disabled={lookup.loading} className="rounded-xl bg-[#08080A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#141418] disabled:opacity-60">{lookup.loading ? "…" : "Chercher"}</button>
          </div>
          {lookup.error && <p className="mt-3 text-sm text-red-300">{lookup.error}</p>}
          {lookup.data && (
            <div className="mt-4 space-y-3 border-t border-white/[0.07] pt-4 text-sm">
              <p className={`font-semibold ${LOOKUP_REASONS[lookup.data.reason]?.tone || "text-white/70"}`}>
                {LOOKUP_REASONS[lookup.data.reason]?.label || lookup.data.reason} {lookup.data.hasAccess ? "· accès complet actif" : ""}
              </p>
              {lookup.data.redis && (
                <div className="text-white/55">
                  <p className="text-white/40">Enregistrement Redis (webhook)</p>
                  <p>{lookup.data.redis.type || "?"} · {lookup.data.redis.kind || "?"} · {lookup.data.redis.status || "?"} · accordé {formatDate(lookup.data.redis.grantedAt) || "?"}</p>
                </div>
              )}
              {lookup.data.whop.found && (
                <div className="text-white/55">
                  <p className="text-white/40">Adhésion Whop</p>
                  <p>{lookup.data.whop.product || "?"} · statut {lookup.data.whop.status || "?"} · plan {lookup.data.whop.planKind || lookup.data.whop.planId || "inconnu"}{lookup.data.whop.renewalPeriodEnd ? ` · renouvelle le ${formatDate(lookup.data.whop.renewalPeriodEnd)}` : ""}</p>
                </div>
              )}
              {!lookup.data.whop.configured && <p className="text-white/40">Clé API Whop non configurée — vérification limitée à Redis.</p>}
              {lookup.data.whop.error && <p className="text-red-300/80">Whop: {lookup.data.whop.error}</p>}
              {(lookup.data.packCredits > 0 || lookup.data.ownedPrompts.length > 0) && (
                <p className="text-white/55">Pack: {lookup.data.packCredits} crédit(s) restant(s), {lookup.data.ownedPrompts.length} prompt(s) débloqué(s).</p>
              )}
              <p className={lookup.data.webhookSecretConfigured ? "text-white/40" : "font-semibold text-red-300"}>
                {lookup.data.webhookSecretConfigured ? "Signature du webhook Whop vérifiée." : "⚠ WHOP_WEBHOOK_SECRET absent — le webhook accepte des requêtes non signées."}
              </p>

              {lookup.data.revoked && <p className="font-semibold text-emerald-300">Accès retiré.</p>}

              {/* The durable one. Offered whatever the records say — an email
                  with nothing on file can still be blocked ahead of time, and a
                  blocked one always needs a way back. */}
              <div className="border-t border-white/[0.07] pt-3">
                <button
                  type="button"
                  onClick={() => toggleBlock(lookup.data.email, lookup.data.blocked)}
                  disabled={busyEmail === lookup.data.email}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${lookup.data.blocked ? "border border-white/15 bg-[#0A0A0B] text-white/70 hover:text-[#EDE9E0]" : "bg-red-500 text-white hover:bg-red-400"}`}
                >
                  {busyEmail === lookup.data.email ? "…" : lookup.data.blocked ? "Débloquer" : "Bloquer définitivement"}
                </button>
                <p className="mt-2 text-xs text-white/40">
                  {lookup.data.blocked
                    ? "Débloquer rend l'accès que cet email avait avant le blocage, s'il en avait un."
                    : "Bloquer refuse l'accès avant même de consulter Whop — contrairement au retrait ci-dessous, une adhésion active ne le contourne pas."}
                </p>
              </div>

              {/* Deletes only our own record — never touches Whop. A live Whop
                  membership re-grants itself through the fallback this same
                  endpoint reads, the next time that email is checked, so this
                  button is the fix for a stray record, not a way to stop
                  billing. The warning underneath says so whenever one exists. */}
              {lookup.data.redis && (
                <div className="border-t border-white/[0.07] pt-3">
                  {lookup.data.whop.found && (
                    <p className="mb-2 text-xs text-amber-300/90">
                      Une adhésion Whop est toujours active pour cet email — retirer l'accès ici ne l'annule pas, il reviendra au prochain contrôle tant qu'elle existe. Annule-la sur Whop pour un retrait définitif.
                    </p>
                  )}
                  {/* type="button" is load-bearing: this sits inside the search
                      <form>, and a bare <button> there defaults to type="submit"
                      — every click would have re-run the search first, which
                      resets `revoke` and made the confirm step unreachable. */}
                  <button
                    type="button"
                    onClick={runRevoke}
                    disabled={revoke.loading}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${revoke.confirming ? "bg-red-500 text-white hover:bg-red-400" : "border border-red-400/30 bg-red-400/[0.08] text-red-300 hover:bg-red-400/[0.14]"}`}
                  >
                    {revoke.loading ? "…" : revoke.confirming ? "Confirmer le retrait" : "Retirer l'accès"}
                  </button>
                  {revoke.confirming && !revoke.loading && (
                    <button type="button" onClick={() => setRevoke({ confirming: false, loading: false, error: "" })} className="ml-2 text-sm text-white/40 hover:text-white/70">Annuler</button>
                  )}
                  {revoke.error && <p className="mt-2 text-sm text-red-300">{revoke.error}</p>}
                </div>
              )}
            </div>
          )}
        </form>

        {/* Behind a toggle rather than always open: it scans the keyspace, so
            it is the one thing on this page worth asking for explicitly instead
            of running beside a list that refreshes every ten seconds. */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-[#121214] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-white/40">
              Tous les accès{access.loaded ? ` · ${access.rows.length}` : ""}
              {access.blocked.length ? ` · ${access.blocked.length} bloqué${access.blocked.length > 1 ? "s" : ""}` : ""}
            </p>
            <button
              type="button"
              onClick={() => { setShowAccess((v) => !v); if (!access.loaded) loadAccess(); }}
              className="rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2 text-xs font-semibold text-white/60 transition hover:text-[#EDE9E0]"
            >
              {showAccess ? "Masquer" : access.loaded ? "Afficher" : "Charger la liste"}
            </button>
          </div>

          {showAccess && (
            <div className="mt-4 border-t border-white/[0.07] pt-4">
              {access.error && <p className="mb-3 text-sm text-red-300">{access.error}</p>}
              {access.loading && <p className="text-sm text-white/40">Chargement…</p>}

              {access.loaded && !access.loading && (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="search"
                      value={accessQuery}
                      onChange={(e) => setAccessQuery(e.target.value)}
                      placeholder="Filtrer par email…"
                      className="min-w-[200px] flex-1 rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2 text-sm outline-none transition focus:border-white/35"
                    />
                    <button type="button" onClick={() => loadAccess(true)} className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition ${access.audited ? "border border-white/10 bg-[#0A0A0B] text-white/60 hover:text-[#EDE9E0]" : "bg-[#EDE9E0] text-[#0A0A0B] hover:bg-white"}`}>
                      {access.audited ? "Revérifier sur Whop" : "Vérifier les paiements"}
                    </button>
                    <button type="button" onClick={() => loadAccess()} className="rounded-xl border border-white/10 bg-[#0A0A0B] px-3.5 py-2 text-xs font-semibold text-white/60 transition hover:text-[#EDE9E0]">Actualiser</button>
                  </div>

                  {/* Counts first: the question is "how many did not pay", and
                      scanning a list of rows to answer it is the slow way. */}
                  {access.audited && (
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      {["paid", "paid_pack", "trial", "past_due", "canceling", "unpaid", "blocked"].map((key) => {
                        const count = access.rows.filter((r) => r.payment === key).length;
                        if (!count) return null;
                        return <span key={key} className={PAYMENT_LABELS[key].tone}><span className="font-semibold">{count}</span> {PAYMENT_LABELS[key].label}</span>;
                      })}
                    </div>
                  )}
                  {access.audited && access.rows.some((r) => r.missingRecord) && (
                    <p className="mt-2 text-xs text-amber-300/90">
                      {access.rows.filter((r) => r.missingRecord).length} personne(s) paient sur Whop sans aucun accès enregistré ici — un webhook qui n'est jamais arrivé. Elles apparaissent en bas de la liste.
                    </p>
                  )}

                  {access.rows.length === 0 ? (
                    <p className="py-8 text-center text-sm text-white/40">Aucun accès enregistré.</p>
                  ) : (
                    <ul className="mt-3 divide-y divide-white/[0.07]">
                      {access.rows
                        .filter((r) => !accessQuery.trim() || r.email.toLowerCase().includes(accessQuery.trim().toLowerCase()))
                        .map((r) => (
                          <li key={r.email} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 py-3">
                            <span className="min-w-0 flex-1">
                              <button type="button" onClick={() => { setLookupEmail(r.email); fetchLookup(r.email); }} title="Voir le détail" className={`block max-w-full truncate text-left text-sm font-medium transition hover:text-white/70 ${r.blocked ? "text-red-300 line-through" : "text-[#EDE9E0]"}`}>{r.email}</button>
                              <span className="block truncate text-xs text-white/40">
                                {r.missingRecord ? "Aucun accès enregistré ici" : r.fullAccess ? `Accès complet${r.kind ? ` · ${r.kind}` : ""}${r.grantedAt ? ` · ${formatDate(r.grantedAt)}` : ""}` : "Pack"}
                                {r.credits > 0 || r.owned > 0 ? ` · ${r.credits} crédit(s), ${r.owned} prompt(s)` : ""}
                                {r.blocked ? " · bloqué" : ""}
                                {r.payment && r.payment !== "unknown" && (
                                  <> · <span className={PAYMENT_LABELS[r.payment]?.tone || "text-white/40"}>{PAYMENT_LABELS[r.payment]?.label || r.payment}</span>{r.whopProduct ? ` (${r.whopProduct})` : ""}</>
                                )}
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleBlock(r.email, r.blocked)}
                              disabled={busyEmail === r.email}
                              className={`flex-none rounded-full px-3.5 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${r.blocked ? "border border-white/15 bg-[#0A0A0B] text-white/60 hover:text-[#EDE9E0]" : "border border-red-400/30 bg-red-400/[0.08] text-red-300 hover:bg-red-400/[0.16]"}`}
                            >
                              {busyEmail === r.email ? "…" : r.blocked ? "Débloquer" : "Bloquer"}
                            </button>
                          </li>
                        ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#121214]">
          {state.leads.length === 0 && !state.loading ? (
            <p className="px-5 py-10 text-center text-sm text-white/40">Aucun email pour l'instant.</p>
          ) : (
            <ul className="divide-y divide-white/[0.07]">
              {state.leads.map((lead) => (
                <li key={lead.email} className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-3.5 transition ${fresh.has(lead.email) ? "bg-emerald-400/[0.1]/70" : ""}`}>
                  <span className="min-w-0 flex-1">
                    <button onClick={() => copyTextToClipboard(lead.email)} title="Copier" className="block max-w-full truncate text-left text-sm font-medium text-[#EDE9E0] transition hover:text-white/70">{lead.email}</button>
                    {lead.prompt && <span className="block truncate text-xs text-white/40">{lead.prompt}{lead.ref ? ` · via ${lead.ref}` : ""}</span>}
                  </span>
                  <span className="flex-none text-xs text-white/40">{ago(lead.registeredAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}

function SubscriptionPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ loading: false, error: "", data: null, checked: false });
  const [cancel, setCancel] = useState({ confirming: false, loading: false, done: false, error: "", renewalDate: null });

  const clean = (v) => String(v).replace(/[\s\u00AD\u200B-\u200D\u2060\uFEFF]/g, "").toLowerCase();

  async function doCancel() {
    setCancel((c) => ({ ...c, loading: true, error: "" }));
    try {
      const response = await fetch(`${API_BASE_URL}/api/cancel-subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: clean(email) }),
      });
      const d = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(apiError(d, t("Cancellation failed. Please retry.", "La r\u00E9siliation a \u00E9chou\u00E9. R\u00E9essaie.")));
      setCancel({ confirming: false, loading: false, done: true, error: "", renewalDate: d.renewalDate || null });
    } catch (error) {
      setCancel((c) => ({ ...c, loading: false, error: error.message }));
    }
  }

  async function lookup(e) {
    if (e) e.preventDefault();
    const normalized = clean(email);
    if (!normalized) return;
    setCancel({ confirming: false, loading: false, done: false, error: "", renewalDate: null });
    setStatus({ loading: true, error: "", data: null, checked: false });
    try {
      const response = await fetch(`${API_BASE_URL}/api/subscription-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error");
      setStatus({ loading: false, error: "", data, checked: true });
    } catch (error) {
      setStatus({ loading: false, error: t("Unable to retrieve your subscription. Please try again.", "Impossible de récupérer votre abonnement. Réessayez."), data: null, checked: true });
    }
  }

  const data = status.data;
  const statusLabel = (s) => ({
    active: t("Active", "Actif"),
    trialing: t("Free trial", "Essai gratuit"),
    past_due: t("Payment overdue", "Paiement en retard"),
    canceling: t("Cancelling", "En cours de résiliation"),
    completed: t("Active", "Actif"),
  })[s] || s;

  return (
    <main className="min-h-screen bg-[#0A0A0B] text-[#EDE9E0]">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-20%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-white/[0.05] blur-[120px]" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <a href="/"><Logo /></a>
        <div className="flex items-center gap-3">
          <LangSwitch />
          <a href="/" className="rounded-full border border-white/10 bg-[#121214] px-5 py-2.5 text-sm font-medium text-white/75 shadow-sm transition hover:border-white/25 hover:text-[#EDE9E0]">← {t("Back", "Retour")}</a>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-2xl px-6 pb-24 pt-8 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-[#EDE9E0] md:text-5xl">{t("My subscription", "Mon abonnement")}</h1>
        <p className="mt-3 text-sm leading-6 text-white/55">{t("Enter the email you used at checkout to view and manage your subscription.", "Entrez l'email utilisé lors de l'achat pour voir et gérer votre abonnement.")}</p>

        <form onSubmit={lookup} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" inputMode="email" autoComplete="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="email@example.com" className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#121214] px-4 py-3 text-sm text-[#EDE9E0] outline-none placeholder:text-white/40 focus:border-white/35 focus:ring-4 focus:ring-white/10" />
          <button type="submit" disabled={status.loading} className="rounded-2xl bg-[#08080A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#141418] hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60">{status.loading ? t("Checking...", "Vérification...") : t("View", "Voir")}</button>
        </form>

        {status.error && <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-400/25 bg-red-400/[0.08] p-4 text-sm leading-6 text-red-300"><Icon name="alert" className="mt-1 h-4 w-4 flex-none" /><p>{status.error}</p></div>}

        {status.checked && !status.error && data && !data.found && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-[#121214] p-6 shadow-sm">
            <p className="text-sm leading-6 text-white/60">{t("No active subscription found for this email.", "Aucun abonnement actif trouvé pour cet email.")}</p>
            <a href="/pricing" className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#08080A] px-6 py-3 text-sm font-bold text-white shadow-none transition hover:bg-[#141418] hover:scale-[1.03]">{t("See plans", "Voir les offres")} <Icon name="arrow" className="h-4 w-4" /></a>
          </div>
        )}

        {status.checked && data && data.found && (
          <div className="mt-6 rounded-[28px] border border-white/10 bg-[#121214] p-7 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/40">{t("Plan", "Offre")}</p>
                <h2 className="mt-1 text-2xl font-semibold text-[#EDE9E0]">{data.plan}</h2>
              </div>
              {data.type === "subscription" ? (
                <span className={`rounded-full border px-3 py-1 text-xs font-medium ${data.status === "past_due" ? "border-red-400/25 bg-red-400/[0.08] text-red-300" : "border-emerald-400/25 bg-emerald-400/[0.07] text-emerald-300"}`}>{statusLabel(data.status)}</span>
              ) : (
                <span className="rounded-full border border-white/12 bg-white/[0.05] px-3 py-1 text-xs font-medium text-white/80">{t("Lifetime access", "Accès à vie")}</span>
              )}
            </div>

            {data.type === "subscription" && (
              <div className="mt-6 space-y-2 text-sm text-white/60">
                {data.status === "trialing" && data.renewalDate && <p>{t("Free trial ends on", "Fin de l'essai gratuit le")} <span className="font-medium text-[#EDE9E0]">{formatDate(data.renewalDate)}</span>.</p>}
                {data.cancelAtPeriodEnd ? (
                  <p className="text-amber-300">{t("Your subscription is cancelled and will end on", "Votre abonnement est résilié et se terminera le")} <span className="font-medium">{formatDate(data.renewalDate)}</span>.</p>
                ) : (
                  data.renewalDate && data.status !== "trialing" && <p>{t("Next renewal on", "Prochain renouvellement le")} <span className="font-medium text-[#EDE9E0]">{formatDate(data.renewalDate)}</span>.</p>
                )}
              </div>
            )}

            {data.type === "lifetime" && (
              <p className="mt-6 text-sm leading-6 text-white/60">{t("You have lifetime access — no subscription to manage.", "Vous avez un accès à vie — aucun abonnement à gérer.")}</p>
            )}

            {data.type !== "lifetime" && (
              <div className="mt-7 border-t border-white/[0.07] pt-6">
                {(cancel.done || data.cancelAtPeriodEnd || data.status === "canceling") ? (
                  <div className="flex items-start gap-2 rounded-2xl border border-amber-400/25 bg-amber-400/[0.07] p-4 text-sm leading-6 text-amber-300">
                    <Icon name="check" className="mt-0.5 h-4 w-4 flex-none" />
                    <p>{t("Subscription cancelled — you keep access until", "Abonnement résilié — tu gardes l'accès jusqu'au")} <span className="font-medium">{formatDate(cancel.renewalDate || data.renewalDate)}</span>.</p>
                  </div>
                ) : cancel.confirming ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-sm font-semibold text-[#EDE9E0]">{t("Cancel your subscription?", "Résilier ton abonnement ?")}</p>
                    <p className="mt-1 text-xs leading-5 text-white/55">{t("You'll keep access until the end of the current period. You can resubscribe anytime.", "Tu gardes l'accès jusqu'à la fin de la période en cours. Tu peux te réabonner quand tu veux.")}</p>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <button onClick={doCancel} disabled={cancel.loading} className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">{cancel.loading ? t("Cancelling…", "Résiliation…") : t("Yes, cancel", "Oui, résilier")}</button>
                      <button onClick={() => setCancel((c) => ({ ...c, confirming: false, error: "" }))} disabled={cancel.loading} className="rounded-xl border border-white/10 bg-[#121214] px-5 py-2.5 text-sm font-semibold text-white/75 transition hover:border-white/25 disabled:opacity-60">{t("Keep my subscription", "Garder mon abonnement")}</button>
                    </div>
                    {cancel.error && <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-red-300"><Icon name="alert" className="mt-0.5 h-3.5 w-3.5 flex-none" />{cancel.error}</p>}
                  </div>
                ) : (
                  <>
                    <button onClick={() => setCancel({ confirming: true, loading: false, done: false, error: "", renewalDate: null })} className="inline-flex items-center gap-2 rounded-2xl border border-red-400/25 bg-[#121214] px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-400/[0.1]">
                      {t("Cancel my subscription", "Résilier mon abonnement")}
                    </button>
                    <p className="mt-3 text-xs leading-5 text-white/40">{t("Cancelling keeps your access until the end of the current period.", "La résiliation conserve ton accès jusqu'à la fin de la période en cours.")}</p>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* The ebook and the support link live here too, so they survive
            closing the success page. */}
        {status.checked && data && data.found && earnedSupport(data) && <SupportCard className="mt-4" />}
        {status.checked && data && data.found && earnedEbook(data) && <EbookCard className="mt-4" />}
      </section>

      <footer className="relative z-10 border-t border-white/10 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row lg:px-8">
          <Logo />
          <p className="text-sm text-white/40">© {new Date().getFullYear()} Movento. {t("All rights reserved.", "Tous droits réservés.")}</p>
          <a href="/" className="text-sm text-white/40 transition hover:text-[#EDE9E0]">{t("Back to home", "Retour à l'accueil")}</a>
        </div>
      </footer>
    </main>
  );
}

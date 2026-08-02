import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { track } from "@vercel/analytics";
import { getRef, refProps } from "./affiliate.js";

const VIDEO_ASSETS = "https://raw.githubusercontent.com/aayushsoam/motionsites.ai/main/assets/videos/";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:4242" : "");
const CHECKOUT_API_URL = import.meta.env.VITE_CHECKOUT_API_URL || `${API_BASE_URL}/api/create-checkout-session`;
// Walkthrough video shown under the three steps. TikTok's iframe embed is used
// rather than their embed.js so the page pulls no third-party script.
const TIKTOK_VIDEO_ID = "7662839288530210080";
// Free bonus ebook handed to buyers on the post-payment page.
const EBOOK_URL = "https://drive.google.com/file/d/1Rudbr82oNNV1TJ8okGjozPybSxIvAmPs/view?usp=sharing";
// Exclusive promo code surfaced at the end of the welcome quiz (create it in Whop
// for it to actually apply at checkout). Visitors arriving through an affiliate
// link get their own code, so their redemptions can be told apart.
const PROMO_CODE = "HERO10";
const AFFILIATE_PROMO_CODE = "MOVENTO10";
// Customer rating, kept in one place: it is shown on the page AND declared as
// AggregateRating in index.html, and Google drops the markup if the two disagree.
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
  } catch {
    // No storage (private mode) — fall through to the default.
  }
  return "fr";
})();
// Keep the declared language in step with what is actually rendered.
try { document.documentElement.lang = lang; } catch { /* no DOM (SSR/tests) */ }
function t(en, fr) { return lang === "fr" ? fr : en; }

const makePreview = (name, ext = "mp4") => `${VIDEO_ASSETS}${name}_0.${ext}`;

const prompts = [
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
  { title: "Mostar Cinematic Scroll", category: "Landing Page", type: "Landing", file: "Mostar_Cinematic_Scroll.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/a/CleanShot%202026-07-31%20at%2007.43.14.mp4", tags: ["Cinematic", "Scroll", "Parallax"], gradient: "from-sky-200 via-cyan-600 to-[#0b1110]" },
  { title: "1Brain Studio", category: "Agency", type: "Hero", file: "1Brain_Cinematic_Video_Hero.md", preview: "https://cdn.5sdesign.art/projects/1brain.mp4", tags: ["Cinematic", "Scroll Video", "Glass"], gradient: "from-neutral-300 via-neutral-600 to-black" },
  { title: "Moss Sea Moss Store", category: "Landing Page", type: "Landing", file: "Moss_Botanical_Commerce.md", preview: "https://cdn.5sdesign.art/projects/moss.mp4", tags: ["E-commerce", "Dark", "Wellness"], gradient: "from-stone-300 via-emerald-900 to-[#060606]" },
  { title: "Paradiso Newsletter CTA", category: "Component", type: "Component", file: "Paradiso_Newsletter_CTA.md", preview: "https://cdn.sceneai.art/landing-pages/33ca7181-9976-4d1d-94b1-41b9c5b5e488.mov", tags: ["CTA", "Real Estate", "Email"], gradient: "from-emerald-200 via-teal-600 to-slate-900" },
  { title: "Amée Paris Couture", category: "Landing Page", type: "Landing", file: "Amee_Paris_Couture.md", preview: "https://cdn.5sdesign.art/projects/amee-paris.mp4", tags: ["Fashion", "Editorial", "Marquee"], gradient: "from-stone-200 via-neutral-400 to-[#0E0E0E]" },
  { title: "Porgas Step Into Wonder", category: "Landing Page", type: "Landing", file: "Porgas_Step_Into_Wonder.md", preview: "https://cdn.5sdesign.art/projects/porgas.mp4", tags: ["Parallax", "Scroll", "Serif"], gradient: "from-amber-200 via-orange-800 to-[#0a0608]" },
  { title: "Serene Wellness", category: "Landing Page", type: "Landing", file: "Serene_Wellness_Landing.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/uploaded/planetscrollArea.mp4", tags: ["Wellness", "Parallax", "Glass"], gradient: "from-sky-200 via-cyan-700 to-[#010A17]" },
  { title: "Marcus Bennet Portfolio", category: "Portfolio", type: "Hero", file: "Marcus_Bennet_Portfolio.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/a/showcaseareaArea.mp4", tags: ["Portfolio", "Editorial", "Marquee"], gradient: "from-stone-200 via-neutral-500 to-black" },
  { title: "LaunchPad Blog", category: "Component", type: "Component", file: "Launchpad_Insights_Blog.md", preview: "https://cdn.sceneai.art/landing-pages/1947878a-fa95-4ac2-9369-84e343feba2e.mov", tags: ["Blog", "SaaS", "Cards"], gradient: "from-blue-200 via-blue-500 to-slate-900" },
  { title: "Synergeus Fintech", category: "Fintech", type: "Landing", file: "Synergeus_Fintech_Landing.md", preview: "https://admin.lafys.com/api/media/file/synergeus_JaaqgDoA.mp4", tags: ["Fintech", "AI", "Serif"], gradient: "from-lime-200 via-emerald-600 to-black" },
  { title: "Pelmatech Health", category: "Landing Page", type: "Landing", file: "Pelmatech_Health_Landing.md", preview: "https://admin.lafys.com/api/media/file/Pelmatech1.mp4", tags: ["Health", "Editorial", "Carousel"], gradient: "from-stone-200 via-neutral-400 to-neutral-900" },
  { title: "Picway Gallery", category: "Landing Page", type: "Hero", file: "Picway_Gallery_Hero.md", preview: "https://cdn.5sdesign.art/projects/picway.mp4", tags: ["WebGL", "Editorial", "Gallery"], gradient: "from-orange-100 via-amber-200 to-neutral-800" },
  { title: "Azaka Creative Director", category: "Portfolio", type: "Hero", file: "Azaka_Creative_Director.md", preview: "https://cdn.5sdesign.art/projects/azaka.mp4", tags: ["Cinematic", "Cursor", "Dark"], gradient: "from-neutral-200 via-neutral-600 to-[#050505]" },
  { title: "Metery Web3", category: "Web3", type: "Hero", file: "Metery_Web3_Hero.md", preview: "https://cdn.5sdesign.art/projects/metery.mp4", tags: ["Web3", "Nature", "Video"], gradient: "from-amber-200 via-lime-600 to-[#0d130f]" },
  { title: "Airlines Travel", category: "Landing Page", type: "Hero", file: "Airlines_Travel_Hero.md", preview: "https://cdn.sceneai.art/landing-pages/9fffaa43-bc70-467c-b53f-f0bd27a5b342.mp4", tags: ["Travel", "Cinematic", "Video"], gradient: "from-sky-200 via-sky-600 to-slate-900" },
  { title: "Farcy AI Agents", category: "AI / SaaS", type: "Hero", file: "Farcy_AI_Agents_Hero.md", preview: "https://cdn.5sdesign.art/projects/farcy.mp4", tags: ["AI", "Glass", "Dark"], gradient: "from-lime-300 via-emerald-700 to-[#0b0d0b]" },
  { title: "Mapple Headphones", category: "Landing Page", type: "Landing", file: "Mapple_Headphone_Store.md", preview: "https://cdn.5sdesign.art/projects/mapple.mp4", tags: ["E-commerce", "Product", "Glass"], gradient: "from-amber-200 via-stone-500 to-[#0e0d0b]" },
  { title: "Zpeed Motorsport", category: "Landing Page", type: "Hero", file: "Zpeed_Motorsport_Hero.md", preview: "https://cdn.5sdesign.art/projects/zpeed.mp4", tags: ["Sport", "Editorial", "Video"], gradient: "from-red-300 via-red-700 to-[#181818]" },
  { title: "Chipmuk Studio", category: "Agency", type: "Hero", file: "Chipmuk_Hero.md", preview: "https://cdn.5sdesign.art/projects/chipmuk.mp4", tags: ["Studio", "Scrub", "Cinematic"], gradient: "from-sky-200 via-blue-700 to-[#010828]" },
  { title: "Relevance AI Search", category: "AI / SaaS", type: "Hero", file: "Relevance_AI_Hero.md", preview: "https://cdn.sceneai.art/landing-pages/856338f8-bbd7-4522-b55b-856e79fe977b.mp4", tags: ["AI", "Search", "Dark"], gradient: "from-zinc-300 via-zinc-600 to-black" },
  { title: "ihouse Smart Home", category: "SaaS", type: "Hero", file: "Ihouse_Smart_Home_Hero.md", preview: "https://cdn.5sdesign.art/projects/ihouse.mp4", tags: ["Smart Home", "Glass", "3D"], gradient: "from-sky-200 via-blue-500 to-[#3f7dd6]" },
  { title: "Norm Architects Studio", category: "Agency", type: "Landing", file: "Norm_Architects_Studio.md", preview: "https://cdn.shipper.now/video/users/cmm7biunr0006k1040dpvere0/1785141891816-6fxw1qs5bfb-Video_Project_10_-_Trim.mp4", tags: ["Studio", "Minimal", "Video"], gradient: "from-stone-200 via-neutral-400 to-neutral-900" },
  { title: "Boomerang", category: "Fintech", type: "Landing", file: "Boomerang_Landing.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/a/trustflowginArea.mp4", tags: ["Fintech", "AI", "Serif"], gradient: "from-stone-100 via-neutral-400 to-[#191919]" },
  { title: "Adam Roberts Portfolio", category: "Portfolio", type: "Landing", file: "Adam_Roberts_Portfolio.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/a/digitaldirector.mp4", tags: ["Portfolio", "Pixel", "Video"], gradient: "from-neutral-200 via-neutral-600 to-black" },
  { title: "Jack — 3D Creator", category: "Portfolio", type: "Landing", file: "Jack_3D_Creator.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/uploaded/jackportofplio.mp4", tags: ["3D", "Portfolio", "Video"], gradient: "from-fuchsia-400 via-purple-600 to-[#0C0C0C]" },
  { title: "Healcure Medical", category: "Landing Page", type: "Hero", file: "Healcure_Medical_Hero.md", preview: "https://cdn.sceneai.art/landing-pages/a2a9ca39-628c-4fc1-b0b3-aff67fedf4c6.mov", tags: ["Health", "Trust", "Editorial"], gradient: "from-teal-200 via-teal-600 to-slate-900" },
  { title: "Pizza Restaurant", category: "Landing Page", type: "Landing", file: "Pizza.md", preview: "https://i.imgur.com/79tTQ9Y.jpeg", tags: ["Restaurant", "Food", "Framer"], gradient: "from-red-300 via-orange-600 to-[#1A0D08]" },
  { title: "Wandor Travel Hero", category: "Landing Page", type: "Hero", file: "Wandor_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/a/where%20willArea.mp4", tags: ["Travel", "Glass", "Video"], gradient: "from-amber-200 via-orange-600 to-[#2A1810]" },
  { title: "Beanro Coffee Shop", category: "Landing Page", type: "Landing", file: "Beanro_Coffee_Shop.md", preview: "https://i.postimg.cc/7LKy8X3y/Capture-d-e-cran-2026-07-19-a-16-34-59.png", tags: ["Coffee Shop", "E-commerce", "Warm"], gradient: "from-amber-200 via-orange-700 to-[#2A1810]" },
  { title: "Aethera Lending Hero", category: "Fintech", type: "Hero", file: "Aethera_Lending_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/a/handstouchgodArea.mp4", tags: ["Fintech", "Editorial", "Video"], gradient: "from-neutral-100 via-stone-400 to-neutral-900" },
  { title: "GlobalBank Projects", category: "SaaS", type: "Hero", file: "Globalbank_Project_Hero.md", preview: "https://cdn.sceneai.art/landing-pages/dcea62ef-17b9-4e8c-8201-2a65f2ed5ef4.mov", tags: ["SaaS", "Light", "Green"], gradient: "from-emerald-100 via-emerald-400 to-emerald-900" },
  { title: "NHM Hero", category: "Landing Page", type: "Landing", file: "NHM_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(75).webp", tags: ["Museum", "Editorial", "Scroll"], gradient: "from-neutral-300 via-stone-600 to-[#0a0a0a]" },
  { title: "Love Bag Hero", category: "Landing Page", type: "Landing", file: "Love_Bag_Hero.md", preview: "https://admin.lafys.com/api/media/file/bags_EV1r0FBY.mp4", tags: ["E-commerce", "Scroll", "Video"], gradient: "from-amber-100 via-stone-300 to-neutral-900" },
  { title: "Pallet Ross", category: "Landing Page", type: "Landing", file: "Pallet_Ross_Landing.md", preview: "https://admin.lafys.com/api/media/file/4d32e42469657663b66a3c08aeccd70e_1DkflpwZ.mp4", tags: ["Marketplace", "Scroll", "Video"], gradient: "from-teal-200 via-red-400 to-neutral-900" },
  { title: "VALMAX Hero", category: "Portfolio", type: "Landing", file: "Valmax_Hero.md", preview: "https://admin.lafys.com/api/media/file/valmax_NCXFcrZo.mp4", tags: ["Photography", "Stars", "Video"], gradient: "from-lime-300 via-neutral-700 to-black" },
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
  { title: "NeuralKinetics Hero", category: "Fintech", type: "Hero", file: "NeuralKinetics_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/prompts%20(i've%20added%20them%20to%20the%20motionsites)/132Area.mp4", tags: ["Fintech", "Video", "Minimal"], gradient: "from-zinc-200 via-slate-400 to-black" },
  { title: "prmpt Archive", category: "Portfolio", type: "Landing", file: "prmpt_Archive.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/fe42Area.mp4", tags: ["Scroll", "Fashion", "Cursor"], gradient: "from-neutral-200 via-neutral-500 to-black" },
  { title: "VEX Ventures", category: "Landing Page", type: "Hero", file: "VEX_Ventures.md", preview: "https://motionsites.ai/assets/hero-vex-ventures-preview-BczMFIiw.gif", tags: ["Ventures", "Video", "Bold"], gradient: "from-zinc-100 via-zinc-500 to-black" },
  { title: "Cortexa FAQ", category: "Component", type: "Component", file: "Cortexa_FAQ.md", preview: "https://cdn.sceneai.art/landing-pages/b64f5a41-4690-4a19-99b3-f6a2f102311f.mov", tags: ["FAQ", "Accordion", "Editorial"], gradient: "from-white via-neutral-300 to-neutral-800" },
  { title: "Fearless Studio Hero", category: "Agency", type: "Hero", file: "Fearless_Studio_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(71).webp", tags: ["Studio", "Bold", "Video"], gradient: "from-violet-400 via-purple-700 to-black" },
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
  { title: "Gulfselite Private Jet", category: "Landing Page", type: "Hero", file: "Gulfselite_Jet_Hero.md", preview: "https://cdn.sceneai.art/landing-pages/42ce5ea2-d807-4a5f-90a9-0f3082988c1b.mov", tags: ["Luxury", "Aviation", "Serif"], gradient: "from-sky-100 via-slate-400 to-slate-900" },
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
  { title: "Orbis NFT", category: "Landing Page", type: "Landing", file: "Orbis_NFT.md", preview: "https://motionsites.ai/assets/hero-orbis-nft-preview-C3wvh77a.gif", tags: ["NFT", "Web3", "Landing"], gradient: "from-purple-300 via-pink-500 to-black" },
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
  { title: "Velorah", category: "Agency", type: "Landing", file: "Velorah.md", preview: "https://motionsites.ai/assets/hero-velorah-preview-CJNTtbpd.gif", tags: ["Agency", "Premium", "Motion"], gradient: "from-pink-300 via-purple-500 to-black" },
  { title: "Scalable Analytics", category: "SaaS", type: "Hero", file: "Scalable_Saas_Hero.md", preview: "https://cdn.sceneai.art/landing-pages/89c8a5cc-2198-4623-afcb-5d020e8e95b6.mov", tags: ["Analytics", "Dashboard", "oklch"], gradient: "from-indigo-300 via-indigo-700 to-[#0a0a0c]" },
  { title: "Viktor Portfolio", category: "Portfolio", type: "Portfolio", file: "Viktor_Portfolio.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(89).webp", tags: ["Personal", "Creative", "Motion"], gradient: "from-lime-300 via-green-600 to-black" },
  { title: "Wealth Video Hero", category: "Fintech", type: "Hero", file: "Wealth_Video_Hero.md", preview: "https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif", tags: ["Finance", "Video", "Hero"], gradient: "from-emerald-300 via-green-600 to-black" },
  { title: "Web3 EOS Hero", category: "Web3", type: "Hero", file: "Web3_EOS_Hero.md", preview: "https://motionsites.ai/assets/hero-web3-eos-poster-DF0_WdVS.png", tags: ["Web3", "EOS", "Hero"], gradient: "from-purple-300 via-indigo-500 to-black" },
  { title: "Weblex Dark Hero", category: "Landing Page", type: "Hero", file: "Weblex_Dark_Hero.md", preview: "https://motionsites.ai/assets/hero-weblex-preview-BoIbrUHI.gif", tags: ["Dark", "Agency", "Hero"], gradient: "from-zinc-100 via-zinc-500 to-black" },
  { title: "xPortfolio Hero", category: "Hero Section", type: "Hero", file: "xPortfolio_Hero.md", preview: "https://motionsites.ai/assets/hero-xportfolio-preview-D4A8maiC.gif", tags: ["Portfolio", "Hero", "Creative"], gradient: "from-fuchsia-300 via-violet-500 to-black" },
];

// Only prompts whose .md is actually hosted in azoklearn/movento/prompts/ (or that open an
// external link) are shown. Add a filename here as its content is added to the repo.
const AVAILABLE_FILES = new Set([
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

// Three prompts are given away: they show what the catalogue is worth without
// asking for a card. Copying one still costs an email (the lead modal), so a
// free prompt is a lead, not an anonymous download. Must stay in sync with the
// same list in api/_shared.js — the server is what actually enforces access.
const FREE_PROMPT_FILES = new Set([
  "Picway_Gallery_Hero.md",
  "Boomerang_Landing.md",
  "Mapple_Headphone_Store.md",
  "Healcure_Medical_Hero.md",
  "Lumina_Vision_Hero.md",
  "Qumica_Infrastructure_Hero.md",
]);

const plans = [
  {
    id: "monthly",
    hidden: false,
    name: t("Monthly", "Mensuel"),
    price: "21.99€",
    period: t("/ mo", "/ mois"),
    subPrice: t("1-day free trial, then 21.99€/mo — cancel anytime", "1 jour d'essai gratuit, puis 21,99€/mois — résiliable à tout moment"),
    badge: t("1-day free trial", "Essai 1 jour"),
    description: t("Try it for a day, then full access to the catalog, billed monthly.", "Essaie une journée, puis accès complet au catalogue, facturé chaque mois."),
    cta: t("Start the free trial", "Commencer l'essai gratuit"),
    featured: false,
    features: [t("1-day free trial", "1 jour d'essai gratuit"), t("Access to all prompts", "Accès à tous les prompts"), t("New prompts added regularly", "Nouveaux prompts ajoutés régulièrement"), t("Cancel anytime", "Résiliez à tout moment")],
  },
  {
    id: "yearly",
    hidden: false,
    name: t("Yearly", "Annuel"),
    price: "89.99€",
    period: t("/ yr", "/ an"),
    subPrice: t("≈ 7.50€/mo — save 66% vs monthly", "≈ 7,50€/mois — 66% d'économie vs mensuel"),
    badge: t("Best value", "Meilleur rapport"),
    description: t("Build premium AI websites all year long.", "Créez des sites premium toute l'année."),
    cta: t("Get the annual plan", "Prendre l'offre annuelle"),
    featured: false,
    bonus: t("Free bonus ebook included", "Ebook offert inclus"),
    bonusDesc: t("Learn to build your site, sell it, land clients and manage it — A to Z.", "Apprends à créer ton site, le vendre, trouver des clients et le gérer — de A à Z."),
    features: [t("Full Movento catalog", "Catalogue Movento complet"), t("Year-round updates", "Mises à jour toute l'année"), t("New premium categories", "Nouvelles catégories premium"), t("Optimized for Lovable, Cursor, Claude & Shopify", "Optimisé pour Lovable, Cursor, Claude & Shopify"), t("Save 66% vs monthly", "66% d'économie vs mensuel")],
  },
  {
    id: "lifetime",
    hidden: false,
    name: t("Lifetime", "À vie"),
    price: "145€",
    originalPrice: "250€",
    discountBadge: "-42%",
    period: t("forever", "à vie"),
    badge: t("One shot", "Une fois pour toutes"),
    description: t("Unlock unlimited web creation, once and for all.", "Débloquez la création web sans limites, une fois pour toutes."),
    cta: t("Get lifetime access", "Obtenir l'accès à vie"),
    featured: true,
    // Direct support is what lifetime has that the subscriptions do not, so it
    // gets its own block above the ebook rather than a line in the bullet list.
    perk: t("Direct support, answered within 24h", "Support direct, réponse sous 24h"),
    perkDesc: t("Write whenever you need — questions, advice, a second look at your project. A real person answers, never a bot.", "Écris quand tu veux — questions, conseils, un avis sur ton projet. Une vraie personne te répond, jamais un bot."),
    bonus: t("Free bonus ebook included", "Ebook offert inclus"),
    bonusDesc: t("Learn to build your site, sell it, land clients and manage it — A to Z.", "Apprends à créer ton site, le vendre, trouver des clients et le gérer — de A à Z."),
    features: [t("High-value prompts", "Prompts à forte valeur ajoutée"), t("Unlimited lifetime access", "Accès illimité à vie"), t("Considerable savings vs agencies", "Économies considérables vs agences"), t("Professional-grade design & UX", "Création professionnelle"), t("Continuous learning & updates", "Apprentissage continu")],
  },
];

// Plans without a configured Whop checkout link are hidden rather than shown
// with a button that would fail.
const visiblePlans = plans.filter((plan) => !plan.hidden);
// Tailwind only sees literal class names, so pick whole strings.
const planGridMd = visiblePlans.length === 1 ? "md:grid-cols-1" : visiblePlans.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3";
const planGridLg = visiblePlans.length === 1 ? "lg:grid-cols-1" : visiblePlans.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3";

// Clean, single-focus pricing card used across every purchase surface (paywall
// modal, pricing section, /pricing page). Intentionally minimal: price, one CTA,
// a few essential bullets — nothing else.
function PlanCard({ plan, onBuy, loading, featured }) {
  return (
    <div className={`relative flex flex-col rounded-[28px] p-6 transition sm:p-7 ${featured ? "border-2 border-blue-600 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_60px_-24px_rgba(37,99,235,0.4)]" : "border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_40px_-28px_rgba(15,23,42,0.25)]"}`}>
      {featured && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm shadow-blue-600/30">{t("Best value", "Meilleur choix")}</span>}
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900">{plan.name}</h3>
        {plan.discountBadge && <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">{plan.discountBadge}</span>}
      </div>
      <div className="mt-4 flex items-end gap-2">
        <span className="text-5xl font-bold tracking-[-0.06em] text-slate-900">{plan.price}</span>
        <span className="pb-1.5 text-sm text-slate-400">{plan.period}</span>
      </div>
      {plan.originalPrice && <p className="mt-1.5 text-sm text-slate-400"><span className="line-through">{plan.originalPrice}</span></p>}
      {plan.subPrice && <p className="mt-1.5 text-xs font-medium text-emerald-600">{plan.subPrice}</p>}
      <button
        onClick={() => onBuy(plan)}
        disabled={loading}
        className={`group mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 ${featured ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700" : "border border-slate-200 bg-white text-slate-900 hover:border-blue-300 hover:bg-blue-50"}`}
      >
        {loading ? t("Loading…", "Chargement…") : plan.cta}
        <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" />
      </button>
      <ul className="mt-6 space-y-2.5">
        {plan.features.slice(0, 4).map((feat) => (
          <li key={feat} className="flex items-center gap-2.5 text-sm text-slate-600">
            <span className="grid h-4 w-4 flex-none place-items-center rounded-full bg-blue-100 text-blue-600"><Icon name="check" className="h-3 w-3" /></span> {feat}
          </li>
        ))}
      </ul>
      {plan.perk && (
        <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-2.5">
          <span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-blue-600 text-white"><Icon name="shield" className="h-3 w-3" /></span>
          <div>
            <p className="text-sm font-semibold text-blue-700">{plan.perk}</p>
            {plan.perkDesc && <p className="mt-0.5 text-xs leading-5 text-blue-700/80">{plan.perkDesc}</p>}
          </div>
        </div>
      )}
      {plan.bonus && (
        <div className={`${plan.perk ? "mt-2.5" : "mt-5"} flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5`}>
          <span className="mt-0.5 grid h-5 w-5 flex-none place-items-center rounded-full bg-amber-400 text-white"><Icon name="gift" className="h-3 w-3" /></span>
          <div>
            <p className="text-sm font-semibold text-amber-700">{plan.bonus}</p>
            {plan.bonusDesc && <p className="mt-0.5 text-xs leading-5 text-amber-700/80">{plan.bonusDesc}</p>}
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

function WhopCheckoutEmbed({ planId, prefillEmail, onComplete }) {
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

  return (
    <div
      key={planId}
      data-whop-checkout-plan-id={planId}
      data-whop-checkout-theme="light"
      data-whop-checkout-theme-accent-color="blue"
      data-whop-checkout-skip-redirect="true"
      data-whop-checkout-on-complete={cbName}
      {...(prefillEmail ? { "data-whop-checkout-prefill-email": prefillEmail } : {})}
      className="min-h-[540px] w-full overflow-hidden rounded-2xl bg-slate-50"
    />
  );
}

const cleanEmail = (v) => String(v).replace(/[\s­​-‍⁠﻿]/g, "").toLowerCase();

// Shown right after the embedded payment completes: the buyer's checkout email is
// their access key, so we confirm access on this device with a single field.
function CheckoutSuccess({ prefillEmail, onUnlocked }) {
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
      if (r.ok && d.hasAccess) { onUnlocked(norm); return; }
      setSt({ loading: false, error: t("Access is activating — this can take a moment. Retry in a few seconds.", "L'accès s'active — cela peut prendre un instant. Réessaie dans quelques secondes.") });
    } catch {
      setSt({ loading: false, error: t("Unable to verify right now. Please retry.", "Vérification impossible pour le moment. Réessaie.") });
    }
  }

  return (
    <div className="py-4 text-center">
      <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500 text-white"><Icon name="check" className="h-6 w-6" /></div>
      <h3 className="text-xl font-semibold tracking-tight text-slate-900">{t("Payment confirmed 🎉", "Paiement confirmé 🎉")}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">{t("Confirm the email you paid with to unlock the full catalog on this device.", "Confirme l'email utilisé au paiement pour débloquer tout le catalogue sur cet appareil.")}</p>
      <form onSubmit={submit} className="mx-auto mt-5 flex max-w-sm flex-col gap-3 sm:flex-row">
        <input autoFocus value={email} onChange={(e) => setEmail(e.target.value)} type="email" inputMode="email" autoComplete="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="email@example.com" className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10" />
        <button type="submit" disabled={st.loading} className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 hover:scale-[1.01] disabled:opacity-60">{st.loading ? t("Checking…", "Vérification…") : t("Unlock", "Débloquer")}</button>
      </form>
      {st.error && <p className="mx-auto mt-3 flex max-w-sm items-start gap-2 text-left text-xs leading-5 text-amber-600"><Icon name="alert" className="mt-0.5 h-3.5 w-3.5 flex-none" />{st.error}</p>}
    </div>
  );
}

// Full-screen overlay that runs the whole purchase ON-SITE: fetch the plan id,
// mount the embedded Whop checkout, then confirm access — never leaving the page.
// Falls back to the hosted redirect only when no plan_xxx id is configured.
function CheckoutOverlay({ plan, prefillEmail, onClose, onUnlocked }) {
  const [load, setLoad] = useState({ loading: true, planId: "", error: "" });
  const [done, setDone] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoad({ loading: true, planId: "", error: "" });
    (async () => {
      try {
        const r = await fetch(CHECKOUT_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: plan.id, ref: getRef() }),
        });
        let d = {};
        try { d = await r.json(); } catch { d = {}; }
        if (!r.ok) throw new Error(d.error || `Erreur serveur paiement (${r.status}).`);
        // Referred visitors go to Whop's hosted checkout even when the embed is
        // available: the affiliate code rides on the URL (a=...), which is the
        // only path that credits the commission for certain.
        if (d.checkoutUrl && getRef()) { track("checkout_redirected", { plan: plan.id, ...refProps() }); window.location.assign(d.checkoutUrl); return; }
        if (d.planId) { if (alive) setLoad({ loading: false, planId: d.planId, error: "" }); return; }
        // No embeddable plan id configured — gracefully use the hosted page.
        if (d.checkoutUrl) { window.location.assign(d.checkoutUrl); return; }
        throw new Error("Checkout indisponible pour cette offre.");
      } catch (e) {
        if (alive) setLoad({ loading: false, planId: "", error: getCheckoutErrorMessage(e) });
      }
    })();
    return () => { alive = false; };
  }, [plan.id]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center px-3 py-4 sm:px-4 sm:py-8" onClick={onClose}>
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }} transition={{ type: "spring", stiffness: 300, damping: 26 }} className="relative flex max-h-[94dvh] w-full max-w-xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 sm:rounded-[32px]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <p className="text-sm font-semibold text-slate-900">{plan.name}</p>
            <p className="text-xs text-slate-500">{plan.price} <span className="text-slate-400">{plan.period}</span></p>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"><Icon name="close" className="h-4 w-4" /></button>
        </div>
        <div className="overflow-y-auto overscroll-contain p-4 sm:p-6">
          {done ? (
            <CheckoutSuccess prefillEmail={prefillEmail} onUnlocked={onUnlocked} />
          ) : load.loading ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 text-center">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
              <p className="text-sm text-slate-500">{t("Loading secure checkout…", "Chargement du paiement sécurisé…")}</p>
            </div>
          ) : load.error ? (
            <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 px-4 text-center">
              <div className="grid h-11 w-11 place-items-center rounded-full border border-red-200 bg-red-50 text-red-500"><Icon name="alert" className="h-5 w-5" /></div>
              <p className="max-w-sm text-sm leading-6 text-red-600">{load.error}</p>
              <button onClick={() => setLoad((s) => ({ ...s }))} className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700">{t("Retry", "Réessayer")}</button>
            </div>
          ) : (
            <WhopCheckoutEmbed planId={load.planId} prefillEmail={prefillEmail} onComplete={() => { track("checkout_completed", { plan: plan.id, ...refProps() }); setDone(true); }} />
          )}
        </div>
        <div className="flex items-center justify-center gap-1.5 border-t border-slate-100 px-5 py-3 text-[11px] text-slate-400">
          <Icon name="shield" className="h-3 w-3 text-blue-500" /> {t("Secure payment via Whop", "Paiement sécurisé via Whop")}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Reassurance strip shown next to the buy buttons. Every claim here must stay true.
function Reassurance({ className = "" }) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] text-slate-400 ${className}`}>
      <span className="flex items-center gap-1.5"><Icon name="shield" className="h-3 w-3 text-blue-500" /> {t("Secure payment via Whop", "Paiement sécurisé via Whop")}</span>
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

  return <svg {...common}>{children}</svg>;
}

// Used in the navbar, the mobile menu, every page header and the footer — one
// change here swaps the mark everywhere. The file is /public/logo.png, shared
// with the favicon, and versioned so a swap is not served from cache.
function Logo() {
  return (
    <span className="flex items-center gap-2.5 select-none">
      <img src="/logo.png?v=2" alt="" aria-hidden="true" width="36" height="36" className="h-9 w-9 flex-none object-contain" />
      <span className="text-[22px] font-bold tracking-[-0.03em] text-slate-900">Movento</span>
    </span>
  );
}

// Cheap, network-free placeholder shown until a card scrolls near the viewport.
function PreviewSkeleton({ item }) {
  return <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-20`} />;
}

// Local static poster (a frame grabbed at ~3s) for each video preview, generated
// into /public/posters. On mobile we show only this — the video never loads.
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
const isVideoPreview = (url) => Boolean(url) && [".mp4", ".webm", ".mov"].some((ext) => url.endsWith(ext) || url.includes(`${ext}?`));
const isImagePreview = (url) => Boolean(url) && [".png", ".jpg", ".jpeg", ".gif", ".webp"].some((ext) => url.endsWith(ext) || url.includes(`${ext}?`));

function posterFor(previewUrl) {
  const base = decodeURIComponent(previewUrl.split("/").pop().split("?")[0]).replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
  return `/posters/${base}.jpg`;
}

function GeneratedPreview({ item }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className={`absolute -left-10 -top-10 h-56 w-56 rounded-full bg-gradient-to-br ${item.gradient} opacity-45 blur-3xl`} />
      <div className={`absolute -bottom-16 right-0 h-72 w-72 rounded-full bg-gradient-to-br ${item.gradient} opacity-35 blur-3xl`} />
      <div className="absolute inset-5 rounded-[22px] border border-white/70 bg-white/70 p-4 backdrop-blur-xl shadow-sm">
        <div className="mb-4 flex items-center justify-between"><div className="h-3 w-20 rounded-full bg-slate-900/15" /><div className="flex gap-1.5"><div className="h-2 w-2 rounded-full bg-slate-900/15" /><div className="h-2 w-2 rounded-full bg-slate-900/10" /><div className="h-2 w-2 rounded-full bg-slate-900/[0.07]" /></div></div>
        <div className="grid h-[78%] grid-cols-[0.9fr_1.1fr] gap-3">
          <div className="space-y-3"><div className="h-5 w-24 rounded-full bg-slate-900/15" /><div className="h-16 rounded-2xl bg-slate-900/[0.06]" /><div className="h-3 w-28 rounded-full bg-slate-900/10" /><div className="h-3 w-20 rounded-full bg-slate-900/[0.06]" /><div className="mt-4 h-9 w-24 rounded-full bg-blue-600" /></div>
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="relative rounded-[24px] border border-white/70 bg-white/80 p-3 shadow-lg shadow-slate-900/10">
            <div className="mb-3 h-4 w-24 rounded-full bg-slate-900/15" />
            <div className="space-y-2">{[72, 48, 88, 58].map((w, i) => <div key={i} className="flex items-center gap-2"><div className="h-7 w-7 rounded-xl bg-slate-900/[0.07]" /><div className="h-2 rounded-full bg-slate-900/12" style={{ width: `${w}%` }} /></div>)}</div>
            <div className="absolute bottom-3 right-3 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-[10px] text-slate-500 backdrop-blur">Preview</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function PreviewCard({ item, badge, onClick, onPreview }) {
  const [previewFailed, setPreviewFailed] = useState(false);
  // A missing /posters/*.jpg must not blank the card: we fall back to the video
  // itself rather than to the generic mockup (see the mobile branch below).
  const [posterFailed, setPosterFailed] = useState(false);
  const [inView, setInView] = useState(false);
  const [visible, setVisible] = useState(false);
  // On mobile we never stream gallery videos — like motionsites, we show a frozen
  // first frame instead. That's the single biggest mobile load win.
  const [isMobile] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches);
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const hasVideo = !previewFailed && isVideoPreview(item.preview);
  const hasImage = !previewFailed && isImagePreview(item.preview);
  // Every preview is shown whole. "cover" crops whatever does not match the
  // card's ratio, and what it crops is always the navbar and the footer of the
  // design — the two parts a buyer looks at first. An item can still ask for
  // previewFit: "cover" if its clip really is 1.35 and edge-to-edge.
  const fitClass = item.previewFit === "cover" ? "object-cover" : "object-contain";

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

  // Play only the previews on screen so mobile never decodes 40 videos at once.
  // Runs after render, so videoRef is always mounted when this fires.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (!isMobile && visible) v.play?.().catch(() => {});
    else v.pause?.();
  }, [visible, inView, isMobile]);

  // Every card opens the preview popup — the visitor sees the design play at a
  // usable size before deciding, and copies from there. Copying straight from
  // the grid gave no way to actually look at what you were taking.
  const handleClick = () => {
    if (onPreview) onPreview(item);
    else onClick?.();
  };

  return (
    <motion.div layout whileHover={{ y: -6 }} onClick={handleClick} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleClick(); } }} className="group relative cursor-pointer overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_28px_-14px_rgba(15,23,42,0.15)] transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_1px_2px_rgba(15,23,42,0.05),0_22px_44px_-18px_rgba(37,99,235,0.35)]">
      {/* 1.35 is the measured ratio of the preview clips (11 of 12 land between
          1.333 and 1.379), so with object-contain the letterbox is under 2% on
          almost every card — and the odd 16:9 or portrait clip is shown whole
          instead of being cropped. The bars pick up the card's own surface. */}
      <div ref={containerRef} className="relative aspect-[1.35] overflow-hidden bg-slate-100">
        {!inView ? <PreviewSkeleton item={item} /> : hasVideo ? (isMobile ? (posterFailed ? <video src={`${item.preview}#t=0.1`} className={`h-full w-full ${fitClass}`} style={{ objectPosition: item.previewPosition || "center" }} muted playsInline preload="metadata" onError={() => setPreviewFailed(true)} /> : <img className={`h-full w-full ${fitClass}`} style={{ objectPosition: item.previewPosition || "center" }} src={posterFor(item.preview)} alt={`${item.title} preview`} loading="lazy" decoding="async" onError={() => setPosterFailed(true)} />) : <video ref={videoRef} src={item.preview} poster={posterFor(item.preview)} className={`h-full w-full ${fitClass} transition duration-500`} style={{ objectPosition: item.previewPosition || "center" }} autoPlay loop muted playsInline preload="metadata" onError={() => setPreviewFailed(true)} />) : hasImage ? <img className={`h-full w-full ${fitClass} transition duration-500`} style={{ objectPosition: item.previewPosition || "center" }} src={item.preview} alt={`${item.title} preview`} loading="lazy" decoding="async" onError={() => setPreviewFailed(true)} /> : <GeneratedPreview item={item} />}
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-3.5">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold tracking-tight text-slate-900">{item.title}</h3>
          <p className="mt-0.5 text-xs text-slate-400">{item.category}</p>
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
    return "Le service de paiement Whop n'est pas joignable. Vérifie les liens de checkout Whop dans les variables Vercel.";
  }
  return error?.message || "Impossible de lancer le paiement pour le moment.";
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
  console.assert(validatePlanId("monthly"), "monthly should be valid");
  console.assert(validatePlanId("yearly"), "yearly should be valid");
  console.assert(validatePlanId("lifetime"), "lifetime should be valid");
  console.assert(!validatePlanId("weekly"), "weekly should be invalid");
  console.assert(extractPrompt("# Test\n\n## Prompt\nhello\n* * *\nfooter") === "hello", "extractPrompt should parse prompt block");
  console.assert(extractPrompt("plain text") === "plain text", "extractPrompt should fallback to full markdown");
}

if (typeof window !== "undefined" && !window.__MOVENTO_TESTS_RAN__) {
  window.__MOVENTO_TESTS_RAN__ = true;
  runSelfTests();
}

// Welcome quiz — a short, tap-only, non-skippable onboarding shown once per device.
// Goal is conviction, not lead capture: every answer reassures the visitor that
// Movento fits their goal, then the final screen teases the bonus ebook + promo code.
const QUIZ_GOALS = [
  { key: "self", emoji: "🚀", label: t("Launch my own site / business", "Lancer mon propre site / business"), affirm: t("Your project deserves a site that turns heads. Premium result, without writing a line of code.", "Ton projet mérite un site qui envoie. Rendu premium, sans écrire une ligne de code.") },
  { key: "clients", emoji: "💼", label: t("Build sites for clients", "Créer des sites pour des clients"), affirm: t("Deliver agency-grade sites in minutes. Your clients will love it.", "Livre des sites dignes d'une agence en quelques minutes. Tes clients vont adorer.") },
  { key: "resell", emoji: "💰", label: t("Resell turnkey sites", "Revendre des sites clé en main"), affirm: t("Every prompt is a resellable site. Your margin is the time you save.", "Chaque prompt = un site revendable. Ta marge, c'est le temps que tu gagnes.") },
  { key: "learn", emoji: "🎨", label: t("Learn / level up", "Apprendre / me perfectionner"), affirm: t("Start from an already-pro site and tweak it — the best way to progress.", "Pars d'un site déjà pro et bidouille-le — la meilleure façon de progresser.") },
];

const QUIZ_LEVELS = [
  { key: "none", emoji: "🌱", label: t("Zero — I'm just starting", "Zéro, je débute"), affirm: t("Perfect: not a single line to write. Copy, paste, it's online.", "Parfait : zéro ligne à écrire. Tu copies, tu colles, c'est en ligne.") },
  { key: "some", emoji: "⚡", label: t("I get by a little", "Je me débrouille un peu"), affirm: t("The heavy lifting is done — you just personalize and publish.", "Le gros du travail est déjà fait — tu personnalises et tu publies.") },
  { key: "pro", emoji: "💻", label: t("I already code", "Je code déjà"), affirm: t("Save hours: no more blank page, start from a pro base.", "Gagne des heures : finie la page blanche, tu pars d'une base pro.") },
];

function WelcomeQuiz({ onDone }) {
  const [step, setStep] = useState(0); // 0 = goal, 1 = level, 2 = final
  const [goal, setGoal] = useState(null);
  const [level, setLevel] = useState(null);
  // Read once on mount: the code shown must not change under the visitor's eyes.
  const [referred] = useState(() => Boolean(getRef()));
  const promoCode = referred ? AFFILIATE_PROMO_CODE : PROMO_CODE;

  useEffect(() => { track("quiz_shown"); }, []);

  function pickGoal(g) { setGoal(g); track("quiz_goal", { goal: g.key }); setStep(1); }
  function pickLevel(l) { setLevel(l); track("quiz_level", { level: l.key }); setStep(2); }
  function finish() { track("quiz_completed", { goal: goal?.key || "", level: level?.key || "", ...refProps(), promo: promoCode }); onDone(); }
  // Escape hatch on both questions: a visitor who only wants the gallery should
  // never have to answer to reach it.
  function skipQuiz() { track("quiz_skipped", { step, ...refProps() }); onDone(); }
  const optionClass = "group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-left shadow-sm transition hover:border-blue-400 hover:bg-blue-50 hover:shadow-md";

  return (
    <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] overflow-y-auto bg-white text-slate-900">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="mv-aurora absolute left-1/2 top-[-15%] h-[440px] w-[560px] -translate-x-1/2 rounded-full bg-blue-400/20 blur-[130px]" />
        <div className="absolute bottom-[-12%] right-[-8%] h-[380px] w-[380px] rounded-full bg-indigo-300/20 blur-[130px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-full max-w-xl flex-col px-5 py-6 sm:px-6">
        <div className="flex items-center justify-between">
          <Logo />
          {step < 2 && <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-700"><Icon name="gift" className="h-3.5 w-3.5" /> {t("Free bonus at the end", "Bonus offert à la fin")}</span>}
        </div>

        <div className="flex flex-1 flex-col justify-center py-8">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="q1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{t("Question 1 / 2", "Question 1 / 2")}</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{t("What brings you to Movento?", "Qu'est-ce qui t'amène sur Movento ?")}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">{t("Whatever your answer, you're in the right place.", "Peu importe ta réponse, tu es au bon endroit.")}</p>
                <div className="mt-5 flex flex-col gap-3">
                  {QUIZ_GOALS.map((g) => (
                    <button key={g.key} onClick={() => pickGoal(g)} className={optionClass}>
                      <span className="text-2xl">{g.emoji}</span>
                      <span className="flex-1 text-sm font-medium text-slate-800">{g.label}</span>
                      <Icon name="arrow" className="h-4 w-4 flex-none text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500" />
                    </button>
                  ))}
                </div>
                <button onClick={skipQuiz} className="mt-4 w-full rounded-2xl px-4 py-3 text-center text-sm font-medium text-slate-400 transition hover:bg-slate-50 hover:text-slate-700">{t("I just want to see the prompts", "Je veux juste voir les prompts")} →</button>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="q2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <div className="flex items-center gap-3">
                  <button onClick={() => setStep(0)} className="text-xs text-slate-400 transition hover:text-slate-700">← {t("Back", "Retour")}</button>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{t("Question 2 / 2", "Question 2 / 2")}</p>
                </div>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{t("Your level with code?", "Ton niveau en code ?")}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">{t("No wrong answer — Movento adapts to every level.", "Aucune mauvaise réponse — Movento s'adapte à tous les niveaux.")}</p>
                <div className="mt-5 flex flex-col gap-3">
                  {QUIZ_LEVELS.map((l) => (
                    <button key={l.key} onClick={() => pickLevel(l)} className={optionClass}>
                      <span className="text-2xl">{l.emoji}</span>
                      <span className="flex-1 text-sm font-medium text-slate-800">{l.label}</span>
                      <Icon name="arrow" className="h-4 w-4 flex-none text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500" />
                    </button>
                  ))}
                </div>
                <button onClick={skipQuiz} className="mt-4 w-full rounded-2xl px-4 py-3 text-center text-sm font-medium text-slate-400 transition hover:bg-slate-50 hover:text-slate-700">{t("I just want to see the prompts", "Je veux juste voir les prompts")} →</button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="final" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"><Icon name="check" className="h-6 w-6" /></div>
                <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{t("Whatever your goal, you're in the right place. 🎯", "Peu importe ton objectif, tu es au bon endroit. 🎯")}</h2>
                {goal && <p className="mt-3 text-center text-sm leading-6 text-slate-600">{goal.affirm}</p>}
                {level && <p className="mt-1.5 text-center text-sm leading-6 text-slate-400">{level.affirm}</p>}

                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{t("Your exclusive code", "Ton code exclusif")}</p>
                  <div className="mt-2 flex items-center justify-center gap-2.5">
                    <span className="rounded-lg border border-dashed border-blue-300 bg-blue-50 px-4 py-2 font-mono text-lg font-bold tracking-[0.2em] text-blue-700">{promoCode}</span>
                    <span className="text-sm font-semibold text-emerald-600">−10%</span>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-400">{t("Apply it at checkout — reserved, don't miss it.", "À appliquer au paiement — réservé, profites-en.")}</p>
                </div>

                <button onClick={finish} className="mt-4 w-full rounded-2xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 hover:scale-[1.01]">{t("Browse the prompts", "Voir les prompts")} →</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default function MoventoSite() {
  const [query, setQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("recent"); // recent | free
  const [copiedCard, setCopiedCard] = useState("");
  const [copyError, setCopyError] = useState("");
  const [unlockNotice, setUnlockNotice] = useState("");
  const [accessEmail, setAccessEmail] = useState(getStoredAccessEmail);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [accessStatus, setAccessStatus] = useState({ loading: false, message: "", error: "" });
  const [checkoutPlan, setCheckoutPlan] = useState(null); // plan being purchased in the embedded overlay
  const [leadEmail, setLeadEmail] = useState(getStoredLeadEmail);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
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
      setPreviewItem(slug ? prompts.find((p) => slugify(p.title) === decodeURIComponent(slug).toLowerCase()) || null : null);
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  const [paywallItem, setPaywallItem] = useState(null); // the paid prompt that triggered the paywall
  const [showQuiz, setShowQuiz] = useState(() => {
    if (typeof window === "undefined") return false;
    try { return !window.localStorage.getItem("movento_quiz_done"); } catch { return false; }
  });
  const isSuccessPage = typeof window !== "undefined" && window.location.pathname === "/success";
  const isMentionsPage = typeof window !== "undefined" && window.location.pathname === "/mentions-legales";
  const isPricingPage = typeof window !== "undefined" && window.location.pathname === "/pricing";
  const isSubscriptionPage = typeof window !== "undefined" && window.location.pathname === "/subscription";

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
      setAccessStatus({ loading: true, message: "Confirmation du paiement Whop...", error: "" });

      try {
        const response = await fetch(`${API_BASE_URL}/api/checkout-session?session_id=${encodeURIComponent(sessionId)}`);
        const data = await response.json();

        if (!response.ok || !data.hasAccess) throw new Error(data.error || "Paiement non confirmé.");

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
    // prompts is kept newest-first (new entries are added at the top), so the
    // array order is already the order the gallery shows. "free" narrows the
    // list rather than reordering it.
    return prompts.filter((p) => {
      if (!isPromptAvailable(p)) return false;
      if (sortOrder === "free" && !FREE_PROMPT_FILES.has(p.file)) return false;
      return `${p.title} ${p.category} ${p.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase());
    });
  }, [query, sortOrder]);

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

      if (!response.ok) throw new Error(data.error || "Unable to verify access.");

      setHasPremiumAccess(Boolean(data.hasAccess));
      setAccessEmail(normalizedEmail);

      if (data.hasAccess) {
        window.localStorage.setItem("movento_access_email", normalizedEmail);
        // Only count a deliberate unlock, not the silent re-check on every load.
        if (!options.silent) track("access_unlocked");
        if (!options.silent) setAccessStatus({ loading: false, message: "Premium access activated on this device.", error: "" });
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
      message = "Prompt introuvable sur le serveur (erreur 404). Ce n'est pas votre presse-papiers — signalez-le nous.";
    } else if (name === "TypeError" || msg.toLowerCase().includes("fetch") || msg.toLowerCase().includes("network")) {
      message = "Connexion au serveur impossible. Vérifiez votre réseau et réessayez.";
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

    if (!isFree && !hasPremiumAccess) {
      track("paywall_shown", { prompt: item.title, category: item.category, ...refProps() });
      setPaywallItem(item);
      setShowPricingModal(true);
      return;
    }

    if (isFree && !accessEmail && !leadEmail) {
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
        body: JSON.stringify({ email }),
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
    setShowPricingModal(false);
    setCheckoutPlan(plan);
  }

  // Called once the buyer confirms their access email after paying inline.
  function handleUnlocked(email) {
    window.localStorage.setItem("movento_access_email", email);
    setAccessEmail(email);
    setHasPremiumAccess(true);
    setCheckoutPlan(null);
    setPaywallItem(null);
    track("access_unlocked");
  }

  if (isMentionsPage) return <MentionsLegales />;
  if (isPricingPage) return <PricingPage />;
  if (isSubscriptionPage) return <SubscriptionPage />;
  if (isSuccessPage) return <SuccessPage />;

  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-900">
      <AnimatePresence>
        {showQuiz && <WelcomeQuiz onDone={() => { try { window.localStorage.setItem("movento_quiz_done", "1"); } catch (_) {} setShowQuiz(false); }} />}
        {showLeadModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setShowLeadModal(false)}>
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="relative w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-900/20" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setShowLeadModal(false)} className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-400 transition hover:text-slate-900"><Icon name="close" className="h-4 w-4" /></button>
              <div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-600/25"><Icon name="sparkles" className="h-5 w-5" /></div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">{t("Access free prompts", "Accéder aux prompts gratuits")}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{t("Enter your email to copy free prompts. No spam, ever.", "Entrez votre email pour copier les prompts gratuits. Jamais de spam.")}</p>
              <form onSubmit={submitLeadEmail} className="mt-6 flex flex-col gap-3">
                <input autoFocus value={leadEmailInput} onChange={(e) => setLeadEmailInput(e.target.value)} type="email" required placeholder="you@example.com" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10" />
                <button type="submit" disabled={leadSubmitting} className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 hover:scale-[1.01] disabled:opacity-60">{leadSubmitting ? t("Just a moment...", "Un instant...") : t("Copy free prompt →", "Copier le prompt gratuit →")}</button>
              </form>
              <p className="mt-4 text-center text-xs text-slate-400">{t("Your data will never be shared.", "Vos données ne seront jamais partagées.")}</p>
              <div className="mt-5 border-t border-slate-100 pt-4 text-center">
                <button onClick={() => { setShowLeadModal(false); setShowUnlockModal(true); }} className="text-xs text-slate-400 transition hover:text-slate-700">{t("Already purchased? Unlock your access", "Déjà client ? Déverrouille ton accès")}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {showPricingModal && !checkoutPlan && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center px-3 py-4 sm:px-4 sm:py-8" onClick={() => setShowPricingModal(false)}>
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 16 }} transition={{ type: "spring", stiffness: 300, damping: 26 }} className={`relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 sm:rounded-[32px] ${visiblePlans.length === 1 ? "max-w-md" : "max-w-3xl"}`} onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setShowPricingModal(false)} className="absolute right-4 top-4 z-10 grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:text-slate-900"><Icon name="close" className="h-4 w-4" /></button>
              <div className="overflow-y-auto overscroll-contain p-6 pt-8 sm:p-8">
                <div className="pr-8 text-center">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{paywallItem ? t(`Unlock “${paywallItem.title}”`, `Débloque « ${paywallItem.title} »`) : t("Unlock all prompts", "Débloque tous les prompts")}</h2>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">{t("Choose a plan to unlock the whole Movento catalog.", "Choisis une offre pour débloquer tout le catalogue Movento.")}</p>
                </div>
                <div className={`mx-auto mt-8 grid gap-4 ${planGridMd}`}>
                  {visiblePlans.map((plan) => (
                    <PlanCard key={plan.id} plan={plan} featured={plan.featured} loading={Boolean(checkoutPlan)} onBuy={startCheckout} />
                  ))}
                </div>
                <Reassurance className="mt-6" />
                <div className="mt-6 text-center">
                  <button onClick={() => { setShowPricingModal(false); setShowUnlockModal(true); }} className="text-sm text-slate-400 transition hover:text-slate-700">{t("Already purchased? Unlock your access", "Déjà client ? Déverrouille ton accès")}</button>
                </div>
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
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="relative w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-900/20" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setShowUnlockModal(false)} className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-white text-slate-400 transition hover:text-slate-900"><Icon name="close" className="h-4 w-4" /></button>
              <div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600"><Icon name="lock" className="h-5 w-5" /></div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">{t("Unlock your access", "Déverrouille ton accès")}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{t("For customers who already purchased. Enter the email used at checkout.", "Réservé aux clients ayant déjà payé. Entre l'email utilisé lors de l'achat.")}</p>
              <form onSubmit={async (e) => { e.preventDefault(); const ok = await verifyAccess(); if (ok) setShowUnlockModal(false); }} className="mt-6 flex flex-col gap-3">
                <input autoFocus value={accessEmail} onChange={(e) => setAccessEmail(e.target.value)} type="email" inputMode="email" autoComplete="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} required placeholder="email@example.com" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10" />
                <button type="submit" disabled={accessStatus.loading} className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 hover:scale-[1.01] disabled:opacity-60">{accessStatus.loading ? t("Verifying...", "Vérification...") : t("Unlock", "Déverrouiller")}</button>
              </form>
              {accessStatus.error && <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-red-600"><Icon name="alert" className="mt-0.5 h-3.5 w-3.5 flex-none" />{accessStatus.error}</p>}
              <div className="mt-5 border-t border-slate-100 pt-4 text-center">
                <button onClick={() => { setShowUnlockModal(false); setPaywallItem(null); setShowPricingModal(true); }} className="text-xs text-slate-400 transition hover:text-slate-700">{t("Not a customer yet? See the offer", "Pas encore client ? Voir l'offre")}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {previewItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6" onClick={closePreview}>
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="relative flex max-h-[92dvh] w-full max-w-lg flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl shadow-slate-900/25" onClick={(e) => e.stopPropagation()}>
              <button onClick={closePreview} className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-slate-900/40 text-white backdrop-blur transition hover:bg-slate-900/60"><Icon name="close" className="h-4 w-4" /></button>
              {/* The popup now opens for every card, so it has to render whatever
                  the preview happens to be — clip, animated image, or nothing. */}
              {isVideoPreview(previewItem.preview) ? (
                <video key={previewItem.file} src={previewItem.preview} poster={posterFor(previewItem.preview)} autoPlay loop muted playsInline className="w-full flex-none bg-slate-100 object-contain" style={{ aspectRatio: "1.35", objectPosition: previewItem.previewPosition || "center" }} />
              ) : isImagePreview(previewItem.preview) ? (
                <img key={previewItem.file} src={previewItem.preview} alt={`${previewItem.title} preview`} className="w-full flex-none bg-slate-100 object-contain" style={{ aspectRatio: "1.35", objectPosition: previewItem.previewPosition || "center" }} />
              ) : (
                <div className="relative w-full flex-none overflow-hidden bg-slate-100" style={{ aspectRatio: "1.35" }}><GeneratedPreview item={previewItem} /></div>
              )}
              <div className="flex items-center justify-between gap-3 p-5">
                <div className="min-w-0">
                  <h3 className="truncate text-base font-semibold text-slate-900">{previewItem.title}</h3>
                  <p className="mt-0.5 text-xs text-slate-400">{previewItem.category}</p>
                </div>
                <button onClick={() => { const it = previewItem; closePreview(); copyPrompt(it); }} className="flex flex-none items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 hover:scale-[1.02]">
                  {hasPremiumAccess ? <><Icon name="copy" className="h-4 w-4" /> {t("Copy", "Copier")}</> : FREE_PROMPT_FILES.has(previewItem.file) ? <><Icon name="gift" className="h-4 w-4" /> {t("Copy for free", "Copier gratuitement")}</> : <><Icon name="lock" className="h-4 w-4" /> {t("Unlock", "Débloquer")}</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="mv-aurora absolute left-1/2 top-[-24%] h-[560px] w-[820px] -translate-x-1/2 rounded-full bg-blue-400/25 blur-[130px]" />
        <div className="mv-aurora absolute bottom-[-24%] right-[-12%] h-[560px] w-[560px] rounded-full bg-indigo-300/25 blur-[150px]" style={{ animationDelay: "-6s" }} />
        <div className="absolute left-[-10%] top-[30%] h-[380px] w-[380px] rounded-full bg-cyan-200/25 blur-[130px]" />
        <div className="absolute inset-0 opacity-[0.5]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(15,23,42,0.05) 1px, transparent 0)", backgroundSize: "36px 36px", maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)", WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 100%)" }} />
      </div>

      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-500 md:flex">
          <a href="#prompts" className="transition hover:text-slate-900">Prompts</a>
          <a href="/pricing" className="transition hover:text-slate-900">{t("Pricing", "Tarifs")}</a>
          <a href="/subscription" className="transition hover:text-slate-900">{t("My subscription", "Mon abonnement")}</a>
          <a href="#how" className="transition hover:text-slate-900">{t("Guide", "Guide")}</a>
          <a href="#faq" className="transition hover:text-slate-900">FAQ</a>
        </nav>
        <a href="/pricing" className="hidden rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 hover:shadow-blue-600/40 md:inline-block">{t("Get started", "Commencer")}</a>
        <button onClick={() => setMobileMenuOpen((open) => !open)} aria-label={t("Menu", "Menu")} aria-expanded={mobileMenuOpen} className="grid h-10 w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 md:hidden">
          <Icon name={mobileMenuOpen ? "close" : "menu"} className="h-5 w-5" />
        </button>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }} className="absolute left-6 right-6 top-full z-30 flex flex-col gap-1 rounded-3xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/10 md:hidden">
              {[
                { href: "#prompts", label: "Prompts" },
                { href: "/pricing", label: t("Pricing", "Tarifs") },
                { href: "/subscription", label: t("My subscription", "Mon abonnement") },
                { href: "#how", label: t("Guide", "Guide") },
                { href: "#faq", label: "FAQ" },
              ].map((link) => (
                <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)} className="rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">{link.label}</a>
              ))}
              <a href="/pricing" onClick={() => setMobileMenuOpen(false)} className="mt-1 rounded-2xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700">{t("Get started", "Commencer")}</a>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-12 pb-4 text-center lg:px-8 lg:pt-20">
        <motion.a href="#pricing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100">
          <span className="grid h-4 w-4 place-items-center rounded-full bg-blue-600 text-white"><Icon name="sparkles" className="h-2.5 w-2.5" /></span>
          {t("New prompts added every week", "De nouveaux prompts chaque semaine")}
        </motion.a>
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }} className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-[1.02] tracking-[-0.04em] text-slate-900 md:text-6xl">
          {t("Premium websites,", "Des sites premium,")} <span className="font-display italic font-normal text-blue-600">{t("one prompt away", "en un seul prompt")}</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.12 }} className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-500 md:text-lg">
          {t("Copy a prompt, paste it into Lovable, v0, Bolt, Cursor, Claude or Shopify, and ship a modern site in minutes. No code.", "Copie un prompt, colle-le dans Lovable, v0, Bolt, Cursor, Claude ou Shopify, et obtiens un site moderne en quelques minutes. Sans coder.")}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.19 }} className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href="#prompts" className="group inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 hover:shadow-blue-600/40">{t("Browse the prompts", "Voir les prompts")} <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-0.5" /></a>
          <a href="/pricing" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900">{t("See pricing", "Voir les tarifs")}</a>
        </motion.div>
      </section>

      {/* Walkthrough sits right under the hero: it answers "what is this?" before
          the visitor has to judge the catalogue on thumbnails alone. */}
      <section id="video" className="relative z-10 mx-auto max-w-7xl px-6 pt-12 pb-4 text-center lg:px-8 lg:pt-16">
        <h2 className="text-3xl font-bold tracking-[-0.04em] text-slate-900 md:text-5xl">{t("What is Movento?", "Movento, c'est quoi ?")}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 md:mt-4 md:text-base md:leading-7">{t("A minute to see how it works, from the prompt to the finished site.", "Une minute pour voir comment ça marche, du prompt au site fini.")}</p>
        <div className="mx-auto mt-6 w-full max-w-[325px] overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_20px_50px_-30px_rgba(15,23,42,0.35)] md:mt-8">
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

      <section id="prompts" className="relative z-10 mx-auto max-w-7xl px-6 pt-10 pb-24 lg:px-8 lg:pt-14">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">{t("Gallery", "Galerie")}</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-4xl">{t("Premium prompts", "Prompts premium")}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">{hasPremiumAccess ? t("Premium access active. All prompts can be copied.", "Accès premium actif. Tous les prompts peuvent être copiés.") : `${prompts.filter(isPromptAvailable).length}+ ${t("premium prompts. Unlock the full catalog with one-time lifetime access.", "prompts premium. Débloque tout le catalogue avec l'accès à vie, en un seul paiement.")}`}</p>
          </div>
        </div>
        {hasPremiumAccess ? (
          <div className="mb-8 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
            <div className="grid h-8 w-8 flex-none place-items-center rounded-full bg-emerald-500 text-white"><Icon name="check" className="h-4 w-4" /></div>
            <p className="text-slate-700">{t("Premium access active", "Accès premium actif")} — <span className="text-slate-400">{accessEmail}</span></p>
          </div>
        ) : (
          <button onClick={() => setShowUnlockModal(true)} className="mb-8 flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md">
            <span className="flex items-center gap-3">
              <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-blue-50 text-blue-600"><Icon name="lock" className="h-4 w-4" /></span>
              <span>
                <span className="block text-sm font-semibold text-slate-900">{t("Already purchased?", "Déjà client ?")}</span>
                <span className="block text-xs text-slate-500">{t("Unlock your access with your checkout email.", "Déverrouille ton accès avec ton email d'achat.")}</span>
              </span>
            </span>
            <span className="flex flex-none items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-700">{t("Unlock", "Déverrouiller")} <Icon name="arrow" className="h-3.5 w-3.5" /></span>
          </button>
        )}
        {(accessStatus.message || accessStatus.error) && !isSuccessPage && <div className={`mb-8 flex items-start gap-3 rounded-2xl border p-4 text-sm leading-6 ${accessStatus.error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}><Icon name={accessStatus.error ? "alert" : "check"} className="mt-1 h-4 w-4 flex-none" /><p>{accessStatus.error || accessStatus.message}</p></div>}
        {unlockNotice && <div className="mb-8 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-700"><Icon name="sparkles" className="mt-1 h-4 w-4 flex-none" /><p>{unlockNotice}</p></div>}
        {copyError && <div className="mb-8 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"><Icon name="alert" className="mt-1 h-4 w-4 flex-none" /><p>{copyError}</p></div>}
        <div className="mb-8 flex flex-wrap items-center gap-2">
          {[["recent", t("Newest", "Plus récents")], ["free", t("Free", "Gratuits")]].map(([val, label]) => (
            <button key={val} onClick={() => setSortOrder(val)} className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${sortOrder === val ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-600/20" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"}`}>{label}</button>
          ))}
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence>
            {filtered.map((item) => {
              const isFree = FREE_PROMPT_FILES.has(item.file);
              const unlocked = hasPremiumAccess || isFree;
              return (
                <motion.div key={item.title} layout initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }} className="relative">
                  <PreviewCard item={item} onClick={() => copyPrompt(item)} onPreview={openPreview} badge={
                    <span className={`flex flex-none items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition ${copiedCard === item.title ? "bg-emerald-100 text-emerald-700" : copiedCard === "Error" ? "bg-red-100 text-red-700" : !unlocked ? "bg-slate-100 text-slate-500 group-hover:bg-blue-600 group-hover:text-white" : isFree && !hasPremiumAccess ? "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white" : "bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white"}`}>
                      {copiedCard === item.title ? <><Icon name="check" className="h-3.5 w-3.5" /> {t("Copied", "Copié")}</> : copiedCard === "Error" ? <><Icon name="alert" className="h-3.5 w-3.5" /> {t("Error", "Erreur")}</> : !unlocked ? <><Icon name="lock" className="h-3.5 w-3.5" /> Premium</> : isFree && !hasPremiumAccess ? <><Icon name="gift" className="h-3.5 w-3.5" /> {t("Free", "Gratuit")}</> : item.link ? <><Icon name="arrow" className="h-3.5 w-3.5" /> {t("Open", "Ouvrir")}</> : <><Icon name="copy" className="h-3.5 w-3.5" /> {t("Copy", "Copier")}</>}
                    </span>
                  } />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </section>

      <section id="how" className="relative z-10 mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="overflow-hidden rounded-[36px] border border-slate-200 bg-gradient-to-br from-blue-50 to-white p-8 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_20px_50px_-30px_rgba(37,99,235,0.3)] md:p-12"><div className="grid gap-10 md:grid-cols-3">{[t("Choose a style", "Choisir un style"), t("Copy the prompt", "Copier le prompt"), t("Generate your site", "Générer votre site")].map((step, i) => <div key={step}><div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-sm font-bold text-white shadow-lg shadow-blue-600/25">0{i + 1}</div><h3 className="text-xl font-semibold text-slate-900">{step}</h3><p className="mt-3 text-sm leading-6 text-slate-500">{i === 0 ? t("Browse previews and find a design direction that suits your offer.", "Parcourez les aperçus et trouvez une direction design adaptée à votre offre.") : i === 1 ? t("The prompt is loaded directly from the source to stay intact.", "Le prompt est chargé directement depuis la source pour rester intact.") : t("Paste it into your favorite AI tool and customize the result.", "Collez-le dans votre outil IA préféré et personnalisez le résultat.")}</p></div>)}</div></div>
      </section>

      <Testimonials />

      <section id="pricing" className="relative z-10 mx-auto max-w-7xl px-6 pb-28 pt-10 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-[-0.04em] text-slate-900 md:text-6xl">{t("Choose your plan", "Choisissez votre offre")}</h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-500">{t("Access every premium prompt. Monthly, yearly or lifetime.", "Accède à tous les prompts premium. Au mois, à l'année ou à vie.")}</p>
          {/* The rating is declared as AggregateRating in index.html; Google only
              honours that markup when the same figure is visible on the page. */}
          <div className="mt-5 flex items-center justify-center gap-2">
            <span className="flex items-center gap-0.5 text-amber-400">{[0, 1, 2, 3, 4].map((i) => <Icon key={i} name="star" className="h-4 w-4" />)}</span>
            <span className="text-sm font-semibold text-slate-900">{RATING_SCORE}/5</span>
            <span className="text-sm text-slate-400">· {t(`${RATING_COUNT}+ reviews`, `+${RATING_COUNT} avis`)}</span>
          </div>
        </div>

        <div className={`mx-auto mt-12 grid gap-5 ${visiblePlans.length === 1 ? "max-w-sm" : `max-w-5xl ${planGridLg}`}`}>
          {visiblePlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} featured={plan.featured} loading={Boolean(checkoutPlan)} onBuy={startCheckout} />
          ))}
        </div>

        <Reassurance className="mt-8" />
      </section>

      <section id="faq" className="relative z-10 mx-auto max-w-7xl px-6 pb-28 lg:px-8">
        <div className="mb-14 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">FAQ</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">{t("Questions, answered", "Vos questions, nos réponses")}</h2>
        </div>
        <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
          {[
            { q: t("How does it work?", "Comment ça marche ?"), a: t("Pick a prompt in the gallery, copy it in one click, paste it into Lovable, v0, Bolt, Cursor, Claude or Shopify. The AI generates the full site — you just customize the content.", "Choisissez un prompt dans la galerie, copiez-le en un clic, collez-le dans Lovable, v0, Bolt, Cursor, Claude ou Shopify. L'IA génère le site complet — il ne vous reste qu'à personnaliser le contenu.") },
            { q: t("Which tools are supported?", "Quels outils sont compatibles ?"), a: t("Any AI tool that accepts a text prompt: Lovable, v0, Bolt, Cursor, Claude, Shopify, ChatGPT... The prompts describe every detail (fonts, colors, animations) so the result stays faithful.", "Tous les outils IA qui acceptent un prompt texte : Lovable, v0, Bolt, Cursor, Claude, Shopify, ChatGPT... Les prompts décrivent chaque détail (polices, couleurs, animations) pour un résultat fidèle.") },
            { q: t("Can I cancel anytime?", "Puis-je résilier à tout moment ?"), a: t("Yes. Monthly and annual plans can be cancelled anytime from the My subscription page or directly on Whop — no minimum commitment.", "Oui. Les offres mensuelle et annuelle peuvent être résiliées à tout moment depuis la page Mon abonnement ou directement sur Whop — sans engagement minimum.") },
            { q: t("How do I access prompts after paying?", "Comment j'accède aux prompts après paiement ?"), a: t("The email you used at checkout is your access key. Enter it in the gallery on any device and every prompt unlocks instantly.", "L'email utilisé au paiement est votre clé d'accès. Entrez-le dans la galerie sur n'importe quel appareil et tous les prompts se débloquent instantanément.") },
            { q: t("Is the catalog updated?", "Le catalogue est-il mis à jour ?"), a: t("Yes — new premium prompts are added regularly, and they're all included in your plan at no extra cost.", "Oui — de nouveaux prompts premium sont ajoutés régulièrement, et ils sont tous inclus dans votre abonnement sans surcoût.") },
            { q: t("Can I use the sites commercially?", "Puis-je utiliser les sites commercialement ?"), a: t("Yes. The sites you generate from our prompts are yours — client projects, portfolios, product launches, anything.", "Oui. Les sites que vous générez à partir de nos prompts vous appartiennent — projets clients, portfolios, lancements de produits, tout est permis.") },
          ].map((item) => (
            <div key={item.q} className="border-t border-slate-200 pt-6">
              <h3 className="text-base font-semibold text-slate-900">{item.q}</h3>
              <p className="mt-3 max-w-lg text-sm leading-7 text-slate-500">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-28 lg:px-8">
        <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-blue-600 to-indigo-600 px-8 py-16 text-center shadow-2xl shadow-blue-600/30 md:py-20">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-white/20 blur-[100px]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px" }} />
          <h2 className="relative mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white md:text-5xl">{t("Your next site is one prompt away.", "Votre prochain site est à un prompt près.")}</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-sm leading-7 text-blue-100 md:text-base">{t("One great prompt saves hours of design, integration and client back-and-forth.", "Un bon prompt vous économise des heures de design, d'intégration et d'allers-retours client.")}</p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="/pricing" className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-blue-700 shadow-xl shadow-blue-950/20 transition hover:scale-[1.04]">{t("See plans", "Voir les offres")} <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" /></a>
            <span className="text-xs text-blue-100/80">{t("Monthly, yearly or lifetime — your call", "Au mois, à l'année ou à vie — tu choisis")}</span>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-slate-200 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row lg:px-8">
          <Logo />
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} Movento. {t("All rights reserved.", "Tous droits réservés.")}</p>
          <div className="flex items-center gap-5">
            <a href="/subscription" className="text-sm text-slate-400 transition hover:text-slate-900">{t("My subscription", "Mon abonnement")}</a>
            <a href="/mentions-legales" className="text-sm text-slate-400 transition hover:text-slate-900">{t("Legal notice", "Mentions légales")}</a>
            {/* Full reload on purpose: `lang` is resolved once at module load. */}
            <a href={`?lang=${lang === "fr" ? "en" : "fr"}`} className="text-sm font-medium text-slate-400 transition hover:text-slate-900" hrefLang={lang === "fr" ? "en" : "fr"}>{lang === "fr" ? "English" : "Français"}</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function SuccessPage() {
  const [email, setEmail] = useState(getStoredAccessEmail);
  const [status, setStatus] = useState({ loading: false, ok: false, error: "" });
  // The bonus ebook ships with yearly and lifetime, not with the monthly trial.
  // Unknown plans get it: a paying customer must never be denied by a lookup
  // that merely failed to identify their plan.
  const [ebookEarned, setEbookEarned] = useState(true);

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
          setEbookEarned(subData?.kind !== "monthly");
        } catch { setEbookEarned(true); }
      } else {
        setStatus({ loading: false, ok: false, error: t("No access found for this email yet. If you just paid, wait a minute and retry — activation can take a moment.", "Aucun accès trouvé pour cet email pour l'instant. Si tu viens de payer, patiente une minute et réessaie — l'activation peut prendre un instant.") });
      }
    } catch (_) {
      setStatus({ loading: false, ok: false, error: t("Unable to verify right now. Please retry.", "Vérification impossible pour le moment. Réessaie.") });
    }
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-20%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] h-[400px] w-[400px] rounded-full bg-blue-300/15 blur-[120px]" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <a href="/"><Logo /></a>
        <a href="/#prompts" className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900">{t("Go to the gallery", "Aller à la galerie")} →</a>
      </header>

      <section className="relative z-10 mx-auto max-w-2xl px-6 pb-24 pt-8 lg:px-8">
        <div className="text-center">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"><Icon name="check" className="h-6 w-6" /></div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">{t("Payment confirmed 🎉", "Paiement confirmé 🎉")}</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 md:text-base">{t("Thank you for your purchase! Unlock your access below.", "Merci pour ton achat ! Débloque ton accès ci-dessous.")}</p>
        </div>

        {/* Step 1 — unlock access */}
        <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_40px_-28px_rgba(15,23,42,0.25)] md:p-7">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-blue-600 text-sm font-bold text-white">1</span>
            <h2 className="text-lg font-semibold text-slate-900">{t("Unlock your prompts", "Débloque tes prompts")}</h2>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-500">{t("Enter the email you used at checkout. It unlocks the full catalog on this device — and on any device, anytime.", "Entre l'email que tu as utilisé au paiement. Il débloque tout le catalogue sur cet appareil — et sur n'importe quel appareil, à tout moment.")}</p>
          {status.ok ? (
            <div className="mt-5 flex flex-col items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-700 sm:flex-row sm:items-center sm:justify-between">
              <span className="flex items-center gap-2"><Icon name="check" className="h-4 w-4 flex-none" /> {t("Access unlocked on this device!", "Accès débloqué sur cet appareil !")}</span>
              <a href="/#prompts" className="inline-flex flex-none items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 hover:scale-[1.02]">{t("Copy prompts", "Copier les prompts")} <Icon name="arrow" className="h-4 w-4" /></a>
            </div>
          ) : (
            <>
              <form onSubmit={unlock} className="mt-5 flex flex-col gap-3 sm:flex-row">
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" inputMode="email" autoComplete="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="email@example.com" className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10" />
                <button type="submit" disabled={status.loading} className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60">{status.loading ? t("Checking...", "Vérification...") : t("Unlock", "Débloquer")}</button>
              </form>
              {status.error && <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-amber-600"><Icon name="alert" className="mt-0.5 h-3.5 w-3.5 flex-none" />{status.error}</p>}
            </>
          )}
        </div>

        {/* Bonus ebook — yearly and lifetime */}
        {status.ok && ebookEarned && (
          <div className="mt-4 rounded-[28px] border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_40px_-28px_rgba(217,119,6,0.25)] md:p-7">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-amber-400 text-white"><Icon name="gift" className="h-4 w-4" /></span>
              <h2 className="text-lg font-semibold text-slate-900">{t("Your free bonus ebook", "Ton ebook bonus offert")}</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{t("The full playbook: build your site, sell it, find clients and manage everything — from A to Z.", "Le guide complet : créer ton site, le vendre, trouver des clients et tout gérer — de A à Z.")}</p>
            <a href={EBOOK_URL} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 text-sm font-semibold text-[#1a1400] transition hover:bg-amber-300 hover:scale-[1.02]"><Icon name="download" className="h-4 w-4" /> {t("Download the ebook", "Télécharger l'ebook")}</a>
          </div>
        )}

        <p className="mt-6 text-center text-xs leading-5 text-slate-400">{t("Keep this email address — it's your key to access Movento anytime.", "Garde bien cet email — c'est ta clé pour accéder à Movento à tout moment.")}</p>
      </section>

      <footer className="relative z-10 border-t border-slate-200 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row lg:px-8">
          <Logo />
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} Movento. {t("All rights reserved.", "Tous droits réservés.")}</p>
          <a href="/subscription" className="text-sm text-slate-400 transition hover:text-slate-900">{t("My subscription", "Mon abonnement")}</a>
        </div>
      </footer>
    </main>
  );
}

function MentionsLegales() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-20%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-400/20 blur-[120px]" />
      </div>
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <a href="/"><Logo /></a>
        <a href="/" className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900">← {t("Back", "Retour")}</a>
      </header>
      <section className="relative z-10 mx-auto max-w-3xl px-6 pb-24 pt-12 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">{t("Legal notice", "Mentions légales")}</h1>
        <p className="mt-3 text-sm text-slate-400">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="mt-12 space-y-10 text-sm leading-7 text-slate-600">
          <div>
            <h2 className="mb-3 text-base font-semibold text-slate-900">1. Website publisher</h2>
            <p>This website <strong className="text-slate-700">movento.dev</strong> is published by <span className="text-slate-700">Movento</span>.</p>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-slate-900">2. Hosting</h2>
            <p>This website is hosted by <span className="text-slate-700">Vercel Inc.</span> — 340 S Lemon Ave #4133, Walnut, CA 91789, United States — vercel.com</p>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-slate-900">3. Intellectual property</h2>
            <p>All content on Movento (text, prompts, visuals, structure) is the exclusive property of the publisher and is protected by applicable intellectual property laws. Any reproduction, even partial, is strictly prohibited without prior authorization.</p>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-slate-900">4. Personal data</h2>
            <p>Movento collects your email address to manage access to content. Payment data is processed by <span className="text-slate-700">Whop</span> and is not stored by Movento. Your data is never sold to third parties. You may request access, correction or deletion by contacting us.</p>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-slate-900">5. Payment</h2>
            <p>Payments are securely processed by <span className="text-slate-700">Whop</span>. Monthly and annual subscriptions can be cancelled at any time from your Whop account. Lifetime access is a one-time purchase with no subscription.</p>
            <p className="mt-3">You can cancel your subscription at any time from your Whop account, or by emailing <span className="text-slate-700">movento.dev@gmail.com</span> from the address used at checkout.</p>
            <p className="mt-3">Movento reserves the right to modify subscription prices at any time.</p>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-slate-900">6. Cookies</h2>
            <p>Movento only uses data stored locally on your device (localStorage) to remember your access and email. No third-party tracking cookies are used.</p>
            <p className="mt-3">We measure audience with <span className="text-slate-700">Vercel Web Analytics</span>, which is cookieless and does not track you across websites or build a personal profile. It records anonymous page views and product events (for example, opening the pricing modal) so we can improve the site.</p>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-slate-900">7. Contact</h2>
            <p>For any questions: <span className="text-slate-700">movento.dev@gmail.com</span></p>
          </div>
        </div>
      </section>
      <footer className="relative z-10 border-t border-slate-200 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row lg:px-8">
          <Logo />
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} Movento. {t("All rights reserved.", "Tous droits réservés.")}</p>
          <a href="/" className="text-sm text-slate-400 transition hover:text-slate-900">{t("Back to home", "Retour à l'accueil")}</a>
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
  "VALMAX Hero",
  "Wandor Travel Hero",
];

// Real customer quotes only, reproduced as they were written and attributed to
// buyers who agreed to be named. The section hides itself while this list is
// empty, so nothing invented ever ends up on the page.
const TESTIMONIALS = [
  {
    name: "Thomas Morel",
    role: t("Freelance web designer", "Freelance web designer"),
    quote: "Franchement impressionné. J'ai créé un site premium avec Claude en moins d'une heure grâce aux prompts de Movento. Le résultat était largement au niveau de ce que je faisais en plusieurs jours. J'ai même signé un client quelques jours après. L'investissement est rentabilisé très vite.",
  },
  {
    name: "Lucas Bernard",
    role: t("Web agency", "Agence web"),
    quote: "On utilise Movento pour accélérer la création de maquettes et gagner du temps sur les premiers jets. Les prompts sont très bien structurés et permettent d'obtenir des designs modernes sans partir d'une page blanche. C'est devenu un outil indispensable dans notre workflow.",
  },
  {
    name: "Maxime Rousse",
    role: t("Beginner", "Débutant"),
    quote: "Je n'avais quasiment aucune expérience avec Claude avant de découvrir Movento. Les prompts sont simples à utiliser et le rendu est bluffant. J'ai réussi à créer mon premier site professionnel en quelques heures seulement. Je recommande à tous ceux qui veulent vendre des sites rapidement.",
  },
];

function PricingShowcase({ onPick }) {
  const items = useMemo(
    () => SHOWCASE_TITLES.map((title) => prompts.find((p) => p.title === title)).filter(Boolean),
    [],
  );
  if (!items.length) return null;

  return (
    <section className="relative z-10 border-y border-slate-200/70 bg-slate-50/70 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-white px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700 shadow-sm">
            <Icon name="layers" className="h-3 w-3" /> {t("Included in every plan", "Inclus dans chaque offre")}
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-slate-900 md:text-4xl">
            {t("The designs you unlock", "Les designs que tu débloques")}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base leading-7 text-slate-500">
            {t(
              `${prompts.length} premium prompts, each one describing a complete site — fonts, colors, animations, section by section.`,
              `${prompts.length} prompts premium, chacun décrivant un site complet — polices, couleurs, animations, section par section.`,
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
          <a href="/#prompts" className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900">
            {t("Browse the full catalog", "Voir tout le catalogue")} <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  if (!TESTIMONIALS.length) return null;

  const initials = (name) => name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <section className="relative z-10 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
            <span className="flex items-center gap-0.5 text-amber-400">{[0, 1, 2, 3, 4].map((i) => <Icon key={i} name="star" className="h-3.5 w-3.5" />)}</span>
            <span className="text-sm font-semibold text-slate-900">{RATING_SCORE}/5</span>
            <span className="text-sm text-slate-400">· {t(`${RATING_COUNT}+ reviews`, `+${RATING_COUNT} avis`)}</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-[-0.03em] text-slate-900 md:text-4xl">{t("What buyers say", "Ce que disent les acheteurs")}</h2>
        </motion.div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((review, i) => (
            <motion.figure
              key={review.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex h-full flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_40px_-28px_rgba(15,23,42,0.25)] transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_1px_2px_rgba(15,23,42,0.05),0_24px_48px_-24px_rgba(37,99,235,0.3)]"
            >
              {/* Oversized quote mark, kept decorative and behind the text. */}
              <span aria-hidden="true" className="pointer-events-none absolute -right-2 -top-6 select-none font-serif text-[110px] leading-none text-slate-100">”</span>
              <span className="relative flex items-center gap-0.5 text-amber-400">{[0, 1, 2, 3, 4].map((n) => <Icon key={n} name="star" className="h-3.5 w-3.5" />)}</span>
              <blockquote className="relative mt-4 flex-1 text-[15px] leading-7 text-slate-700">“{review.quote}”</blockquote>
              <figcaption className="relative mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                <span className="grid h-10 w-10 flex-none place-items-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-bold text-white">{initials(review.name)}</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-900">{review.name}</span>
                  {review.role && <span className="block truncate text-xs text-slate-400">{review.role}</span>}
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingPage() {
  const [checkoutPlan, setCheckoutPlan] = useState(null);

  function onUnlocked(email) {
    window.localStorage.setItem("movento_access_email", email);
    track("access_unlocked");
    window.location.assign("/#prompts");
  }

  function startCheckout(plan, source) {
    track("checkout_started", { plan: plan.id, source, ...refProps() });
    setCheckoutPlan(plan);
  }

  const scrollToPlans = () => document.getElementById("plans")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <main className="min-h-screen bg-white text-slate-900">
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
        <div className="absolute inset-x-0 top-0 h-[70vh] bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:22px_22px] opacity-[0.045] [mask-image:linear-gradient(to_bottom,#000,transparent)]" />
        <div className="absolute left-1/2 top-[-22%] h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-blue-400/25 blur-[130px]" />
        <div className="absolute right-[-8%] top-[18%] h-[420px] w-[420px] rounded-full bg-indigo-300/20 blur-[120px]" />
        <div className="absolute bottom-[-12%] left-[-6%] h-[420px] w-[420px] rounded-full bg-sky-200/25 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <a href="/" className="transition hover:opacity-80"><Logo /></a>
          <div className="flex items-center gap-2">
            <a href="/#prompts" className="hidden rounded-full px-4 py-2.5 text-sm font-medium text-slate-500 transition hover:text-slate-900 sm:inline-block">{t("Catalog", "Catalogue")}</a>
            <a href="/" className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900">← {t("Back", "Retour")}</a>
          </div>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-16 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/80 bg-blue-50/80 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-700 backdrop-blur">
            <Icon name="sparkles" className="h-3 w-3" /> {t(`${prompts.length} premium prompts`, `${prompts.length} prompts premium`)}
          </span>
          <h1 className="mt-6 text-[2.6rem] font-bold leading-[1.05] tracking-[-0.045em] text-slate-900 md:text-6xl">
            {t("Choose your", "Choisissez votre")}{" "}
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 bg-clip-text text-transparent">{t("plan", "offre")}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-base leading-7 text-slate-500">{t("Access every premium prompt. Monthly, yearly or lifetime.", "Accède à tous les prompts premium. Au mois, à l'année ou à vie.")}</p>
          {/* The rating is declared as AggregateRating in index.html; Google only
              honours that markup when the same figure is visible on the page. */}
          <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
            <span className="flex items-center gap-0.5 text-amber-400">{[0, 1, 2, 3, 4].map((i) => <Icon key={i} name="star" className="h-3.5 w-3.5" />)}</span>
            <span className="text-sm font-semibold text-slate-900">{RATING_SCORE}/5</span>
            <span className="text-sm text-slate-400">· {t(`${RATING_COUNT}+ reviews`, `+${RATING_COUNT} avis`)}</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }} id="plans" className={`mx-auto mt-14 grid scroll-mt-24 gap-5 ${visiblePlans.length === 1 ? "max-w-sm" : `max-w-5xl ${planGridLg}`}`}>
          {visiblePlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} featured={plan.featured} loading={Boolean(checkoutPlan)} onBuy={(p) => startCheckout(p, "plan_card")} />
          ))}
        </motion.div>

        <Reassurance className="mt-9" />
      </section>

      <PricingShowcase onPick={scrollToPlans} />

      <Testimonials />

      <footer className="relative z-10 border-t border-slate-200 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row lg:px-8">
          <Logo />
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} Movento. {t("All rights reserved.", "Tous droits réservés.")}</p>
          <a href="/" className="text-sm text-slate-400 transition hover:text-slate-900">{t("Back to home", "Retour à l'accueil")}</a>
        </div>
      </footer>
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
      if (!response.ok) throw new Error(d.error || t("Cancellation failed. Please retry.", "La r\u00E9siliation a \u00E9chou\u00E9. R\u00E9essaie."));
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
    <main className="min-h-screen bg-white text-slate-900">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-20%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-400/20 blur-[120px]" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <a href="/"><Logo /></a>
        <a href="/" className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900">← {t("Back", "Retour")}</a>
      </header>

      <section className="relative z-10 mx-auto max-w-2xl px-6 pb-24 pt-8 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">{t("My subscription", "Mon abonnement")}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">{t("Enter the email you used at checkout to view and manage your subscription.", "Entrez l'email utilisé lors de l'achat pour voir et gérer votre abonnement.")}</p>

        <form onSubmit={lookup} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" inputMode="email" autoComplete="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="email@example.com" className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10" />
          <button type="submit" disabled={status.loading} className="rounded-2xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60">{status.loading ? t("Checking...", "Vérification...") : t("View", "Voir")}</button>
        </form>

        {status.error && <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"><Icon name="alert" className="mt-1 h-4 w-4 flex-none" /><p>{status.error}</p></div>}

        {status.checked && !status.error && data && !data.found && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm leading-6 text-slate-600">{t("No active subscription found for this email.", "Aucun abonnement actif trouvé pour cet email.")}</p>
            <a href="/pricing" className="mt-4 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 hover:scale-[1.03]">{t("See plans", "Voir les offres")} <Icon name="arrow" className="h-4 w-4" /></a>
          </div>
        )}

        {status.checked && data && data.found && (
          <div className="mt-6 rounded-[28px] border border-slate-200 bg-white p-7 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_16px_40px_-28px_rgba(15,23,42,0.25)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{t("Plan", "Offre")}</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">{data.plan}</h2>
              </div>
              {data.type === "subscription" ? (
                <span className={`rounded-full border px-3 py-1 text-xs font-medium ${data.status === "past_due" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{statusLabel(data.status)}</span>
              ) : (
                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">{t("Lifetime access", "Accès à vie")}</span>
              )}
            </div>

            {data.type === "subscription" && (
              <div className="mt-6 space-y-2 text-sm text-slate-600">
                {data.status === "trialing" && data.renewalDate && <p>{t("Free trial ends on", "Fin de l'essai gratuit le")} <span className="font-medium text-slate-900">{formatDate(data.renewalDate)}</span>.</p>}
                {data.cancelAtPeriodEnd ? (
                  <p className="text-amber-600">{t("Your subscription is cancelled and will end on", "Votre abonnement est résilié et se terminera le")} <span className="font-medium">{formatDate(data.renewalDate)}</span>.</p>
                ) : (
                  data.renewalDate && data.status !== "trialing" && <p>{t("Next renewal on", "Prochain renouvellement le")} <span className="font-medium text-slate-900">{formatDate(data.renewalDate)}</span>.</p>
                )}
              </div>
            )}

            {data.type === "lifetime" && (
              <p className="mt-6 text-sm leading-6 text-slate-600">{t("You have lifetime access — no subscription to manage.", "Vous avez un accès à vie — aucun abonnement à gérer.")}</p>
            )}

            {data.type !== "lifetime" && (
              <div className="mt-7 border-t border-slate-100 pt-6">
                {(cancel.done || data.cancelAtPeriodEnd || data.status === "canceling") ? (
                  <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-700">
                    <Icon name="check" className="mt-0.5 h-4 w-4 flex-none" />
                    <p>{t("Subscription cancelled — you keep access until", "Abonnement résilié — tu gardes l'accès jusqu'au")} <span className="font-medium">{formatDate(cancel.renewalDate || data.renewalDate)}</span>.</p>
                  </div>
                ) : cancel.confirming ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">{t("Cancel your subscription?", "Résilier ton abonnement ?")}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{t("You'll keep access until the end of the current period. You can resubscribe anytime.", "Tu gardes l'accès jusqu'à la fin de la période en cours. Tu peux te réabonner quand tu veux.")}</p>
                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      <button onClick={doCancel} disabled={cancel.loading} className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">{cancel.loading ? t("Cancelling…", "Résiliation…") : t("Yes, cancel", "Oui, résilier")}</button>
                      <button onClick={() => setCancel((c) => ({ ...c, confirming: false, error: "" }))} disabled={cancel.loading} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 disabled:opacity-60">{t("Keep my subscription", "Garder mon abonnement")}</button>
                    </div>
                    {cancel.error && <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-red-600"><Icon name="alert" className="mt-0.5 h-3.5 w-3.5 flex-none" />{cancel.error}</p>}
                  </div>
                ) : (
                  <>
                    <button onClick={() => setCancel({ confirming: true, loading: false, done: false, error: "", renewalDate: null })} className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50">
                      {t("Cancel my subscription", "Résilier mon abonnement")}
                    </button>
                    <p className="mt-3 text-xs leading-5 text-slate-400">{t("Cancelling keeps your access until the end of the current period.", "La résiliation conserve ton accès jusqu'à la fin de la période en cours.")}</p>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      <footer className="relative z-10 border-t border-slate-200 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row lg:px-8">
          <Logo />
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} Movento. {t("All rights reserved.", "Tous droits réservés.")}</p>
          <a href="/" className="text-sm text-slate-400 transition hover:text-slate-900">{t("Back to home", "Retour à l'accueil")}</a>
        </div>
      </footer>
    </main>
  );
}

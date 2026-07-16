import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { track } from "@vercel/analytics";

const VIDEO_ASSETS = "https://raw.githubusercontent.com/aayushsoam/motionsites.ai/main/assets/videos/";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:4242" : "");
const CHECKOUT_API_URL = import.meta.env.VITE_CHECKOUT_API_URL || `${API_BASE_URL}/api/create-checkout-session`;

const lang = (() => { try { return (navigator.language || "").startsWith("fr") ? "fr" : "en"; } catch { return "en"; } })();
function t(en, fr) { return lang === "fr" ? fr : en; }

const makePreview = (name, ext = "mp4") => `${VIDEO_ASSETS}${name}_0.${ext}`;

const prompts = [
  { title: "Vibrant Wellness Hero", category: "Landing Page", type: "Hero", file: "Vibrant_Wellness_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/a/brainhealthArea.mp4", tags: ["Wellness", "Glass", "Video"], gradient: "from-emerald-200 via-teal-500 to-stone-900" },
  { title: "Axon Hero", category: "SaaS", type: "Hero", file: "Axon_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/a/naturezoompuirple.mp4", tags: ["AI", "Agents", "Video"], gradient: "from-violet-200 via-purple-500 to-[#1B133C]" },
  { title: "dot. Hero", category: "Landing Page", type: "Hero", file: "Dot_Hero.md", preview: "https://motionsites.ai/assets/dot-hero-Csf49OgS.gif", tags: ["Messaging", "Video", "Minimal"], gradient: "from-blue-200 via-sky-400 to-stone-800" },
  { title: "Mainframe A.R.I.A. Hero", category: "Agency", type: "Hero", file: "Mainframe_ARIA_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(46).webp", tags: ["Agency", "Typewriter", "Video"], gradient: "from-stone-200 via-neutral-500 to-black" },
  { title: "SynapseX Hero", category: "AI / SaaS", type: "Hero", file: "SynapseX_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(33).webp", tags: ["AI", "Neural", "Video"], gradient: "from-zinc-300 via-purple-700 to-black" },
  { title: "Urban Bloom Hero", category: "Landing Page", type: "Hero", file: "Urban_Bloom_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(8).webp", tags: ["Scroll", "Glass", "Video"], gradient: "from-emerald-300 via-green-700 to-black" },
  { title: "Flowpath Hero", category: "SaaS", type: "Hero", file: "Flowpath_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/prompts%20(i've%20added%20them%20to%20the%20motionsites)/Wellbeing%20OS.mp4", tags: ["SaaS", "Wellness", "Video"], gradient: "from-amber-200 via-orange-500 to-[#2C221C]" },
  { title: "TerraElix Hero", category: "Landing Page", type: "Hero", file: "TerraElix_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(11).webp", tags: ["Wellness", "E-commerce", "Clean"], gradient: "from-emerald-200 via-lime-400 to-neutral-900" },
  { title: "Aurai Hero", category: "Landing Page", type: "Hero", file: "Aurai_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(32).webp", tags: ["Wellness", "Glass", "Video"], gradient: "from-rose-200 via-violet-400 to-slate-900" },
  { title: "Forma Contact", category: "Agency", type: "Landing", file: "Forma_Contact.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(45).webp", tags: ["Contact", "Form", "Video"], gradient: "from-neutral-200 via-neutral-500 to-black" },
  { title: "Foldcraft Hero", category: "Agency", type: "Hero", file: "Foldcraft_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(14).webp", tags: ["Studio", "Video", "Minimal"], gradient: "from-neutral-300 via-neutral-600 to-black" },
  { title: "VaultShield Hero", category: "SaaS", type: "Hero", file: "VaultShield_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(64).webp", tags: ["Security", "Video", "Clean"], gradient: "from-violet-300 via-purple-500 to-[#192837]" },
  { title: "USD Halo", category: "Fintech", type: "Landing", file: "USD_Halo.md", preview: "https://motionsites.ai/assets/halo-usd-hero-CtMXOklk.gif", tags: ["Stablecoin", "DeFi", "Video"], gradient: "from-neutral-200 via-slate-400 to-[#2B2644]" },
  { title: "CargoX Group Hero", category: "Landing Page", type: "Hero", file: "CargoX_Group_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/prompts%20(i've%20added%20them%20to%20the%20motionsites)/carArea.mp4", tags: ["Logistics", "Video", "Dark"], gradient: "from-yellow-400 via-amber-600 to-slate-900" },
  { title: "Portal Cinematic", category: "Landing Page", type: "Hero", file: "Portal_Cinematic.md", preview: "https://motionsites.ai/assets/hero-portal-preview-DEscBr2T.gif", tags: ["Cinematic", "Streaming", "Video"], gradient: "from-slate-300 via-indigo-600 to-black" },
  { title: "Equilibrium Hero", category: "Landing Page", type: "Hero", file: "Equilibrium_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(93).webp", tags: ["Wellness", "Glass", "Video"], gradient: "from-emerald-200 via-teal-500 to-slate-900" },
  { title: "Mainframe Hero", category: "Agency", type: "Hero", file: "Mainframe_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(42).webp", tags: ["Interactive", "Typewriter", "Video"], gradient: "from-neutral-200 via-emerald-700 to-black" },
  { title: "Prisma Studio", category: "Agency", type: "Landing", file: "Prisma_Studio.md", preview: "https://motionsites.ai/assets/hero-prisma-preview-D4QeI0Bn.gif", previewPosition: "top", tags: ["Studio", "Cinematic", "Video"], gradient: "from-stone-300 via-neutral-600 to-black" },
  { title: "TOONHUB Carousel", category: "Landing Page", type: "Hero", file: "TOONHUB_Carousel.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(24).webp", tags: ["3D", "Carousel", "Playful"], gradient: "from-orange-300 via-pink-500 to-sky-500" },
  { title: "Axion Studio", category: "Agency", type: "Landing", file: "Axion_Studio.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(27).webp", tags: ["Agency", "Shader", "Clean"], gradient: "from-neutral-200 via-orange-400 to-neutral-900" },
  { title: "NeuralKinetics Hero", category: "Fintech", type: "Hero", file: "NeuralKinetics_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/prompts%20(i've%20added%20them%20to%20the%20motionsites)/132Area.mp4", tags: ["Fintech", "Video", "Minimal"], gradient: "from-zinc-200 via-slate-400 to-black" },
  { title: "prmpt Archive", category: "Portfolio", type: "Landing", file: "prmpt_Archive.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/fe42Area.mp4", tags: ["Scroll", "Fashion", "Cursor"], gradient: "from-neutral-200 via-neutral-500 to-black" },
  { title: "VEX Ventures", category: "Landing Page", type: "Hero", file: "VEX_Ventures.md", preview: "https://motionsites.ai/assets/hero-vex-ventures-preview-BczMFIiw.gif", tags: ["Ventures", "Video", "Bold"], gradient: "from-zinc-100 via-zinc-500 to-black" },
  { title: "Fearless Studio Hero", category: "Agency", type: "Hero", file: "Fearless_Studio_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(71).webp", tags: ["Studio", "Bold", "Video"], gradient: "from-violet-400 via-purple-700 to-black" },
  { title: "MicroVisuals Hero", category: "AI / SaaS", type: "Hero", file: "MicroVisuals_Hero.md", preview: "https://image.mux.com/i9kUFJpB6GrWoe2UXRZG4lIP02g00LGulS1GTVrMMwZI00/animated.webp?width=640&fps=15", tags: ["AI", "Glass", "Serif"], gradient: "from-zinc-200 via-slate-500 to-black" },
  { title: "LinkFlow Hero", category: "SaaS", type: "Hero", file: "LinkFlow_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(55).webp", tags: ["AI", "Workflow", "Video"], gradient: "from-lime-300 via-emerald-600 to-stone-900" },
  { title: "Lumora Hero", category: "Landing Page", type: "Hero", file: "Lumora_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/prompts%20(i've%20added%20them%20to%20the%20motionsites)/endless.mp4", tags: ["Mindfulness", "Video", "Glass"], gradient: "from-amber-200 via-orange-400 to-stone-900" },
  { title: "Veldara Hero", category: "Landing Page", type: "Landing", file: "Veldara_Hero.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(21).webp", tags: ["Scroll", "3D", "Dark"], gradient: "from-blue-400 via-cyan-600 to-black" },
  { title: "Creative Studio Showcase", category: "Portfolio", type: "Landing", file: "Creative_Studio_Showcase.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/newpsotArea.mp4", tags: ["Studio", "Creative", "Spotlight"], gradient: "from-sky-200 via-cyan-400 to-slate-900" },
  { title: "Wisa Space", category: "Hero Section", type: "Hero", file: "Wisa_Space.md", link: "https://aistudio.google.com/u/1/apps/857d4bc5-1fa0-482d-9bdd-64327801c864?showPreview=true&showAssistant=true", preview: "https://motionsites.ai/assets/hero-wisa-space-preview-CAIFtU8c.gif", tags: ["Space", "3D", "Dark"], gradient: "from-slate-600 via-blue-900 to-black" },
  { title: "PureFlow Air Hero", category: "Landing Page", type: "Landing", file: "PureFlow_Air_Hero.md", preview: "https://image.mux.com/WuNDVUgyyrxFhrn2QxrF1LjMS3nBwrD7xjMNnIEn6nU/animated.webp?width=640&fps=15", tags: ["Product", "Clean", "Spotlight"], gradient: "from-gray-200 via-slate-400 to-black" },
  { title: "AI Automation Hero", category: "AI / SaaS", type: "Hero", file: "AI_Automation_Hero.md", preview: "https://motionsites.ai/assets/hero-synapse-ai-preview-BjBuH68i.gif", tags: ["AI", "Hero", "Dark"], gradient: "from-indigo-500 via-violet-500 to-cyan-400" },
  { title: "AI Designer Agency", category: "Landing Page", type: "Landing", file: "AI_Designer_Agency.md", preview: "https://motionsites.ai/assets/hero-ai-designer-agency-preview-vrAje6Od.gif", tags: ["Agency", "AI", "Premium"], gradient: "from-purple-400 via-fuchsia-500 to-black" },
  { title: "AI Designer Portfolio", category: "Landing Page", type: "Landing", file: "AI_Designer_Portfolio.md", preview: "https://motionsites.ai/assets/hero-vortex-studio-preview-BQyvwopD.gif", tags: ["Portfolio", "AI", "Creative"], gradient: "from-violet-400 via-blue-500 to-black" },
  { title: "AKOR Security", category: "Landing Page", type: "Landing", file: "AKOR_Security.md", preview: "https://motionsites.ai/assets/hero-akor-security-preview-hRrwsPNf.gif", tags: ["Security", "Dark", "Corporate"], gradient: "from-red-400 via-orange-500 to-black" },
  { title: "Aethera Studio", category: "Hero Section", type: "Hero", file: "Aethera_Studio.md", preview: "https://motionsites.ai/assets/hero-aethera-preview-DknSlcTa.gif", tags: ["Studio", "Creative", "Hero"], gradient: "from-sky-300 via-blue-500 to-black" },
  { title: "Apex SaaS", category: "SaaS", type: "Landing", file: "Apex_SaaS.md", preview: "https://motionsites.ai/assets/hero-apex-saas-preview-CbnBKSPv.gif", tags: ["SaaS", "Gradient", "Startup"], gradient: "from-purple-400 via-pink-500 to-slate-950" },
  { title: "Asme", category: "Hero Section", type: "Hero", file: "Asme.md", preview: "https://motionsites.ai/assets/hero-asme-preview-B_nGDnTP.gif", tags: ["Hero", "Minimal", "Modern"], gradient: "from-zinc-100 via-zinc-500 to-black" },
  { title: "Automation Machines", category: "Hero Section", type: "Hero", file: "Automation_Machines.md", preview: "https://motionsites.ai/assets/hero-automation-machines-preview-DlTveRIN.gif", tags: ["Automation", "Industry", "Hero"], gradient: "from-amber-300 via-orange-600 to-black" },
  { title: "Bionova Biotech", category: "SaaS", type: "Landing", file: "Bionova_Biotech.md", preview: "https://motionsites.ai/assets/hero-bionova-preview-Sk76d0_D.gif", tags: ["Biotech", "SaaS", "Clean"], gradient: "from-emerald-300 via-teal-500 to-black" },
  { title: "Bloom AI", category: "Hero Section", type: "Hero", file: "Bloom_AI.md", preview: "https://motionsites.ai/assets/hero-bloom-ai-preview-g6RcYLTl.gif", tags: ["AI", "Hero", "Soft"], gradient: "from-pink-300 via-rose-500 to-black" },
  { title: "Bold Portfolio Hero", category: "Portfolio", type: "Hero", file: "Bold_Portfolio_Hero.md", preview: "https://motionsites.ai/assets/hero-portfolio-bold-preview-9Yfbi-Wg.gif", tags: ["Portfolio", "Bold", "Creative"], gradient: "from-red-400 via-orange-500 to-black" },
  { title: "Buzzentic Agency", category: "Agency", type: "Landing", file: "Buzzentic_Agency.md", preview: "https://motionsites.ai/assets/hero-buzzentic-preview-CbopM29R.gif", tags: ["Agency", "Video", "Brand"], gradient: "from-yellow-300 via-orange-500 to-black" },
  { title: "ClearInvoice SaaS Hero", category: "SaaS", type: "Hero", file: "ClearInvoice_SaaS_Hero.md", preview: "https://motionsites.ai/assets/hero-clearinvoice-preview-l3q8sam6.gif", tags: ["Invoice", "SaaS", "Clean"], gradient: "from-blue-300 via-cyan-500 to-black" },
  { title: "ClubX Investors", category: "Landing Page", type: "Landing", file: "ClubX_Investors.md", preview: "https://motionsites.ai/assets/hero-clubx-preview-CpKCe8yV.gif", tags: ["Private Club", "Luxury", "Video"], gradient: "from-amber-200 via-orange-500 to-neutral-950" },
  { title: "CodeNest Coding Platform", category: "Landing Page", type: "Landing", file: "CodeNest_Coding_Platform.md", preview: "https://motionsites.ai/assets/hero-codenest-preview-Cgppc2qV.gif", tags: ["Code", "Platform", "Developer"], gradient: "from-lime-300 via-green-500 to-black" },
  { title: "Dark Portfolio Hero", category: "Portfolio", type: "Hero", file: "Dark_Portfolio_Hero.md", preview: "https://motionsites.ai/assets/hero-portfolio-dark-preview-RZYzJHIL.gif", tags: ["Portfolio", "Dark", "Hero"], gradient: "from-zinc-200 via-zinc-600 to-black" },
  { title: "Datacore Booking", category: "SaaS", type: "Landing", file: "Datacore_Booking.md", preview: "https://motionsites.ai/assets/hero-datacore-booking-preview-B3t9SRK6.gif", tags: ["Booking", "SaaS", "Data"], gradient: "from-cyan-300 via-blue-500 to-black" },
  { title: "Datacore SaaS Hero", category: "SaaS", type: "Hero", file: "Datacore_SaaS_Hero.md", preview: "https://motionsites.ai/assets/hero-datacore-preview-DWeq7Ls3.gif", tags: ["Data", "SaaS", "Hero"], gradient: "from-blue-400 via-indigo-500 to-black" },
  { title: "DesignPro Academy", category: "Hero Section", type: "Hero", file: "DesignPro_Academy.md", preview: "https://motionsites.ai/assets/hero-designpro-preview-D8c5_een.gif", tags: ["Academy", "Design", "Hero"], gradient: "from-orange-300 via-pink-500 to-black" },
  { title: "Digitwist AI Builder", category: "SaaS", type: "Landing", file: "Digitwist_AI_Builder.md", preview: "https://motionsites.ai/assets/hero-digitwist-preview-s2pJetjQ.gif", tags: ["AI Builder", "SaaS", "No-code"], gradient: "from-violet-300 via-purple-600 to-black" },
  { title: "E-commerce Website", category: "Landing Page", type: "Landing", file: "E-commerce_Website.md", preview: "https://motionsites.ai/assets/hero-ecommerce-website-preview-D7j_TrNR.gif", tags: ["Shop", "Commerce", "Landing"], gradient: "from-rose-300 via-fuchsia-500 to-black" },
  { title: "EVR Ventures", category: "Hero Section", type: "Hero", file: "EVR_Ventures.md", preview: "https://motionsites.ai/assets/hero-evr-ventures-preview-DZxeVFEX.gif", tags: ["Venture", "Hero", "Premium"], gradient: "from-blue-200 via-indigo-500 to-black" },
  { title: "Finlytic AI Agent", category: "SaaS", type: "Landing", file: "Finlytic_AI_Agent.md", preview: "https://motionsites.ai/assets/hero-finlytic-preview-CV9g0FHP.gif", tags: ["Finance", "AI Agent", "SaaS"], gradient: "from-emerald-300 via-cyan-500 to-black" },
  { title: "Framelix 3D Studios", category: "Agency", type: "Landing", file: "Framelix_3D_Studios.md", preview: "https://motionsites.ai/assets/hero-framelix-preview-DsyIImVY.gif", tags: ["3D", "Studio", "Agency"], gradient: "from-fuchsia-300 via-purple-500 to-black" },
  { title: "Glassmorphism Agency Hero", category: "Agency", type: "Hero", file: "Glassmorphism_Agency_Hero.md", preview: "https://motionsites.ai/assets/hero-glassmorphism-agency-preview-CGqeRoqP.gif", tags: ["Glass", "Agency", "Hero"], gradient: "from-cyan-300 via-violet-500 to-black" },
  { title: "Grow AI Talent Platform", category: "SaaS", type: "Landing", file: "Grow_AI_Talent_Platform.md", preview: "https://motionsites.ai/assets/hero-grow-ai-preview-BlQ8tAQ-.gif", tags: ["Talent", "AI", "SaaS"], gradient: "from-green-300 via-emerald-500 to-black" },
  { title: "HR SaaS Hero", category: "SaaS", type: "Hero", file: "HR_SaaS_Hero.md", preview: "https://motionsites.ai/assets/hero-hr-saas-preview-Cf365Y1O.gif", tags: ["HR", "SaaS", "Hero"], gradient: "from-indigo-300 via-blue-500 to-black" },
  { title: "Investor Deck", category: "Presentation", type: "Deck", file: "Investor_Deck.md", preview: "https://motionsites.ai/assets/hero-deck-preview-CbidQJxW.gif", tags: ["Deck", "Investor", "Slides"], gradient: "from-amber-200 via-yellow-500 to-black" },
  { title: "Liquid Glass Agency", category: "Landing Page", type: "Landing", file: "Liquid_Glass_Agency.md", preview: "https://motionsites.ai/assets/hero-liquid-glass-agency-preview-Cr5Q9-lc.gif", tags: ["Glass", "Agency", "Premium"], gradient: "from-fuchsia-400 via-violet-500 to-indigo-950" },
  { title: "Loader Animation", category: "Component", type: "Component", file: "Loader_Animation.md", preview: "https://motionsites.ai/assets/hero-loader-animation-preview-C3_SX_Io.gif", tags: ["Loader", "Animation", "Component"], gradient: "from-white via-zinc-400 to-black" },
  { title: "Logoisum Video Agency", category: "Agency", type: "Landing", file: "Logoisum_Video_Agency.md", preview: "https://motionsites.ai/assets/hero-logoisum-preview-yhpSc7Yy.gif", tags: ["Video", "Agency", "Brand"], gradient: "from-red-300 via-pink-500 to-black" },
  { title: "Mindloop", category: "SaaS", type: "Landing", file: "Mindloop.md", preview: "https://motionsites.ai/assets/hero-mindloop-preview-BR8xW6xW.gif", tags: ["SaaS", "AI", "Dark"], gradient: "from-violet-300 via-indigo-500 to-black" },
  { title: "Mindloop Landing", category: "Landing Page", type: "Landing", file: "Mindloop_Landing.md", preview: "https://motionsites.ai/assets/hero-mindloop-landing-preview-Bqnstohr.gif", tags: ["Landing", "AI", "Modern"], gradient: "from-blue-300 via-purple-500 to-black" },
  { title: "NOVA Space Systems", category: "Landing Page", type: "Landing", file: "NOVA_Space_Systems.md", preview: "https://motionsites.ai/assets/hero-nova-space-preview-ej0OOJ0M.gif", tags: ["Space", "Systems", "Landing"], gradient: "from-cyan-300 via-blue-600 to-black" },
  { title: "NeoVision", category: "Landing Page", type: "Landing", file: "NeoVision.md", preview: "https://motionsites.ai/assets/hero-neovision-preview-qwRNOas1.gif", tags: ["Vision", "AI", "Landing"], gradient: "from-fuchsia-300 via-violet-500 to-black" },
  { title: "Neuralyn", category: "SaaS", type: "Landing", file: "Neuralyn.md", preview: "https://motionsites.ai/assets/hero-neuralyn-preview-Br4FRDQA.gif", tags: ["AI", "Neural", "SaaS"], gradient: "from-purple-300 via-blue-500 to-black" },
  { title: "New Era Automotive Hero", category: "Automotive", type: "Hero", file: "New_Era_Automotive_Hero.md", preview: "https://motionsites.ai/assets/hero-new-era-auto-preview-W56vp0xD.gif", tags: ["Automotive", "Hero", "Premium"], gradient: "from-zinc-100 via-red-500 to-black" },
  { title: "New Era Bold Hero", category: "Agency", type: "Hero", file: "New_Era_Bold_Hero.md", preview: "https://motionsites.ai/assets/hero-new-era-preview-CocuDUm9.gif", tags: ["Bold", "Agency", "Hero"], gradient: "from-orange-300 via-red-500 to-black" },
  { title: "Nexora Automation", category: "SaaS", type: "Landing", file: "Nexora_Automation.md", preview: "https://motionsites.ai/assets/hero-nexora-preview-cx5HmUgo.gif", tags: ["Automation", "SaaS", "AI"], gradient: "from-sky-300 via-indigo-500 to-black" },
  { title: "Nexus IT Solutions", category: "Hero Section", type: "Hero", file: "Nexus_IT_Solutions.md", preview: "https://motionsites.ai/assets/hero-nexus-preview-74RfhYpA.gif", tags: ["B2B", "IT", "Clean"], gradient: "from-blue-400 via-sky-500 to-slate-950" },
  { title: "Nickel Payments", category: "SaaS", type: "Landing", file: "Nickel_Payments.md", preview: "https://motionsites.ai/assets/hero-nickel-preview-CnRoBZt5.gif", tags: ["Payments", "Fintech", "SaaS"], gradient: "from-yellow-300 via-amber-500 to-black" },
  { title: "Orbis NFT", category: "Landing Page", type: "Landing", file: "Orbis_NFT.md", preview: "https://motionsites.ai/assets/hero-orbis-nft-preview-C3wvh77a.gif", tags: ["NFT", "Web3", "Landing"], gradient: "from-purple-300 via-pink-500 to-black" },
  { title: "Orbit Engineers", category: "Agency", type: "Landing", file: "Orbit_Engineers.md", preview: makePreview("Orbit_Engineers"), tags: ["Engineering", "Agency", "Orbit"], gradient: "from-blue-300 via-cyan-500 to-black" },
  { title: "Orbit Web3", category: "Web3", type: "Landing", file: "Orbit_Web3.md", preview: "https://motionsites.ai/assets/hero-orbit-web3-preview-BXt4OttD.gif", tags: ["Web3", "Crypto", "Orbit"], gradient: "from-indigo-300 via-violet-500 to-black" },
  { title: "Planet Orbit", category: "SaaS", type: "Landing", file: "Planet_Orbit.md", preview: "https://motionsites.ai/assets/hero-planet-orbit-preview-DWAP8Z1P.gif", tags: ["Orbit", "SaaS", "Space"], gradient: "from-cyan-300 via-indigo-600 to-black" },
  { title: "Portfolio Cosmic", category: "Portfolio", type: "Portfolio", file: "Portfolio_Cosmic.md", preview: "https://motionsites.ai/assets/hero-portfolio-cosmic-preview-BpvWJ3Nc.gif", tags: ["Portfolio", "Cosmic", "Personal"], gradient: "from-violet-300 via-blue-500 to-black" },
  { title: "Power AI", category: "Hero Section", type: "Hero", file: "Power_AI.md", preview: "https://motionsites.ai/assets/hero-power-ai-preview-BqpSbx41.gif", tags: ["AI", "Hero", "Energy"], gradient: "from-cyan-300 via-blue-600 to-black" },
  { title: "Price Calculator", category: "SaaS", type: "Component", file: "Price_Calculator.md", preview: "https://motionsites.ai/assets/hero-price-calculator-preview-Dak8DDgY.gif", tags: ["Calculator", "Conversion", "Dark"], gradient: "from-emerald-400 via-teal-500 to-slate-950" },
  { title: "Railroad.ai", category: "Hero Section", type: "Hero", file: "Railroad.ai.md", preview: "https://motionsites.ai/assets/hero-railroad-preview-CqimSb5d.gif", tags: ["Video", "Cinematic", "Landing"], gradient: "from-zinc-200 via-slate-500 to-blue-700" },
  { title: "SkyElite Private Jets", category: "Landing Page", type: "Landing", file: "SkyElite_Private_Jets.md", preview: "https://motionsites.ai/assets/hero-skyelite-preview-DHaZIgUv.gif", tags: ["Luxury", "Jets", "Landing"], gradient: "from-sky-200 via-blue-500 to-black" },
  { title: "Space Voyage", category: "Landing Page", type: "Landing", file: "Space_Voyage.md", preview: "https://motionsites.ai/assets/hero-space-voyage-preview-eECLH3Yc.gif", tags: ["Space", "Immersive", "Hero"], gradient: "from-cyan-300 via-blue-600 to-black" },
  { title: "Stellar AI", category: "Hero Section", type: "Hero", file: "Stellar_AI.md", preview: "https://motionsites.ai/assets/hero-stellar-ai-preview-D3HL6bw1.gif", tags: ["AI", "Stellar", "Hero"], gradient: "from-blue-300 via-violet-500 to-black" },
  { title: "Synapse Dark Hero", category: "SaaS", type: "Hero", file: "Synapse_Dark_Hero.md", preview: "https://motionsites.ai/assets/hero-synapse-preview-CP83ds5W.gif", tags: ["Dark", "AI", "SaaS"], gradient: "from-violet-300 via-purple-600 to-black" },
  { title: "Sync AI", category: "Hero Section", type: "Hero", file: "Sync_AI.md", preview: "https://motionsites.ai/assets/hero-stellar-ai-v2-preview-DjvxjG3C.gif", tags: ["AI", "Sync", "Hero"], gradient: "from-sky-300 via-cyan-500 to-black" },
  { title: "Targo Logistics Hero", category: "SaaS", type: "Hero", file: "Targo_Logistics_Hero.md", preview: "https://motionsites.ai/assets/hero-targo-preview-BF9qQyMr.gif", tags: ["Logistics", "SaaS", "Hero"], gradient: "from-orange-300 via-red-500 to-black" },
  { title: "Taskly", category: "Hero Section", type: "Hero", file: "Taskly.md", preview: "https://motionsites.ai/assets/hero-taskly-preview-Dq2MKaI0.gif", tags: ["Productivity", "Hero", "Dark"], gradient: "from-lime-300 via-green-500 to-black" },
  { title: "Taskora SaaS Hero", category: "SaaS", type: "Hero", file: "Taskora_SaaS_Hero.md", preview: "https://motionsites.ai/assets/hero-taskora-preview-BlRBv8IU.gif", tags: ["Tasks", "SaaS", "Hero"], gradient: "from-blue-300 via-indigo-500 to-black" },
  { title: "Terra Geo Map", category: "SaaS", type: "Landing", file: "Terra_Geo_Map.md", preview: "https://motionsites.ai/assets/hero-terra-preview-BFjrCr7T.gif", tags: ["Map", "Geo", "SaaS"], gradient: "from-emerald-300 via-teal-500 to-black" },
  { title: "Transform Data", category: "Hero Section", type: "Hero", file: "Transform_Data.md", preview: "https://motionsites.ai/assets/hero-transform-data-preview-Cx5OU29N.gif", tags: ["Data", "Hero", "B2B"], gradient: "from-cyan-300 via-blue-500 to-black" },
  { title: "Velorah", category: "Agency", type: "Landing", file: "Velorah.md", preview: "https://motionsites.ai/assets/hero-velorah-preview-CJNTtbpd.gif", tags: ["Agency", "Premium", "Motion"], gradient: "from-pink-300 via-purple-500 to-black" },
  { title: "Viktor Portfolio", category: "Portfolio", type: "Portfolio", file: "Viktor_Portfolio.md", preview: "https://pub-86dc5b5484314368ac5436a674b0d919.r2.dev/hero%20sections/animated%20(89).webp", tags: ["Personal", "Creative", "Motion"], gradient: "from-lime-300 via-green-600 to-black" },
  { title: "Wealth Video Hero", category: "Fintech", type: "Hero", file: "Wealth_Video_Hero.md", preview: "https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif", tags: ["Finance", "Video", "Hero"], gradient: "from-emerald-300 via-green-600 to-black" },
  { title: "Web3 EOS Hero", category: "Web3", type: "Hero", file: "Web3_EOS_Hero.md", preview: "https://motionsites.ai/assets/hero-web3-eos-poster-DF0_WdVS.png", tags: ["Web3", "EOS", "Hero"], gradient: "from-purple-300 via-indigo-500 to-black" },
  { title: "Weblex Dark Hero", category: "Landing Page", type: "Hero", file: "Weblex_Dark_Hero.md", preview: "https://motionsites.ai/assets/hero-weblex-preview-BoIbrUHI.gif", tags: ["Dark", "Agency", "Hero"], gradient: "from-zinc-100 via-zinc-500 to-black" },
  { title: "xPortfolio Hero", category: "Hero Section", type: "Hero", file: "xPortfolio_Hero.md", preview: "https://motionsites.ai/assets/hero-xportfolio-preview-D4A8maiC.gif", tags: ["Portfolio", "Hero", "Creative"], gradient: "from-fuchsia-300 via-violet-500 to-black" },
];

// Only prompts whose .md is actually hosted in azoklearn/movento/prompts/ (or that open an
// external link) are shown. Add a filename here as its content is added to the repo.
const AVAILABLE_FILES = new Set([
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
]);

function isPromptAvailable(item) {
  return Boolean(item.link) || AVAILABLE_FILES.has(item.file);
}

const categories = ["Tous", "AI / SaaS", "Landing Page", "Hero Section", "SaaS", "Agency", "Portfolio", "Web3", "Component", "Presentation", "Automotive", "Fintech"];
const FREE_PROMPT_FILES = new Set([]);

const plans = [
  {
    id: "monthly",
    name: t("Monthly", "Mensuel"),
    price: "14.99€",
    period: t("/ mo", "/ mois"),
    badge: t("Flexible", "Flexible"),
    description: t("14.99€/mo. Cancel anytime.", "14,99€/mois. Résiliez à tout moment."),
    cta: t("Get started →", "Commencer →"),
    featured: false,
    features: [t("Access to all prompts", "Accès à tous les prompts"), t("One-click prompt copy", "Copie en un clic"), t("Video & visual previews", "Aperçus vidéo & visuels"), t("New prompts included", "Nouveaux prompts inclus"), t("Cancel anytime", "Résiliez à tout moment")],
  },
  {
    id: "yearly",
    name: t("Yearly", "Annuel"),
    price: "50€",
    period: t("/ yr", "/ an"),
    subPrice: t("≈ 4.17€/mo — save 72% vs monthly", "≈ 4,17€/mois — 72% d'économie vs mensuel"),
    badge: t("Best value", "Meilleur rapport"),
    description: t("Build premium AI websites regularly.", "Créez des sites premium toute l'année."),
    cta: t("Get the annual plan", "Prendre l'offre annuelle"),
    featured: true,
    features: [t("Full Movento catalog", "Catalogue Movento complet"), t("Year-round updates", "Mises à jour toute l'année"), t("New premium categories", "Nouvelles catégories premium"), t("Optimized for Lovable / v0 / Bolt", "Optimisé pour Lovable / v0 / Bolt"), t("Save over 45%", "Économisez plus de 45%")],
  },
  {
    id: "lifetime",
    // Hidden until WHOP_LIFETIME_URL exists — without a checkout link the button
    // would 400. Flip to false once the Whop plan is live.
    hidden: true,
    name: t("Lifetime", "À vie"),
    price: "120€",
    period: t("forever", "à vie"),
    badge: t("One shot", "Une fois pour toutes"),
    description: t("One-time payment. Yours forever.", "Paiement unique. À vous pour toujours."),
    cta: t("Get lifetime access", "Obtenir l'accès à vie"),
    featured: false,
    features: [t("Lifetime access", "Accès à vie"), t("All future updates", "Toutes les mises à jour futures"), t("No subscription", "Sans abonnement"), t("All previews included", "Tous les aperçus inclus"), t("Perfect for freelancers & agencies", "Parfait pour les freelances & agences")],
  },
];

// Plans without a configured Whop checkout link are hidden rather than shown
// with a button that would fail.
const visiblePlans = plans.filter((plan) => !plan.hidden);
// Tailwind only sees literal class names, so pick whole strings.
const planGridMd = visiblePlans.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3";
const planGridLg = visiblePlans.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3";

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

  return <svg {...common}>{children}</svg>;
}

function Logo() {
  return (
    <img src="/logo.png" alt="Movento" className="h-12 w-auto" />
  );
}

function SmartVideo({ src, className, onError }) {
  if (!src) return null;
  return <video src={src} className={className} autoPlay loop muted playsInline preload="metadata" onError={onError} />;
}

function GeneratedPreview({ item }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className={`absolute -left-10 -top-10 h-56 w-56 rounded-full bg-gradient-to-br ${item.gradient} opacity-45 blur-3xl`} />
      <div className={`absolute -bottom-16 right-0 h-72 w-72 rounded-full bg-gradient-to-br ${item.gradient} opacity-35 blur-3xl`} />
      <div className="absolute inset-5 rounded-[22px] border border-white/10 bg-black/30 p-4 backdrop-blur-xl">
        <div className="mb-4 flex items-center justify-between"><div className="h-3 w-20 rounded-full bg-white/25" /><div className="flex gap-1.5"><div className="h-2 w-2 rounded-full bg-white/25" /><div className="h-2 w-2 rounded-full bg-white/20" /><div className="h-2 w-2 rounded-full bg-white/15" /></div></div>
        <div className="grid h-[78%] grid-cols-[0.9fr_1.1fr] gap-3">
          <div className="space-y-3"><div className="h-5 w-24 rounded-full bg-white/25" /><div className="h-16 rounded-2xl bg-white/10" /><div className="h-3 w-28 rounded-full bg-white/15" /><div className="h-3 w-20 rounded-full bg-white/10" /><div className="mt-4 h-9 w-24 rounded-full bg-white/80" /></div>
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="relative rounded-[24px] border border-white/10 bg-white/10 p-3 shadow-2xl shadow-black/30">
            <div className="mb-3 h-4 w-24 rounded-full bg-white/20" />
            <div className="space-y-2">{[72, 48, 88, 58].map((w, i) => <div key={i} className="flex items-center gap-2"><div className="h-7 w-7 rounded-xl bg-white/10" /><div className="h-2 rounded-full bg-white/20" style={{ width: `${w}%` }} /></div>)}</div>
            <div className="absolute bottom-3 right-3 rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-[10px] text-white/60 backdrop-blur">Preview</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function PreviewCard({ item, badge, onClick }) {
  const [previewFailed, setPreviewFailed] = useState(false);
  const hasVideo = !previewFailed && item.preview && (item.preview.endsWith(".mp4") || item.preview.endsWith(".webm"));
  const hasImage = !previewFailed && item.preview && [".png", ".jpg", ".jpeg", ".gif", ".webp"].some((ext) => item.preview.endsWith(ext) || item.preview.includes(`${ext}?`));

  return (
    <motion.div layout whileHover={{ y: -5 }} onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick?.(); } }} className="group relative cursor-pointer overflow-hidden rounded-[20px] bg-white/[0.04] shadow-xl shadow-black/30 transition hover:bg-white/[0.07]">
      <div className="relative aspect-[1.45] overflow-hidden bg-[#080913]">
        {hasVideo ? <SmartVideo className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" style={{ objectPosition: item.previewPosition || "center" }} src={item.preview} onError={() => setPreviewFailed(true)} /> : hasImage ? <img className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" style={{ objectPosition: item.previewPosition || "center" }} src={item.preview} alt={`${item.title} preview`} onError={() => setPreviewFailed(true)} /> : <GeneratedPreview item={item} />}
      </div>
      <div className="flex items-center justify-between gap-3 px-4 py-3.5">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold tracking-tight text-white">{item.title}</h3>
          <p className="mt-0.5 text-xs text-white/40">{item.category}</p>
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

export default function MoventoSite() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tous");
  const [copiedCard, setCopiedCard] = useState("");
  const [copyError, setCopyError] = useState("");
  const [unlockNotice, setUnlockNotice] = useState("");
  const [accessEmail, setAccessEmail] = useState(getStoredAccessEmail);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [accessStatus, setAccessStatus] = useState({ loading: false, message: "", error: "" });
  const [checkoutStatus, setCheckoutStatus] = useState({ loading: "", error: "" });
  const [leadEmail, setLeadEmail] = useState(getStoredLeadEmail);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [pendingFreeItem, setPendingFreeItem] = useState(null);
  const [leadEmailInput, setLeadEmailInput] = useState("");
  const [leadSubmitting, setLeadSubmitting] = useState(false);
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
    return prompts.filter((p) => {
      if (!isPromptAvailable(p)) return false;
      const matchCategory = category === "Tous" || p.category === category;
      const matchQuery = `${p.title} ${p.category} ${p.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase());
      return matchCategory && matchQuery;
    });
  }, [query, category]);

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
      track("paywall_shown", { prompt: item.title, category: item.category });
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

  async function goToCheckout(planId) {
    if (checkoutStatus.loading) return;

    track("checkout_started", { plan: planId });
    setCheckoutStatus({ loading: planId, error: "" });

    try {
      if (!validatePlanId(planId)) throw new Error("Invalid plan.");

      const response = await fetch(CHECKOUT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) throw new Error(data.error || `Erreur serveur paiement (${response.status}).`);
      if (!data.checkoutUrl || typeof data.checkoutUrl !== "string") throw new Error("Le backend n'a pas renvoyé de lien de checkout Whop.");

      window.location.assign(data.checkoutUrl);
    } catch (error) {
      console.error("Erreur paiement Whop", error);
      setCheckoutStatus({ loading: "", error: getCheckoutErrorMessage(error) });
    }
  }

  if (isMentionsPage) return <MentionsLegales />;
  if (isPricingPage) return <PricingPage />;
  if (isSubscriptionPage) return <SubscriptionPage />;

  return (
    <main className="min-h-screen overflow-hidden bg-[#05060a] text-white">
      <AnimatePresence>
        {showLeadModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setShowLeadModal(false)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="relative w-full max-w-md rounded-[28px] border border-white/10 bg-[#0d0e18] p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setShowLeadModal(false)} className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 text-white/50 hover:text-white transition"><Icon name="close" className="h-4 w-4" /></button>
              <div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-500/30 to-cyan-500/20 border border-violet-300/20"><Icon name="sparkles" className="h-5 w-5 text-violet-300" /></div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">{t("Access free prompts", "Accéder aux prompts gratuits")}</h2>
              <p className="mt-2 text-sm leading-6 text-white/50">{t("Enter your email to copy free prompts. No spam, ever.", "Entrez votre email pour copier les prompts gratuits. Jamais de spam.")}</p>
              <form onSubmit={submitLeadEmail} className="mt-6 flex flex-col gap-3">
                <input autoFocus value={leadEmailInput} onChange={(e) => setLeadEmailInput(e.target.value)} type="email" required placeholder="you@example.com" className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-violet-400/50" />
                <button type="submit" disabled={leadSubmitting} className="w-full rounded-2xl bg-white py-3 text-sm font-semibold text-black transition hover:scale-[1.01] disabled:opacity-60">{leadSubmitting ? t("Just a moment...", "Un instant...") : t("Copy free prompt →", "Copier le prompt gratuit →")}</button>
              </form>
              <p className="mt-4 text-center text-xs text-white/25">{t("Your data will never be shared.", "Vos données ne seront jamais partagées.")}</p>
            </motion.div>
          </motion.div>
        )}
        {showPricingModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-3 py-6 sm:items-center sm:px-4 sm:py-8" onClick={() => setShowPricingModal(false)}>
            <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="relative my-auto w-full max-w-5xl rounded-3xl border border-white/10 bg-[#0d0e18] p-5 shadow-2xl sm:rounded-[32px] sm:p-8" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setShowPricingModal(false)} className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 text-white/50 hover:text-white transition sm:right-5 sm:top-5"><Icon name="close" className="h-4 w-4" /></button>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-white/65"><Icon name="sparkles" className="h-3.5 w-3.5 text-violet-300" /> {t("Founder pricing", "Prix fondateurs")}</div>
              <h2 className="mt-2 pr-10 text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">{t("Unlock all prompts", "Débloquer tous les prompts")}</h2>
              <p className="mt-2 text-sm text-white/50">{t("Choose a plan to access the full Movento catalog.", "Choisissez une offre pour accéder au catalogue complet Movento.")}</p>
              {checkoutStatus.error && (
                <div className="mt-4 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-100">
                  <Icon name="alert" className="mt-0.5 h-4 w-4 flex-none" /><p>{checkoutStatus.error}</p>
                </div>
              )}
              <div className={`mt-7 grid gap-4 ${planGridMd}`}>
                {visiblePlans.map((plan) => (
                  <div key={plan.id} className={`relative overflow-hidden rounded-[24px] border p-3 backdrop-blur-2xl transition hover:-translate-y-1 ${plan.id === "monthly" ? "border-violet-400/40 bg-gradient-to-br from-violet-500/[0.22] via-fuchsia-500/[0.08] to-cyan-500/[0.12]" : plan.featured ? "border-violet-300/30 bg-gradient-to-br from-violet-500/[0.18] via-white/[0.06] to-cyan-500/[0.12]" : "border-white/10 bg-white/[0.035]"}`}>
                    {plan.id === "monthly" && <div className="pointer-events-none absolute -left-8 -top-8 h-40 w-40 rounded-full bg-fuchsia-500/25 blur-[60px]" />}
                    {plan.featured && <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-violet-500/30 blur-[70px]" />}
                    <div className="relative rounded-[18px] border border-white/10 bg-[#080910]/90 p-5">
                      <div className="mb-5 flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                          <p className="mt-1 text-xs leading-5 text-white/45">{plan.description}</p>
                        </div>
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${plan.id === "monthly" ? "border-fuchsia-400/30 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 text-fuchsia-200" : plan.featured ? "border-violet-300/25 bg-violet-500/15 text-violet-100" : "border-white/10 bg-white/[0.05] text-white/55"}`}>{plan.badge}</span>
                      </div>
                      <div className="mb-5">
                        <div className="flex items-end gap-1.5">
                          <span className="text-4xl font-bold tracking-[-0.06em] text-white">{plan.price}</span>
                          <span className="pb-1 text-sm text-white/40">{plan.period}</span>
                        </div>
                        {plan.subPrice && <p className="mt-1.5 text-[11px] font-medium text-emerald-300/90">{plan.subPrice}</p>}
                      </div>
                      <button disabled={Boolean(checkoutStatus.loading)} onClick={() => goToCheckout(plan.id)} className={`group flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 ${plan.id === "monthly" ? "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 text-white shadow-xl shadow-violet-500/30" : plan.featured ? "bg-white text-black hover:bg-white/90" : "border border-white/10 bg-white/[0.06] text-white hover:bg-white hover:text-black"}`}>
                        {checkoutStatus.loading === plan.id ? t("Redirecting...", "Redirection...") : plan.cta}
                        <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" />
                      </button>
                      <div className="my-5 h-px bg-white/10" />
                      <div className="space-y-2.5">
                        {plan.features.map((feat) => (
                          <div key={feat} className="flex items-center gap-2.5 text-xs text-white/65">
                            <div className="grid h-4 w-4 flex-none place-items-center rounded-full bg-white/10"><Icon name="check" className="h-3 w-3 text-white" /></div>
                            {feat}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-20%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-blue-500/20 blur-[140px]" />
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "34px 34px" }} />
      </div>

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-white/55 md:flex">
          <a href="#prompts" className="hover:text-white">Prompts</a>
          <a href="/pricing" className="hover:text-white">{t("Pricing", "Tarifs")}</a>
          <a href="/subscription" className="hover:text-white">{t("My subscription", "Mon abonnement")}</a>
          <a href="#how" className="hover:text-white">{t("Guide", "Guide")}</a>
          <a href="#faq" className="hover:text-white">FAQ</a>
        </nav>
        <a href="/pricing" className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:shadow-violet-500/45 hover:brightness-110">{t("Get started", "Commencer")}</a>
      </header>

      {isSuccessPage && (
        <section className="relative z-10 mx-auto max-w-4xl px-6 pb-10 pt-14 text-center lg:px-8">
          <div className="rounded-[34px] border border-emerald-300/20 bg-emerald-400/[0.08] p-8 shadow-2xl shadow-emerald-950/30 backdrop-blur-2xl">
            <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-emerald-200/20 bg-emerald-300/10 text-emerald-100">
              <Icon name="check" className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">{t("Payment confirmed", "Paiement confirmé")}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/60 md:text-base">
              {accessStatus.loading ? t("Confirming your payment with Whop.", "Confirmation de votre paiement avec Whop.") : hasPremiumAccess ? t("Your Movento access is ready. Go back to the gallery and copy premium prompts.", "Votre accès Movento est prêt. Retournez à la galerie et copiez les prompts premium.") : t("Payment received. If your access does not activate automatically, enter your email below.", "Paiement reçu. Si votre accès ne s'active pas automatiquement, entrez votre email ci-dessous.")}
            </p>
            {accessStatus.message && <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-emerald-100">{accessStatus.message}</p>}
            {accessStatus.error && <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-red-100">{accessStatus.error}</p>}
            <a href="/#prompts" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]">
              {t("Back to prompts", "Retour aux prompts")} <Icon name="arrow" className="h-4 w-4" />
            </a>
          </div>
        </section>
      )}

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-16 pt-16 text-center lg:px-8 lg:pt-24">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/70 backdrop-blur-xl"><Icon name="sparkles" className="h-4 w-4 text-violet-300" /> {t("Premium web design prompt library", "Bibliothèque de prompts design web premium")}</motion.div>
        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mx-auto max-w-5xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] text-white md:text-7xl lg:text-8xl">
          {lang === "fr" ? <>Créez des sites web <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text pr-1 italic text-transparent" style={{ fontFamily: '"Instrument Serif", serif', fontWeight: 400 }}>modernes</span> sans coder.</> : <>Build <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text pr-1 italic text-transparent" style={{ fontFamily: '"Instrument Serif", serif', fontWeight: 400 }}>modern</span> websites without coding.</>}
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-white/60 md:text-xl">{t("Ready-to-use prompts to build beautiful landing pages in minutes. Copy, paste, launch.", "Des prompts prêts à l'emploi pour créer de superbes landing pages en quelques minutes. Copiez, collez, lancez.")}</motion.p>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a href="/pricing" className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-8 py-3.5 text-sm font-bold text-white shadow-2xl shadow-violet-500/40 transition hover:scale-[1.04] hover:shadow-violet-500/60">
            <span className="relative z-10 flex items-center gap-2">{t("Start for free", "Commencer gratuitement")} <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" /></span>
          </a>
          <a href="#prompts" className="rounded-full border border-white/10 bg-white/[0.05] px-6 py-3 text-sm font-semibold text-white/80 backdrop-blur hover:bg-white/10">{t("Explore prompts", "Voir les prompts")}</a>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-xs text-white/45">
          <span className="flex items-center gap-2"><Icon name="check" className="h-3.5 w-3.5 text-emerald-300" /> {t("Cancel anytime", "Résiliable à tout moment")}</span>
          <span className="flex items-center gap-2"><Icon name="shield" className="h-3.5 w-3.5 text-violet-300" /> {t("Secure payment via Whop", "Paiement sécurisé via Whop")}</span>
          <span className="flex items-center gap-2"><Icon name="zap" className="h-3.5 w-3.5 text-amber-300" /> {t("Instant access after checkout", "Accès immédiat après paiement")}</span>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 backdrop-blur"><span className="text-xl font-bold text-white">{prompts.filter(isPromptAvailable).length}+</span><span className="ml-2 text-sm text-white/50">{t("premium prompts", "prompts premium")}</span></div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 backdrop-blur"><span className="text-sm text-white/50">{t("Works with", "Compatible")}</span><span className="ml-2 text-sm font-semibold text-white">Lovable · v0 · Bolt · Cursor</span></div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 backdrop-blur"><span className="text-sm text-white/50">{t("New prompts", "Nouveaux prompts")}</span><span className="ml-2 text-sm font-semibold text-white">{t("every week", "chaque semaine")}</span></div>
        </motion.div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-4 rounded-[34px] border border-white/10 bg-white/[0.035] p-3 shadow-2xl shadow-black/50 backdrop-blur-2xl md:grid-cols-3">
          <div className="rounded-[26px] border border-white/10 bg-black/30 p-6"><Icon name="zap" className="mb-5 h-6 w-6 text-violet-300" /><h3 className="text-lg font-semibold">{t("Copy & paste", "Copier-coller")}</h3><p className="mt-2 text-sm leading-6 text-white/55">{t("A clean prompt, ready for Lovable, v0, Bolt, Cursor or Claude.", "Un prompt propre, prêt pour Lovable, v0, Bolt, Cursor ou Claude.")}</p></div>
          <div className="rounded-[26px] border border-white/10 bg-black/30 p-6"><Icon name="layers" className="mb-5 h-6 w-6 text-blue-300" /><h3 className="text-lg font-semibold">{t("Visual preview", "Aperçu visuel")}</h3><p className="mt-2 text-sm leading-6 text-white/55">{t("See the style before generating: dark UI, video, glass, portfolio, SaaS.", "Voyez le style avant de générer : dark UI, vidéo, glass, portfolio, SaaS.")}</p></div>
          <div className="rounded-[26px] border border-white/10 bg-black/30 p-6"><Icon name="code" className="mb-5 h-6 w-6 text-cyan-300" /><h3 className="text-lg font-semibold">{t("No coding", "Sans code")}</h3><p className="mt-2 text-sm leading-6 text-white/55">{t("Built for marketing, communication and creative profiles.", "Conçu pour les profils marketing, communication et créatifs.")}</p></div>
        </div>
      </section>

      <section id="prompts" className="relative z-10 mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-white/35">{t("Gallery", "Galerie")}</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">{t("Premium prompts", "Prompts premium")}</h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/50">{hasPremiumAccess ? t("Premium access active. All prompts can be copied.", "Accès premium actif. Tous les prompts peuvent être copiés.") : `${prompts.filter(isPromptAvailable).length}+ ${t("premium prompts. The full catalog unlocks with a Movento plan.", "prompts premium. Le catalogue complet se débloque avec un abonnement Movento.")}`}</p>
        </div>
        <div className="mb-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl md:flex md:items-center md:justify-between md:gap-5">
          <div>
            <p className="text-sm font-semibold text-white">{hasPremiumAccess ? t("Premium access active", "Accès premium actif") : t("Already a member?", "Déjà membre ?")}</p>
            <p className="mt-1 text-sm leading-6 text-white/50">{hasPremiumAccess ? `${t("Signed in as", "Connecté en tant que")} ${accessEmail}.` : t("Enter the email used at checkout to unlock premium prompts on this device.", "Entrez l'email utilisé lors de l'achat pour accéder aux prompts premium.")}</p>
          </div>
          <form className="mt-4 flex flex-col gap-3 sm:flex-row md:mt-0" onSubmit={(event) => { event.preventDefault(); verifyAccess(); }}>
            <input value={accessEmail} onChange={(event) => setAccessEmail(event.target.value)} type="email" inputMode="email" autoComplete="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="email@example.com" className="min-w-0 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-violet-400/50 sm:w-72" />
            <button disabled={accessStatus.loading} className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60">{accessStatus.loading ? t("Verifying...", "Vérification...") : hasPremiumAccess ? t("Re-verify", "Re-vérifier") : t("Unlock", "Déverrouiller")}</button>
          </form>
        </div>
        {(accessStatus.message || accessStatus.error) && !isSuccessPage && <div className={`mb-8 flex items-start gap-3 rounded-2xl border p-4 text-sm leading-6 backdrop-blur-xl ${accessStatus.error ? "border-red-400/20 bg-red-500/10 text-red-100" : "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"}`}><Icon name={accessStatus.error ? "alert" : "check"} className="mt-1 h-4 w-4 flex-none" /><p>{accessStatus.error || accessStatus.message}</p></div>}
        {unlockNotice && <div className="mb-8 flex items-start gap-3 rounded-2xl border border-violet-300/20 bg-violet-500/10 p-4 text-sm leading-6 text-violet-50 backdrop-blur-xl"><Icon name="sparkles" className="mt-1 h-4 w-4 flex-none" /><p>{unlockNotice}</p></div>}
        {copyError && <div className="mb-8 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm leading-6 text-red-100 backdrop-blur-xl"><Icon name="alert" className="mt-1 h-4 w-4 flex-none" /><p>{copyError}</p></div>}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">{categories.map((cat) => <button key={cat} onClick={() => setCategory(cat)} className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition ${category === cat ? "border-white/20 bg-white text-black" : "border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/10"}`}>{cat}</button>)}</div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence>
            {filtered.map((item) => {
              const unlocked = hasPremiumAccess || FREE_PROMPT_FILES.has(item.file);
              return (
                <motion.div key={item.title} layout initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }} className="relative">
                  <PreviewCard item={item} onClick={() => copyPrompt(item)} badge={
                    <span className={`flex flex-none items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition ${copiedCard === item.title ? "bg-emerald-400/15 text-emerald-200" : copiedCard === "Error" ? "bg-red-400/15 text-red-200" : "bg-white/[0.08] text-white/80 group-hover:bg-white group-hover:text-black"}`}>
                      {copiedCard === item.title ? <><Icon name="check" className="h-3.5 w-3.5" /> {t("Copied", "Copié")}</> : copiedCard === "Error" ? <><Icon name="alert" className="h-3.5 w-3.5" /> {t("Error", "Erreur")}</> : !unlocked ? <><Icon name="lock" className="h-3.5 w-3.5" /> Premium</> : item.link ? <><Icon name="arrow" className="h-3.5 w-3.5" /> {t("Open", "Ouvrir")}</> : <><Icon name="copy" className="h-3.5 w-3.5" /> {t("Copy", "Copier")}</>}
                    </span>
                  } />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </section>

      <section id="how" className="relative z-10 mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="rounded-[40px] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8 backdrop-blur-xl md:p-12"><div className="grid gap-10 md:grid-cols-3">{[t("Choose a style", "Choisir un style"), t("Copy the prompt", "Copier le prompt"), t("Generate your site", "Générer votre site")].map((step, i) => <div key={step}><div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] text-sm font-bold text-white/70">0{i + 1}</div><h3 className="text-xl font-semibold">{step}</h3><p className="mt-3 text-sm leading-6 text-white/55">{i === 0 ? t("Browse previews and find a design direction that suits your offer.", "Parcourez les aperçus et trouvez une direction design adaptée à votre offre.") : i === 1 ? t("The prompt is loaded directly from the source to stay intact.", "Le prompt est chargé directement depuis la source pour rester intact.") : t("Paste it into your favorite AI tool and customize the result.", "Collez-le dans votre outil IA préféré et personnalisez le résultat.")}</p></div>)}</div></div>
      </section>

      <section id="pricing" className="relative z-10 mx-auto max-w-7xl px-6 pb-28 pt-10 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/65 backdrop-blur-xl"><Icon name="sparkles" className="h-4 w-4 text-violet-300" /> {t("Launch offer - Founder pricing", "Offre de lancement - Prix fondateurs")}</div>
          <h2 className="text-5xl font-semibold tracking-[-0.06em] text-white md:text-7xl">{t("Choose your plan", "Choisissez votre offre")}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/55">{t("Save hours on every landing page. Copy a premium prompt, paste it into your AI tool, and turn an idea into a modern site in minutes.", "Économisez des heures sur chaque landing page. Copiez un prompt premium, collez-le dans votre outil IA, et transformez une idée en site moderne en quelques minutes.")}</p>

        </div>

        {checkoutStatus.error && <div className="mx-auto mt-8 flex max-w-3xl items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm leading-6 text-red-100 backdrop-blur-xl"><Icon name="alert" className="mt-1 h-4 w-4 flex-none" /><p>{checkoutStatus.error}</p></div>}

        <div className={`mx-auto mt-14 grid max-w-6xl gap-5 ${planGridLg}`}>
          {visiblePlans.map((plan) => (
            <div key={plan.id} className={`relative overflow-hidden rounded-[34px] border p-3 shadow-2xl backdrop-blur-2xl transition hover:-translate-y-1 ${plan.id === "monthly" ? "border-violet-400/40 bg-gradient-to-br from-violet-500/[0.22] via-fuchsia-500/[0.08] to-cyan-500/[0.12] shadow-violet-900/30" : plan.featured ? "border-violet-300/30 bg-gradient-to-br from-violet-500/[0.18] via-white/[0.06] to-cyan-500/[0.12] shadow-violet-900/25" : "border-white/10 bg-white/[0.035] shadow-black/40"}`}>
              {plan.id === "monthly" && <div className="pointer-events-none absolute -left-10 -top-10 h-56 w-56 rounded-full bg-fuchsia-500/25 blur-[80px]" />}
              {plan.featured && <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-500/30 blur-[100px]" />}
              <div className="relative rounded-[28px] border border-white/10 bg-[#080910]/90 p-7">
                <div className="mb-7 flex items-start justify-between gap-4"><div><h3 className="text-2xl font-semibold tracking-tight text-white">{plan.name}</h3><p className="mt-2 text-sm leading-6 text-white/45">{plan.description}</p></div><span className={`rounded-full border px-3 py-1 text-xs font-medium ${plan.id === "monthly" ? "border-fuchsia-400/30 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 text-fuchsia-200" : plan.featured ? "border-violet-300/25 bg-violet-500/15 text-violet-100" : "border-white/10 bg-white/[0.05] text-white/55"}`}>{plan.badge}</span></div>
                <div className="mb-7"><div className="flex items-end gap-2"><span className="text-6xl font-bold tracking-[-0.07em] text-white">{plan.price}</span><span className="pb-2 text-white/40">{plan.period}</span></div>{plan.subPrice && <p className="mt-2 text-xs font-medium text-emerald-300/90">{plan.subPrice}</p>}</div>
                <button disabled={Boolean(checkoutStatus.loading)} onClick={() => goToCheckout(plan.id)} className={`group flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 ${plan.id === "monthly" ? "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 text-white shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50" : plan.featured ? "bg-white text-black hover:bg-white/90 shadow-2xl shadow-white/10" : "border border-white/10 bg-white/[0.06] text-white hover:bg-white hover:text-black"}`}>{checkoutStatus.loading === plan.id ? t("Redirecting...", "Redirection...") : plan.cta}<Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" /></button>
                <div className="my-7 h-px bg-white/10" />
                <div className="space-y-3">{plan.features.map((item) => <div key={item} className="flex items-center gap-3 text-sm text-white/65"><div className="grid h-5 w-5 flex-none place-items-center rounded-full bg-white/10"><Icon name="check" className="h-3.5 w-3.5 text-white" /></div>{item}</div>)}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 flex max-w-4xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-white/45">
          <span className="flex items-center gap-2"><Icon name="shield" className="h-3.5 w-3.5 text-violet-300" /> {t("Payment secured by Whop", "Paiement sécurisé par Whop")}</span>
          <span className="flex items-center gap-2"><Icon name="zap" className="h-3.5 w-3.5 text-amber-300" /> {t("Instant access", "Accès immédiat")}</span>
          <span className="flex items-center gap-2"><Icon name="check" className="h-3.5 w-3.5 text-emerald-300" /> {t("Cancel anytime from your Whop account", "Résiliable à tout moment depuis votre compte Whop")}</span>
        </div>
      </section>

      <section id="faq" className="relative z-10 mx-auto max-w-7xl px-6 pb-28 lg:px-8">
        <div className="mb-14 max-w-2xl">
          <p className="text-sm uppercase tracking-[0.3em] text-white/35">FAQ</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">{t("Questions, answered", "Vos questions, nos réponses")}</h2>
        </div>
        <div className="grid gap-x-12 gap-y-10 md:grid-cols-2">
          {[
            { q: t("How does it work?", "Comment ça marche ?"), a: t("Pick a prompt in the gallery, copy it in one click, paste it into Lovable, v0, Bolt or Cursor. The AI generates the full site — you just customize the content.", "Choisissez un prompt dans la galerie, copiez-le en un clic, collez-le dans Lovable, v0, Bolt ou Cursor. L'IA génère le site complet — il ne vous reste qu'à personnaliser le contenu.") },
            { q: t("Which tools are supported?", "Quels outils sont compatibles ?"), a: t("Any AI tool that accepts a text prompt: Lovable, v0, Bolt, Cursor, Claude, ChatGPT... The prompts describe every detail (fonts, colors, animations) so the result stays faithful.", "Tous les outils IA qui acceptent un prompt texte : Lovable, v0, Bolt, Cursor, Claude, ChatGPT... Les prompts décrivent chaque détail (polices, couleurs, animations) pour un résultat fidèle.") },
            { q: t("Can I cancel anytime?", "Puis-je résilier à tout moment ?"), a: t("Yes. Monthly and annual plans can be cancelled anytime from the My subscription page or directly on Whop — no minimum commitment.", "Oui. Les offres mensuelle et annuelle peuvent être résiliées à tout moment depuis la page Mon abonnement ou directement sur Whop — sans engagement minimum.") },
            { q: t("How do I access prompts after paying?", "Comment j'accède aux prompts après paiement ?"), a: t("The email you used at checkout is your access key. Enter it in the gallery on any device and every prompt unlocks instantly.", "L'email utilisé au paiement est votre clé d'accès. Entrez-le dans la galerie sur n'importe quel appareil et tous les prompts se débloquent instantanément.") },
            { q: t("Is the catalog updated?", "Le catalogue est-il mis à jour ?"), a: t("Yes — new premium prompts are added regularly, and they're all included in your plan at no extra cost.", "Oui — de nouveaux prompts premium sont ajoutés régulièrement, et ils sont tous inclus dans votre abonnement sans surcoût.") },
            { q: t("Can I use the sites commercially?", "Puis-je utiliser les sites commercialement ?"), a: t("Yes. The sites you generate from our prompts are yours — client projects, portfolios, product launches, anything.", "Oui. Les sites que vous générez à partir de nos prompts vous appartiennent — projets clients, portfolios, lancements de produits, tout est permis.") },
          ].map((item) => (
            <div key={item.q} className="border-t border-white/10 pt-6">
              <h3 className="text-base font-semibold text-white">{item.q}</h3>
              <p className="mt-3 max-w-lg text-sm leading-7 text-white/55">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-28 lg:px-8">
        <div className="relative overflow-hidden rounded-[40px] border border-violet-400/25 bg-gradient-to-br from-violet-600/[0.16] via-[#0a0b14] to-fuchsia-600/[0.12] px-8 py-16 text-center shadow-2xl shadow-violet-950/40 md:py-20">
          <div className="pointer-events-none absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-500/25 blur-[100px]" />
          <h2 className="relative mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-white md:text-5xl">{t("Your next site is one prompt away.", "Votre prochain site est à un prompt près.")}</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-sm leading-7 text-white/55 md:text-base">{t("One great prompt saves hours of design, integration and client back-and-forth.", "Un bon prompt vous économise des heures de design, d'intégration et d'allers-retours client.")}</p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="/pricing" className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-8 py-3.5 text-sm font-bold text-white shadow-2xl shadow-violet-500/40 transition hover:scale-[1.04] hover:shadow-violet-500/60">{t("See plans", "Voir les offres")} <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" /></a>
            <span className="text-xs text-white/40">{t("No commitment — cancel anytime", "Sans engagement — résiliable à tout moment")}</span>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/[0.06] py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row lg:px-8">
          <Logo />
          <p className="text-sm text-white/30">© {new Date().getFullYear()} Movento. {t("All rights reserved.", "Tous droits réservés.")}</p>
          <div className="flex items-center gap-5">
            <a href="/subscription" className="text-sm text-white/30 hover:text-white transition">{t("My subscription", "Mon abonnement")}</a>
            <a href="/mentions-legales" className="text-sm text-white/30 hover:text-white transition">{t("Legal notice", "Mentions légales")}</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function MentionsLegales() {
  return (
    <main className="min-h-screen bg-[#05060a] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-20%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[120px]" />
      </div>
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <a href="/"><Logo /></a>
        <a href="/" className="rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-white/80 backdrop-blur transition hover:bg-white hover:text-black">← {t("Back", "Retour")}</a>
      </header>
      <section className="relative z-10 mx-auto max-w-3xl px-6 pb-24 pt-12 lg:px-8">
        <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">{t("Legal notice", "Mentions légales")}</h1>
        <p className="mt-3 text-sm text-white/40">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="mt-12 space-y-10 text-sm leading-7 text-white/65">
          <div>
            <h2 className="mb-3 text-base font-semibold text-white">1. Website publisher</h2>
            <p>This website <strong className="text-white/80">movento.dev</strong> is published by <span className="text-white/80">Movento</span>.</p>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-white">2. Hosting</h2>
            <p>This website is hosted by <span className="text-white/80">Vercel Inc.</span> — 340 S Lemon Ave #4133, Walnut, CA 91789, United States — vercel.com</p>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-white">3. Intellectual property</h2>
            <p>All content on Movento (text, prompts, visuals, structure) is the exclusive property of the publisher and is protected by applicable intellectual property laws. Any reproduction, even partial, is strictly prohibited without prior authorization.</p>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-white">4. Personal data</h2>
            <p>Movento collects your email address to manage access to content. Payment data is processed by <span className="text-white/80">Whop</span> and is not stored by Movento. Your data is never sold to third parties. You may request access, correction or deletion by contacting us.</p>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-white">5. Payment</h2>
            <p>Payments are securely processed by <span className="text-white/80">Whop</span>. Monthly and annual subscriptions can be cancelled at any time from your Whop account. Lifetime access is a one-time purchase with no subscription.</p>
            <p className="mt-3">You can cancel your subscription at any time from your Whop account, or by emailing <span className="text-white/80">movento.dev@gmail.com</span> from the address used at checkout.</p>
            <p className="mt-3">Movento reserves the right to modify subscription prices at any time.</p>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-white">6. Cookies</h2>
            <p>Movento only uses data stored locally on your device (localStorage) to remember your access and email. No third-party tracking cookies are used.</p>
            <p className="mt-3">We measure audience with <span className="text-white/80">Vercel Web Analytics</span>, which is cookieless and does not track you across websites or build a personal profile. It records anonymous page views and product events (for example, opening the pricing modal) so we can improve the site.</p>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-white">7. Contact</h2>
            <p>For any questions: <span className="text-white/80">movento.dev@gmail.com</span></p>
          </div>
        </div>
      </section>
      <footer className="relative z-10 border-t border-white/[0.06] py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row lg:px-8">
          <Logo />
          <p className="text-sm text-white/30">© {new Date().getFullYear()} Movento. {t("All rights reserved.", "Tous droits réservés.")}</p>
          <a href="/" className="text-sm text-white/30 hover:text-white transition">{t("Back to home", "Retour à l'accueil")}</a>
        </div>
      </footer>
    </main>
  );
}

function PricingPage() {
  const [checkoutStatus, setCheckoutStatus] = useState({ loading: "", error: "" });

  async function goToCheckout(planId) {
    if (checkoutStatus.loading) return;
    track("checkout_started", { plan: planId });
    setCheckoutStatus({ loading: planId, error: "" });
    try {
      if (!validatePlanId(planId)) throw new Error("Invalid plan.");
      const response = await fetch(CHECKOUT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      let data = {};
      try { data = await response.json(); } catch { data = {}; }
      if (!response.ok) throw new Error(data.error || `Server error (${response.status}).`);
      if (!data.checkoutUrl) throw new Error("No checkout URL returned.");
      window.location.assign(data.checkoutUrl);
    } catch (error) {
      setCheckoutStatus({ loading: "", error: getCheckoutErrorMessage(error) });
    }
  }

  return (
    <main className="min-h-screen bg-[#05060a] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-20%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] h-[400px] w-[400px] rounded-full bg-fuchsia-600/10 blur-[120px]" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <a href="/"><Logo /></a>
        <a href="/" className="rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-white/80 backdrop-blur transition hover:bg-white hover:text-black">← {t("Back", "Retour")}</a>
      </header>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-28 pt-10 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/65 backdrop-blur-xl">
            <Icon name="sparkles" className="h-4 w-4 text-violet-300" /> {t("Launch offer - Founder pricing", "Offre de lancement - Prix fondateurs")}
          </div>
          <h1 className="text-5xl font-semibold tracking-[-0.06em] text-white md:text-7xl">{t("Choose your plan", "Choisissez votre offre")}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/55">{t("Save hours on every landing page. Copy a premium prompt, paste it into your AI tool, and turn an idea into a modern site in minutes.", "Économisez des heures sur chaque landing page. Copiez un prompt premium, collez-le dans votre outil IA, et transformez une idée en site moderne en quelques minutes.")}</p>
        </div>

        {checkoutStatus.error && (
          <div className="mx-auto mt-8 flex max-w-3xl items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm leading-6 text-red-100 backdrop-blur-xl">
            <Icon name="alert" className="mt-1 h-4 w-4 flex-none" />
            <p>{checkoutStatus.error}</p>
          </div>
        )}

        <div className={`mx-auto mt-14 grid max-w-6xl gap-5 ${planGridLg}`}>
          {visiblePlans.map((plan) => (
            <div key={plan.id} className={`relative overflow-hidden rounded-[34px] border p-3 shadow-2xl backdrop-blur-2xl transition hover:-translate-y-1 ${plan.id === "monthly" ? "border-violet-400/40 bg-gradient-to-br from-violet-500/[0.22] via-fuchsia-500/[0.08] to-cyan-500/[0.12] shadow-violet-900/30" : plan.featured ? "border-violet-300/30 bg-gradient-to-br from-violet-500/[0.18] via-white/[0.06] to-cyan-500/[0.12] shadow-violet-900/25" : "border-white/10 bg-white/[0.035] shadow-black/40"}`}>
              {plan.id === "monthly" && <div className="pointer-events-none absolute -left-10 -top-10 h-56 w-56 rounded-full bg-fuchsia-500/25 blur-[80px]" />}
              {plan.featured && <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-500/30 blur-[100px]" />}
              <div className="relative rounded-[28px] border border-white/10 bg-[#080910]/90 p-7">
                <div className="mb-7 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-semibold tracking-tight text-white">{plan.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/45">{plan.description}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-medium ${plan.id === "monthly" ? "border-fuchsia-400/30 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 text-fuchsia-200" : plan.featured ? "border-violet-300/25 bg-violet-500/15 text-violet-100" : "border-white/10 bg-white/[0.05] text-white/55"}`}>{plan.badge}</span>
                </div>
                <div className="mb-7">
                  <div className="flex items-end gap-2">
                    <span className="text-6xl font-bold tracking-[-0.07em] text-white">{plan.price}</span>
                    <span className="pb-2 text-white/40">{plan.period}</span>
                  </div>
                  {plan.subPrice && <p className="mt-2 text-xs font-medium text-emerald-300/90">{plan.subPrice}</p>}
                </div>
                <button
                  disabled={Boolean(checkoutStatus.loading)}
                  onClick={() => goToCheckout(plan.id)}
                  className={`group flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 ${plan.id === "monthly" ? "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 text-white shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50" : plan.featured ? "bg-white text-black hover:bg-white/90 shadow-2xl shadow-white/10" : "border border-white/10 bg-white/[0.06] text-white hover:bg-white hover:text-black"}`}
                >
                  {checkoutStatus.loading === plan.id ? t("Redirecting...", "Redirection...") : plan.cta}
                  <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" />
                </button>
                <div className="my-7 h-px bg-white/10" />
                <div className="space-y-3">
                  {plan.features.map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm text-white/65">
                      <div className="grid h-5 w-5 flex-none place-items-center rounded-full bg-white/10">
                        <Icon name="check" className="h-3.5 w-3.5 text-white" />
                      </div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-[28px] border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur-xl">
          <p className="text-sm leading-6 text-white/60">{t("One great prompt can save you hours of design, integration and client back-and-forth. Movento helps you go from idea to impressive site.", "Un bon prompt peut vous faire gagner des heures de design, d'intégration et d'échanges client. Movento vous aide à passer de l'idée au site impressionnant.")}</p>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/[0.06] py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row lg:px-8">
          <Logo />
          <p className="text-sm text-white/30">© {new Date().getFullYear()} Movento. {t("All rights reserved.", "Tous droits réservés.")}</p>
          <a href="/" className="text-sm text-white/30 hover:text-white transition">{t("Back to home", "Retour à l'accueil")}</a>
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

  const clean = (v) => String(v).replace(/[\s\u00AD\u200B-\u200D\u2060\uFEFF]/g, "").toLowerCase();

  async function lookup(e) {
    if (e) e.preventDefault();
    const normalized = clean(email);
    if (!normalized) return;
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
    <main className="min-h-screen bg-[#05060a] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-20%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[120px]" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <a href="/"><Logo /></a>
        <a href="/" className="rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-white/80 backdrop-blur transition hover:bg-white hover:text-black">← {t("Back", "Retour")}</a>
      </header>

      <section className="relative z-10 mx-auto max-w-2xl px-6 pb-24 pt-8 lg:px-8">
        <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">{t("My subscription", "Mon abonnement")}</h1>
        <p className="mt-3 text-sm leading-6 text-white/50">{t("Enter the email you used at checkout to view and manage your subscription.", "Entrez l'email utilisé lors de l'achat pour voir et gérer votre abonnement.")}</p>

        <form onSubmit={lookup} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" inputMode="email" autoComplete="email" autoCapitalize="none" autoCorrect="off" spellCheck={false} placeholder="email@example.com" className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-violet-400/50" />
          <button type="submit" disabled={status.loading} className="rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60">{status.loading ? t("Checking...", "Vérification...") : t("View", "Voir")}</button>
        </form>

        {status.error && <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm leading-6 text-red-100"><Icon name="alert" className="mt-1 h-4 w-4 flex-none" /><p>{status.error}</p></div>}

        {status.checked && !status.error && data && !data.found && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-sm leading-6 text-white/70">{t("No active subscription found for this email.", "Aucun abonnement actif trouvé pour cet email.")}</p>
            <a href="/pricing" className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-6 py-3 text-sm font-bold text-white transition hover:scale-[1.03]">{t("See plans", "Voir les offres")} <Icon name="arrow" className="h-4 w-4" /></a>
          </div>
        )}

        {status.checked && data && data.found && (
          <div className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/40">{t("Plan", "Offre")}</p>
                <h2 className="mt-1 text-2xl font-semibold text-white">{data.plan}</h2>
              </div>
              {data.type === "subscription" ? (
                <span className={`rounded-full border px-3 py-1 text-xs font-medium ${data.status === "past_due" ? "border-red-400/30 bg-red-500/15 text-red-100" : "border-emerald-300/25 bg-emerald-400/15 text-emerald-100"}`}>{statusLabel(data.status)}</span>
              ) : (
                <span className="rounded-full border border-violet-300/25 bg-violet-500/15 px-3 py-1 text-xs font-medium text-violet-100">{t("Lifetime access", "Accès à vie")}</span>
              )}
            </div>

            {data.type === "subscription" && (
              <div className="mt-6 space-y-2 text-sm text-white/65">
                {data.status === "trialing" && data.renewalDate && <p>{t("Free trial ends on", "Fin de l'essai gratuit le")} <span className="text-white">{formatDate(data.renewalDate)}</span>.</p>}
                {data.cancelAtPeriodEnd ? (
                  <p className="text-amber-200">{t("Your subscription is cancelled and will end on", "Votre abonnement est résilié et se terminera le")} <span className="font-medium">{formatDate(data.renewalDate)}</span>.</p>
                ) : (
                  data.renewalDate && data.status !== "trialing" && <p>{t("Next renewal on", "Prochain renouvellement le")} <span className="text-white">{formatDate(data.renewalDate)}</span>.</p>
                )}
              </div>
            )}

            {data.type === "lifetime" && (
              <p className="mt-6 text-sm leading-6 text-white/65">{t("You have lifetime access — no subscription to manage.", "Vous avez un accès à vie — aucun abonnement à gérer.")}</p>
            )}

            {data.type !== "lifetime" && (
              <div className="mt-7 border-t border-white/10 pt-6">
                <a href={data.portalUrl || "https://whop.com/orders/"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-black">
                  {t("Manage or cancel on Whop", "Gérer ou résilier sur Whop")} <Icon name="arrow" className="h-4 w-4" />
                </a>
                <p className="mt-3 text-xs leading-5 text-white/40">{t("Your membership is managed on Whop. Cancelling keeps your access until the end of the current period.", "Votre abonnement est géré sur Whop. La résiliation conserve votre accès jusqu'à la fin de la période en cours.")}</p>
              </div>
            )}
          </div>
        )}
      </section>

      <footer className="relative z-10 border-t border-white/[0.06] py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row lg:px-8">
          <Logo />
          <p className="text-sm text-white/30">© {new Date().getFullYear()} Movento. {t("All rights reserved.", "Tous droits réservés.")}</p>
          <a href="/" className="text-sm text-white/30 hover:text-white transition">{t("Back to home", "Retour à l'accueil")}</a>
        </div>
      </footer>
    </main>
  );
}

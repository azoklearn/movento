import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const VIDEO_ASSETS = "https://raw.githubusercontent.com/aayushsoam/motionsites.ai/main/assets/videos/";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:4242" : "");
const CHECKOUT_API_URL = import.meta.env.VITE_CHECKOUT_API_URL || `${API_BASE_URL}/api/create-checkout-session`;

const makePreview = (name, ext = "mp4") => `${VIDEO_ASSETS}${name}_0.${ext}`;

const prompts = [
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
  { title: "Viktor Portfolio", category: "Portfolio", type: "Portfolio", file: "Viktor_Portfolio.md", preview: "https://motionsites.ai/assets/hero-viktor-portfolio-preview-Bd2-Dg_u.gif", tags: ["Personal", "Creative", "Motion"], gradient: "from-lime-300 via-green-600 to-black" },
  { title: "Wealth Video Hero", category: "Fintech", type: "Hero", file: "Wealth_Video_Hero.md", preview: "https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif", tags: ["Finance", "Video", "Hero"], gradient: "from-emerald-300 via-green-600 to-black" },
  { title: "Web3 EOS Hero", category: "Web3", type: "Hero", file: "Web3_EOS_Hero.md", preview: "https://motionsites.ai/assets/hero-web3-eos-poster-DF0_WdVS.png", tags: ["Web3", "EOS", "Hero"], gradient: "from-purple-300 via-indigo-500 to-black" },
  { title: "Weblex Dark Hero", category: "Landing Page", type: "Hero", file: "Weblex_Dark_Hero.md", preview: "https://motionsites.ai/assets/hero-weblex-preview-BoIbrUHI.gif", tags: ["Dark", "Agency", "Hero"], gradient: "from-zinc-100 via-zinc-500 to-black" },
  { title: "xPortfolio Hero", category: "Hero Section", type: "Hero", file: "xPortfolio_Hero.md", preview: "https://motionsites.ai/assets/hero-xportfolio-preview-D4A8maiC.gif", tags: ["Portfolio", "Hero", "Creative"], gradient: "from-fuchsia-300 via-violet-500 to-black" },
];

const categories = ["Tous", "AI / SaaS", "Landing Page", "Hero Section", "SaaS", "Agency", "Portfolio", "Web3", "Component", "Presentation", "Automotive", "Fintech"];
const FREE_PROMPT_FILES = new Set([]);

const plans = [
  {
    id: "monthly",
    name: "Monthly",
    price: "7.99€",
    period: "/ mo",
    badge: "Try for free",
    description: "3 days free, then 7.99€/mo. Cancel anytime.",
    cta: "Try free for 3 days →",
    featured: false,
    features: ["Access to all prompts", "One-click prompt copy", "Video & visual previews", "New prompts included", "Cancel anytime"],
  },
  {
    id: "yearly",
    name: "Yearly",
    price: "50€",
    period: "/ yr",
    badge: "Best value",
    description: "Build premium AI websites regularly.",
    cta: "Get the annual plan",
    featured: true,
    features: ["Full Movento catalog", "Year-round updates", "New premium categories", "Optimized for Lovable / v0 / Bolt", "Save over 45%"],
  },
  {
    id: "lifetime",
    name: "Lifetime",
    price: "100€",
    period: "forever",
    badge: "One shot",
    description: "One-time payment. Yours forever.",
    cta: "Get lifetime access",
    featured: false,
    features: ["Lifetime access", "All future updates", "No subscription", "All previews included", "Perfect for freelancers & agencies"],
  },
];

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

function PreviewCard({ item }) {
  const [previewFailed, setPreviewFailed] = useState(false);
  const isFree = FREE_PROMPT_FILES.has(item.file);
  const hasVideo = !previewFailed && item.preview && (item.preview.endsWith(".mp4") || item.preview.endsWith(".webm"));
  const hasImage = !previewFailed && item.preview && [".png", ".jpg", ".jpeg", ".gif", ".webp"].some((ext) => item.preview.endsWith(ext) || item.preview.includes(`${ext}?`));

  return (
    <motion.div layout whileHover={{ y: -6 }} className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] p-3 shadow-2xl shadow-black/40 backdrop-blur-xl">
      <div className="relative aspect-[1.45] overflow-hidden rounded-[22px] bg-[#080913]">
        {hasVideo ? <SmartVideo className="h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-105" src={item.preview} onError={() => setPreviewFailed(true)} /> : hasImage ? <img className="h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-105" src={item.preview} alt={`${item.title} preview`} onError={() => setPreviewFailed(true)} /> : <GeneratedPreview item={item} />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white/80 backdrop-blur-md"><Icon name="play" className="h-3 w-3" /> Visual preview</div>
        <div className={`absolute right-4 top-4 rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur-md ${isFree ? "border-emerald-300/25 bg-emerald-400/15 text-emerald-100" : "border-violet-300/20 bg-violet-400/15 text-violet-100"}`}>
          {isFree ? "Gratuit" : "Premium"}
        </div>
      </div>
      <div className="space-y-3 px-2 py-4">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.24em] text-white/40">{item.category}</p><h3 className="mt-1 text-lg font-semibold tracking-tight text-white">{item.title}</h3></div><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">{item.type}</span></div>
        <div className="flex flex-wrap gap-2">{item.tags.map((tag) => <span key={tag} className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs text-white/55">{tag}</span>)}</div>
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
  return plans.some((plan) => plan.id === planId);
}

function getCheckoutErrorMessage(error) {
  if (error?.name === "TypeError") {
    return "Le serveur de paiement Stripe n'est pas joignable. En local, lance node server.js sur le port 4242. En production, vérifie les variables Stripe dans Vercel.";
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
  const [unlockNotice, setUnlockNotice] = useState("");
  const [accessEmail, setAccessEmail] = useState(getStoredAccessEmail);
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [accessStatus, setAccessStatus] = useState({ loading: false, message: "", error: "" });
  const [checkoutStatus, setCheckoutStatus] = useState({ loading: "", error: "" });
  const [leadEmail, setLeadEmail] = useState(getStoredLeadEmail);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [pendingFreeItem, setPendingFreeItem] = useState(null);
  const [leadEmailInput, setLeadEmailInput] = useState("");
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const isSuccessPage = typeof window !== "undefined" && window.location.pathname === "/success";
  const isMentionsPage = typeof window !== "undefined" && window.location.pathname === "/mentions-legales";
  const isPricingPage = typeof window !== "undefined" && window.location.pathname === "/pricing";

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
      setAccessStatus({ loading: true, message: "Confirmation du paiement Stripe...", error: "" });

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
      const matchCategory = category === "Tous" || p.category === category;
      const matchQuery = `${p.title} ${p.category} ${p.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase());
      return matchCategory && matchQuery;
    });
  }, [query, category]);

  async function verifyAccess(email = accessEmail, options = {}) {
    const normalizedEmail = email.trim().toLowerCase();
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
        if (!options.silent) setAccessStatus({ loading: false, message: "Premium access activated on this device.", error: "" });
        return true;
      }

      window.localStorage.removeItem("movento_access_email");
      if (!options.silent) setAccessStatus({ loading: false, message: "", error: "No payment found for this email." });
      return false;
    } catch (error) {
      console.error("Access verification error", error);
      if (!options.silent) setAccessStatus({ loading: false, message: "", error: error.message || "Unable to verify access." });
      return false;
    }
  }

  async function fetchAndCopyPrompt(item, emailOverride) {
    try {
      const email = emailOverride || accessEmail || leadEmail;
      const response = await fetch(`${API_BASE_URL}/api/prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: item.file, email }),
      });
      if (!response.ok) throw new Error("Prompt not found");
      const data = await response.json();
      const copied = await copyTextToClipboard(data.prompt);
      if (!copied) throw new Error("Copy denied by browser");
      setCopiedCard(item.title);
      setTimeout(() => setCopiedCard(""), 1600);
    } catch (error) {
      console.error("Prompt copy error", error);
      setCopiedCard("Error");
      setTimeout(() => setCopiedCard(""), 1600);
    }
  }

  async function copyPrompt(item) {
    const isFree = FREE_PROMPT_FILES.has(item.file);

    if (!isFree && !hasPremiumAccess) {
      setUnlockNotice(`${item.title} is included in Movento premium access.`);
      document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => setUnlockNotice(""), 2600);
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
      if (!data.checkoutUrl || typeof data.checkoutUrl !== "string") throw new Error("Le backend n'a pas renvoyé de checkoutUrl Stripe.");

      window.location.assign(data.checkoutUrl);
    } catch (error) {
      console.error("Erreur paiement Stripe", error);
      setCheckoutStatus({ loading: "", error: getCheckoutErrorMessage(error) });
    }
  }

  if (isMentionsPage) return <MentionsLegales />;
  if (isPricingPage) return <PricingPage />;

  return (
    <main className="min-h-screen overflow-hidden bg-[#05060a] text-white">
      <AnimatePresence>
        {showLeadModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setShowLeadModal(false)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="relative w-full max-w-md rounded-[28px] border border-white/10 bg-[#0d0e18] p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setShowLeadModal(false)} className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 text-white/50 hover:text-white transition"><Icon name="close" className="h-4 w-4" /></button>
              <div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-500/30 to-cyan-500/20 border border-violet-300/20"><Icon name="sparkles" className="h-5 w-5 text-violet-300" /></div>
              <h2 className="text-2xl font-semibold tracking-tight text-white">Access free prompts</h2>
              <p className="mt-2 text-sm leading-6 text-white/50">Enter your email to copy free prompts. No spam, ever.</p>
              <form onSubmit={submitLeadEmail} className="mt-6 flex flex-col gap-3">
                <input autoFocus value={leadEmailInput} onChange={(e) => setLeadEmailInput(e.target.value)} type="email" required placeholder="you@example.com" className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-violet-400/50" />
                <button type="submit" disabled={leadSubmitting} className="w-full rounded-2xl bg-white py-3 text-sm font-semibold text-black transition hover:scale-[1.01] disabled:opacity-60">{leadSubmitting ? "Just a moment..." : "Copy free prompt →"}</button>
              </form>
              <p className="mt-4 text-center text-xs text-white/25">Your data will never be shared.</p>
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
          <a href="/pricing" className="hover:text-white">Pricing</a>
          <a href="#how" className="hover:text-white">Guide</a>
        </nav>
        <a href="#prompts" className="rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-white/80 backdrop-blur transition hover:bg-white hover:text-black">Explore</a>
      </header>

      {isSuccessPage && (
        <section className="relative z-10 mx-auto max-w-4xl px-6 pb-10 pt-14 text-center lg:px-8">
          <div className="rounded-[34px] border border-emerald-300/20 bg-emerald-400/[0.08] p-8 shadow-2xl shadow-emerald-950/30 backdrop-blur-2xl">
            <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-emerald-200/20 bg-emerald-300/10 text-emerald-100">
              <Icon name="check" className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">Payment confirmed</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/60 md:text-base">
              {accessStatus.loading ? "Confirming your payment with Stripe." : hasPremiumAccess ? "Your Movento access is ready. Go back to the gallery and copy premium prompts." : "Payment received. If your access does not activate automatically, enter your email below."}
            </p>
            {accessStatus.message && <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-emerald-100">{accessStatus.message}</p>}
            {accessStatus.error && <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-red-100">{accessStatus.error}</p>}
            <a href="/#prompts" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]">
              Back to prompts <Icon name="arrow" className="h-4 w-4" />
            </a>
          </div>
        </section>
      )}

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-16 pt-16 text-center lg:px-8 lg:pt-24">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/70 backdrop-blur-xl"><Icon name="sparkles" className="h-4 w-4 text-violet-300" /> Premium web design prompt library</motion.div>
        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mx-auto max-w-5xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] text-white md:text-7xl lg:text-8xl">Build <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">modern</span> websites without coding.</motion.h1>
        <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-white/60 md:text-xl">Ready-to-copy prompts, animated previews and curated design direction for marketers, freelancers and creative teams.</motion.p>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a href="/pricing" className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-8 py-3.5 text-sm font-bold text-white shadow-2xl shadow-violet-500/40 transition hover:scale-[1.04] hover:shadow-violet-500/60">
            <span className="relative z-10 flex items-center gap-2">Start for free <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" /></span>
          </a>
          <a href="#prompts" className="rounded-full border border-white/10 bg-white/[0.05] px-6 py-3 text-sm font-semibold text-white/80 backdrop-blur hover:bg-white/10">Explore prompts</a>
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mt-4 text-xs text-white/30">1 day free — then 7.99€/mo. Cancel anytime.</motion.p>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-4 rounded-[34px] border border-white/10 bg-white/[0.035] p-3 shadow-2xl shadow-black/50 backdrop-blur-2xl md:grid-cols-3">
          <div className="rounded-[26px] border border-white/10 bg-black/30 p-6"><Icon name="zap" className="mb-5 h-6 w-6 text-violet-300" /><h3 className="text-lg font-semibold">Copy & paste</h3><p className="mt-2 text-sm leading-6 text-white/55">A clean prompt, ready for Lovable, v0, Bolt, Cursor or Claude.</p></div>
          <div className="rounded-[26px] border border-white/10 bg-black/30 p-6"><Icon name="layers" className="mb-5 h-6 w-6 text-blue-300" /><h3 className="text-lg font-semibold">Visual preview</h3><p className="mt-2 text-sm leading-6 text-white/55">See the style before generating: dark UI, video, glass, portfolio, SaaS.</p></div>
          <div className="rounded-[26px] border border-white/10 bg-black/30 p-6"><Icon name="code" className="mb-5 h-6 w-6 text-cyan-300" /><h3 className="text-lg font-semibold">No coding</h3><p className="mt-2 text-sm leading-6 text-white/55">Built for marketing, communication and creative profiles.</p></div>
        </div>
      </section>

      <section id="prompts" className="relative z-10 mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-white/35">Gallery</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">Premium prompts</h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/50">{hasPremiumAccess ? "Premium access active. All prompts can be copied." : "The full catalog unlocks with a Movento plan."}</p>
        </div>
        <div className="mb-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl md:flex md:items-center md:justify-between md:gap-5">
          <div>
            <p className="text-sm font-semibold text-white">{hasPremiumAccess ? "Premium access active" : "Already a member?"}</p>
            <p className="mt-1 text-sm leading-6 text-white/50">{hasPremiumAccess ? `Signed in as ${accessEmail}.` : "Enter the email used at checkout to unlock premium prompts on this device."}</p>
          </div>
          <form className="mt-4 flex flex-col gap-3 sm:flex-row md:mt-0" onSubmit={(event) => { event.preventDefault(); verifyAccess(); }}>
            <input value={accessEmail} onChange={(event) => setAccessEmail(event.target.value)} type="email" placeholder="email@example.com" className="min-w-0 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-violet-400/50 sm:w-72" />
            <button disabled={accessStatus.loading} className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60">{accessStatus.loading ? "Verifying..." : hasPremiumAccess ? "Re-verify" : "Unlock"}</button>
          </form>
        </div>
        {(accessStatus.message || accessStatus.error) && !isSuccessPage && <div className={`mb-8 flex items-start gap-3 rounded-2xl border p-4 text-sm leading-6 backdrop-blur-xl ${accessStatus.error ? "border-red-400/20 bg-red-500/10 text-red-100" : "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"}`}><Icon name={accessStatus.error ? "alert" : "check"} className="mt-1 h-4 w-4 flex-none" /><p>{accessStatus.error || accessStatus.message}</p></div>}
        {unlockNotice && <div className="mb-8 flex items-start gap-3 rounded-2xl border border-violet-300/20 bg-violet-500/10 p-4 text-sm leading-6 text-violet-50 backdrop-blur-xl"><Icon name="sparkles" className="mt-1 h-4 w-4 flex-none" /><p>{unlockNotice}</p></div>}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">{categories.map((cat) => <button key={cat} onClick={() => setCategory(cat)} className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition ${category === cat ? "border-white/20 bg-white text-black" : "border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/10"}`}>{cat}</button>)}</div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {filtered.map((item) => (
              <motion.div key={item.title} layout initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 15 }} className="relative">
                <PreviewCard item={item} />
                <div className="absolute inset-x-0 bottom-0 z-20 p-5"><button onClick={() => copyPrompt(item)} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm font-medium text-white backdrop-blur-xl transition hover:bg-white hover:text-black">{copiedCard === item.title ? <><Icon name="check" className="h-4 w-4" /> Copied</> : copiedCard === "Error" ? <><Icon name="alert" className="h-4 w-4" /> Error</> : item.link && hasPremiumAccess ? <><Icon name="arrow" className="h-4 w-4" /> Open prompt</> : item.link && FREE_PROMPT_FILES.has(item.file) ? <><Icon name="arrow" className="h-4 w-4" /> Open free prompt</> : FREE_PROMPT_FILES.has(item.file) ? <><Icon name="copy" className="h-4 w-4" /> Copy free prompt</> : hasPremiumAccess ? <><Icon name="copy" className="h-4 w-4" /> Copy Prompt</> : <><Icon name="sparkles" className="h-4 w-4" /> Unlock prompt</>}</button></div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      <section id="how" className="relative z-10 mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="rounded-[40px] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8 backdrop-blur-xl md:p-12"><div className="grid gap-10 md:grid-cols-3">{["Choose a style", "Copy the prompt", "Generate your site"].map((step, i) => <div key={step}><div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] text-sm font-bold text-white/70">0{i + 1}</div><h3 className="text-xl font-semibold">{step}</h3><p className="mt-3 text-sm leading-6 text-white/55">{i === 0 ? "Browse previews and find a design direction that suits your offer." : i === 1 ? "The prompt is loaded directly from the source to stay intact." : "Paste it into your favorite AI tool and customize the result."}</p></div>)}</div></div>
      </section>

      <section id="pricing" className="relative z-10 mx-auto max-w-7xl px-6 pb-28 pt-10 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/65 backdrop-blur-xl"><Icon name="sparkles" className="h-4 w-4 text-violet-300" /> Launch offer - Founder pricing</div>
          <h2 className="text-5xl font-semibold tracking-[-0.06em] text-white md:text-7xl">Choose your plan</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/55">Save hours on every landing page. Copy a premium prompt, paste it into your AI tool, and turn an idea into a modern site in minutes.</p>

        </div>

        {checkoutStatus.error && <div className="mx-auto mt-8 flex max-w-3xl items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm leading-6 text-red-100 backdrop-blur-xl"><Icon name="alert" className="mt-1 h-4 w-4 flex-none" /><p>{checkoutStatus.error}</p></div>}

        <div className="mx-auto mt-14 grid max-w-6xl gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.id} className={`relative overflow-hidden rounded-[34px] border p-3 shadow-2xl backdrop-blur-2xl transition hover:-translate-y-1 ${plan.id === "monthly" ? "border-violet-400/40 bg-gradient-to-br from-violet-500/[0.22] via-fuchsia-500/[0.08] to-cyan-500/[0.12] shadow-violet-900/30" : plan.featured ? "border-violet-300/30 bg-gradient-to-br from-violet-500/[0.18] via-white/[0.06] to-cyan-500/[0.12] shadow-violet-900/25" : "border-white/10 bg-white/[0.035] shadow-black/40"}`}>
              {plan.id === "monthly" && <div className="pointer-events-none absolute -left-10 -top-10 h-56 w-56 rounded-full bg-fuchsia-500/25 blur-[80px]" />}
              {plan.featured && <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-500/30 blur-[100px]" />}
              <div className="relative rounded-[28px] border border-white/10 bg-[#080910]/90 p-7">
                <div className="mb-7 flex items-start justify-between gap-4"><div><h3 className="text-2xl font-semibold tracking-tight text-white">{plan.name}</h3><p className="mt-2 text-sm leading-6 text-white/45">{plan.description}</p></div><span className={`rounded-full border px-3 py-1 text-xs font-medium ${plan.id === "monthly" ? "border-fuchsia-400/30 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 text-fuchsia-200" : plan.featured ? "border-violet-300/25 bg-violet-500/15 text-violet-100" : "border-white/10 bg-white/[0.05] text-white/55"}`}>{plan.badge}</span></div>
                <div className="mb-7"><div className="flex items-end gap-2"><span className="text-6xl font-bold tracking-[-0.07em] text-white">{plan.price}</span><span className="pb-2 text-white/40">{plan.period}</span></div></div>
                <button disabled={Boolean(checkoutStatus.loading)} onClick={() => goToCheckout(plan.id)} className={`group flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 ${plan.id === "monthly" ? "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 text-white shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50" : plan.featured ? "bg-white text-black hover:bg-white/90 shadow-2xl shadow-white/10" : "border border-white/10 bg-white/[0.06] text-white hover:bg-white hover:text-black"}`}>{checkoutStatus.loading === plan.id ? "Redirecting..." : plan.cta}<Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" /></button>
                <div className="my-7 h-px bg-white/10" />
                <div className="space-y-3">{plan.features.map((item) => <div key={item} className="flex items-center gap-3 text-sm text-white/65"><div className="grid h-5 w-5 flex-none place-items-center rounded-full bg-white/10"><Icon name="check" className="h-3.5 w-3.5 text-white" /></div>{item}</div>)}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-[28px] border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur-xl"><p className="text-sm leading-6 text-white/60">One great prompt can save you hours of design, integration and client back-and-forth. Movento helps you go from idea to impressive site.</p></div>
      </section>

      <footer className="relative z-10 border-t border-white/[0.06] py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row lg:px-8">
          <Logo />
          <p className="text-sm text-white/30">© {new Date().getFullYear()} Movento. All rights reserved.</p>
          <a href="/mentions-legales" className="text-sm text-white/30 hover:text-white transition">Legal notice</a>
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
        <a href="/" className="rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-white/80 backdrop-blur transition hover:bg-white hover:text-black">← Back</a>
      </header>
      <section className="relative z-10 mx-auto max-w-3xl px-6 pb-24 pt-12 lg:px-8">
        <h1 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">Legal notice</h1>
        <p className="mt-3 text-sm text-white/40">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="mt-12 space-y-10 text-sm leading-7 text-white/65">
          <div>
            <h2 className="mb-3 text-base font-semibold text-white">1. Website publisher</h2>
            <p>This website <strong className="text-white/80">movento.dev</strong> is published by <span className="text-white/80">noanweb</span>.</p>
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
            <p>Movento collects your email address to manage access to content. Payment data is processed by <span className="text-white/80">Stripe</span> and is not stored by Movento. Your data is never sold to third parties. You may request access, correction or deletion by contacting us.</p>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-white">5. Payment</h2>
            <p>Payments are securely processed by <span className="text-white/80">Stripe</span>. Monthly and annual subscriptions can be cancelled at any time. Lifetime access is a one-time purchase with no subscription.</p>
            <p className="mt-3">Movento reserves the right to modify subscription prices at any time. Existing subscribers will be notified in advance of any price change and may cancel their subscription before the new price takes effect.</p>
          </div>

          <div>
            <h2 className="mb-3 text-base font-semibold text-white">6. Cookies</h2>
            <p>Movento only uses data stored locally on your device (localStorage) to remember your access and email. No third-party tracking cookies are used.</p>
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
          <p className="text-sm text-white/30">© {new Date().getFullYear()} Movento. All rights reserved.</p>
          <a href="/" className="text-sm text-white/30 hover:text-white transition">Back to home</a>
        </div>
      </footer>
    </main>
  );
}

function PricingPage() {
  const [checkoutStatus, setCheckoutStatus] = useState({ loading: "", error: "" });

  async function goToCheckout(planId) {
    if (checkoutStatus.loading) return;
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
        <a href="/" className="rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-white/80 backdrop-blur transition hover:bg-white hover:text-black">← Back</a>
      </header>

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-28 pt-10 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/65 backdrop-blur-xl">
            <Icon name="sparkles" className="h-4 w-4 text-violet-300" /> Launch offer - Founder pricing
          </div>
          <h1 className="text-5xl font-semibold tracking-[-0.06em] text-white md:text-7xl">Choose your plan</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/55">Save hours on every landing page. Copy a premium prompt, paste it into your AI tool, and turn an idea into a modern site in minutes.</p>
        </div>

        {checkoutStatus.error && (
          <div className="mx-auto mt-8 flex max-w-3xl items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm leading-6 text-red-100 backdrop-blur-xl">
            <Icon name="alert" className="mt-1 h-4 w-4 flex-none" />
            <p>{checkoutStatus.error}</p>
          </div>
        )}

        <div className="mx-auto mt-14 grid max-w-6xl gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
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
                </div>
                <button
                  disabled={Boolean(checkoutStatus.loading)}
                  onClick={() => goToCheckout(plan.id)}
                  className={`group flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 ${plan.id === "monthly" ? "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 text-white shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50" : plan.featured ? "bg-white text-black hover:bg-white/90 shadow-2xl shadow-white/10" : "border border-white/10 bg-white/[0.06] text-white hover:bg-white hover:text-black"}`}
                >
                  {checkoutStatus.loading === plan.id ? "Redirecting..." : plan.cta}
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
          <p className="text-sm leading-6 text-white/60">One great prompt can save you hours of design, integration and client back-and-forth. Movento helps you go from idea to impressive site.</p>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/[0.06] py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row lg:px-8">
          <Logo />
          <p className="text-sm text-white/30">© {new Date().getFullYear()} Movento. All rights reserved.</p>
          <a href="/" className="text-sm text-white/30 hover:text-white transition">Back to home</a>
        </div>
      </footer>
    </main>
  );
}

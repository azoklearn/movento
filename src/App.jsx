import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const VIDEO_ASSETS = "https://raw.githubusercontent.com/aayushsoam/motionsites.ai/main/assets/videos/";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4242";
const CHECKOUT_API_URL = import.meta.env.VITE_CHECKOUT_API_URL || `${API_BASE_URL}/api/create-checkout-session`;

const makePreview = (name, ext = "mp4") => `${VIDEO_ASSETS}${name}_0.${ext}`;

const prompts = [
  { title: "AI Automation Hero", category: "AI / SaaS", type: "Hero", file: "AI_Automation_Hero.md", preview: "https://motionsites.ai/assets/hero-synapse-ai-preview-BjBuH68i.gif", tags: ["AI", "Hero", "Dark"], gradient: "from-indigo-500 via-violet-500 to-cyan-400" },
  { title: "AI Designer Agency", category: "Landing Page", type: "Landing", file: "AI_Designer_Agency.md", preview: makePreview("AI_Designer_Agency"), tags: ["Agency", "AI", "Premium"], gradient: "from-purple-400 via-fuchsia-500 to-black" },
  { title: "AI Designer Portfolio", category: "Landing Page", type: "Landing", file: "AI_Designer_Portfolio.md", preview: "https://motionsites.ai/assets/hero-vortex-studio-preview-BQyvwopD.gif", tags: ["Portfolio", "AI", "Creative"], gradient: "from-violet-400 via-blue-500 to-black" },
  { title: "AKOR Security", category: "Landing Page", type: "Landing", file: "AKOR_Security.md", preview: makePreview("AKOR_Security"), tags: ["Security", "Dark", "Corporate"], gradient: "from-red-400 via-orange-500 to-black" },
  { title: "Aethera Studio", category: "Hero Section", type: "Hero", file: "Aethera_Studio.md", preview: "https://motionsites.ai/assets/hero-aethera-preview-DknSlcTa.gif", tags: ["Studio", "Creative", "Hero"], gradient: "from-sky-300 via-blue-500 to-black" },
  { title: "Apex SaaS", category: "SaaS", type: "Landing", file: "Apex_SaaS.md", preview: makePreview("Apex_SaaS"), tags: ["SaaS", "Gradient", "Startup"], gradient: "from-purple-400 via-pink-500 to-slate-950" },
  { title: "Asme", category: "Hero Section", type: "Hero", file: "Asme.md", preview: makePreview("Asme"), tags: ["Hero", "Minimal", "Modern"], gradient: "from-zinc-100 via-zinc-500 to-black" },
  { title: "Automation Machines", category: "Hero Section", type: "Hero", file: "Automation_Machines.md", preview: "https://motionsites.ai/assets/hero-automation-machines-preview-DlTveRIN.gif", tags: ["Automation", "Industry", "Hero"], gradient: "from-amber-300 via-orange-600 to-black" },
  { title: "Bionova Biotech", category: "SaaS", type: "Landing", file: "Bionova_Biotech.md", preview: makePreview("Bionova_Biotech"), tags: ["Biotech", "SaaS", "Clean"], gradient: "from-emerald-300 via-teal-500 to-black" },
  { title: "Bloom AI", category: "Hero Section", type: "Hero", file: "Bloom_AI.md", preview: "https://motionsites.ai/assets/hero-bloom-ai-preview-g6RcYLTl.gif", tags: ["AI", "Hero", "Soft"], gradient: "from-pink-300 via-rose-500 to-black" },
  { title: "Bold Portfolio Hero", category: "Portfolio", type: "Hero", file: "Bold_Portfolio_Hero.md", preview: "https://motionsites.ai/assets/hero-portfolio-bold-preview-9Yfbi-Wg.gif", tags: ["Portfolio", "Bold", "Creative"], gradient: "from-red-400 via-orange-500 to-black" },
  { title: "Buzzentic Agency", category: "Agency", type: "Landing", file: "Buzzentic_Agency.md", preview: makePreview("Buzzentic_Agency"), tags: ["Agency", "Video", "Brand"], gradient: "from-yellow-300 via-orange-500 to-black" },
  { title: "ClearInvoice SaaS Hero", category: "SaaS", type: "Hero", file: "ClearInvoice_SaaS_Hero.md", preview: makePreview("ClearInvoice_SaaS_Hero"), tags: ["Invoice", "SaaS", "Clean"], gradient: "from-blue-300 via-cyan-500 to-black" },
  { title: "ClubX Investors", category: "Landing Page", type: "Landing", file: "ClubX_Investors.md", preview: makePreview("ClubX_Investors"), tags: ["Private Club", "Luxury", "Video"], gradient: "from-amber-200 via-orange-500 to-neutral-950" },
  { title: "CodeNest Coding Platform", category: "Landing Page", type: "Landing", file: "CodeNest_Coding_Platform.md", preview: "https://motionsites.ai/assets/codercrest-hero-CoycO52t.gif", tags: ["Code", "Platform", "Developer"], gradient: "from-lime-300 via-green-500 to-black" },
  { title: "Dark Portfolio Hero", category: "Portfolio", type: "Hero", file: "Dark_Portfolio_Hero.md", preview: makePreview("Dark_Portfolio_Hero"), tags: ["Portfolio", "Dark", "Hero"], gradient: "from-zinc-200 via-zinc-600 to-black" },
  { title: "Datacore Booking", category: "SaaS", type: "Landing", file: "Datacore_Booking.md", preview: makePreview("Datacore_Booking"), tags: ["Booking", "SaaS", "Data"], gradient: "from-cyan-300 via-blue-500 to-black" },
  { title: "Datacore SaaS Hero", category: "SaaS", type: "Hero", file: "Datacore_SaaS_Hero.md", preview: makePreview("Datacore_SaaS_Hero"), tags: ["Data", "SaaS", "Hero"], gradient: "from-blue-400 via-indigo-500 to-black" },
  { title: "DesignPro Academy", category: "Hero Section", type: "Hero", file: "DesignPro_Academy.md", preview: makePreview("DesignPro_Academy"), tags: ["Academy", "Design", "Hero"], gradient: "from-orange-300 via-pink-500 to-black" },
  { title: "Digitwist AI Builder", category: "SaaS", type: "Landing", file: "Digitwist_AI_Builder.md", preview: makePreview("Digitwist_AI_Builder"), tags: ["AI Builder", "SaaS", "No-code"], gradient: "from-violet-300 via-purple-600 to-black" },
  { title: "E-commerce Website", category: "Landing Page", type: "Landing", file: "E-commerce_Website.md", preview: "https://motionsites.ai/assets/hero-ecommerce-website-preview-D7j_TrNR.gif", tags: ["Shop", "Commerce", "Landing"], gradient: "from-rose-300 via-fuchsia-500 to-black" },
  { title: "EVR Ventures", category: "Hero Section", type: "Hero", file: "EVR_Ventures.md", preview: "https://motionsites.ai/assets/hero-vex-ventures-preview-BczMFIiw.gif", tags: ["Venture", "Hero", "Premium"], gradient: "from-blue-200 via-indigo-500 to-black" },
  { title: "Finlytic AI Agent", category: "SaaS", type: "Landing", file: "Finlytic_AI_Agent.md", preview: makePreview("Finlytic_AI_Agent"), tags: ["Finance", "AI Agent", "SaaS"], gradient: "from-emerald-300 via-cyan-500 to-black" },
  { title: "Framelix 3D Studios", category: "Agency", type: "Landing", file: "Framelix_3D_Studios.md", preview: "https://motionsites.ai/assets/hero-3d-jack-portfolio-preview-BS06Nx21.gif", tags: ["3D", "Studio", "Agency"], gradient: "from-fuchsia-300 via-purple-500 to-black" },
  { title: "Glassmorphism Agency Hero", category: "Agency", type: "Hero", file: "Glassmorphism_Agency_Hero.md", preview: "https://motionsites.ai/assets/hero-glassmorphism-agency-preview-CGqeRoqP.gif", tags: ["Glass", "Agency", "Hero"], gradient: "from-cyan-300 via-violet-500 to-black" },
  { title: "Grow AI Talent Platform", category: "SaaS", type: "Landing", file: "Grow_AI_Talent_Platform.md", preview: "https://motionsites.ai/assets/hero-grow-ai-preview-BlQ8tAQ-.gif", tags: ["Talent", "AI", "SaaS"], gradient: "from-green-300 via-emerald-500 to-black" },
  { title: "HR SaaS Hero", category: "SaaS", type: "Hero", file: "HR_SaaS_Hero.md", preview: "https://motionsites.ai/assets/hero-hr-saas-preview-Cf365Y1O.gif", tags: ["HR", "SaaS", "Hero"], gradient: "from-indigo-300 via-blue-500 to-black" },
  { title: "Investor Deck", category: "Presentation", type: "Deck", file: "Investor_Deck.md", preview: makePreview("Investor_Deck"), tags: ["Deck", "Investor", "Slides"], gradient: "from-amber-200 via-yellow-500 to-black" },
  { title: "Liquid Glass Agency", category: "Landing Page", type: "Landing", file: "Liquid_Glass_Agency.md", preview: "https://motionsites.ai/assets/hero-liquid-glass-agency-preview-Cr5Q9-lc.gif", tags: ["Glass", "Agency", "Premium"], gradient: "from-fuchsia-400 via-violet-500 to-indigo-950" },
  { title: "Loader Animation", category: "Component", type: "Component", file: "Loader_Animation.md", preview: "https://motionsites.ai/assets/hero-loader-animation-preview-C3_SX_Io.gif", tags: ["Loader", "Animation", "Component"], gradient: "from-white via-zinc-400 to-black" },
  { title: "Logoisum Video Agency", category: "Agency", type: "Landing", file: "Logoisum_Video_Agency.md", preview: makePreview("Logoisum_Video_Agency"), tags: ["Video", "Agency", "Brand"], gradient: "from-red-300 via-pink-500 to-black" },
  { title: "Mindloop", category: "SaaS", type: "Landing", file: "Mindloop.md", preview: makePreview("Mindloop"), tags: ["SaaS", "AI", "Dark"], gradient: "from-violet-300 via-indigo-500 to-black" },
  { title: "Mindloop Landing", category: "Landing Page", type: "Landing", file: "Mindloop_Landing.md", preview: makePreview("Mindloop_Landing"), tags: ["Landing", "AI", "Modern"], gradient: "from-blue-300 via-purple-500 to-black" },
  { title: "NOVA Space Systems", category: "Landing Page", type: "Landing", file: "NOVA_Space_Systems.md", preview: "https://motionsites.ai/assets/hero-nova-space-preview-ej0OOJ0M.gif", tags: ["Space", "Systems", "Landing"], gradient: "from-cyan-300 via-blue-600 to-black" },
  { title: "NeoVision", category: "Landing Page", type: "Landing", file: "NeoVision.md", preview: makePreview("NeoVision"), tags: ["Vision", "AI", "Landing"], gradient: "from-fuchsia-300 via-violet-500 to-black" },
  { title: "Neuralyn", category: "SaaS", type: "Landing", file: "Neuralyn.md", preview: makePreview("Neuralyn"), tags: ["AI", "Neural", "SaaS"], gradient: "from-purple-300 via-blue-500 to-black" },
  { title: "New Era Automotive Hero", category: "Automotive", type: "Hero", file: "New_Era_Automotive_Hero.md", preview: makePreview("New_Era_Automotive_Hero"), tags: ["Automotive", "Hero", "Premium"], gradient: "from-zinc-100 via-red-500 to-black" },
  { title: "New Era Bold Hero", category: "Agency", type: "Hero", file: "New_Era_Bold_Hero.md", preview: makePreview("New_Era_Bold_Hero"), tags: ["Bold", "Agency", "Hero"], gradient: "from-orange-300 via-red-500 to-black" },
  { title: "Nexora Automation", category: "SaaS", type: "Landing", file: "Nexora_Automation.md", preview: makePreview("Nexora_Automation"), tags: ["Automation", "SaaS", "AI"], gradient: "from-sky-300 via-indigo-500 to-black" },
  { title: "Nexus IT Solutions", category: "Hero Section", type: "Hero", file: "Nexus_IT_Solutions.md", preview: "https://motionsites.ai/assets/hero-nexus-preview-74RfhYpA.gif", tags: ["B2B", "IT", "Clean"], gradient: "from-blue-400 via-sky-500 to-slate-950" },
  { title: "Nickel Payments", category: "SaaS", type: "Landing", file: "Nickel_Payments.md", preview: makePreview("Nickel_Payments"), tags: ["Payments", "Fintech", "SaaS"], gradient: "from-yellow-300 via-amber-500 to-black" },
  { title: "Orbis NFT", category: "Landing Page", type: "Landing", file: "Orbis_NFT.md", preview: makePreview("Orbis_NFT"), tags: ["NFT", "Web3", "Landing"], gradient: "from-purple-300 via-pink-500 to-black" },
  { title: "Orbit Engineers", category: "Agency", type: "Landing", file: "Orbit_Engineers.md", preview: makePreview("Orbit_Engineers"), tags: ["Engineering", "Agency", "Orbit"], gradient: "from-blue-300 via-cyan-500 to-black" },
  { title: "Orbit Web3", category: "Web3", type: "Landing", file: "Orbit_Web3.md", preview: makePreview("Orbit_Web3"), tags: ["Web3", "Crypto", "Orbit"], gradient: "from-indigo-300 via-violet-500 to-black" },
  { title: "Planet Orbit", category: "SaaS", type: "Landing", file: "Planet_Orbit.md", preview: makePreview("Planet_Orbit"), tags: ["Orbit", "SaaS", "Space"], gradient: "from-cyan-300 via-indigo-600 to-black" },
  { title: "Portfolio Cosmic", category: "Portfolio", type: "Portfolio", file: "Portfolio_Cosmic.md", preview: "https://motionsites.ai/assets/hero-portfolio-cosmic-preview-BpvWJ3Nc.gif", tags: ["Portfolio", "Cosmic", "Personal"], gradient: "from-violet-300 via-blue-500 to-black" },
  { title: "Power AI", category: "Hero Section", type: "Hero", file: "Power_AI.md", preview: makePreview("Power_AI"), tags: ["AI", "Hero", "Energy"], gradient: "from-cyan-300 via-blue-600 to-black" },
  { title: "Price Calculator", category: "SaaS", type: "Component", file: "Price_Calculator.md", preview: "https://motionsites.ai/assets/hero-price-calculator-preview-Dak8DDgY.gif", tags: ["Calculator", "Conversion", "Dark"], gradient: "from-emerald-400 via-teal-500 to-slate-950" },
  { title: "Railroad.ai", category: "Hero Section", type: "Hero", file: "Railroad.ai.md", preview: makePreview("Railroad.ai"), tags: ["Video", "Cinematic", "Landing"], gradient: "from-zinc-200 via-slate-500 to-blue-700" },
  { title: "SkyElite Private Jets", category: "Landing Page", type: "Landing", file: "SkyElite_Private_Jets.md", preview: "https://motionsites.ai/assets/hero-skyelite-preview-DHaZIgUv.gif", tags: ["Luxury", "Jets", "Landing"], gradient: "from-sky-200 via-blue-500 to-black" },
  { title: "Space Voyage", category: "Landing Page", type: "Landing", file: "Space_Voyage.md", preview: makePreview("Space_Voyage"), tags: ["Space", "Immersive", "Hero"], gradient: "from-cyan-300 via-blue-600 to-black" },
  { title: "Stellar AI", category: "Hero Section", type: "Hero", file: "Stellar_AI.md", preview: makePreview("Stellar_AI"), tags: ["AI", "Stellar", "Hero"], gradient: "from-blue-300 via-violet-500 to-black" },
  { title: "Synapse Dark Hero", category: "SaaS", type: "Hero", file: "Synapse_Dark_Hero.md", preview: makePreview("Synapse_Dark_Hero"), tags: ["Dark", "AI", "SaaS"], gradient: "from-violet-300 via-purple-600 to-black" },
  { title: "Sync AI", category: "Hero Section", type: "Hero", file: "Sync_AI.md", preview: makePreview("Sync_AI"), tags: ["AI", "Sync", "Hero"], gradient: "from-sky-300 via-cyan-500 to-black" },
  { title: "Targo Logistics Hero", category: "SaaS", type: "Hero", file: "Targo_Logistics_Hero.md", preview: makePreview("Targo_Logistics_Hero"), tags: ["Logistics", "SaaS", "Hero"], gradient: "from-orange-300 via-red-500 to-black" },
  { title: "Taskly", category: "Hero Section", type: "Hero", file: "Taskly.md", preview: makePreview("Taskly", "webm"), tags: ["Productivity", "Hero", "WebM"], gradient: "from-lime-300 via-green-500 to-black" },
  { title: "Taskora SaaS Hero", category: "SaaS", type: "Hero", file: "Taskora_SaaS_Hero.md", preview: makePreview("Taskora_SaaS_Hero"), tags: ["Tasks", "SaaS", "Hero"], gradient: "from-blue-300 via-indigo-500 to-black" },
  { title: "Terra Geo Map", category: "SaaS", type: "Landing", file: "Terra_Geo_Map.md", preview: makePreview("Terra_Geo_Map"), tags: ["Map", "Geo", "SaaS"], gradient: "from-emerald-300 via-teal-500 to-black" },
  { title: "Transform Data", category: "Hero Section", type: "Hero", file: "Transform_Data.md", preview: makePreview("Transform_Data"), tags: ["Data", "Hero", "B2B"], gradient: "from-cyan-300 via-blue-500 to-black" },
  { title: "Velorah", category: "Agency", type: "Landing", file: "Velorah.md", preview: "https://motionsites.ai/assets/hero-velorah-preview-CJNTtbpd.gif", tags: ["Agency", "Premium", "Motion"], gradient: "from-pink-300 via-purple-500 to-black" },
  { title: "Viktor Portfolio", category: "Portfolio", type: "Portfolio", file: "Viktor_Portfolio.md", preview: makePreview("Viktor_Portfolio"), tags: ["Personal", "Creative", "Motion"], gradient: "from-lime-300 via-green-600 to-black" },
  { title: "Wealth Video Hero", category: "Fintech", type: "Hero", file: "Wealth_Video_Hero.md", preview: makePreview("Wealth_Video_Hero"), tags: ["Finance", "Video", "Hero"], gradient: "from-emerald-300 via-green-600 to-black" },
  { title: "Web3 EOS Hero", category: "Web3", type: "Hero", file: "Web3_EOS_Hero.md", preview: "https://motionsites.ai/assets/hero-web3-eos-poster-DF0_WdVS.png", tags: ["Web3", "EOS", "Hero"], gradient: "from-purple-300 via-indigo-500 to-black" },
  { title: "Weblex Dark Hero", category: "Landing Page", type: "Hero", file: "Weblex_Dark_Hero.md", preview: makePreview("Weblex_Dark_Hero"), tags: ["Dark", "Agency", "Hero"], gradient: "from-zinc-100 via-zinc-500 to-black" },
  { title: "xPortfolio Hero", category: "Hero Section", type: "Hero", file: "xPortfolio_Hero.md", preview: makePreview("xPortfolio_Hero"), tags: ["Portfolio", "Hero", "Creative"], gradient: "from-fuchsia-300 via-violet-500 to-black" },
];

const categories = ["Tous", "AI / SaaS", "Landing Page", "Hero Section", "SaaS", "Agency", "Portfolio", "Web3", "Component", "Presentation", "Automotive", "Fintech"];
const FREE_PROMPT_FILE = "AI_Automation_Hero.md";

const plans = [
  {
    id: "monthly",
    name: "Monthly",
    price: "9€",
    period: "/ mois",
    badge: "Flexible",
    description: "Pour tester Movento sans engagement.",
    cta: "Commencer maintenant",
    featured: false,
    features: ["Accès à tous les prompts", "Copy prompt en un clic", "Aperçus vidéo / visuels", "Nouveaux prompts inclus", "Annulable à tout moment"],
  },
  {
    id: "yearly",
    name: "Yearly",
    price: "120€",
    period: "/ an",
    badge: "Meilleur choix",
    description: "Pour créer régulièrement des sites premium avec l’IA.",
    cta: "Prendre l’offre annuelle",
    featured: true,
    features: ["Tout le catalogue Movento", "Mises à jour toute l’année", "Nouvelles catégories premium", "Prompts optimisés Lovable / v0 / Bolt", "Économise plus de 45%"],
  },
  {
    id: "lifetime",
    name: "Lifetime",
    price: "200€",
    period: "à vie",
    badge: "One shot",
    description: "Tu payes une fois. Tu gardes l’accès pour toujours.",
    cta: "Débloquer à vie",
    featured: false,
    features: ["Accès à vie", "Toutes les futures mises à jour", "Aucun abonnement", "Toutes les previews incluses", "Parfait pour freelances & agences"],
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

  return <svg {...common}>{children}</svg>;
}

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-violet-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-violet-500 to-cyan-300 opacity-80" />
        <span className="relative text-lg font-black tracking-[-0.08em] text-white">M</span>
      </div>
      <span className="text-lg font-semibold tracking-tight text-white">Movento</span>
    </div>
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
  const isFree = item.file === FREE_PROMPT_FILE;
  const hasVideo = !previewFailed && item.preview && (item.preview.endsWith(".mp4") || item.preview.endsWith(".webm"));
  const hasImage = !previewFailed && item.preview && [".png", ".jpg", ".jpeg", ".gif", ".webp"].some((ext) => item.preview.endsWith(ext) || item.preview.includes(`${ext}?`));

  return (
    <motion.div layout whileHover={{ y: -6 }} className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] p-3 shadow-2xl shadow-black/40 backdrop-blur-xl">
      <div className="relative aspect-[1.45] overflow-hidden rounded-[22px] bg-[#080913]">
        {hasVideo ? <SmartVideo className="h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-105" src={item.preview} onError={() => setPreviewFailed(true)} /> : hasImage ? <img className="h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-105" src={item.preview} alt={`${item.title} preview`} onError={() => setPreviewFailed(true)} /> : <GeneratedPreview item={item} />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white/80 backdrop-blur-md"><Icon name="play" className="h-3 w-3" /> Aperçu visuel</div>
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
    return "Le serveur de paiement Stripe local n’est pas joignable. Lance node server.js sur le port 4242, ou configure VITE_CHECKOUT_API_URL vers ton backend en production.";
  }
  return error?.message || "Impossible de lancer le paiement pour le moment.";
}

function getStoredAccessEmail() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("movento_access_email") || "";
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
  const isSuccessPage = typeof window !== "undefined" && window.location.pathname === "/success";

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
      setAccessStatus({ loading: false, message: "", error: "Entre l’email utilisé pendant le paiement." });
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

      if (!response.ok) throw new Error(data.error || "Impossible de vérifier l’accès.");

      setHasPremiumAccess(Boolean(data.hasAccess));
      setAccessEmail(normalizedEmail);

      if (data.hasAccess) {
        window.localStorage.setItem("movento_access_email", normalizedEmail);
        if (!options.silent) setAccessStatus({ loading: false, message: "Accès premium activé sur cet appareil.", error: "" });
        return true;
      }

      window.localStorage.removeItem("movento_access_email");
      if (!options.silent) setAccessStatus({ loading: false, message: "", error: "Aucun paiement trouvé pour cet email." });
      return false;
    } catch (error) {
      console.error("Erreur vérification accès", error);
      if (!options.silent) setAccessStatus({ loading: false, message: "", error: error.message || "Impossible de vérifier l’accès." });
      return false;
    }
  }

  async function copyPrompt(item) {
    if (item.file !== FREE_PROMPT_FILE && !hasPremiumAccess) {
      setUnlockNotice(`${item.title} est inclus dans l'accès premium Movento.`);
      document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => setUnlockNotice(""), 2600);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: item.file, email: accessEmail }),
      });
      if (!response.ok) throw new Error("Prompt introuvable");
      const data = await response.json();
      await navigator.clipboard.writeText(data.prompt);
      setCopiedCard(item.title);
      setTimeout(() => setCopiedCard(""), 1600);
    } catch (error) {
      console.error("Erreur copie prompt", error);
      setCopiedCard("Erreur");
      setTimeout(() => setCopiedCard(""), 1600);
    }
  }

  async function goToCheckout(planId) {
    if (checkoutStatus.loading) return;

    setCheckoutStatus({ loading: planId, error: "" });

    try {
      if (!validatePlanId(planId)) throw new Error("Plan invalide.");

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
      if (!data.checkoutUrl || typeof data.checkoutUrl !== "string") throw new Error("Le backend n’a pas renvoyé de checkoutUrl Stripe.");

      window.location.assign(data.checkoutUrl);
    } catch (error) {
      console.error("Erreur paiement Stripe", error);
      setCheckoutStatus({ loading: "", error: getCheckoutErrorMessage(error) });
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#05060a] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute left-1/2 top-[-20%] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-blue-500/20 blur-[140px]" />
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "34px 34px" }} />
      </div>

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm text-white/55 md:flex">
          <a href="#prompts" className="hover:text-white">Prompts</a>
          <a href="#pricing" className="hover:text-white">Pricing</a>
          <a href="#how" className="hover:text-white">Guide</a>
        </nav>
        <a href="#prompts" className="rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-white/80 backdrop-blur transition hover:bg-white hover:text-black">Explorer</a>
      </header>

      {isSuccessPage && (
        <section className="relative z-10 mx-auto max-w-4xl px-6 pb-10 pt-14 text-center lg:px-8">
          <div className="rounded-[34px] border border-emerald-300/20 bg-emerald-400/[0.08] p-8 shadow-2xl shadow-emerald-950/30 backdrop-blur-2xl">
            <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-emerald-200/20 bg-emerald-300/10 text-emerald-100">
              <Icon name="check" className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">Paiement confirmé</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/60 md:text-base">
              {accessStatus.loading ? "On confirme ton paiement avec Stripe." : hasPremiumAccess ? "Ton accès Movento est prêt. Tu peux revenir à la galerie et copier les prompts premium." : "Paiement reçu. Si l’accès ne s’active pas automatiquement, entre ton email plus bas."}
            </p>
            {accessStatus.message && <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-emerald-100">{accessStatus.message}</p>}
            {accessStatus.error && <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-red-100">{accessStatus.error}</p>}
            <a href="/#prompts" className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]">
              Retour aux prompts <Icon name="arrow" className="h-4 w-4" />
            </a>
          </div>
        </section>
      )}

      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-16 pt-16 text-center lg:px-8 lg:pt-24">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/70 backdrop-blur-xl"><Icon name="sparkles" className="h-4 w-4 text-violet-300" /> Bibliothèque française de prompts web premium</motion.div>
        <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="mx-auto max-w-5xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] text-white md:text-7xl lg:text-8xl">Créez des sites modernes sans coder.</motion.h1>
        <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-white/60 md:text-xl">Des prompts prêts à copier, des aperçus animés, et une direction artistique pensée pour les gens de la com, les freelances et les équipes marketing.</motion.p>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a href="#prompts" className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.02]">Explorer les prompts <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" /></a>
          <a href="#pricing" className="rounded-full border border-white/10 bg-white/[0.05] px-6 py-3 text-sm font-semibold text-white/80 backdrop-blur hover:bg-white/10">Voir les offres</a>
        </motion.div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-4 rounded-[34px] border border-white/10 bg-white/[0.035] p-3 shadow-2xl shadow-black/50 backdrop-blur-2xl md:grid-cols-3">
          <div className="rounded-[26px] border border-white/10 bg-black/30 p-6"><Icon name="zap" className="mb-5 h-6 w-6 text-violet-300" /><h3 className="text-lg font-semibold">Copier-coller</h3><p className="mt-2 text-sm leading-6 text-white/55">Un prompt propre, prêt pour Lovable, v0, Bolt, Cursor ou Claude.</p></div>
          <div className="rounded-[26px] border border-white/10 bg-black/30 p-6"><Icon name="layers" className="mb-5 h-6 w-6 text-blue-300" /><h3 className="text-lg font-semibold">Aperçu visuel</h3><p className="mt-2 text-sm leading-6 text-white/55">Tu vois le style avant de générer : dark UI, vidéo, glass, portfolio, SaaS.</p></div>
          <div className="rounded-[26px] border border-white/10 bg-black/30 p-6"><Icon name="code" className="mb-5 h-6 w-6 text-cyan-300" /><h3 className="text-lg font-semibold">Sans coder</h3><p className="mt-2 text-sm leading-6 text-white/55">Pensé pour les profils marketing, communication et création.</p></div>
        </div>
      </section>

      <section id="prompts" className="relative z-10 mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div><p className="text-sm uppercase tracking-[0.3em] text-white/35">Galerie</p><h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">Prompts premium</h2><p className="mt-4 max-w-2xl text-sm leading-6 text-white/50">{hasPremiumAccess ? "Accès premium actif. Tous les prompts peuvent être copiés." : "Un prompt est offert pour tester la qualité. Le reste du catalogue se débloque avec un accès Movento."}</p></div>
          <div className="relative w-full md:w-80"><Icon name="search" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un style..." className="w-full rounded-full border border-white/10 bg-white/[0.05] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/35 focus:border-violet-400/50" /></div>
        </div>
        <div className="mb-8 rounded-[28px] border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl md:flex md:items-center md:justify-between md:gap-5">
          <div>
            <p className="text-sm font-semibold text-white">{hasPremiumAccess ? "Accès premium actif" : "Déjà client ?"}</p>
            <p className="mt-1 text-sm leading-6 text-white/50">{hasPremiumAccess ? `Connecté avec ${accessEmail}.` : "Entre l’email utilisé au paiement pour débloquer les prompts premium sur cet appareil."}</p>
          </div>
          <form className="mt-4 flex flex-col gap-3 sm:flex-row md:mt-0" onSubmit={(event) => { event.preventDefault(); verifyAccess(); }}>
            <input value={accessEmail} onChange={(event) => setAccessEmail(event.target.value)} type="email" placeholder="email@exemple.com" className="min-w-0 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-violet-400/50 sm:w-72" />
            <button disabled={accessStatus.loading} className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60">{accessStatus.loading ? "Vérification..." : hasPremiumAccess ? "Revérifier" : "Débloquer"}</button>
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
                <div className="absolute inset-x-0 bottom-0 z-20 p-5"><button onClick={() => copyPrompt(item)} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm font-medium text-white backdrop-blur-xl transition hover:bg-white hover:text-black">{copiedCard === item.title ? <><Icon name="check" className="h-4 w-4" /> Copié</> : copiedCard === "Erreur" ? <><Icon name="alert" className="h-4 w-4" /> Erreur</> : item.file === FREE_PROMPT_FILE ? <><Icon name="copy" className="h-4 w-4" /> Copy Prompt gratuit</> : hasPremiumAccess ? <><Icon name="copy" className="h-4 w-4" /> Copy Prompt</> : <><Icon name="sparkles" className="h-4 w-4" /> Débloquer le prompt</>}</button></div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      <section id="how" className="relative z-10 mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="rounded-[40px] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8 backdrop-blur-xl md:p-12"><div className="grid gap-10 md:grid-cols-3">{["Choisis un style", "Copie le prompt", "Génère ton site"].map((step, i) => <div key={step}><div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] text-sm font-bold text-white/70">0{i + 1}</div><h3 className="text-xl font-semibold">{step}</h3><p className="mt-3 text-sm leading-6 text-white/55">{i === 0 ? "Parcours les aperçus et trouve une direction artistique adaptée à ton offre." : i === 1 ? "Le prompt est chargé depuis la source brute pour rester intact." : "Colle-le dans ton outil IA préféré et personnalise le résultat."}</p></div>)}</div></div>
      </section>

      <section id="pricing" className="relative z-10 mx-auto max-w-7xl px-6 pb-28 pt-10 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/65 backdrop-blur-xl"><Icon name="sparkles" className="h-4 w-4 text-violet-300" /> Offre de lancement • Prix fondateur</div>
          <h2 className="text-5xl font-semibold tracking-[-0.06em] text-white md:text-7xl">Choisis ton accès</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/55">Gagne des heures sur chaque landing page. Copie un prompt premium, colle-le dans ton outil IA, et transforme une idée en site moderne en quelques minutes.</p>
          <p className="mx-auto mt-4 inline-flex rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/55">
            Code test Stripe : <span className="ml-1 font-semibold text-white">testonly</span>
          </p>
        </div>

        {checkoutStatus.error && <div className="mx-auto mt-8 flex max-w-3xl items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm leading-6 text-red-100 backdrop-blur-xl"><Icon name="alert" className="mt-1 h-4 w-4 flex-none" /><p>{checkoutStatus.error}</p></div>}

        <div className="mx-auto mt-14 grid max-w-6xl gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.id} className={`relative overflow-hidden rounded-[34px] border p-3 shadow-2xl backdrop-blur-2xl transition hover:-translate-y-1 ${plan.featured ? "border-violet-300/30 bg-gradient-to-br from-violet-500/[0.18] via-white/[0.06] to-cyan-500/[0.12] shadow-violet-900/25" : "border-white/10 bg-white/[0.035] shadow-black/40"}`}>
              {plan.featured && <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-violet-500/30 blur-[100px]" />}
              <div className="relative rounded-[28px] border border-white/10 bg-[#080910]/90 p-7">
                <div className="mb-7 flex items-start justify-between gap-4"><div><h3 className="text-2xl font-semibold tracking-tight text-white">{plan.name}</h3><p className="mt-2 text-sm leading-6 text-white/45">{plan.description}</p></div><span className={`rounded-full border px-3 py-1 text-xs font-medium ${plan.featured ? "border-violet-300/25 bg-violet-500/15 text-violet-100" : "border-white/10 bg-white/[0.05] text-white/55"}`}>{plan.badge}</span></div>
                <div className="mb-7"><div className="flex items-end gap-2"><span className="text-6xl font-bold tracking-[-0.07em] text-white">{plan.price}</span><span className="pb-2 text-white/40">{plan.period}</span></div></div>
                <button disabled={Boolean(checkoutStatus.loading)} onClick={() => goToCheckout(plan.id)} className={`group flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 ${plan.featured ? "bg-white text-black hover:bg-white/90 shadow-2xl shadow-white/10" : "border border-white/10 bg-white/[0.06] text-white hover:bg-white hover:text-black"}`}>{checkoutStatus.loading === plan.id ? "Redirection..." : plan.cta}<Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" /></button>
                <div className="my-7 h-px bg-white/10" />
                <div className="space-y-3">{plan.features.map((item) => <div key={item} className="flex items-center gap-3 text-sm text-white/65"><div className="grid h-5 w-5 flex-none place-items-center rounded-full bg-white/10"><Icon name="check" className="h-3.5 w-3.5 text-white" /></div>{item}</div>)}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-3xl rounded-[28px] border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur-xl"><p className="text-sm leading-6 text-white/60">Un seul bon prompt peut te faire économiser plusieurs heures de design, d’intégration et d’allers-retours client. Movento est fait pour passer de “j’ai une idée” à “j’ai une page qui donne envie”.</p></div>
      </section>
    </main>
  );
}

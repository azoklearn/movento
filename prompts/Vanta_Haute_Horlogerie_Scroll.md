Crée un site web one-page ultra premium pour une marque de montres de luxe fictive
nommée VANTA. Expérience 3D immersive pilotée au scroll, noir et blanc absolu,
minimaliste et grandiose. Code complet, propre, commenté, prêt à déployer sur Vercel.

STACK IMPOSÉE
- React 19 + Vite 7, Tailwind CSS 4 (plugin @tailwindcss/vite), Three.js via
  @react-three/fiber 9 + @react-three/drei 10, GSAP 3.13 + ScrollTrigger.
- Scroll natif. Aucune lib de smooth scroll.
- Arborescence : src/App.jsx · src/index.css · src/lib/scrollState.js ·
  src/lib/ready.js · src/hooks/useMediaQuery.js · src/components/{Loader,
  ScrollVideo,Scene3D,Cursor,Grain,Reveal}.jsx · src/components/sections/{Hero,
  Manifesto,Detail,Craft,Collection,Finale,Footer}.jsx

DIRECTION ARTISTIQUE (stricte)
- Trois couleurs uniquement : #000000, #FFFFFF, #8A8A8A (textes secondaires).
- Typographies Google Fonts : "Italiana" (serif display, titres, casse haute,
  letter-spacing 0.28em sur le logo) + "Jost" 200/300/400 (sans géométrique, corps).
- Contraste de taille extrême : titre hero clamp(4rem,13vw,15rem) ; chiffres de la
  section Détail clamp(6rem,16vw,15rem) ; corps 0.65–1.35rem.
- Beaucoup de vide, sections de 90vh à 150vh. Aucune ombre portée, aucun coin
  arrondi, aucun dégradé sauf noir→transparent.
- Grain de film statique en overlay fixe : SVG feTurbulence (fractalNoise,
  baseFrequency 0.9, 2 octaves, tuile 240px) en data-URI, opacité 0.03,
  pointer-events none.
- Empilement z-index : 0 vidéo · 1 canvas 3D · 2 voile de lisibilité (gradient
  vertical black/55 → transparent → black/55) · 10 contenu · 70 grain ·
  80 curseur · 100 loader.

VIDÉO DE FOND SCRUBBÉE AU SCROLL (élément central)
- <video> fixed inset-0 object-cover z-0, muted, playsinline, preload="auto",
  disablePictureInPicture, aria-hidden, JAMAIS d'autoplay.
- Chaîne de sources avec repli automatique via l'événement error :
  · Desktop : d'abord le CDN
    https://res.cloudinary.com/du0hbrmvw/video/upload/v1787178771/vanta_rsl9nf.mp4
    puis repli sur /vanta.mp4 local, puis site sur fond noir si tout échoue.
  · Mobile : d'abord /vanta-portrait.mp4 (verticale), puis le CDN, puis /vanta.mp4.
- Mapping : progress = scrollY / (scrollHeight - innerHeight), lissé par lerp
  (facteur 0.1 desktop, 0.18 mobile) dans une boucle requestAnimationFrame ;
  video.currentTime = smooth * video.duration. Ne seeker que si l'écart dépasse
  1/60 s. Lire video.duration dynamiquement (aucune durée en dur — la vidéo
  actuelle fait 15,04 s mais le code ne doit pas le savoir).
- Stocker {raw, smooth} dans un module partagé hors React (aucun re-render/frame) ;
  la scène 3D lit ce module dans useFrame.
- Débloquer le décodeur iOS au premier touchstart : play().then(pause()).
- Filets de sécurité : libérer le site après 6 s si les métadonnées sont là,
  10 s quoi qu'il arrive.

ÉCRAN DE CHARGEMENT
- Plein écran noir z-100, compteur 00→100 centré en Italiana
  clamp(3rem,8vw,7rem), tabular-nums, "VANTA" en 0.65rem letter-spacing 0.5em
  gris en bas. Scroll verrouillé (classe is-loading sur <html>).
- Progression = buffer réel (video.buffered / duration, plafonné à 99 jusqu'à
  canplaythrough). Affichage lissé INDÉPENDANT du framerate :
  k = 1 - 0.001^dt (dt en secondes, plafonné à 0.5) — jamais de lerp par frame fixe.
- PIÈGE À ÉVITER : le setTimeout qui signale la fin du fondu doit être protégé
  par un ref « déjà déclenché » — pas de clearTimeout dans un cleanup re-exécuté
  par un changement de dépendance, sinon le signal ne part jamais.
- Fondu 1 s vers le site, puis : déverrouiller le scroll, scrollTo(0,0),
  ScrollTrigger.refresh(), émettre un signal global « ready ».

RÈGLE CRITIQUE D'ORCHESTRATION
- AUCUNE animation d'entrée ne se crée avant le signal « ready » (module
  pub/sub : whenReady(fn)). Sinon les reveals du hero se jouent invisiblement
  sous le loader. Tous les ScrollTriggers de reveal sont créés à ce signal.

SCÈNE 3D (desktop uniquement)
- Canvas transparent fixed z-1 pointer-events-none, dpr={[1,2]}, sans ombres,
  camera z=8 fov 42, matériaux sans éclairage.
- 4 anneaux fil de fer blancs (drei Line, lineWidth 0.75, cercles de rayons
  1.5 / 2.1 / 2.9 / 3.6, inclinaisons distinctes) + 3 lignes radiales
  (lineWidth 0.5, longueur 8.8) + 350 particules blanches (coquille sphérique
  rayon 3.5–6, size 0.018, depthWrite false).
- Presets par section (7 entrées {rotX, rotY, opacité, vitesse de spin}) :
  Hero {0.45,0,0.5,0.05} · Manifeste {0.9,0.6,0.3,0.08} · Détail
  {1.35,1.2,0.45,0.05} · Savoir-faire {0.2,2.0,0.25,0.1} · Collection
  {1.05,2.8,0.4,0.06} · Finale {1.6,3.6,0.55,0.04} · Footer {1.6,3.6,0,0.02}.
  Index actif = floor(smoothProgress × 7). Interpolations exponentielles
  indépendantes du framerate : k = 1 - 0.001^delta.
- Parallaxe souris douce : position ±0.45/±0.3, rotation z ±0.2 (pointer R3F).
- Code-splitting OBLIGATOIRE : React.lazy(() => import('./Scene3D')) — three.js
  ne doit jamais être téléchargé sur mobile (bundle principal ≈ 110 kB gz).

SECTIONS (fond transparent au-dessus de la vidéo)
1. HERO 100svh — « VANTA » Italiana, tracking 0.28em ; sous-titre
   « Haute horlogerie » 0.7rem, tracking 0.6em, gris, delay 0.5s ; ligne de
   scroll verticale 1px×64px, gradient blanc→transparent, animation scaleY
   origin top/bottom 2.6s infinie. Aucun bouton.
2. MANIFESTE min-h 150vh — un paragraphe (~43 mots, aligné gauche, max 40vw,
   leading 1.9) : « Le temps ne se possède pas. Il se contemple. VANTA ne mesure
   pas les heures — elle leur donne un poids, une matière, un silence. Chaque
   calibre naît dans l'obscurité de nos ateliers, d'un seul geste juste, répété
   jusqu'à l'oubli de la main. » Révélé mot par mot LIÉ AU SCROLL (scrub:true,
   start "top 70%", end "bottom 55%", opacité 0.08→1, stagger 0.08).
3. DÉTAIL — trois blocs min-h 90vh : (Boîtier / « Acier 904L, brossé et poli à
   la main. » / 42 MM) · (Étanchéité / « Éprouvée bien au-delà des usages. » /
   100 M) · (Réserve de marche / « Calibre manufacture V.01, remontage
   manuel. » / 72 H). Libellé 0.7rem tracking 0.5em gris, chiffre Italiana
   géant, unité en exposant gris tracking 0.2em.
4. SAVOIR-FAIRE min-h 130vh centré — « Trois cent douze composants. » (blanc)
   / « Une seule main. » (gris), Italiana clamp(2rem,5vw,4.5rem).
5. COLLECTION — trois articles min-h 100vh, typographie seule entre deux filets
   blancs 1px opacité 0.35 : (I — RÉF. VA-101 / Noir Absolu / 18 400 €) ·
   (II — RÉF. VA-202 / Ombre / 24 900 €) · (III — RÉF. VA-303 / Éclipse /
   32 700 €). Nom en Italiana clamp(3rem,9vw,9rem) uppercase.
6. FINALE min-h 130vh fond noir plein — dégradé noir→transparent de 40vh
   au-dessus pour la transition ; « VANTA » géant ; bouton <a> « DÉCOUVRIR »
   contour blanc 1px, padding 1.1rem 3.5rem, tracking 0.45em, inversion
   blanc/noir au survol (transition 0.5s cubic-bezier(0.25,1,0.5,1)).
7. FOOTER — une ligne : « © 2026 VANTA — Tous droits réservés » + liens
   Mentions / Contact / Instagram, 0.65rem uppercase tracking 0.3em gris,
   hover blanc, border-top white/15.

ANIMATIONS (GSAP + ScrollTrigger)
- Reveal générique : clip-path inset(0 0 100% 0) → inset(0 0 -8% 0) (débord
  -8% pour les jambages) + y 40→0, power3.out, 1.2s, stagger 0.06 sur les mots,
  toggleActions "play none none reverse". État initial masqué en CSS
  (.reveal-mask) pour éviter tout flash avant GSAP.
- Curseur personnalisé (pointer:fine uniquement) : cercle 24px bordure blanche
  1px, mix-blend-difference, suit la souris avec lerp 0.14, scale 2.5 (60px)
  sur a/button/[data-hover], apparition au premier mousemove, cursor:none
  sur le document. Aucune animation rebondissante nulle part.

RESPONSIVE / ACCESSIBILITÉ / SEO
- Mobile (<768px) : pas de scène 3D, pas de curseur custom, lerp vidéo 0.18,
  vidéo verticale avec repli, typos réduites via clamp.
- prefers-reduced-motion : vidéo figée à 20% de sa durée, tous les reveals
  remplacés par des fondus simples via gsap.matchMedia, ligne de scroll figée.
- Skip-link « Aller au contenu », focus-visible outline blanc 1px offset 6px,
  navigation clavier complète, aria-labels sur toutes les sections,
  ::selection inversé.
- index.html lang="fr" : title « VANTA — Haute Horlogerie », meta description,
  canonical, Open Graph + Twitter card, theme-color #000000, favicon SVG
  data-URI (V blanc sur noir), preconnect Google Fonts.
- README avec la commande ffmpeg d'encodage scrubbing :
  ffmpeg -i source.mp4 -an -c:v libx264 -profile:v high -pix_fmt yuv420p
  -g 6 -keyint_min 6 -crf 20 -movflags +faststart public/vanta.mp4
  (keyframe toutes les 6 images = seek instantané, faststart = buffering web).

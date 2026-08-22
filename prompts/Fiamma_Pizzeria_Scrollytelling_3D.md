# PROMPT — Reconstruire à l'identique le site « Fiamma » (pizzeria scrollytelling 3D)

Référence visuelle live : https://pizza-jade-ten.vercel.app/ — le résultat doit être indistinguable de cette référence.

# RÔLE
Tu es directeur artistique + développeur front-end senior spécialisé en sites immersifs WebGL.
Tu produis du code propre, performant, complet — aucun placeholder, aucun TODO.

# LIVRABLE
Un seul fichier `index.html` (CSS + JS inline) qui charge ses assets par URL directe
(voir manifeste §1). Il doit fonctionner servi par n'importe quel serveur statique
(pas en `file://`). Aucun build, aucun framework.

# STACK (versions exactes, balises `<script src>` classiques, pas de modules)
- Three.js r128 : https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js
- GSAP 3.12.5 : https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js
- ScrollTrigger 3.12.5 : https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js
- Lenis 1.1.14 : https://unpkg.com/lenis@1.1.14/dist/lenis.min.js
- Fontes Google : `Instrument+Serif:ital@0;1` + `Inter:wght@400;500;600`, display=swap, preconnect.

---

# 1 · MANIFESTE DES ASSETS (liens directs, CORS `*` activé)

Base : `https://pizza-jade-ten.vercel.app/assets/web/`

| Fichier | Usage exact |
|---|---|
| `pizza-hero.jpg` (2048×2048) | Texture de la pizza 3D (masquée en cercle au runtime) + fallback héro reduced-motion. **Charger avec `crossOrigin='anonymous'`** (obligatoire : l'image passe dans un canvas puis en texture WebGL). |
| `ingredients.jpg` (1920×1084) | Média du panneau 01 (San Marzano) |
| `cheese-pull.mp4` + `cheese-pull-poster.jpg` (1280×720, 5 s, muet) | Média du panneau 02 (Mozzarella), `<video muted playsinline loop preload="none" poster=…>` |
| `dough.jpg` (1600×1206) | Média du panneau 03 (Basilic) **et** visuel circulaire de la section La Pâte |
| `flame-loop.mp4` + `flame-poster.jpg` (1280×720, 5 s, muet) | Vidéo du cadre arrondi de la section Le Four |
| `terrace.jpg` (2000×1129) | Fond parallax full-bleed de la section Ambiance |
| `menu-margherita.jpg` `menu-marinara.jpg` `menu-bufala.jpg` `menu-diavola.jpg` `menu-quattro.jpg` `menu-ortolana.jpg` (800×800) | Images rondes des 6 cartes du menu |
| `oven.jpg`, `marble.jpg` | Préchargées dans le préloader (réserve DA, non affichées) |

Fallback équivalent si besoin : `https://raw.githubusercontent.com/azoklearn/pizza/main/assets/web/<fichier>` (mêmes fichiers, CORS `*`).

Préloader : précharge exactement `pizza-hero.jpg, marble.jpg, dough.jpg, oven.jpg, ingredients.jpg, terrace.jpg` + `document.fonts.ready`.

---

# 2 · DIRECTION ARTISTIQUE (valeurs exactes)

## Palette (CSS custom properties sur `:root`)
```
--cream:#FDFBF7  --ivory:#F4EFE6  --warm:#EDE6D9
--red:#C8102E    --red-deep:#8E0B20
--green:#008C45  --olive:#5A6B4A
--ink:#1C1A17    --gold:#C9A227
--ease:cubic-bezier(.16,1,.3,1)
```
Règles : 80 % fond clair / 15 % typo sombre / 5 % rouge-vert. Jamais de bloc rouge plein écran.
Le vert et le rouge ne se touchent jamais (toujours séparés par du crème).
`::selection` : fond rouge, texte crème.

## Typographie
- Titres : Instrument Serif 400, italique sur les mots-clés (`<em>`). `h1: clamp(3rem,9vw,9rem)`,
  `h2: clamp(2.3rem,4.8vw,4.6rem)`, line-height 1.02, letter-spacing -.01em.
- Corps : Inter 400/500, `clamp(15px,1.05vw,17px)`, line-height 1.6.
- Sur-titres `.overtitle` : Inter 500, 12px, uppercase, letter-spacing .18em, couleur `--olive`,
  précédés d'un tiret doré de 34×1px (pseudo-élément, gap 14px).
- `.lead` : `clamp(1.02rem,1.25vw,1.2rem)`, couleur #3c3831, max-width 34em.

## Signature « pro »
- Grain : div fixe plein écran, SVG data-URI `feTurbulence type=fractalNoise baseFrequency=.85
  numOctaves=2 stitchTiles=stitch` sur rect, opacity .035, z-index 9990, pointer-events none.
- Curseur custom (pointer:fine uniquement) : cercle 14px bordure 1.5px `--ink`, suit la souris
  avec lerp ×.22 ; au survol de `a, button, .dish, .avis-card, video` → 44px, fond rouge .9, sans bordure.
- Marges : `--gutter: clamp(20px,8vw,120px)` ; contenu max-width 1560px centré.
- Boutons `.btn` : pilule (radius 999), padding 1.02em 2.1em ; pseudo `::before` couleur
  `--red-deep` (ou `--ink` pour la variante outline) qui **monte du bas** (translateY 101%→0, .55s var(--ease)).
  Variantes : `.btn-solid` fond rouge texte blanc ; `.btn-ghost` bordure 1.5px rgba(28,26,23,.4).
  Flèche `→` qui glisse de 5px au hover. `:active` scale .97.
- Liens `.lnk` : underline 1px qui se dessine de gauche à droite (scaleX 0→1, .55s).
- Focus visible : outline 2px `--red`, offset 3px. Skip-link « Aller au contenu ».

---

# 3 · STRUCTURE & COPY (verbatim, ne pas réécrire)

`<html lang="fr">`. Nav fixe : logo serif italique « Fiamma » ; liens « La maison » (#histoire),
« La carte » (#carte), « L'ambiance » (#ambiance) ; tél « 04 78 27 45 12 » ; bouton « Réserver ».
Après 40px de scroll : fond rgba(253,251,247,.82) + backdrop blur 14px + padding réduit.
Sur mobile (<900px) : seulement logo + bouton Réserver.

## 1 · HERO (`#hero`, min-height 100svh)
- Overtitle : « Pizzeria napoletana · Lyon 1ᵉʳ »
- H1 (2 lignes, split-text char par char) : « La pizza, » / *« comme à Napoli. »* (2ᵉ ligne italique)
- Sous-titre : « Pâte maturée 72 heures, four à bois à 450 °C, tomates San Marzano et mozzarella
  di bufala DOP. Le reste, c'est du feu. »
- CTAs : « Réserver une table → » (solid) · « Voir la carte » (ghost)
- Bas de page : trait vertical animé (balayage rouge 1.8s infini) + « Faites défiler — l'histoire commence »

## 2 · HISTOIRE (`#histoire`, min-height 110vh, grille 2 col 1.05fr/.95fr, col droite vide pour la 3D)
- Overtitle « La maison » ; H2 : « Née d'un four,¶d'une famille,¶*d'une obsession.* »
- P1 : « Fiamma est née en 2018, au retour de trois années passées dans les cuisines de Naples.
  Une conviction simple : la vraie pizza ne s'improvise pas, elle se respecte — la pâte, le feu,
  le produit, et rien d'autre. »
- P2 : « Chaque matin, la pâte de la veille de la veille finit sa maturation. Chaque soir, le four
  monte à 450 °C. Entre les deux : quatre-vingt-dix secondes de cuisson, pas une de plus. »
- 3 stats (bordure haute 1px `--gold`, chiffre serif `clamp(1.7rem,2.6vw,2.6rem)`, légende 11.5px
  uppercase olive) : **72 h** de maturation · **450 °C** four à bois · **90 s** de cuisson

## 3 · INGRÉDIENTS (`#ingredients`, rail horizontal épinglé — desktop seulement)
Rail `.h-track` de 3 panneaux `width:min(86vw,1080px)`, chacun grille 2 col (texte / média arrondi
26px, ratio 4/3, ombre 0 34px 70px -34px rgba(28,26,23,.4)). Numéros décoratifs serif italiques
géants (01/02/03, rgba(28,26,23,.14)). Badges : pilule bordure verte, texte vert, point vert, uppercase 11.5px.
- 01 « Tomates *San Marzano* » — « Cultivées dans la plaine volcanique du Vésuve, écrasées à la
  main, jamais cuites avant d'entrer au four. Une acidité douce, une chair dense — le goût exact
  de la baie de Naples. » — badge « DOP · Agro Sarnese-Nocerino » — media `ingredients.jpg`
- 02 « Mozzarella *di bufala* » — « Arrivée deux fois par semaine de Campanie, égouttée douze
  heures pour ne jamais noyer la pâte. Elle fond, elle file, elle ne rend pas l'eau. » — badge
  « DOP · Campania » — media `cheese-pull.mp4`
- 03 « Basilic frais *& huile du Cilento* » — « Le basilic est posé à la sortie du four, jamais
  avant — pour garder son parfum intact. L'huile d'olive extra-vierge arrive en bidon du Cilento,
  pressée à froid chez un producteur unique. » — badge « Récolte à la main » — media `dough.jpg`
Mobile : panneaux empilés verticalement, pas de pin.

## 4 · LA PÂTE (`#pate`, épinglée 160% — desktop)
Grille 2 col : à gauche visuel carré ratio 1 avec `dough.jpg` en `border-radius:50%` et
`clip-path: circle(16% at 50% 50%)` → `circle(70.7% …)` au scrub. À droite :
- Overtitle « La pâte » ; H2 « *Le temps* fait¶le travail. »
- Compteur géant serif `clamp(4.2rem,8.5vw,8rem)` : « 72 » + « h de maturation » (petit, italique olive) —
  la valeur = `round(min(1, progress*1.25)*72)`.
- Para : « Trois jours de fermentation lente à température contrôlée. C'est ce qui rend la croûte
  légère, digeste, soufflée — tachetée de léopard comme l'exige la tradition napolitaine. »
- 3 lignes précédées d'un tiret doré 22px : « Farine 00 de moulin piémontais » ·
  « Levain naturel entretenu depuis 2018 » · « 62 % d'hydratation, sel de Trapani »

## 5 · LE FOUR (`#four`, min-height 110vh, grille .92fr/1.08fr)
- Overtitle « Le four » ; H2 « 450 °C.¶90 secondes.¶*Pas plus.* »
- Para : « Un dôme napolitain monté sur place, chauffé au bois de hêtre. La sole tourne autour de
  la flamme, la croûte cloque, le cœur reste moelleux. C'est une cuisson violente — et c'est
  exactement le but. »
- 2 stats : **Hêtre** bois unique · **Dôme** monté sur place
- À droite : `flame-loop.mp4` dans un cadre `border-radius:30px`, ratio 16/10, double ombre chaude :
  `0 40px 90px -34px rgba(120,50,0,.55), 0 0 120px -20px rgba(255,122,38,.35)`.

## 6 · LA CARTE (`#carte`)
En-tête : Overtitle « La carte » ; H2 « Six pizzas.¶*Zéro compromis.* » ; intro « Une carte courte,
parce que chaque pizza mérite le même soin. Tout est fait minute, rien n'attend. »
Liste 2 colonnes (1 col mobile), chaque plat : image ronde 96px (ombre portée) + nom serif 1.55rem
+ ingrédients .85rem olive + prix serif italique 1.35rem aligné droite + filet bas 1px
rgba(201,162,39,.34). Hover : carte translateY(-8px), image rotate(15deg) (.5/.6s var(--ease)).
| Margherita | San Marzano, fior di latte, basilic, huile d'olive | 12 € |
| Marinara | San Marzano, ail, origan, huile d'olive — sans fromage | 10 € |
| Bufala DOP | San Marzano, mozzarella di bufala, tomates cerises, basilic | 15 € |
| Diavola | San Marzano, fior di latte, spianata piquante, piment | 15 € |
| Quattro Formaggi | Fior di latte, gorgonzola, provola fumée, parmesan 24 mois | 16 € |
| Ortolana | San Marzano, légumes grillés, fior di latte, basilic | 14 € |
Note : « Vins italiens à partir de 26 € — 18 références de petites caves. / Pâte sans gluten le
mardi et le mercredi, sur réservation. » + bouton ghost « Réserver une table → ».

## 7 · AMBIANCE (`#ambiance`, height 96vh)
`terrace.jpg` en fond cover débordant (`inset:-12% 0`) animé en parallax `yPercent -9→9` ;
voile `linear-gradient(to top, rgba(20,16,10,.62), rgba(20,16,10,.05) 55%)`.
Citation serif italique blanche `clamp(1.7rem,3.4vw,3.1rem)` : « On se croirait à Naples,¶sans
l'avion. » + source uppercase « Avis Google — juin 2026 ». Badge pilule **verte** : étoile SVG
blanche + « 4,9 · 312 avis Google » (lien vers #avis).

## 8 · AVIS (`#avis`)
Overtitle « Ils en parlent » ; H2 « Parole *de clients.* ».
Carrousel : cartes blanches 24px radius, `width:min(78vw,430px)`, bordure rgba(28,26,23,.07),
ombre douce ; 5 étoiles SVG **rouges** ; texte ; pied nom + source.
1. Camille R. · Google · mai 2026 — « La meilleure pâte de Lyon, et de loin. Légère, soufflée, ce
   petit goût de levain… On a refait 600 km deux mois plus tard juste pour la Bufala. »
2. Marco T. · Google · avril 2026 — « Napolitain qui vit à Lyon depuis dix ans : c'est la première
   fois que je retrouve la pizza de mon quartier. La Marinara est d'une justesse rare. »
3. Élise B. · Google · juin 2026 — « Réservé pour un anniversaire, accueil parfait, service précis.
   Le cheese pull de la Quattro Formaggi a fait le tour de la table — et d'Instagram. »
Mécanique : dupliquer les 3 cartes (6 au total), boucle infinie par translateX modulo la
demi-largeur, autoplay **-34 px/s**, pause au survol, drag pointer (inertie : vélocité ×.94/frame),
curseur grab/grabbing.

## 9 · RÉSERVATION (`#reservation`, grille 1.06fr/.94fr)
Overtitle « Réservation » ; H2 « Votre table¶*vous attend.* ».
Formulaire (panneau `--ivory`, radius 30px) — labels flottants (label absolu qui monte en 11px
uppercase olive quand focus ou rempli ; champs : bordure basse seule 1.5px, focus rouge) :
Nom* · Téléphone* · Date* (`min` = aujourd'hui) · Couverts* (select 1→« 8 personnes et + ») ·
Message « (allergies, occasion, terrasse…) » (textarea). Bouton solid pleine largeur « Demander
cette table → ». Note : « Confirmation par téléphone sous 2 h aux horaires d'ouverture. »
Submit (front seul) : masquer les champs, afficher « *Grazie mille !* — Votre demande est bien
partie. Nous vous rappelons très vite pour confirmer. Pressé·e ? 04 78 27 45 12 ».
Colonne droite : ADRESSE « 12 rue des Capucins / 69001 Lyon — Pentes de la Croix-Rousse » (lien
Google Maps) ; HORAIRES table pointillés dorés : Lundi **Fermé** (rouge) / Mardi — Dimanche
12 h – 14 h 30 / 19 h – 22 h 30 ; CONTACT tél + « @fiamma.lyon » ;
iframe Maps `https://www.google.com/maps?q=12+rue+des+Capucins+69001+Lyon&output=embed`,
hauteur 250px, radius 24px, `filter: grayscale(1) contrast(1.04)`, loading lazy.

## 10 · FOOTER (fond `--ink`, texte crème)
Filigrane : « Fiamma » serif italique `clamp(9rem,26vw,26rem)`, texte transparent,
`-webkit-text-stroke: 1px rgba(253,251,247,.09)`, centré, dépassant en bas (`bottom:-.34em`).
4 colonnes : logo + « Pizzeria napolitaine — pâte maturée 72 h, four à bois, produits DOP. » /
TROUVER (adresse, tél) / SUIVRE (Instagram → https://instagram.com/fiamma.lyon, Avis Google → #avis) /
LE RESTE (La carte, Réserver, Mentions légales). Ligne basse : « © 2026 Fiamma — Tous droits
réservés » · « Fait avec ❤️ à Lyon ».

---

# 4 · SCÈNE 3D (reproduction exacte)

Canvas `position:fixed inset:0 z-index:1 pointer-events:none` DERRIÈRE le contenu (sections z-index 2).
Renderer alpha, antialias sur desktop uniquement, `powerPreference:'high-performance'`,
`pixelRatio = min(devicePixelRatio, 1.75 desktop / 1.5 mobile)`, `outputEncoding = sRGBEncoding`.
Caméra perspective fov 35, position (0,0,5.6).

Lumières : Ambient 0xfff2e2 ×.78 ; Directionnelle clé 0xfff8ee ×.95 en (-2.4,1.8,3) ;
Directionnelle d'appoint 0xffe9d0 ×.28 en (2.6,-.6,2) ; PointLight « four » 0xff7a26,
intensité 0 (pilotée), distance 9, decay 1.8, position (1.5,-.3,1.6).

## La pizza
- Texture : dessiner `pizza-hero.jpg` (crossOrigin anonymous) dans un canvas 1024², puis
  `globalCompositeOperation='destination-in'` avec un dégradé radial centré : opaque jusqu'à
  r=0.80×(1024/2), fondu → transparent à r=0.875×(1024/2). CanvasTexture, anisotropy min(8,max).
- Dessus : `PlaneGeometry(PLANE, PLANE, SEG, SEG)` avec `PIZZA_R=1.55`, `PLANE=2*PIZZA_R/0.84`,
  `SEG=116` desktop / `72` mobile. Déplacement de chaque vertex avec `rn=hypot(x,y)/PIZZA_R`,
  si `rn≤1.08` : `z = 0.20*exp(-((rn-0.90)/0.105)²)` (croûte) `+ 0.055*max(0,1-rn²)` (dôme)
  `+ sin(13.7x+9.3y)*cos(7.1x−11.9y)*0.011` (grain, ×0.3 si rn>1). `computeVertexNormals()`.
  Matériau : MeshStandard, map=texture, transparent, roughness .82, emissive 0xff5a00 intensité 0.
- Tranche : cylindre ouvert (R×.985 haut, R×.9 bas, h .17, 96 seg) tourné face caméra, z −.085,
  couleur 0xe0aa6c roughness .92. Dessous : cercle R×.9 à z −.17, couleur 0xd9a25f.
- Ombre de contact : plane 4.4² avec CanvasTexture dégradé radial noir (rgba(28,20,10,.85)→0),
  z −.8, opacité .16, `depthWrite:false`, suit la pizza avec offset (+.35, −.55), scale = celle de la pizza.
- Flottement idle : position.x += sin(t×.6)×.02 ; position.y += sin(t×.9)×.035.
  Parallax souris (pointer fine) : rotation.x += −mouseY×.1 ; rotation.y = mouseX×.14.
  Rotation continue : rotation.z += spin×dt (spin de base .09 rad/s).

## Les toppings (n'existent QUE pendant l'explosion)
9 méshes dans le groupe pizza, chacun avec position « posée » (home) et position « orbite » (away) :
- 3 tranches de tomate : cylindre r .17 h .05 (24 seg) face caméra, matériaux [côté 0xb8261f,
  dessus 0xe0523c] ; home rayon .95, angles i·2π/3+.5 ; away rayon 2.0+.15i, z .45+.18i.
- 3 mozzarellas : sphère .155 aplatie (scale z .55), 0xf7f2e6 roughness .38 ; home rayon .55,
  angles +1.6 ; away 1.75+.2i, z −.35−.14i.
- 3 feuilles de basilic : plane .36×.22 (6×3 seg) incurvée `z=sin(u·π)·.07`, 0x2f7a40 DoubleSide,
  rotation z aléatoire ; home rayon 1.15, angles +2.7 ; away 2.25+.12i, z .3−.5i.
Par frame, pour le topping j : `e = smoothstep(clamp(explode*1.25 − j*0.022, 0, 1))` ;
position = lerp(home, away, e) ; **scale = max(.001, e)** et `visible = e>.02` (à l'état posé ils
sont invisibles — la photo suffit) ; rotation propre ∝ e (vitesse aléatoire ±.3–1) +
oscillation rotation.x = e·sin(t·.8+j)·.5.
Labels (desktop, pointer fine, explode>.4) : raycaster sur les toppings → tooltip HTML pilule ink
qui suit le curseur : « Tomates San Marzano DOP » / « Mozzarella di bufala » / « Basilic frais ».

## Brunissage au four
`topMat.color` : blanc → 0xc59468 lerpé par `brown` ; couleur de la tranche : 0xe0aa6c → 0x9c6337
(par brown×.9). `pulse = .5+.5sin(6.3t)+.22sin(13.1t)` ;
`topMat.emissiveIntensity = fire*(0.10+0.07*pulse)` ; `pointLight.intensity = fire*(1.5+.8*pulse)`.

---

# 5 · CHORÉGRAPHIE DE SCROLL — ARCHITECTURE « ÉCRIVAIN UNIQUE » (critique)

**Règle absolue : aucun tween GSAP n'écrit l'état 3D.** Des ScrollTriggers passifs (sondes) sont
créés, et une fonction `compute()` appelée à CHAQUE frame de la boucle de rendu recompose l'état
par chaînage de lerps depuis leurs `.progress`. (Des tweens scrub concurrents sur un même objet
s'écrasent mutuellement lors des sauts de scroll — c'est un bug, pas une option.)

Lenis : `duration 1.15`, easing `1.001−2^(−10t)`, branché sur `ScrollTrigger.update` +
`gsap.ticker` (lagSmoothing 0). Tout le reste en `scrub:1`.

Sondes (desktop) — `L(a,b,t)=a+(b−a)t`, `C(v)=clamp(v,0,1)` :
- `p1` : #histoire [top bottom → top top]
- `p2` : progression du PIN ingrédients [top top → += (scrollWidth−vw)], scrub 1, anticipatePin 1,
  qui anime aussi `x` du rail : 0 → −(scrollWidth−vw)
- `p3` : progression du PIN pâte [top top → +=160%] qui anime aussi le clip-path 16%→70.7%
  et le compteur (dans son onUpdate — seul écrivain du compteur)
- `p4` : #four [top bottom → top 15%] · `pf` : #four [top 70% → top 10%] ·
  `pb` : #four [top 40% → bottom 60%] · `p5` : #carte [top bottom → top 25%]

État par frame (DESKTOP) :
```
x  = L(1.42, 1.5, p1)   → L(x, −1.9, C(p2·1.15)) → L(x, −2.7, C((p3−.45)·1.9)) → L(x, 1.32, p4)
y  = L(−.08, .05, p1)   → L(y, −1.2, C(p2·1.4))  → L(y, −1.95, C((p3−.45)·1.9)) → L(y, −1.32, p4²) → L(y, −3.6, p5)
sc = L(.9, 1.04, p1)    → L(sc, .62, C(p2·1.6))  → L(sc, .52, p4) → L(sc, .4, p5)
rx = L(−.38, 0, p1)     → L(rx, −.2, p4)
explode  = C(p2·2.6) · (1 − C(p3·2.2))
spin     = .09 + p2·.12·(1−p3)
brown    = pb            fire = pf·(1−p5)
shadowOp = .16·(1−p5)    alpha = 1
```
Lecture narrative : héro incliné à droite → pivote à plat (p1) → descend en satellite bas-gauche
et EXPLOSE pendant le rail horizontal (p2) → les ingrédients reviennent puis elle sort par le coin
bas-gauche (p3) → remonte se nicher SOUS le cadre des flammes et brunit (p4, y en p4² pour passer
sous le pli) → tombe hors champ à la carte (p5).

MOBILE (<900px) : pas de pins (rail empilé ; sondes #ingredients [top 70% → bottom 60%] et
#pate [top 75% → bottom 70%]) ; `x=0` ;
`y = L(−1.35,−1.5,p1) → L(y,−1.4,p4) → L(y,−3.6,p5)` ;
`sc = L(.55,.45,p1) → L(sc,.5,p4) → L(sc,.4,p5)` ; **`alpha = L(1,.4,p1)`** appliquée en
opacité CSS du canvas (après le héro, la pizza devient un fond discret à 40 %).

Autres animations (créées **APRÈS** les pins, sinon leurs offsets ignorent les spacers ;
terminer par `ScrollTrigger.sort(); ScrollTrigger.refresh()`) :
- Reveals `[data-reveal]` : fromTo autoAlpha 0 / y 34 → 1.1s power3.out, start 'top 88%', une fois.
  (Exclure les éléments du rail horizontal sur desktop — les rendre visibles directement.)
- Fond du `<body>` (fromTo backgroundColor, immediateRender false, scrub 1, fenêtre
  [top 85% → top 15%] de chaque section) : #histoire cream→ivory · #pate ivory→cream ·
  #four cream→#EDE6D9 · #carte #EDE6D9→cream.
- Parallax ambiance : `yPercent −9→9` sur [top bottom → bottom top].
- Nav `.scrolled` au-delà de 40px.

## Préloader
Overlay crème z 10000 : compteur serif italique `clamp(4rem,12vw,9rem)` 0→100 (progression réelle
des 6 images + fontes, affichage lissé ×.14/frame) + libellé « FIAMMA — PIZZERIA NAPOLETANA · LYON ».
Sortie : fade du contenu (.5s power2.in, delay .25) → `clipPath: inset(0 0 100% 0)` 1.05s
expo.inOut → display none. Puis : chars du H1 (span par caractère, `yPercent:110, rotate:4` →
0, 1.15s expo.out, stagger .03, lignes en `overflow:hidden`) ; nav (y −16, .8s) et éléments
`[data-hero-fade]` (y 26, .9s, stagger .09) en power3.out.

## Vidéos
`muted playsinline loop preload="none" poster` + IntersectionObserver threshold .25 :
play à l'entrée (catch silencieux), pause à la sortie.

---

# 6 · ACCESSIBILITÉ, SEO, ROBUSTESSE

- `prefers-reduced-motion: reduce` : canvas et curseur cachés (CSS), image `pizza-hero.jpg`
  statique à droite du héro, clip-path pâte figé à 75%, compteur affiché à 72, AUCUN trigger créé,
  préloader masqué immédiatement, vidéos jamais lancées (posters visibles).
- Si WebGL indisponible : try/catch → même fallback image, le site reste complet.
- Landmarks `header/main/section/footer`, aria-labels sur les sections et le carrousel, `alt`
  descriptifs sur toutes les images, formulaire avec vrais `<label for>`, navigation clavier.
- `<title>` : « Fiamma — Pizzeria napolitaine à Lyon | Four à bois & pâte 72 h ». Meta description,
  OG (title/description/image/locale fr_FR), favicon SVG emoji 🍕 en data-URI.
- JSON-LD `Restaurant` : name Fiamma, streetAddress 12 rue des Capucins, postalCode 69001,
  addressLocality Lyon, addressCountry FR, geo 45.7712/4.8330, telephone +33478274512,
  servesCuisine [Pizza napolitaine, Cuisine italienne], priceRange €€, acceptsReservations True,
  openingHoursSpecification Tue–Sun 12:00–14:30 et 19:00–22:30, sameAs instagram.com/fiamma.lyon.
- `overflow-x: clip` sur body ; aucune barre de défilement horizontale à aucun breakpoint.

# 7 · CRITÈRES D'ACCEPTATION
1. Indistinguable de https://pizza-jade-ten.vercel.app/ (desktop 1280×800 et mobile 375×812).
2. 0 erreur console ; 60 fps sur laptop moyen (scène ≤ 15 draw calls).
3. Le scroll raconte : pâte → ingrédients → four → pizza → table, sans temps mort ni saut de caméra.
4. Un saut de scroll instantané (ancre, drag de scrollbar) laisse la scène dans l'état EXACT
   prévu pour cette position — aucun conflit d'animations (c'est le test de l'écrivain unique).
5. Fonctionne sur un serveur statique quelconque ; les assets se chargent depuis les URLs directes
   du manifeste (texture héro incluse, grâce à crossOrigin + CORS).

RESPONSIVE (obligatoire) : le site doit être entièrement responsive — il doit s'afficher et fonctionner correctement sur mobile, tablette et desktop, sans aucun défilement horizontal, quelle que soit la largeur d'écran.

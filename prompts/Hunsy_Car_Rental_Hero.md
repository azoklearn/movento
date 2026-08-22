Create a full-screen car rental hero section landing page. Follow every detail exactly.

PAGE SETUP
- Font family: 'Helvetica Neue', Helvetica, Arial, sans-serif; antialiased
- Page background: #ffffff; margin 0, padding 0
- Links: default color #111111, hover #666666, no underline
- Fully responsive (desktop + mobile); nav hidden below 900px width

BACKGROUND VIDEO (plays automatically, loops forever, NEVER stops)
- Fixed full-viewport layer: position fixed, inset 0, z-index 0, overflow hidden, background #04060b
- Video URL: https://cdn.sceneai.art/Hero%20section%20video%20file%20(2)/efcd1627-21df-4a73-ba9b-3ba7ac3a7f91.mp4
- Video attributes: autoplay, muted, loop, playsinline, preload="auto"; display block; width 100%; height 100%; object-fit cover
- The video must loop forever and NEVER stop. Add JS safeguards:
  - set video.loop = true in JS in addition to the loop attribute
  - on 'ended': set video.currentTime = 0 and call video.play()
  - on 'pause': immediately call video.play() again
  - on document 'visibilitychange' (tab becomes visible): call video.play()
- Dark overlay on top of video: absolute, inset 0, background rgba(4,6,11,0.35)
- All page content sits above it with position relative, z-index 1 — no white space anywhere, video fills edge to edge

PRELOADER
- Fixed, inset 0, z-index 60, background #04060b, centered text
- Text: buffered percentage "NN%" — 13px, letter-spacing 0.25em, uppercase, weight 600, color #b9cdea
- Percentage = video buffered end / duration (from 'progress' events)
- Fades out (opacity 1→0, 0.6s) + pointer-events none on video 'canplaythrough', with a 6s fallback timer

HEADER (over the video)
- Layout: flex, space-between, align center, gap 16px
- Padding: clamp(14px, 2.4vw, 26px) vertical, clamp(20px, 2.8vw, 42px) horizontal
- Logo left: "HUNSY" — clamp(20px, 2vw, 24px), weight 600, letter-spacing -0.02em, color #ffffff
- Nav centered (absolute, left 50%, translateX(-50%)), gap clamp(28px, 3.5vw, 56px), desktop only (≥900px)
  - 4 items, each 14px, color rgba(255,255,255,0.85), hover #ffffff:
    Fleet (#fleet), Pricing (#pricing), How It Works (#how-it-works), Contact (#contact)
- Right: "Ask on WhatsApp" glassy button (links to https://wa.me/971501234567)
  - background rgba(255,255,255,0.12); backdrop-filter blur(16px) saturate(160%)
  - border 1px solid rgba(255,255,255,0.35)
  - box-shadow: inset 0 1px 0 rgba(255,255,255,0.4), 0 4px 16px rgba(0,0,0,0.15)
  - color #ffffff; border-radius 12px; padding 10px 18px; font-size 14px; weight 500; nowrap
  - hover background rgba(255,255,255,0.24)

HERO CONTENT (bottom of viewport; hero fills 100vh)
- Bottom row: flex, wrap, align-items flex-end, justify-content space-between
- Gap clamp(24px, 4vw, 64px); padding 0 clamp(20px, 2.8vw, 42px) clamp(32px, 5vh, 56px)
  (left/right padding identical to header so everything lines up)

LEFT GROUP (bottom-left, left-aligned, min-width min(100%, 380px))
1) Happy renters badge — flex row, gap 14px, margin-bottom clamp(18px, 2.6vh, 28px)
   - 5 overlapping avatars: each clamp(30px, 2.6vw, 38px) circle, border 2px solid rgba(255,255,255,0.9), object-fit cover, overlap margin-left -12px (except first)
   - Avatar URLs in order:
     https://cdn.sceneai.art/Only%20man%20image/42b82183-3b58-4a03-8e82-ca8b4bea698e.png
     https://cdn.sceneai.art/Only%20man%20image/f042bdf5-73ea-4715-9b9b-6e1e9576119c.png
     https://cdn.sceneai.art/Only%20man%20image/11790acc-96cb-44c9-8fa0-a95192bc1e93.png
     https://cdn.sceneai.art/Only%20man%20image/0ccd6017-25fc-493b-abdf-321915dde101.jpg
     https://cdn.sceneai.art/Only%20man%20image/7e1339ef-7a01-4979-93c8-21d97af291ee.webp
   - Label: "2,500+ Happy Renters" — clamp(15px, 1.3vw, 18px), weight 400, #ffffff
   - Entrance: fade+rise 0.7s cubic-bezier(0.22,1,0.36,1), delay 0.15s
2) Main headline (h1): "Rent Premium Cars" line break "Without the Hassle"
   - font-size clamp(27px, 4.2vw, 56px); weight 500; letter-spacing -0.035em; line-height 1.04; color #ffffff
   - Each word animates in one by one: fade + translateY(26px)→0, 0.8s cubic-bezier(0.22,1,0.36,1), delays 0.30s / 0.40s / 0.50s / 0.60s / 0.70s / 0.80s

RIGHT GROUP (bottom-right, width min(100%, 480px), margin-left auto so its right edge aligns with the Ask on WhatsApp button; content left-aligned)
1) Secondary text (16 words): "Choose from our luxury fleet, book instantly, and get your car delivered anywhere in Dubai fast."
   - clamp(15px, 1.2vw, 18px); weight 400; line-height 1.5; color rgba(255,255,255,0.88); margin-bottom clamp(22px, 3.6vh, 36px)
   - Each word fades in one by one: 0.6s ease-out, starting 1.00s, +0.05s per word
2) "Explore Fleet" button (links to #how-it-works)
   - background #ffffff; color #111111; border-radius 12px; padding 15px 26px
   - font-size clamp(15px, 1.2vw, 17px); weight 500; hover background #ededed
   - Entrance: fade + translateY(14px)→0, 0.7s cubic-bezier(0.22,1,0.36,1), delay 1.55s

ANIMATION KEYFRAMES
- wordIn: from { opacity 0; translateY(26px) } to { opacity 1; translateY(0) }
- softIn: from { opacity 0; translateY(14px) } to { opacity 1; translateY(0) }

NOTES
- Page contains only this hero section — nothing else
- No white space at top, bottom, left, or right; video is the background for everything
- On mobile the two bottom groups stack vertically, all content remains left-aligned

RESPONSIVE (required): the site must be fully responsive — it has to display and work correctly on mobile, tablet and desktop, with no horizontal scrolling at any screen width.

Build me a React + Vite + TypeScript + Tailwind CSS v4 website. This is a dark-themed spatial-scrolling 4-section glass card showcase. The page background is #0a0d15. Each section is a 100vw x 100vh full-screen view containing a single large card (1040x684 native pixels, scaled proportionally). On desktop, scrolling (wheel) pans a 200vw x 200vh canvas in a clockwise loop: Section 1 (top-left) to Section 2 (top-right, offset 74vw) to Section 3 (bottom-right, offset 74vw / 82vh) to Section 4 (bottom-left, offset 82vh) and back to 1. On mobile (less than or equal to 1024px), the 4 sections are stacked vertically with CSS scroll-snap-type: y mandatory. Use framer-motion for all animations.

Install these npm dependencies: react, react-dom, framer-motion, tailwindcss (v4), @tailwindcss/vite, @fontsource-variable/dm-sans.

Below is a summary of every file, every component, every inline SVG icon, every animation, every style token, and every asset reference. Where behavior is complex, exact code is provided. CRITICAL: All image assets MUST be sourced strictly via direct cloud links. Base URL: `https://qclay.design/lovable/glass-menu/[filename]`. СТРОГО ЗАПРЕЩЕНО добавлять /assets/ в URL! You are STRICTLY FORBIDDEN from creating your own placeholders, colored rectangles, SVGs (unless code is provided), or using empty `<img>` tags. You must use the exact direct URLs provided.

---

FONTS

1. "Plus Jakarta Display" -- a custom font loaded via @font-face from /fonts/plus-jakarta-display-regular.otf (weight normal, format opentype). This is the display/heading font. You can substitute Google Font "Plus Jakarta Sans" weight 300 as an approximation if the OTF is unavailable.
2. "DM Sans Variable" -- loaded via the npm package @fontsource-variable/dm-sans. This is the body/UI font.

In Tailwind v4 @theme block, define:
--font-jakarta: "Plus Jakarta Display", "Plus Jakarta Sans", "Georgia", serif;
--font-aeonik: "DM Sans Variable", "DM Sans", system-ui, sans-serif;

---

GLOBAL CSS (index.css)

@import "tailwindcss";
@import "@fontsource-variable/dm-sans";

@font-face {
  font-family: "Plus Jakarta Display";
  src: url("/fonts/plus-jakarta-display-regular.otf") format("opentype");
  font-weight: normal;
}

@theme {
  --font-jakarta: "Plus Jakarta Display", "Plus Jakarta Sans", "Georgia", serif;
  --font-aeonik: "DM Sans Variable", "DM Sans", system-ui, sans-serif;
}

* { box-sizing: border-box; }
body { margin: 0; overflow-x: hidden; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; cursor: url('https://qclay.design/lovable/glass-menu/Cursur.svg') 16 16, auto; }
#root { width: 100%; }

---

FILE STRUCTURE

src/main.tsx -- React entry, renders <App />
src/App.tsx -- renders <SpatialScroll />
src/index.css -- global styles above
src/hooks/useIsMobile.ts -- custom hook
src/BlurFadeWords.tsx -- word-by-word blur fade animation component
src/SpatialScroll.tsx -- spatial scroll container
src/sections/AnimatedNetworkLines.tsx -- animated SVG network lines
src/sections/Section1Productivity.tsx -- Section 1
src/sections/Section2.tsx -- Section 2
src/sections/Section3.tsx -- Section 3
src/sections/Section4.tsx -- Section 4
public/assets/ -- 63 image and SVG files (listed below)
public/fonts/plus-jakarta-display-regular.otf

---

HOOK: useIsMobile.ts

```tsx
import { useState, useEffect } from 'react'

export function useIsMobile(breakpoint = 1024) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= breakpoint : false
  )

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`)
    const update = () => setIsMobile(mq.matches)
    mq.addEventListener('change', update)
    update()
    return () => mq.removeEventListener('change', update)
  }, [breakpoint])

  return isMobile
}
```

---

COMPONENT: BlurFadeWords.tsx

This component splits text into words and animates each word individually. Each word starts with opacity 0 and filter blur(8px), then animates to opacity 1 and blur(0px). Each word is delayed by baseDelay + index * 0.07 seconds, duration 0.5s, ease easeOut. Words are displayed inline-block with marginRight 0.3em between them. Accepts an optional wordStyle CSSProperties to style individual words (used for gradient text).

```tsx
import { motion } from 'framer-motion'
import type { CSSProperties } from 'react'

export function BlurFadeWords({
  text,
  baseDelay = 0,
  isInView = true,
  wordStyle,
}: {
  text: string
  baseDelay?: number
  isInView?: boolean
  wordStyle?: CSSProperties
}) {
  const words = text.split(' ')
  return (
    <>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, filter: 'blur(8px)' }}
          animate={{
            opacity: isInView ? 1 : 0,
            filter: isInView ? 'blur(0px)' : 'blur(8px)',
          }}
          transition={{
            delay: isInView ? baseDelay + i * 0.07 : 0,
            duration: 0.5,
            ease: 'easeOut',
          }}
          style={{
            display: 'inline-block',
            marginRight: i < words.length - 1 ? '0.3em' : 0,
            ...wordStyle,
          }}
        >
          {word}
        </motion.span>
      ))}
    </>
  )
}
```

---

COMPONENT: AnimatedWords (used inside Section 1, 2, 3 -- a simpler variant without blur)

This is a local helper inside sections. Each word fades in with opacity 0 to 1, delay baseDelay + i * 0.1, duration 0.4s, ease easeOut. Display inline. Words are separated by spaces in the text output.

```tsx
function AnimatedWords({ text, baseDelay = 0, isInView }: {
  text: string
  baseDelay?: number
  isInView: boolean
}) {
  const words = text.split(' ')
  return (
    <>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: isInView ? 1 : 0 }}
          transition={{ delay: baseDelay + i * 0.1, duration: 0.4, ease: 'easeOut' }}
          style={{ display: 'inline' }}
        >
          {word}{i < words.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </>
  )
}
```

---

COMPONENT: SpatialScroll.tsx

The core navigation container. On desktop (width > 1024), it renders a 200vw x 200vh motion.div inside a 100vw x 100vh overflow-hidden container. Four sections are absolutely positioned:
- Section 1: top 0, left 0, 100vw x 100vh
- Section 2: top 0, left 74vw, 100vw x 100vh
- Section 3: top 82vh, left 74vw, 100vw x 100vh
- Section 4: top 82vh, left 0, 100vw x 100vh

Navigation goes clockwise: 1 -> 2 -> 3 -> 4 -> 1 (loop). Wheel scroll with deltaY > 0 goes forward, < 0 goes backward (blocked until first full loop). Minimum deltaY threshold is 5. Animation uses framer-motion animate() with duration 0.85s, ease [0.76, 0, 0.24, 1]. After animation, a 950ms cooldown prevents re-triggering.

Position calculation: x = position.x * (window.innerWidth * 0.74), y = position.y * (window.innerHeight * 0.82).

On mobile, it renders a vertical scroll container with scroll-snap-type: y mandatory, each section wrapped in a div with scroll-snap-align: start, scroll-snap-stop: always, height 100vh. Background color #0a0d15.

Full code:

```tsx
import { useCallback, useEffect, useRef } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import { Section1Productivity } from './sections/Section1Productivity'
import { Section2 } from './sections/Section2'
import { Section3 } from './sections/Section3'
import { Section4 } from './sections/Section4'
import { useIsMobile } from './hooks/useIsMobile'

const SECTION_POSITIONS = [
  { x: 0, y: 0 },
  { x: -1, y: 0 },
  { x: -1, y: -1 },
  { x: 0, y: -1 },
]

export function SpatialScroll() {
  const isMobile = useIsMobile()
  const isPhone = useIsMobile(600)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sectionRef = useRef(0)
  const isAnimating = useRef(false)
  const hasLooped = useRef(false)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const posFor = useCallback((idx: number) => {
    const pos = SECTION_POSITIONS[idx]
    return {
      tx: pos.x * (window.innerWidth * 0.74),
      ty: pos.y * (window.innerHeight * 0.82),
    }
  }, [])

  const goTo = useCallback((idx: number) => {
    if (isAnimating.current) return
    isAnimating.current = true
    if (sectionRef.current === 3 && idx === 0) hasLooped.current = true
    const { tx, ty } = posFor(idx)
    animate(x, tx, { duration: 0.85, ease: [0.76, 0, 0.24, 1] })
    animate(y, ty, { duration: 0.85, ease: [0.76, 0, 0.24, 1] })
    sectionRef.current = idx
    setTimeout(() => { isAnimating.current = false }, 950)
  }, [x, y, posFor])

  useEffect(() => {
    if (isMobile) return
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (isAnimating.current) return
      if (Math.abs(e.deltaY) < 5) return
      const dir = e.deltaY > 0 ? 1 : -1
      if (!hasLooped.current && sectionRef.current === 0 && dir === -1) return
      goTo((sectionRef.current + dir + 4) % 4)
    }
    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [goTo, isMobile])

  useEffect(() => {
    if (isMobile) return
    let timer: ReturnType<typeof setTimeout>
    const handleResize = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        const { tx, ty } = posFor(sectionRef.current)
        x.set(tx)
        y.set(ty)
      }, 100)
    }
    window.addEventListener('resize', handleResize)
    return () => { window.removeEventListener('resize', handleResize); clearTimeout(timer) }
  }, [x, y, posFor, isMobile])

  useEffect(() => {
    if (isMobile) return
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0]
      touchStart.current = { x: t.clientX, y: t.clientY }
    }
    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return
      const t = e.changedTouches[0]
      const dx = touchStart.current.x - t.clientX
      const dy = touchStart.current.y - t.clientY
      touchStart.current = null
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)
      if (absDx < 50 && absDy < 50) return
      const dir = absDx >= absDy ? (dx > 0 ? 1 : -1) : (dy > 0 ? 1 : -1)
      if (!hasLooped.current && sectionRef.current === 0 && dir === -1) return
      goTo((sectionRef.current + dir + 4) % 4)
    }
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => { window.removeEventListener('touchstart', onTouchStart); window.removeEventListener('touchend', onTouchEnd) }
  }, [isMobile, goTo])

  if (isMobile) {
    const isTablet = !isPhone
    const snapSlot: React.CSSProperties = {
      height: '100vh',
      scrollSnapAlign: 'start',
      scrollSnapStop: 'always',
      overflow: 'hidden',
      paddingBottom: isTablet ? '36px' : 0,
    }
    return (
      <div ref={scrollContainerRef} style={{ width: '100vw', height: '100vh', overflowY: 'scroll', scrollSnapType: 'y mandatory', backgroundColor: '#0a0d15', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
        <div style={snapSlot}><Section1Productivity /></div>
        <div style={snapSlot}><Section2 /></div>
        <div style={snapSlot}><Section3 /></div>
        <div style={snapSlot}><Section4 /></div>
      </div>
    )
  }

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', backgroundColor: '#0a0d15' }}>
      <motion.div style={{ x, y, position: 'relative', width: '200vw', height: '200vh', willChange: 'transform' }}>
        <div style={{ position: 'absolute', top: '0', left: '0', width: '100vw', height: '100vh' }}><Section1Productivity /></div>
        <div style={{ position: 'absolute', top: '0', left: '74vw', width: '100vw', height: '100vh' }}><Section2 /></div>
        <div style={{ position: 'absolute', top: '82vh', left: '74vw', width: '100vw', height: '100vh' }}><Section3 /></div>
        <div style={{ position: 'absolute', top: '82vh', left: '0', width: '100vw', height: '100vh' }}><Section4 /></div>
      </motion.div>
    </div>
  )
}
```

---

SHARED PATTERN: MagicBorder Component (used in Section 1)

This creates an animated glowing border around a card using a conic-gradient mask trick. It uses a 2px padding with WebkitMask xor masking to only show the border ring. A large 250% x 250% conic gradient rotates infinitely inside.

```tsx
const MAGIC_BORDER_GREEN = 'conic-gradient(from 0deg, transparent 0%, transparent 35%, rgba(36,255,149,0.12) 42%, #24FF95 50%, rgba(36,255,149,0.12) 58%, transparent 65%, transparent 100%)'

function MagicBorder({ color, radius = '24px', reverse = false, duration = 4, initialAngle = 0, isInView = true }: { color: string; radius?: string; reverse?: boolean; duration?: number; initialAngle?: number; isInView?: boolean }) {
  const fromAngle = reverse ? -initialAngle : initialAngle
  const toAngle = fromAngle + (reverse ? -360 : 360)
  return (
    <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, borderRadius: radius, pointerEvents: 'none', overflow: 'hidden', zIndex: 60, padding: '2px', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }}>
      <motion.div
        style={{ position: 'absolute', left: '50%', top: '50%', width: '250%', height: '250%', background: color, x: '-50%', y: '-50%', transformOrigin: 'center center', filter: 'drop-shadow(0 0 5px rgba(36, 255, 149, 0.5)) drop-shadow(0 0 10px rgba(36, 255, 149, 0.3))', willChange: 'transform' }}
        animate={isInView ? { rotate: [fromAngle, toAngle] } : false}
        transition={{ repeat: Infinity, duration, ease: 'linear' }}
      />
    </div>
  )
}
```

Each section has its own color variant:
- Section 1 (Green): #24FF95, glow rgba(36,255,149,...)
- Section 2 (Purple): #906AFF, glow rgba(144,106,255,...)
- Section 3 (Blue): #4C6DFF, glow rgba(76,109,255,...)
- Section 4 (White): #ffffff, glow rgba(255,255,255,...)

The outer card MagicBorder uses duration 10 and initialAngle 180/270/0.

---

SHARED PATTERN: Section Card Container

CRITICAL: Each section MUST use this EXACT code for the container scaling to avoid clipping issues. Do not write your own logic, copy this scaling wrapper exactly (already included in the section code below):

```tsx
  const isMobile = useIsMobile()
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      setScale(w > 1024 ? Math.min(1, w / 1440, h / 900) : Math.max(0.28, (w - 24) / NATIVE_W))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  // ... (inside the section's return statement)
  return (
    <section
      ref={sectionRef}
      style={{
        width: '100vw',
        height: isMobile ? 'auto' : '100vh',
        ...(isMobile ? { minHeight: '100svh', backgroundColor: '#060b0d', overflow: 'hidden' } : {}),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        contain: 'layout style paint',
      }}
    >
      <div style={{
        position: 'relative',
        flexShrink: 0,
        width: NATIVE_W * scale,
        height: NATIVE_H * scale,
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: NATIVE_W,
          height: NATIVE_H,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}>
          {card}
        </div>
      </div>
    </section>
  )
```

---

SHARED PATTERN: Main Card Background

Each card has:
- borderRadius: 24px
- backgroundImage pointing to its section-specific background PNG (s1-main-card-bg.png, s2-card-bg.png, s3-card-bg.png, s4-card-bg.png)
- backgroundSize: 115%
- backgroundPosition: center
- overflow: hidden
- boxShadow: '0 0 0 1px rgba(129,209,189,0.01), 0 40px 120px rgba(0,0,0,0.75), 0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)'

A light overlay image (card-light-overlay.png or s3-card-light-overlay.png) is positioned absolute, covering the full card, objectFit cover, pointerEvents none, zIndex 999, with a colored drop-shadow filter matching the section accent.

---

COMPONENT: AnimatedNetworkLines.tsx

This is an SVG component (484x358 viewport, viewBox 0 0 593 453) with 30 path definitions forming a symmetrical fan/network pattern. Each path draws in with pathLength 0 to 1, delayed by 0.1 + i * 0.1 seconds, duration 1.9s, ease [0.25, 1, 0.5, 1]. Stroke color #272729, strokeWidth 1.55864. The first two paths (index 0 and 1) also have a glowing animated dot that travels along the path using SVG animateMotion, dur 4.5s, repeatCount indefinite. The dot is a circle with r=40 and radialGradient fill, masked to reveal the colored stroke (the section accent color) with strokeWidth 2.5 and drop-shadow glow. A glowing pill-shaped ellipse (the "hub") at center-left fades in at delay 1.1s to opacity 0.8 using a Gaussian blur filter. The color prop determines the accent color: green #24FF95, purple #906AFF, or blue #4C6DFF.

The SVG has a radial mask: radial-gradient(ellipse 65% 55% at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 75%) so edges fade out.

Full exact code for AnimatedNetworkLines:

```tsx
import { motion } from 'framer-motion'
import { useId } from 'react'

const sortedPaths = [
  "M126.227 198.56H309.396L356.076 143.247H659.502",
  "M126.227 245.363H309.396L356.076 300.676H659.502",
  "M126.227 184.377H303.307L348.153 129.064H639.646",
  "M126.227 259.546H303.307L348.153 314.859H639.646",
  "M126.227 170.194H297.22L340.229 114.881H619.79",
  "M-1.4187 273.729H297.22L340.229 329.042H619.79",
  "M-58.1501 156.011H291.132L332.305 100.698H599.934",
  "M-1.4187 287.912H291.133L332.305 343.225H599.934",
  "M-49.6404 141.828H277.364L320.373 86.5154H599.934",
  "M-7.0918 302.095H277.364L320.373 357.408H599.934",
  "M-60.9866 127.646H259.662L305.032 72.3326H599.935",
  "M-4.25513 316.278H259.662L305.032 371.591H599.934",
  "M-52.4771 113.463H245.893L293.098 58.1497H599.934",
  "M-9.92847 330.46H245.893L293.098 385.773H599.934",
  "M-62.405 99.28H229.175L278.609 43.9669H599.934",
  "M-5.67358 344.643H229.175L278.609 399.956H599.934",
  "M-56.7317 85.0971H213.44L264.972 29.784H599.935",
  "M-0.000488281 358.826H213.44L264.972 414.139H599.934",
  "M-62.405 70.9143H199.671L253.04 15.6012H599.934",
  "M-5.67358 373.009H199.671L253.04 428.322H599.934",
  "M-56.7317 56.7314H183.936L239.402 1.41829H599.935",
  "M-0.000488281 387.192H183.936L239.402 442.505H599.934",
  "M-52.4771 42.5486H167.217L224.913 -12.7646H599.934",
  "M-24.1113 401.375H167.217L224.913 456.688H599.934",
  "M-66.6597 28.3657H157.383L216.39 -26.9474L599.935 -26.9474",
  "M-38.2939 415.557H157.383L216.39 470.871H599.935",
  "M-55.3135 14.1829H145.581L206.162 -41.1303L599.935 -41.1302",
  "M-55.3135 429.74H145.581L206.162 485.054H599.935",
  "M-78.0061 -5.48363e-06H129.847L192.525 -55.3131H599.934",
  "M-78.0061 443.923H129.847L192.525 499.236H599.934",
]

export function AnimatedNetworkLines({ isInView, color = '#24FF95' }: { isInView: boolean; color?: string }) {
  const uid = useId()
  const glowId = `${uid}-glow`

  return (
    <svg width="484" height="358" viewBox="0 0 593 453" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', overflow: 'hidden',
        WebkitMaskImage: 'radial-gradient(ellipse 65% 55% at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 75%)',
        maskImage: 'radial-gradient(ellipse 65% 55% at center, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 75%)',
      }}
    >
      <defs>
        <filter id={glowId} x="17.6986" y="57.4109" width="280.88" height="283.716" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="59.2282" result="effect1_foregroundBlur_0_1" />
        </filter>
      </defs>

      {sortedPaths.map((d, i) => {
        const pathId = `${uid}-pp-${i}`
        const maskId = `${uid}-pm-${i}`
        const gradId = `${uid}-pg-${i}`
        const beginTime = i === 0 ? '2s' : '2.6s'
        return (
          <g key={i}>
            <motion.path d={d} stroke="#272729" strokeWidth="1.55864" strokeLinecap="round" fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={isInView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
              transition={isInView ? {
                pathLength: { delay: 0.1 + i * 0.1, duration: 1.9, ease: [0.25, 1, 0.5, 1] },
                opacity: { delay: 0.1 + i * 0.1, duration: 0.2 },
              } : { duration: 0 }}
            />
            {(i === 0 || i === 1) && (
              <>
                <defs>
                  <path id={pathId} d={d} />
                  <radialGradient id={gradId}>
                    <stop offset="0%" stopColor="white" stopOpacity="1" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                  </radialGradient>
                  <mask id={maskId}>
                    <circle r="40" fill={`url(#${gradId})`}>
                      <animateMotion dur="4.5s" repeatCount="indefinite" begin={beginTime} keyPoints="0;1;1" keyTimes="0;0.667;1" calcMode="linear">
                        <mpath href={`#${pathId}`} />
                      </animateMotion>
                      <animate attributeName="opacity" values="0;1;1;0;0" keyTimes="0;0.067;0.6;0.667;1" dur="4.5s" repeatCount="indefinite" begin={beginTime} />
                    </circle>
                  </mask>
                </defs>
                <path d={d} stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" mask={`url(#${maskId})`} style={{ filter: `drop-shadow(0 0 6px ${color})` }} />
              </>
            )}
          </g>
        )
      })}

      <motion.g filter={`url(#${glowId})`}
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.8 } : { opacity: 0 }}
        transition={isInView ? { delay: 1.1, duration: 0.8 } : { duration: 0 }}
      >
        <path d="M136.155 197.851C136.155 185.71 145.998 175.867 158.139 175.867C170.279 175.867 180.122 185.71 180.122 197.851V200.687C180.122 212.828 170.279 222.671 158.139 222.671C145.998 222.671 136.155 212.828 136.155 200.687V197.851Z" fill={color} />
      </motion.g>
    </svg>
  )
}
```

---

SECTION 1: PRODUCTIVITY
(Exact code for Section 1)
```tsx
import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { AnimatedNetworkLines } from './AnimatedNetworkLines'
import { useIsMobile } from '../hooks/useIsMobile'
import { BlurFadeWords } from '../BlurFadeWords'

function AnimatedWords({ text, baseDelay = 0, isInView }: {
  text: string
  baseDelay?: number
  isInView: boolean
}) {
  const words = text.split(' ')
  return (
    <>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: isInView ? 1 : 0 }}
          transition={{ delay: baseDelay + i * 0.1, duration: 0.4, ease: 'easeOut' }}
          style={{ display: 'inline' }}
        >
          {word}{i < words.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </>
  )
}

const MAGIC_BORDER_GREEN = 'conic-gradient(from 0deg, transparent 0%, transparent 35%, rgba(36,255,149,0.12) 42%, #24FF95 50%, rgba(36,255,149,0.12) 58%, transparent 65%, transparent 100%)'

function MagicBorder({ color, radius = '24px', reverse = false, duration = 4, initialAngle = 0, isInView = true }: { color: string; radius?: string; reverse?: boolean; duration?: number; initialAngle?: number; isInView?: boolean }) {
  const fromAngle = reverse ? -initialAngle : initialAngle
  const toAngle = fromAngle + (reverse ? -360 : 360)
  return (
    <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, borderRadius: radius, pointerEvents: 'none', overflow: 'hidden', zIndex: 60, padding: '2px', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }}>
      <motion.div
        style={{ position: 'absolute', left: '50%', top: '50%', width: '250%', height: '250%', background: color, x: '-50%', y: '-50%', transformOrigin: 'center center', filter: 'drop-shadow(0 0 5px rgba(36, 255, 149, 0.5)) drop-shadow(0 0 10px rgba(36, 255, 149, 0.3))', willChange: 'transform' }}
        animate={isInView ? { rotate: [fromAngle, toAngle] } : false}
        transition={{ repeat: Infinity, duration, ease: 'linear' }}
      />
    </div>
  )
}

const NATIVE_W = 1040
const NATIVE_H = 684

export function Section1Productivity() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isInView, setIsInView] = useState(false)
  const isMobile = useIsMobile()
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      setScale(w > 1024 ? Math.min(1, w / 1440, h / 900) : Math.max(0.28, (w - 24) / NATIVE_W))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    let wasVisible = false
    // On desktop, fire only when 92% visible (≈87% through the 0.85s pan, near completion).
    // Reset when section drops below 10% (diagonal corner of the 2×2 grid, ~4.7%).
    const enterRatio = isMobile ? 0.2 : 0.92
    const exitRatio = isMobile ? 0.05 : 0.1
    const obs = new IntersectionObserver(
      ([entry]) => {
        const ratio = entry.intersectionRatio
        if (entry.isIntersecting && ratio >= enterRatio && !wasVisible) {
          wasVisible = true
          setIsInView(true)
          } else if (!entry.isIntersecting || ratio < exitRatio) {
          wasVisible = false
          setIsInView(false)
        }
      },
      { threshold: [exitRatio, enterRatio] }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [isMobile])

  const card = (
    <div
      style={{
        position: 'relative',
        width: NATIVE_W,
        height: NATIVE_H,
        borderRadius: '24px',
        backgroundImage: 'url(/assets/s1-main-card-bg.png)',
        backgroundSize: '115%',
        backgroundPosition: 'center',
        overflow: 'hidden',
        boxShadow:
          '0 0 0 1px rgba(129,209,189,0.01), 0 40px 120px rgba(0,0,0,0.75), 0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      {/* LightsOfCard overlay */}
      <img
        src="/assets/card-light-overlay.png"
        alt=""
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          pointerEvents: 'none',
          zIndex: 999,
          filter: 'drop-shadow(0 0 50px rgba(36, 255, 149, 0.75))',
        }}
      />

      {/* ── Text block ── */}
      <div
        style={{
          position: 'absolute',
          top: '40px',
          left: '65px',
          width: '480px',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
          visibility: isInView ? 'visible' : 'hidden',
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: 48 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'relative', width: '320px', height: '80px', marginBottom: '25px', marginLeft: '-30px' }}
        >
          <img
            src="/assets/s1-notification-badge.svg"
            alt="01/03"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center', display: 'block' }}
          />
          <div style={{
            position: 'absolute', width: '155px', height: '155px',
            top: '50%', left: '44px', transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(36,255,149,0.10) 0%, rgba(36,255,149,0) 70%)',
            pointerEvents: 'none', borderRadius: '50%',
          }} />
        </motion.div>

        <h1
          style={{
            fontFamily: 'var(--font-jakarta)',
            fontSize: '60px',
            fontWeight: 300,
            lineHeight: 1.05,
            letterSpacing: '-1.5px',
            color: '#ffffff',
            margin: 0,
            marginBottom: '6px',
            overflow: 'visible',
          }}
        >
          <BlurFadeWords text="Productivity" baseDelay={0.5} isInView={isInView} />
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-jakarta)',
            fontSize: '36px',
            fontWeight: 300,
            lineHeight: 1.18,
            letterSpacing: '-0.6px',
            margin: 0,
            marginBottom: '18px',
            overflow: 'visible',
          }}
        >
          <BlurFadeWords
            text="ai/SmartSolution"
            baseDelay={0.8}
            isInView={isInView}
            wordStyle={{
              background: 'linear-gradient(180deg, #9BFFCF 0%, #24FF95 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          />
        </p>

        <p
          style={{
            fontFamily: 'var(--font-jakarta)',
            fontSize: '19px',
            fontWeight: 300,
            lineHeight: 1.3,
            letterSpacing: '-0.2px',
            color: 'rgba(255,255,255,0.6)',
            margin: 0,
            maxWidth: '400px',
            overflow: 'visible',
          }}
        >
          <BlurFadeWords text="Give teams the context needed to make" baseDelay={1.1} isInView={isInView} />
          <br />
          <BlurFadeWords text="quick decisions while staying aligned." baseDelay={1.45} isInView={isInView} />
        </p>
      </div>

      {/* ── Diagram block ── */}
      <div
        style={{
          position: 'absolute',
          left: '35px',
          bottom: '-25px',
          width: '570px',
          height: '358px',
          zIndex: 10,
        }}
      >
        <AnimatedNetworkLines isInView={isInView} color="#24FF95" />

        <motion.img
          src="/assets/asterisk-button.svg"
          alt=""
          initial={{ rotate: 0, opacity: 0 }}
          animate={isInView ? { rotate: [0, 14, 0], opacity: 1 } : { rotate: 0, opacity: 0 }}
          transition={{
            rotate: { delay: 0.1, duration: 1.1, ease: [0.45, 0, 0.55, 1] },
            opacity: { delay: 0.1, duration: 0.7, ease: 'easeOut' },
          }}
          style={{
            position: 'absolute',
            width: '85px', height: '85px',
            left: '48px', top: '134px',
            objectFit: 'contain',
            objectPosition: 'center calc(60% + 2px)',
            backdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(160,160,160,0.1)',
            borderRadius: '20px',
            padding: '1px',
            boxSizing: 'border-box',
          }}
        />

        <motion.img
          src="/assets/discord-button.svg"
          alt=""
          initial={{ scale: 0, rotate: -180, y: -20 }}
          animate={isInView ? { scale: 1, rotate: 0, y: 0 } : { scale: 0, rotate: -180, y: -20 }}
          transition={isInView ? { delay: 2.0, duration: 0.8, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
          style={{
            position: 'absolute',
            width: '85px', height: '85px',
            left: '375px', top: '64px',
            objectFit: 'contain',
            objectPosition: 'center calc(50% + 2px)',
            backdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(160,160,160,0.1)',
            borderRadius: '20px',
            padding: '1px',
            boxSizing: 'border-box',
          }}
        />

        <motion.img
          src="/assets/slack-button.svg"
          alt=""
          initial={{ scale: 0, rotate: -180, y: -20 }}
          animate={isInView ? { scale: 1, rotate: 0, y: 0 } : { scale: 0, rotate: -180, y: -20 }}
          transition={isInView ? { delay: 2.35, duration: 0.8, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
          style={{
            position: 'absolute',
            width: '85px', height: '85px',
            left: '380px', top: '193px',
            objectFit: 'contain',
            objectPosition: 'center calc(50% + 2px)',
            backdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(160,160,160,0.1)',
            borderRadius: '20px',
            padding: '1px',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Right half */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: '-1%',
          width: '50%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '6px 0 6px 73px',
          boxSizing: 'border-box',
          perspective: '1200px',
        }}
      >
        {/* Top card */}
        <div style={{ flex: 0.93, position: 'relative', overflow: 'hidden' }}>
          <motion.div
            initial={{ opacity: 0, x: -200, rotateY: -90, scale: 0.8 }}
            animate={isInView ? { opacity: 1, x: 0, rotateY: 0, scale: 1 } : { opacity: 0, x: -200, rotateY: -90, scale: 0.8 }}
            transition={isInView ? { type: 'spring', stiffness: 32, damping: 22, mass: 1.2 } : { duration: 0 }}
            style={{
              width: '100.5%',
              height: '100.5%',
              marginTop: '-0.25%',
              marginLeft: '-0.25%',
              borderRadius: '24px',
              backgroundImage: 'url(/assets/s1-top-card-bg.png)',
              backgroundSize: '100% 100%',
              overflow: 'hidden',
              position: 'relative',
              transformOrigin: 'center center',
              boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.01)',
            }}
          >
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '-70px', right: 0, pointerEvents: 'none' }}>
              <img
                src="/assets/s1-top-card-header.png"
                alt=""
                style={{
                  position: 'absolute',
                  top: '1.5px',
                  left: '50%',
                  transform: 'translateX(calc(-50% + 30px))',
                  width: '90%', height: 'auto',
                  pointerEvents: 'none',
                  filter: 'grayscale(1) sepia(1) hue-rotate(116deg) saturate(1.8) brightness(1.1)',
                }}
              />
              <div style={{ position: 'absolute', top: -50, left: '50%', transform: 'translateX(calc(-50% + 35px))', width: '80%', height: '100%', pointerEvents: 'none' }}>
                <motion.img
                  src="/assets/s1-top-card-light.png"
                  alt=""
                  initial={{ opacity: 0, y: -100 }}
                  animate={isInView ? { opacity: 0.5, y: 0 } : { opacity: 0, y: -100 }}
                  transition={isInView ? {
                    opacity: { duration: 0.8, ease: 'easeOut', delay: 0.2 },
                    y: { duration: 1.4, ease: [0.45, 0, 0.55, 1], delay: 0.2 },
                  } : { duration: 0 }}
                  style={{
                    width: '100%', height: '100%',
                    objectFit: 'contain',
                    objectPosition: 'top center',
                    pointerEvents: 'none',
                    transformOrigin: '50% 0%',
                    filter: 'drop-shadow(0 0 60px rgba(36, 255, 149, 0.7)) drop-shadow(0 0 30px rgba(36, 255, 149, 0.5))',
                  }}
                />
              </div>

              <div style={{ position: 'absolute', top: '-5px', left: 'calc(59% - 10px)', transform: 'translate(-50%, -50%)', marginTop: '4px', pointerEvents: 'auto' }}>
                <div style={{ width: '54px', height: '54px', borderRadius: '50%', overflow: 'hidden' }}>
                  <img src="/assets/avatar-man-top.png" alt="" style={{ width: '100%', height: 'calc(100% + 15px)', objectFit: 'cover', marginTop: '15px' }} />
                </div>
              </div>

              {/* Outer orbit */}
              <motion.div
                style={{ position: 'absolute', inset: 0, transformOrigin: 'calc(59% - 10px) 13.5px', willChange: 'transform' }}
                initial={{ rotate: 180 }}
                animate={isInView ? { rotate: 0 } : { rotate: 180 }}
                transition={isInView ? { duration: 2.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 } : { duration: 0 }}
              >
                <div style={{ position: 'absolute', top: 'calc(37% - 20px)', left: 'calc(22% + 10px)', transform: 'translate(-50%,-50%)', pointerEvents: 'auto' }}>
                  <motion.div initial={{ rotate: -180, opacity: 0 }} animate={isInView ? { rotate: 0, opacity: 1 } : { rotate: -180, opacity: 0 }} transition={isInView ? { duration: 2.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 } : { duration: 0 }} style={{ width: '34px', height: '34px', borderRadius: '50%', backdropFilter: 'blur(12px)', backgroundColor: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src="/assets/github-icon.svg" alt="" style={{ width: '16px', height: '16px' }} />
                  </motion.div>
                </div>
                <div style={{ position: 'absolute', top: 'calc(55% - 0px)', left: 'calc(32% + 13px)', transform: 'translate(-50%,-50%)', pointerEvents: 'auto' }}>
                  <motion.div initial={{ rotate: -180, opacity: 0 }} animate={isInView ? { rotate: 0, opacity: 1 } : { rotate: -180, opacity: 0 }} transition={isInView ? { duration: 2.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 } : { duration: 0 }} style={{ width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden' }}>
                    <img src="/assets/avatar-woman-1.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </motion.div>
                </div>
                <div style={{ position: 'absolute', top: 'calc(66% - -2px)', left: '54%', transform: 'translate(-50%,-50%)', pointerEvents: 'auto' }}>
                  <motion.div initial={{ rotate: -180, opacity: 0 }} animate={isInView ? { rotate: 0, opacity: 1 } : { rotate: -180, opacity: 0 }} transition={isInView ? { duration: 2.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 } : { duration: 0 }} style={{ width: '44px', height: '44px', borderRadius: '50%', overflow: 'hidden' }}>
                    <img src="/assets/avatar-woman-2.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </motion.div>
                </div>
                <div style={{ position: 'absolute', top: 'calc(56% - -3px)', left: '75%', transform: 'translate(-50%,-50%)', pointerEvents: 'auto' }}>
                  <motion.div initial={{ rotate: -180, opacity: 0 }} animate={isInView ? { rotate: 0, opacity: 1 } : { rotate: -180, opacity: 0 }} transition={isInView ? { duration: 2.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 } : { duration: 0 }} style={{ width: '54px', height: '54px', borderRadius: '50%', overflow: 'hidden' }}>
                    <img src="/assets/avatar-woman-3.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </motion.div>
                </div>
              </motion.div>

              {/* Middle orbit */}
              <motion.div
                style={{ position: 'absolute', inset: 0, transformOrigin: 'calc(59% - 10px) 13.5px', willChange: 'transform' }}
                initial={{ rotate: -180 }}
                animate={isInView ? { rotate: 0 } : { rotate: -180 }}
                transition={isInView ? { duration: 2.4, ease: [0.16, 1, 0.3, 1], delay: 0.4 } : { duration: 0 }}
              >
                <div style={{ position: 'absolute', top: 'calc(26% - 25px)', left: 'calc(86% - 9px)', transform: 'translate(-50%,-50%)', pointerEvents: 'auto' }}>
                  <motion.div initial={{ rotate: 180, opacity: 0 }} animate={isInView ? { rotate: 0, opacity: 1 } : { rotate: 180, opacity: 0 }} transition={isInView ? { duration: 2.4, ease: [0.16, 1, 0.3, 1], delay: 0.4 } : { duration: 0 }} style={{ width: '34px', height: '34px', borderRadius: '50%', backdropFilter: 'blur(12px)', backgroundColor: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src="/assets/widget-box-icon.svg" alt="" style={{ width: '16px', height: '16px' }} />
                  </motion.div>
                </div>
              </motion.div>

              {/* Inner orbit */}
              <motion.div
                style={{ position: 'absolute', inset: 0, transformOrigin: 'calc(59% - 10px) 13.5px', willChange: 'transform' }}
                initial={{ rotate: 180 }}
                animate={isInView ? { rotate: 0 } : { rotate: 180 }}
                transition={isInView ? { duration: 2.4, ease: [0.16, 1, 0.3, 1], delay: 0.6 } : { duration: 0 }}
              >
                <div style={{ position: 'absolute', top: 'calc(27% - 20px)', left: 'calc(36% + 9px)', transform: 'translate(-50%,-50%)', pointerEvents: 'auto' }}>
                  <motion.div initial={{ rotate: -180, opacity: 0 }} animate={isInView ? { rotate: 0, opacity: 1 } : { rotate: -180, opacity: 0 }} transition={isInView ? { duration: 2.4, ease: [0.16, 1, 0.3, 1], delay: 0.6 } : { duration: 0 }} style={{ width: '46px', height: '46px', borderRadius: '50%', overflow: 'hidden' }}>
                    <img src="/assets/avatar-man-1.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </motion.div>
                </div>
                <div style={{ position: 'absolute', top: 'calc(42% - 36px)', left: 'calc(56% + 5px)', transform: 'translate(-50%,-50%)', pointerEvents: 'auto' }}>
                  <motion.div initial={{ rotate: -180, opacity: 0 }} animate={isInView ? { rotate: 0, opacity: 1 } : { rotate: -180, opacity: 0 }} transition={isInView ? { duration: 2.4, ease: [0.16, 1, 0.3, 1], delay: 0.6 } : { duration: 0 }} style={{ width: '76px', height: '76px', borderRadius: '50%', overflow: 'hidden' }}>
                    <img src="/assets/avatar-man-2.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </motion.div>
                </div>
                <div style={{ position: 'absolute', top: 'calc(21% - 30px)', left: 'calc(75% - 6px)', transform: 'translate(-50%,-50%)', pointerEvents: 'auto' }}>
                  <motion.div initial={{ rotate: -180, opacity: 0 }} animate={isInView ? { rotate: 0, opacity: 1 } : { rotate: -180, opacity: 0 }} transition={isInView ? { duration: 2.4, ease: [0.16, 1, 0.3, 1], delay: 0.6 } : { duration: 0 }} style={{ width: '42px', height: '42px', borderRadius: '50%', overflow: 'hidden' }}>
                    <img src="/assets/avatar-man-bottom.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </motion.div>
                </div>
              </motion.div>
            </div>

            <div style={{ position: 'absolute', left: '30px', bottom: '38px' }}>
              <h3 style={{ fontFamily: 'var(--font-aeonik)', fontSize: '24px', fontWeight: 300, color: 'rgba(255,255,255,0.8)', margin: 0, marginBottom: '6px', letterSpacing: '-0.4px' }}>
                <AnimatedWords text="Create a Team" baseDelay={0.8} isInView={isInView} />
              </h3>
              <p style={{ fontFamily: 'var(--font-aeonik)', fontSize: '14px', fontWeight: 300, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.4 }}>
                <AnimatedWords text="Whether you're leading a project, organising a event" baseDelay={1.05} isInView={isInView} />
              </p>
            </div>

            <MagicBorder color={MAGIC_BORDER_GREEN} radius="24px" isInView={isInView} />
          </motion.div>
        </div>

        {/* Bottom card */}
        <div style={{ flex: 1.07, overflow: 'hidden' }}>
          <motion.div
            initial={{ opacity: 0, x: 200, rotateY: 90, scale: 0.8 }}
            animate={isInView ? { opacity: 1, x: 0, rotateY: 0, scale: 1 } : { opacity: 0, x: 200, rotateY: 90, scale: 0.8 }}
            transition={isInView ? { type: 'spring', stiffness: 32, damping: 22, mass: 1.2, delay: 0.15 } : { duration: 0 }}
            style={{
              width: '100.5%',
              height: '100.5%',
              marginTop: '-0.25%',
              marginLeft: '-0.25%',
              borderRadius: '24px',
              backgroundImage: 'url(/assets/s1-bottom-card-bg.png)',
              backgroundSize: '100% 100%',
              overflow: 'hidden',
              position: 'relative',
              transformOrigin: 'center center',
              boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.01)',
            }}
          >
            <div style={{ position: 'absolute', top: '24px', left: '86px', right: '24px', marginBottom: '7px' }}>
              <h3 style={{ fontFamily: 'var(--font-aeonik)', fontSize: '22px', fontWeight: 300, color: 'rgba(255,255,255,0.8)', margin: 0, letterSpacing: '-0.4px' }}>Personal Performance</h3>
            </div>

            <motion.img
              src="/assets/crypto-chart.svg"
              alt=""
              initial={{ clipPath: 'inset(0% 100% 0% 0%)' }}
              animate={isInView ? { clipPath: 'inset(0% 0% 0% 0%)' } : { clipPath: 'inset(0% 100% 0% 0%)' }}
              transition={isInView ? { delay: 0.9, duration: 1.5, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
              style={{ position: 'absolute', bottom: '48px', left: '25px', width: '390px', height: 'auto', pointerEvents: 'none' }}
            />

            <motion.div
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : { scale: 0 }}
              transition={isInView ? { delay: 1.4, duration: 0.55, ease: [0.34, 1.56, 0.64, 1] } : { duration: 0 }}
              style={{ position: 'absolute', bottom: '15px', left: '35px', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <img src="/assets/zap-icon.svg" alt="" style={{ width: '16px', height: '16px' }} />
              <span style={{ fontFamily: 'var(--font-aeonik)', fontSize: '14px', fontWeight: 400, color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap' }}>Generate Custom</span>
            </motion.div>



            <div style={{ position: 'absolute', top: '105px', left: '20px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {[{ label: 'Weekly', border: '#868686' }, { label: 'Finance', border: '#868686' }, { label: 'Food', border: '#2B2B2B' }, { label: 'Works', border: '#2B2B2B' }, { label: 'Shopping', border: '#2B2B2B' }].map(({ label, border }, i) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isInView ? 1 : 0 }}
                  transition={{ delay: 0.9 + i * 0.13, duration: 0.45, ease: 'easeOut' }}
                  style={{ padding: '6px 14px', borderRadius: '999px', border: `1px solid ${border}`, fontFamily: 'var(--font-aeonik)', fontSize: '13px', fontWeight: 400, color: 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap' }}
                >
                  {label}
                </motion.div>
              ))}
            </div>

            <MagicBorder color={MAGIC_BORDER_GREEN} radius="24px" reverse isInView={isInView} />
          </motion.div>
        </div>
      </div>
      <MagicBorder color={MAGIC_BORDER_GREEN} radius="24px" duration={10} initialAngle={180} isInView={isInView} />
    </div>
  )

  return (
    <section
      ref={sectionRef}
      style={{
        width: '100vw',
        height: isMobile ? 'auto' : '100vh',
        ...(isMobile ? { minHeight: '100svh', backgroundColor: '#060b0d', overflow: 'hidden' } : {}),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        contain: 'layout style paint',
      }}
    >
      <div style={{
        position: 'relative',
        flexShrink: 0,
        width: NATIVE_W * scale,
        height: NATIVE_H * scale,
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: NATIVE_W,
          height: NATIVE_H,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}>
          {card}
        </div>
      </div>
    </section>
  )
}

```

---

SECTION 2: FLEXIBILITY
(Exact code for Section 2)
```tsx
import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { AnimatedNetworkLines } from './AnimatedNetworkLines'
import { useIsMobile } from '../hooks/useIsMobile'
import { BlurFadeWords } from '../BlurFadeWords'

function AnimatedWords({ text, baseDelay = 0, isInView }: {
  text: string
  baseDelay?: number
  isInView: boolean
}) {
  const words = text.split(' ')
  return (
    <>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: isInView ? 1 : 0 }}
          transition={{ delay: baseDelay + i * 0.1, duration: 0.4, ease: 'easeOut' }}
          style={{ display: 'inline' }}
        >
          {word}{i < words.length - 1 ? ' ' : ''}
        </motion.span>
      ))}
    </>
  )
}

const MAGIC_BORDER_PURPLE = 'conic-gradient(from 0deg, transparent 0%, transparent 35%, rgba(144,106,255,0.12) 42%, #906AFF 50%, rgba(144,106,255,0.12) 58%, transparent 65%, transparent 100%)'

const NATIVE_W = 1040
const NATIVE_H = 684

export function Section2() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isInView, setIsInView] = useState(false)
  const isMobile = useIsMobile()
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      setScale(w > 1024 ? Math.min(1, w / 1440, h / 900) : Math.max(0.28, (w - 24) / NATIVE_W))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    let wasVisible = false
    const enterRatio = isMobile ? 0.2 : 0.92
    const exitRatio = isMobile ? 0.05 : 0.1
    const obs = new IntersectionObserver(
      ([entry]) => {
        const ratio = entry.intersectionRatio
        if (entry.isIntersecting && ratio >= enterRatio && !wasVisible) {
          wasVisible = true
          setIsInView(true)
          } else if (!entry.isIntersecting || ratio < exitRatio) {
          wasVisible = false
          setIsInView(false)
        }
      },
      { threshold: [exitRatio, enterRatio] }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [isMobile])

  const card = (
    <div
      style={{
        position: 'relative',
        width: NATIVE_W,
        height: NATIVE_H,
        borderRadius: '24px',
        backgroundImage: 'url(/assets/s2-card-bg.png)',
        backgroundSize: '115%',
        backgroundPosition: 'center',
        overflow: 'hidden',
        boxShadow:
          '0 0 0 1px rgba(129,209,189,0.01), 0 40px 120px rgba(0,0,0,0.75), 0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      {/* LightsOfCard overlay */}
      <img
        src="/assets/card-light-overlay.png"
        alt=""
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          pointerEvents: 'none',
          zIndex: 999,
          filter: 'drop-shadow(0 0 50px rgba(87, 36, 233, 0.75))',
        }}
      />

      {/* ── Text block ── */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '65px',
          width: '480px',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
          visibility: isInView ? 'visible' : 'hidden',
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: 48 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'relative', width: '320px', height: '80px', marginBottom: '25px', marginLeft: '-30px', marginTop: '10px' }}
        >
          <img
            src="/assets/step-indicator-s2.svg"
            alt="02/03"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center', display: 'block' }}
          />
          <div style={{
            position: 'absolute', width: '155px', height: '155px',
            top: '50%', left: '44px', transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(85,32,244,0.10) 0%, rgba(85,32,244,0) 70%)',
            pointerEvents: 'none', borderRadius: '50%',
          }} />
        </motion.div>

        <h1
          style={{
            fontFamily: 'var(--font-jakarta)',
            fontSize: '60px',
            fontWeight: 300,
            lineHeight: 1.05,
            letterSpacing: '-1.5px',
            color: '#ffffff',
            margin: 0,
            marginBottom: '6px',
            overflow: 'visible',
          }}
        >
          <BlurFadeWords text="Flexibility" baseDelay={0.5} isInView={isInView} />
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-jakarta)',
            fontSize: '36px',
            fontWeight: 300,
            lineHeight: 1.18,
            letterSpacing: '-0.6px',
            margin: 0,
            marginBottom: '18px',
            overflow: 'visible',
          }}
        >
          <BlurFadeWords
            text="ai/World-Wide"
            baseDelay={0.8}
            isInView={isInView}
            wordStyle={{
              background: 'linear-gradient(180deg, #906AFF 0%, #703FFF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          />
        </p>

        <p
          style={{
            fontFamily: 'var(--font-jakarta)',
            fontSize: '19px',
            fontWeight: 300,
            lineHeight: 1.3,
            letterSpacing: '-0.2px',
            color: 'rgba(255,255,255,0.6)',
            margin: 0,
            maxWidth: '400px',
            overflow: 'visible',
          }}
        >
          <BlurFadeWords text="Work the way you want with customizable" baseDelay={1.1} isInView={isInView} />
          <br />
          <BlurFadeWords text="backgrounds that showcase your personality." baseDelay={1.45} isInView={isInView} />
        </p>
      </div>

      {/* ── Diagram block ── */}
      <div
        style={{
          position: 'absolute',
          left: '35px',
          bottom: '-25px',
          width: '570px',
          height: '358px',
          zIndex: 10,
        }}
      >
        <AnimatedNetworkLines isInView={isInView} color="#906AFF" />

        <motion.img
          src="/assets/asterisk-icon.svg"
          alt=""
          initial={{ rotate: 0, opacity: 0 }}
          animate={isInView ? { rotate: [0, 14, 0], opacity: 1 } : { rotate: 0, opacity: 0 }}
          transition={{
            rotate: { delay: 0.1, duration: 1.1, ease: [0.45, 0, 0.55, 1] },
            opacity: { delay: 0.1, duration: 0.7, ease: 'easeOut' },
          }}
          style={{
            position: 'absolute',
            width: '85px', height: '85px',
            left: '48px', top: '134px',
            objectFit: 'contain',
            objectPosition: 'center calc(60% + 2px)',
            backdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(160,160,160,0.1)',
            borderRadius: '20px',
            padding: '1px',
            boxSizing: 'border-box',
          }}
        />

        <motion.img
          src="/assets/discord-button.svg"
          alt=""
          initial={{ scale: 0, rotate: -180, y: -20 }}
          animate={isInView ? { scale: 1, rotate: 0, y: 0 } : { scale: 0, rotate: -180, y: -20 }}
          transition={isInView ? { delay: 2.0, duration: 0.8, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
          style={{
            position: 'absolute',
            width: '85px', height: '85px',
            left: '375px', top: '64px',
            objectFit: 'contain',
            objectPosition: 'center calc(50% + 2px)',
            backdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(160,160,160,0.1)',
            borderRadius: '20px',
            padding: '1px',
            boxSizing: 'border-box',
          }}
        />

        <motion.img
          src="/assets/slack-icon.svg"
          alt=""
          initial={{ scale: 0, rotate: -180, y: -20 }}
          animate={isInView ? { scale: 1, rotate: 0, y: 0 } : { scale: 0, rotate: -180, y: -20 }}
          transition={isInView ? { delay: 2.35, duration: 0.8, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
          style={{
            position: 'absolute',
            width: '85px', height: '85px',
            left: '380px', top: '193px',
            objectFit: 'contain',
            objectPosition: 'center calc(50% + 2px)',
            backdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(160,160,160,0.1)',
            borderRadius: '20px',
            padding: '1px',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Right side card */}
      <div style={{ perspective: '1200px', position: 'absolute', top: 0, right: 0, width: '500px', height: '630px' }}>
        <motion.div
          initial={{ opacity: 0, x: 140, rotateY: -22, scale: 0.88 }}
          animate={isInView ? { opacity: 1, x: 0, rotateY: 0, scale: 1 } : { opacity: 0, x: 140, rotateY: -22, scale: 0.88 }}
          transition={isInView ? { delay: 0.4, duration: 1.2, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
          style={{ position: 'relative', width: '100%', height: '100%', transformOrigin: 'right center' }}
        >
          <img
            src="/assets/s2-right-card-bg.png"
            alt=""
            style={{ position: 'absolute', top: 0, right: 0, width: '440px', height: '630px', pointerEvents: 'none' }}
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isInView ? 1 : 0 }}
            transition={{ delay: 1.1, duration: 0.5, ease: 'easeOut' }}
            style={{ position: 'absolute', top: '327px', right: '194px', display: 'flex', alignItems: 'center', gap: '10px', pointerEvents: 'none' }}
          >
            <img src="/assets/web-loading-lines.svg" alt="" style={{ width: '26px', height: '26px', flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-aeonik)', fontSize: '18px', fontWeight: 400, color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap', opacity: 0.8 }}>Adding Plan...</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isInView ? 1 : 0 }}
            transition={{ delay: 1.1, duration: 0.5, ease: 'easeOut' }}
            style={{ position: 'absolute', top: '323px', right: '52px', display: 'flex', alignItems: 'stretch', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.14)', overflow: 'hidden', pointerEvents: 'auto' }}
          >
            <div style={{ width: '52px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <img src="/assets/arrow-right.svg" alt="" style={{ width: '20px', height: '20px', transform: 'rotate(180deg)', opacity: 0.35 }} />
            </div>
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.14)', alignSelf: 'stretch' }} />
            <div style={{ width: '52px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <img src="/assets/arrow-right.svg" alt="" style={{ width: '20px', height: '20px' }} />
            </div>
          </motion.div>

          <div style={{ position: 'absolute', top: '373px', right: '111px', pointerEvents: 'none' }}>
            <span style={{ fontFamily: 'var(--font-aeonik)', fontSize: '18px', fontWeight: 400, color: 'rgba(255,255,255,0.8)', whiteSpace: 'nowrap', opacity: 0.8 }}>
              <AnimatedWords text="Journey to the Far Reaches" baseDelay={1.2} isInView={isInView} />
            </span>
          </div>

          <div style={{ position: 'absolute', top: '410px', right: '61px', pointerEvents: 'none' }}>
            <p style={{ fontFamily: 'var(--font-aeonik)', fontSize: '16px', fontWeight: 400, color: 'rgba(255,255,255,0.4)', margin: 0, lineHeight: 1.5 }}>
              <AnimatedWords text="Create a comprehensive plan for your" baseDelay={1.45} isInView={isInView} /><br />
              <AnimatedWords text="team's success with the Manage" baseDelay={1.9} isInView={isInView} /><br />
              <AnimatedWords text="app's powerful planning tools." baseDelay={2.25} isInView={isInView} />
            </p>
          </div>

          <div style={{ position: 'absolute', bottom: '100px', right: '-25px', width: '440px', display: 'flex', justifyContent: 'center', pointerEvents: 'auto', zIndex: 70 }}>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={isInView ? { delay: 1.75, duration: 0.65, ease: [0.34, 1.56, 0.64, 1] } : { duration: 0 }}
            >
              <button style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 20px', borderRadius: '14px', border: '1px solid rgba(160,140,255,0.3)', backgroundColor: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(12px)', cursor: 'pointer' }}>
                <img src="/assets/gear-icon.svg" alt="" style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-aeonik)', fontSize: '15px', fontWeight: 400, color: 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap' }}>Create a Plan</span>
              </button>
            </motion.div>
          </div>



          {/* Magic Border */}
          <div style={{
            position: 'absolute',
            top: '8.5%',
            right: '6.5%',
            bottom: '13.9%',
            left: '28.1%',
            borderRadius: '24px',
            pointerEvents: 'none',
            overflow: 'hidden',
            zIndex: 60,
            padding: '2px',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}>
            <motion.div
              style={{
                position: 'absolute',
                left: '50%', top: '50%',
                width: '250%', height: '250%',
                background: MAGIC_BORDER_PURPLE,
                x: '-50%', y: '-50%',
                transformOrigin: 'center center',
                filter: 'drop-shadow(0 0 5px rgba(144, 106, 255, 0.5)) drop-shadow(0 0 10px rgba(144, 106, 255, 0.3))',
                willChange: 'transform',
              }}
              animate={isInView ? { rotate: 360 } : false}
              transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
            />
          </div>

          {/* Help Center + Support Team */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isInView ? 1 : 0 }}
            transition={{ delay: 2.1, duration: 0.7, ease: 'easeOut' }}
            style={{ position: 'absolute', bottom: '22px', right: '75px', display: 'flex', alignItems: 'center', gap: '15px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/assets/quick-actions-icon.svg" alt="" style={{ width: '16px', height: '16px', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-aeonik)', fontSize: '14px', fontWeight: 400, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>Help Center</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/assets/mail-icon.svg" alt="" style={{ width: '16px', height: '16px', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-aeonik)', fontSize: '14px', fontWeight: 400, color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>Support Team</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, borderRadius: '24px', pointerEvents: 'none', overflow: 'hidden', zIndex: 60, padding: '2px', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }}>
        <motion.div
          style={{ position: 'absolute', left: '50%', top: '50%', width: '250%', height: '250%', background: MAGIC_BORDER_PURPLE, x: '-50%', y: '-50%', transformOrigin: 'center center', filter: 'drop-shadow(0 0 5px rgba(144, 106, 255, 0.5)) drop-shadow(0 0 10px rgba(144, 106, 255, 0.3))', willChange: 'transform' }}
          animate={isInView ? { rotate: [270, 630] } : false}
          transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
        />
      </div>
    </div>
  )

  return (
    <section
      ref={sectionRef}
      style={{
        width: '100vw',
        height: isMobile ? 'auto' : '100vh',
        ...(isMobile ? { minHeight: '100svh', backgroundColor: '#060b0d', overflow: 'hidden' } : {}),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        contain: 'layout style paint',
      }}
    >
      <div style={{
        position: 'relative',
        flexShrink: 0,
        width: NATIVE_W * scale,
        height: NATIVE_H * scale,
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: NATIVE_W,
          height: NATIVE_H,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}>
          {card}
        </div>
      </div>
    </section>
  )
}

```

---

SECTION 3: UNIFY TEAMS
(Exact code for Section 3)
```tsx
import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { AnimatedNetworkLines } from './AnimatedNetworkLines'
import { useIsMobile } from '../hooks/useIsMobile'
import { BlurFadeWords } from '../BlurFadeWords'

const MAGIC_BORDER_BLUE = 'conic-gradient(from 0deg, transparent 0%, transparent 35%, rgba(76,109,255,0.12) 42%, #4C6DFF 50%, rgba(76,109,255,0.12) 58%, transparent 65%, transparent 100%)'

const NATIVE_W = 1040
const NATIVE_H = 684

export function Section3() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isInView, setIsInView] = useState(false)
  const isMobile = useIsMobile()
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      setScale(w > 1024 ? Math.min(1, w / 1440, h / 900) : Math.max(0.28, (w - 24) / NATIVE_W))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    let wasVisible = false
    const enterRatio = isMobile ? 0.2 : 0.92
    const exitRatio = isMobile ? 0.05 : 0.1
    const obs = new IntersectionObserver(
      ([entry]) => {
        const ratio = entry.intersectionRatio
        if (entry.isIntersecting && ratio >= enterRatio && !wasVisible) {
          wasVisible = true
          setIsInView(true)
          } else if (!entry.isIntersecting || ratio < exitRatio) {
          wasVisible = false
          setIsInView(false)
        }
      },
      { threshold: [exitRatio, enterRatio] }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [isMobile])

  // Chat bubbles — card-relative pixel coords (1040×684 space)
  const bubbles = [
    { src: '/assets/s3-chat-hola.png', w: 240, h: 60, delay: 2.1, top: -23, right: 65 },
    { src: '/assets/s3-chat-hello-friend.png', w: 250, h: 70, delay: 1.8, top: 26, right: 215 },
    { src: '/assets/s3-chat-hello-kitty.png', w: 240, h: 65, delay: 1.5, top: 92, right: 65 },
  ]

  const card = (
    <div
      style={{
        position: 'relative',
        width: NATIVE_W,
        height: NATIVE_H,
        borderRadius: '24px',
        backgroundImage: 'url(/assets/s3-card-bg.png)',
        backgroundSize: '115%',
        backgroundPosition: 'center',
        overflow: 'hidden',
        boxShadow:
          '0 0 0 1px rgba(129,209,189,0.01), 0 40px 120px rgba(0,0,0,0.75), 0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      {/* LightsOfCard overlay */}
      <img
        src="/assets/s3-card-light-overlay.png"
        alt=""
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          pointerEvents: 'none',
          zIndex: 999,
          filter: 'drop-shadow(0 0 50px rgba(108, 133, 226, 0.75))',
        }}
      />

      {/* ── Text block ── */}
      <div
        style={{
          position: 'absolute',
          top: '40px',
          left: '65px',
          width: '480px',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
          visibility: isInView ? 'visible' : 'hidden',
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: 48 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'relative', width: '320px', height: '80px', marginBottom: '25px', marginLeft: '-30px' }}
        >
          <img
            src="/assets/step-indicator-s3.svg"
            alt="03/03"
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover',
              objectPosition: 'center center',
              display: 'block',
            }}
          />
          <div style={{
            position: 'absolute',
            width: '155px', height: '155px',
            top: '50%', left: '44px', transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(86,134,249,0.10) 0%, rgba(86,134,249,0) 70%)',
            pointerEvents: 'none', borderRadius: '50%',
          }} />
        </motion.div>

        <h1
          style={{
            fontFamily: 'var(--font-jakarta)',
            fontSize: '60px',
            fontWeight: 300,
            lineHeight: 1.05,
            letterSpacing: '-1.5px',
            color: '#ffffff',
            margin: 0,
            marginBottom: '6px',
            overflow: 'visible',
          }}
        >
          <BlurFadeWords text="Unify Teams" baseDelay={0.5} isInView={isInView} />
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-jakarta)',
            fontSize: '36px',
            fontWeight: 300,
            lineHeight: 1.18,
            letterSpacing: '-0.6px',
            margin: 0,
            marginBottom: '18px',
            overflow: 'visible',
          }}
        >
          <BlurFadeWords
            text="ai/EasierTeamwork"
            baseDelay={0.8}
            isInView={isInView}
            wordStyle={{
              background: 'linear-gradient(180deg, #9BB1FF 0%, #4C6DFF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          />
        </p>

        <p
          style={{
            fontFamily: 'var(--font-jakarta)',
            fontSize: '19px',
            fontWeight: 300,
            lineHeight: 1.3,
            letterSpacing: '-0.2px',
            color: 'rgba(255,255,255,0.6)',
            margin: 0,
            maxWidth: '400px',
            overflow: 'visible',
          }}
        >
          <BlurFadeWords text="Craft your team's perfect process with over" baseDelay={1.1} isInView={isInView} />
          <br />
          <BlurFadeWords text="4000 extensions and 800 integrations." baseDelay={1.45} isInView={isInView} />
        </p>
      </div>

      {/* ── Diagram block ── */}
      <div
        style={{
          position: 'absolute',
          left: '35px',
          bottom: '-25px',
          width: '570px',
          height: '358px',
          zIndex: 10,
        }}
      >
        <AnimatedNetworkLines isInView={isInView} color="#4C6DFF" />

        <motion.img
          src="/assets/asterisk-icon.svg"
          alt=""
          initial={{ rotate: 0, opacity: 0 }}
          animate={isInView ? { rotate: [0, 14, 0], opacity: 1 } : { rotate: 0, opacity: 0 }}
          transition={{
            rotate: { delay: 0.1, duration: 1.1, ease: [0.45, 0, 0.55, 1] },
            opacity: { delay: 0.1, duration: 0.7, ease: 'easeOut' },
          }}
          style={{
            position: 'absolute',
            width: '85px', height: '85px',
            left: '48px', top: '134px',
            objectFit: 'contain',
            objectPosition: 'center calc(60% + 2px)',
            backdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(160,160,160,0.1)',
            borderRadius: '20px',
            padding: '1px',
            boxSizing: 'border-box',
          }}
        />

        <motion.img
          src="/assets/discord-icon.svg"
          alt=""
          initial={{ scale: 0, rotate: -180, y: -20 }}
          animate={isInView ? { scale: 1, rotate: 0, y: 0 } : { scale: 0, rotate: -180, y: -20 }}
          transition={isInView ? { delay: 2.0, duration: 0.8, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
          style={{
            position: 'absolute',
            width: '85px', height: '85px',
            left: '375px', top: '64px',
            objectFit: 'contain',
            objectPosition: 'center calc(50% + 2px)',
            backdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(160,160,160,0.1)',
            borderRadius: '20px',
            padding: '1px',
            boxSizing: 'border-box',
          }}
        />

        <motion.img
          src="/assets/slack-icon.svg"
          alt=""
          initial={{ scale: 0, rotate: -180, y: -20 }}
          animate={isInView ? { scale: 1, rotate: 0, y: 0 } : { scale: 0, rotate: -180, y: -20 }}
          transition={isInView ? { delay: 2.35, duration: 0.8, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
          style={{
            position: 'absolute',
            width: '85px', height: '85px',
            left: '380px', top: '193px',
            objectFit: 'contain',
            objectPosition: 'center calc(50% + 2px)',
            backdropFilter: 'blur(12px)',
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(160,160,160,0.1)',
            borderRadius: '20px',
            padding: '1px',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* chandelier */}
      <motion.img
        src="/assets/s3-chandelier.svg"
        alt=""
        initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
        animate={isInView ? { clipPath: 'inset(0% 0% 0% 0%)' } : { clipPath: 'inset(100% 0% 0% 0%)' }}
        transition={isInView ? { delay: 0.9, duration: 1.0, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
        style={{
          position: 'absolute',
          bottom: '474px', right: '183px',
          width: '114px', height: '55px',
          pointerEvents: 'none',
        }}
      />



      {/* 3SectionCard container */}
      <div style={{ position: 'absolute', bottom: '-30px', right: '40px', width: '440px', height: '530px', perspective: '1200px' }}>
        <motion.div
          initial={{ opacity: 0, x: 120, rotateY: -22, scale: 0.88 }}
          animate={isInView ? { opacity: 1, x: 0, rotateY: 0, scale: 1 } : { opacity: 0, x: 120, rotateY: -22, scale: 0.88 }}
          transition={isInView ? { delay: 0.4, duration: 1.2, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
          style={{ position: 'relative', width: '100%', height: '100%', transformOrigin: 'right center' }}
        >
          <img src="/assets/s3-right-card-bg.png" alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />

          {/* AddMembers button */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            transition={isInView ? { delay: 1.4, duration: 0.65, ease: [0.34, 1.56, 0.64, 1] } : { duration: 0 }}
            style={{ position: 'absolute', bottom: '40px', right: '-5px', width: '250px', transformOrigin: 'center center' }}
          >
            <img src="/assets/s3-add-members-button.png" alt="" style={{ width: '250px', height: '130px', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 1V13M1 7H13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span style={{ fontFamily: 'var(--font-aeonik)', fontSize: '15px', fontWeight: 400, color: 'white', whiteSpace: 'nowrap' }}>Add members</span>
            </div>
          </motion.div>

          {/* Magic Border */}
          <div style={{
            position: 'absolute',
            top: '4.75%', bottom: '14.5%',
            left: '17%', right: '7%',
            borderRadius: '24px',
            pointerEvents: 'none',
            overflow: 'hidden',
            zIndex: 60,
            padding: '2px',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}>
            <motion.div
              style={{
                position: 'absolute',
                left: '50%', top: '50%',
                width: '250%', height: '250%',
                background: MAGIC_BORDER_BLUE,
                x: '-50%', y: '-50%',
                transformOrigin: 'center center',
                filter: 'drop-shadow(0 0 5px rgba(76, 109, 255, 0.5)) drop-shadow(0 0 10px rgba(76, 109, 255, 0.3))',
                willChange: 'transform',
              }}
              animate={isInView ? { rotate: 360 } : false}
              transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
            />
          </div>
        </motion.div>
      </div>

      {/* Chat bubbles — clipped by card overflow:hidden */}
      {bubbles.map(({ src, w, h, delay, top, right }) => (
        <div key={src} style={{ position: 'absolute', top, right, perspective: '700px', zIndex: 55 }}>
          <motion.div
            key={src}
            initial={{ opacity: 0, scale: 0.72, y: 28, rotateX: 20 }}
            animate={isInView ? { opacity: 1, scale: 1, y: 0, rotateX: 0 } : { opacity: 0, scale: 0.72, y: 28, rotateX: 20 }}
            transition={isInView ? { delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
          >
            <img src={src} alt="" style={{ width: w, height: h, display: 'block', pointerEvents: 'none' }} />
          </motion.div>
        </div>
      ))}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, borderRadius: '24px', pointerEvents: 'none', overflow: 'hidden', zIndex: 60, padding: '2px', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }}>
        <motion.div
          style={{ position: 'absolute', left: '50%', top: '50%', width: '250%', height: '250%', background: MAGIC_BORDER_BLUE, x: '-50%', y: '-50%', transformOrigin: 'center center', filter: 'drop-shadow(0 0 5px rgba(76, 109, 255, 0.5)) drop-shadow(0 0 10px rgba(76, 109, 255, 0.3))', willChange: 'transform' }}
          animate={isInView ? { rotate: [0, 360] } : false}
          transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
        />
      </div>
    </div>
  )

  return (
    <section
      ref={sectionRef}
      style={{
        width: '100vw',
        height: isMobile ? 'auto' : '100vh',
        ...(isMobile ? { minHeight: '100svh', backgroundColor: '#060b0d', overflow: 'hidden' } : {}),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        contain: 'layout style paint',
      }}
    >
      {/* Card always in scale wrapper — internal elements never collide on small screens */}
      <div style={{
        position: 'relative',
        flexShrink: 0,
        width: NATIVE_W * scale,
        height: NATIVE_H * scale,
      }}>
        <div style={{
          position: 'absolute',
          top: 0, left: 0,
          width: NATIVE_W,
          height: NATIVE_H,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}>
          {card}
        </div>
      </div>

    </section>
  )
}

```

---

SECTION 4: TEAM CREATED
(Exact code for Section 4)
```tsx
import { motion, useAnimation } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { useIsMobile } from '../hooks/useIsMobile'
import { BlurFadeWords } from '../BlurFadeWords'

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

const RING_END   = [0.54, 0.69, 0.84, 1.00]
const RING_EXIT  = [0.70, 0.90, 1.09, 1.30]

function OrbitRings({ isActive }: { isActive: boolean }) {
  const c0 = useAnimation()
  const c1 = useAnimation()
  const c2 = useAnimation()
  const c3 = useAnimation()

  useEffect(() => {
    if (!isActive) return
    let cancelled = false
    const loop = async () => {
      if (cancelled) return
      c0.set({ scale: 0.18, opacity: 0 })
      c1.set({ scale: 0.18, opacity: 0 })
      c2.set({ scale: 0.18, opacity: 0 })
      c3.set({ scale: 0.18, opacity: 0 })

      const inT = { duration: 1.0, ease: [0.22, 1, 0.36, 1] as const }
      c0.start({ scale: RING_END[0], opacity: 1, transition: inT })
      await sleep(220)
      if (cancelled) return
      c1.start({ scale: RING_END[1], opacity: 1, transition: inT })
      await sleep(220)
      if (cancelled) return
      c2.start({ scale: RING_END[2], opacity: 1, transition: inT })
      await sleep(220)
      if (cancelled) return
      await c3.start({ scale: RING_END[3], opacity: 1, transition: inT })

      await sleep(700)
      if (cancelled) return

      const outT = { duration: 1.1, ease: [0.76, 0, 0.24, 1] as const }
      await Promise.all([
        c0.start({ scale: RING_EXIT[0], opacity: 0, transition: outT }),
        c1.start({ scale: RING_EXIT[1], opacity: 0, transition: outT }),
        c2.start({ scale: RING_EXIT[2], opacity: 0, transition: outT }),
        c3.start({ scale: RING_EXIT[3], opacity: 0, transition: outT }),
      ])

      await sleep(3000)
      if (!cancelled) loop()
    }
    loop()
    return () => { cancelled = true }
  }, [c0, c1, c2, c3, isActive])

  const srcs = [
    '/assets/orbit-1.svg',
    '/assets/orbit-2.svg',
    '/assets/orbit-3.svg',
    '/assets/orbit-3.svg',
  ]
  const controls = [c0, c1, c2, c3]

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 5, willChange: 'transform' }}>
      {srcs.map((src, i) => (
        <motion.img
          key={i}
          src={src}
          alt=""
          initial={{ scale: 0.18, opacity: 0 }}
          animate={controls[i]}
          style={{ position: 'absolute', width: '175%', height: '175%', objectFit: 'contain' }}
        />
      ))}
    </div>
  )
}


const NATIVE_W = 1040
const NATIVE_H = 684

export function Section4() {
  const isMobile = useIsMobile()
  const [scale, setScale] = useState(1)
  const sectionRef = useRef<HTMLElement>(null)
  const [isInView, setIsInView] = useState(false)
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    let wasVisible = false
    const enterRatio = isMobile ? 0.3 : 0.9
    const exitRatio = isMobile ? 0.05 : 0.1
    const obs = new IntersectionObserver(
      ([entry]) => {
        const ratio = entry.intersectionRatio
        if (entry.isIntersecting && ratio >= enterRatio && !wasVisible) {
          wasVisible = true
          setIsInView(true)
          } else if (!entry.isIntersecting || ratio < exitRatio) {
          wasVisible = false
          setIsInView(false)
        }
      },
      { threshold: [exitRatio, enterRatio] }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [isMobile])

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      setScale(w > 1024 ? Math.min(1, w / 1440, h / 900) : Math.max(0.28, (w - 24) / NATIVE_W))
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const card = (
    <div
      style={{
        position: 'relative',
        width: NATIVE_W,
        height: NATIVE_H,
        borderRadius: '24px',
        backgroundColor: 'transparent',
        backgroundImage: 'url(/assets/s4-card-bg.png)',
        backgroundSize: '115%',
        backgroundPosition: 'center',
        overflow: 'hidden',
        boxShadow:
          '0 0 0 1px rgba(129,209,189,0.01), 0 40px 120px rgba(0,0,0,0.75), 0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      <OrbitRings isActive={isInView} />

      <img
        src="/assets/card-light-overlay.png"
        alt=""
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          pointerEvents: 'none',
          zIndex: 50,
        }}
      />

      {/* ── Text block — only rendered when animKey > 0; key forces fresh mount each visit ── */}
      <div
        style={{
          position: 'absolute',
          top: '80px',
          left: 0, right: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 10,
          visibility: isInView ? 'visible' : 'hidden',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-jakarta)',
            fontSize: '60px',
            fontWeight: 300,
            lineHeight: 1.05,
            letterSpacing: '-1.5px',
            color: '#ffffff',
            margin: 0,
            marginBottom: '10px',
            overflow: 'visible',
          }}
        >
          <BlurFadeWords text="Team Created" baseDelay={0.3} isInView={isInView} />
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-jakarta)',
            fontSize: '36px',
            fontWeight: 300,
            lineHeight: 1.18,
            letterSpacing: '-0.6px',
            margin: 0,
            marginBottom: '18px',
            overflow: 'visible',
          }}
        >
          <BlurFadeWords
            text="ai/Running Plan Template"
            baseDelay={0.6}
            isInView={isInView}
            wordStyle={{
              background: 'linear-gradient(180deg, #A0A0A0 0%, #DFDFDF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          />
        </p>

        <p
          style={{
            fontFamily: 'var(--font-jakarta)',
            fontSize: '19px',
            fontWeight: 300,
            lineHeight: 1.5,
            letterSpacing: '-0.2px',
            color: 'rgba(255,255,255,0.6)',
            margin: 0,
          }}
        >
          <BlurFadeWords text="Welcome to the New journey!" baseDelay={1.0} isInView={isInView} />
        </p>

        {/* Perspective wrapper for 3D bar animation */}
        <div style={{ perspective: '1000px', marginTop: '70px', flexShrink: 0 }}>
          <motion.div
            initial={{ opacity: 0, rotateX: -28, y: 40, scale: 0.88 }}
            animate={isInView ? { opacity: 1, rotateX: 0, y: 0, scale: 1 } : { opacity: 0, rotateX: -28, y: 40, scale: 0.88 }}
            transition={isInView ? { delay: 2.3, duration: 1.3, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
            style={{
              position: 'relative',
              width: '376px',
              height: '164px',
              backgroundImage: 'url(/assets/s4-stats-bar.png)',
              backgroundSize: '100% 100%',
              transformOrigin: 'center bottom',
              borderRadius: '20px',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
            }}
          >
            {/* Top-left: device → arrow → desktop */}
            <div style={{ position: 'absolute', top: '18px', left: '32px', display: 'flex', alignItems: 'center' }}>
              <motion.img
                src="/assets/s4-single-device.png"
                alt=""
                initial={{ scale: 0, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={isInView ? { delay: 2.8, duration: 0.65, ease: [0.34, 1.56, 0.64, 1] } : { duration: 0 }}
                style={{ width: '52px', height: '52px', objectFit: 'contain', position: 'relative', left: '-10px' }}
              />
              <motion.div
                initial={{ clipPath: 'inset(0 100% 0 0)' }}
                animate={isInView ? { clipPath: 'inset(0 0% 0 0)' } : { clipPath: 'inset(0 100% 0 0)' }}
                transition={isInView ? { delay: 3.15, duration: 0.75, ease: [0.22, 1, 0.36, 1] } : { duration: 0 }}
                style={{ position: 'relative', left: '-14px', top: '12px', display: 'flex' }}
              >
                <img src="/assets/s4-arrows-divider.svg" alt="" style={{ height: '60px', objectFit: 'contain' }} />
              </motion.div>
              <motion.img
                src="/assets/s4-desktop-icon.svg"
                alt=""
                initial={{ scale: 0, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={isInView ? { delay: 3.15 + 0.75, duration: 0.65, ease: [0.34, 1.56, 0.64, 1] } : { duration: 0 }}
                style={{ width: '37px', height: '37px', objectFit: 'contain', position: 'relative', top: '-15px', left: '-14px' }}
              />
            </div>

            {/* Top-right: 3 avatars */}
            <div style={{ position: 'absolute', top: '25px', right: '21px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {['/assets/s4-avatar-left.png', '/assets/s4-avatar-middle.png', '/assets/s4-avatar-right.png'].map((src, i) => (
                <motion.img
                  key={i}
                  src={src}
                  alt=""
                  initial={{ scale: 0, opacity: 0 }}
                  animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                  transition={isInView ? { delay: 2.9 + i * 0.13, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] } : { duration: 0 }}
                  style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }}
                />
              ))}
            </div>

            {/* Bottom-left: 3 icons */}
            <div style={{ position: 'absolute', bottom: '18px', left: '26px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {['/assets/meta-icon.svg', '/assets/reddit-icon.svg', '/assets/feather-icon.svg'].map((src, i) => (
                <motion.img
                  key={i}
                  src={src}
                  alt=""
                  initial={{ scale: 0, rotate: 0, opacity: 0 }}
                  animate={isInView ? { scale: 1, rotate: 360, opacity: 1 } : { scale: 0, rotate: 0, opacity: 0 }}
                  transition={isInView ? { delay: 3.1 + i * 0.15, duration: 0.85, ease: [0.34, 1.56, 0.64, 1] } : { duration: 0 }}
                  style={{ width: '40px', height: '40px' }}
                />
              ))}
            </div>

            {/* Bottom-right: Template button */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={isInView ? { delay: 3.3, duration: 0.7, ease: [0.34, 1.56, 0.64, 1] } : { duration: 0 }}
              style={{ position: 'absolute', bottom: '18px', right: '26px', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '999px', backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <img src="/assets/asterisk-orange.svg" alt="" style={{ width: '20px', height: '20px', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-aeonik)', fontSize: '15px', fontWeight: 400, color: 'rgba(255,255,255,0.85)', whiteSpace: 'nowrap' }}>Template</span>
              <img src="/assets/arrow-down.svg" alt="" style={{ width: '11px', height: '11px', flexShrink: 0 }} />
            </motion.div>



            {/* Magic Border */}
            <div
              style={{
                position: 'absolute',
                top: 0, bottom: 0, left: 0, right: 0,
                borderRadius: '20px',
                pointerEvents: 'none',
                overflow: 'hidden',
                zIndex: 60,
                padding: '2px',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
              }}
            >
              <motion.div
                style={{
                  position: 'absolute',
                  left: '50%', top: '50%',
                  width: '250%', height: '250%',
                  background: 'conic-gradient(from 0deg, transparent 0%, transparent 42%, rgba(255,255,255,0.1) 47%, #ffffff 50%, rgba(255,255,255,0.1) 53%, transparent 58%, transparent 100%)',
                  x: '-50%', y: '-50%',
                  transformOrigin: 'center center',
                  filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.5)) drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))',
                  willChange: 'transform',
                }}
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 5, ease: 'linear' }}
              />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : { scale: 0 }}
          transition={isInView ? { delay: 2.5, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] } : { duration: 0 }}
          style={{
            width: '180px', height: '40px',
            marginTop: '60px',
            backgroundImage: 'url(/assets/s4-action-button-bg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '999px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <img src="/assets/s4-loader-spinner.png" alt="" style={{ width: '18px', height: '18px', flexShrink: 0 }} />
          <span style={{ fontFamily: 'var(--font-aeonik)', fontSize: '14px', fontWeight: 400, color: '#ffffff', whiteSpace: 'nowrap' }}>Open in 25 Sec...</span>
        </motion.div>
      </div>
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, borderRadius: '24px', pointerEvents: 'none', overflow: 'hidden', zIndex: 60, padding: '2px', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }}>
        <motion.div
          style={{ position: 'absolute', left: '50%', top: '50%', width: '250%', height: '250%', background: 'conic-gradient(from 0deg, transparent 0%, transparent 42%, rgba(255,255,255,0.1) 47%, #ffffff 50%, rgba(255,255,255,0.1) 53%, transparent 58%, transparent 100%)', x: '-50%', y: '-50%', transformOrigin: 'center center', filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.5)) drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))', willChange: 'transform' }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
        />
      </div>
    </div>
  )

  return (
    <section
      ref={sectionRef}
      style={{
        width: '100vw',
        height: isMobile ? 'auto' : '100vh',
        ...(isMobile ? { minHeight: '100svh', backgroundColor: '#060b0d', overflow: 'hidden' } : {}),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        contain: 'layout style paint',
      }}
    >
      <div style={{
        position: 'relative',
        flexShrink: 0,
        width: NATIVE_W * scale,
        height: NATIVE_H * scale,
      }}>
        <div style={{
          position: 'absolute',
          top: 0, left: 0,
          width: NATIVE_W,
          height: NATIVE_H,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}>
          {card}
        </div>
      </div>
    </section>
  )
}

```

---

COMPLETE LIST OF ALL 63 ASSET FILES IN public/assets/

PNG images (these are dark-themed glass/gradient textures, avatars, and UI elements):
1. arrow-down.svg
2. arrow-right.svg
3. asterisk-button.svg
4. asterisk-icon.svg
5. asterisk-orange.svg
6. avatar-man-1.png
7. avatar-man-2.png
8. avatar-man-bottom.png
9. avatar-man-top.png
10. avatar-woman-1.png
11. avatar-woman-2.png
12. avatar-woman-3.png
13. card-light-overlay.png
14. crypto-chart.svg
15. cursor-full.svg
16. cursor-magic.svg
17. discord-button.svg
18. discord-icon.svg
19. feather-icon.svg
20. gear-icon.svg
21. github-icon.svg
22. hero-background.png
23. mail-icon.svg
24. meta-icon.svg
25. orbit-1.svg
26. orbit-2.svg
27. orbit-3.svg
28. quick-actions-icon.svg
29. reddit-icon.svg
30. s1-bottom-card-bg.png
31. s1-main-card-bg.png
32. s1-notification-badge.svg
33. s1-top-card-bg.png
34. s1-top-card-header.png
35. s1-top-card-light.png
36. s2-card-bg.png
37. s2-right-card-bg.png
38. s3-add-members-button.png
39. s3-card-bg.png
40. s3-card-light-overlay.png
41. s3-chandelier.svg
42. s3-chat-hello-friend.png
43. s3-chat-hello-kitty.png
44. s3-chat-hola.png
45. s3-cursor.png
46. s3-right-card-bg.png
47. s4-action-button-bg.png
48. s4-arrows-divider.svg
49. s4-avatar-left.png
50. s4-avatar-middle.png
51. s4-avatar-right.png
52. s4-card-bg.png
53. s4-desktop-icon.svg
54. s4-loader-spinner.png
55. s4-single-device.png
56. s4-stats-bar.png
57. slack-button.svg
58. slack-icon.svg
59. step-indicator-s2.svg
60. step-indicator-s3.svg
61. web-loading-lines.svg
62. widget-box-icon.svg
63. zap-icon.svg

All image assets can be downloaded from: https://qclay.design/lovable/glass-menu/[filename]

---

INLINE SVG ICONS THAT CAN BE RECREATED (for icons you do not download):

github-icon.svg (18x18, white fill-opacity 0.4, GitHub octocat path):
```svg
<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M9 0C4.0275 0 0 4.02975 0 9C0 12.9773 2.5785 16.35 6.15375 17.5387C6.60375 17.6235 6.76875 17.3452 6.76875 17.106C6.76875 16.8922 6.76125 16.326 6.7575 15.576C4.254 16.119 3.726 14.3685 3.726 14.3685C3.3165 13.3297 2.72475 13.0522 2.72475 13.0522C1.9095 12.4943 2.78775 12.5055 2.78775 12.5055C3.6915 12.5685 4.16625 13.4325 4.16625 13.4325C4.96875 14.8088 6.273 14.4112 6.7875 14.181C6.8685 13.599 7.10025 13.2022 7.3575 12.9772C5.35875 12.7522 3.258 11.9783 3.258 8.52975C3.258 7.54725 3.60675 6.74475 4.18425 6.11475C4.083 5.8875 3.77925 4.9725 4.263 3.73275C4.263 3.73275 5.01675 3.49125 6.738 4.65525C7.458 4.455 8.223 4.356 8.988 4.3515C9.753 4.356 10.518 4.455 11.238 4.65525C12.948 3.49125 13.7017 3.73275 13.7017 3.73275C14.1855 4.9725 13.8818 5.8875 13.7917 6.11475C14.3655 6.74475 14.7142 7.54725 14.7142 8.52975C14.7142 11.9873 12.6105 12.7485 10.608 12.9697C10.923 13.2397 11.2155 13.7917 11.2155 14.6347C11.2155 15.8392 11.2043 16.8067 11.2043 17.0993C11.2043 17.3355 11.3617 17.6167 11.823 17.5267C15.4237 16.3463 18 12.9713 18 9C18 4.02975 13.9703 0 9 0Z" fill="white" fill-opacity="0.4"/>
</svg>
```

widget-box-icon.svg (19x16, white fill-opacity 0.4, diamond grid pattern):
```svg
<svg width="19" height="16" viewBox="0 0 19 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M4.65531 0L0 2.96543L4.65531 5.93087L9.3114 2.96543L4.65531 0ZM13.9659 0L9.31062 2.96543L13.9659 5.93087L18.6212 2.96543L13.9659 0ZM0 8.89707L4.65531 11.8625L9.3114 8.89707L4.65531 5.93087L0 8.89707ZM13.9659 5.93087L9.31062 8.89707L13.9659 11.8625L18.6212 8.89707L13.9659 5.93087ZM4.65531 12.8518L9.3114 15.8172L13.9667 12.8518L9.3114 9.88633L4.65531 12.8518Z" fill="white" fill-opacity="0.4"/>
</svg>
```

zap-icon.svg (15x15, white stroke opacity 0.8):
```svg
<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_2_907)">
<path d="M7.44861 5.58637H11.1729V1.86212H3.72437L7.44861 5.58637ZM7.44861 9.31062V13.0349L3.72437 9.31062V5.58637H7.44861M7.44861 5.58637L11.1729 9.31062H7.44861M3.72437 9.31062H7.44861" stroke="white" stroke-opacity="0.8" stroke-width="1.39659"/>
</g>
<defs>
<clipPath id="clip0_2_907">
<rect width="14.897" height="14.897" fill="white"/>
</clipPath>
</defs>
</svg>
```

arrow-down.svg (10x7):
```svg
<svg width="10" height="7" viewBox="0 0 10 7" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8.77247 0.907501L4.83997 5.1425L0.907471 0.907501" stroke="white" stroke-width="1.815" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

arrow-right.svg (26x26):
```svg
<svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M22.15 12.6571H3.16428" stroke="white" stroke-width="2.37321" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M15.8214 6.32857L22.15 12.6571L15.8214 18.9857" stroke="white" stroke-width="2.37321" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

s3-chandelier.svg (114x55, blue stroke at opacity 0.32):
```svg
<svg width="114" height="55" viewBox="0 0 114 55" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M56.75 0V25M0.75 0V8C0.75 16.837 7.913 24 16.75 24H40.75C49.587 24 56.75 31.163 56.75 40V55M112.75 0V8C112.75 16.837 105.587 24 96.75 24H72.75C66.828 24 61.657 27.218 58.89 32" stroke="#6C85E2" stroke-opacity="0.32" stroke-width="1.5"/>
</svg>
```

The Section 3 Add Members button has an inline SVG plus icon:
```svg
<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M7 1V13M1 7H13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
</svg>
```

---

CRITICAL ANIMATION DETAILS SUMMARY

1. Card entry animations use spring physics (stiffness 32, damping 22, mass 1.2) or cubic bezier ease [0.22, 1, 0.36, 1].
2. All animations are gated by isInView boolean from IntersectionObserver.
3. MagicBorder uses mask-composite: exclude trick with 2px padding and continuously rotating conic gradient.
4. Network lines draw paths sequentially using framer-motion pathLength animation.
5. Orbit rings in Section 4 loop asynchronously with sequential staggered scaling.
6. BlurFadeWords applies per-word blur(8px) to blur(0px) with staggered delays.
7. Chat bubbles in Section 3 have 3D perspective rotateX entrance.
8. Spatial scroll uses framer-motion animate() on MotionValues with cubic bezier [0.76, 0, 0.24, 1].
9. All icon buttons have glass morphism: backdrop-filter blur(12px), bg rgba(255,255,255,0.02-0.06), border 1px rgba(160,160,160,0.1) or rgba(255,255,255,0.12), borderRadius 20px.

Make sure every single element, animation timing, color value, font weight, letter spacing, and positioning matches exactly as described. Use the exact CSS values. Download all PNG/SVG assets from https://qclay.design/lovable/glass-menu/[filename] and place them in public/assets/.

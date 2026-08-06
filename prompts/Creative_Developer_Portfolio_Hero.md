Act as an award-winning designer and web developer. Your task is to recreate a specific, high-end portfolio website hero section with maximum accuracy. Follow this complete, production-ready specification to implement the website exactly as described, including its visual appearance, user experience, animations, and technical architecture.

## 1. Visual Design System

### Exact Color Palette (HEX/RGB)
*   **Background Color**: `#030305` (Deep dark background)
*   **Text Primary**: `#FFFFFF` (Pure white)
*   **Text Secondary**: `#d5d5d5` (Light gray for readability)
*   **Accent Color**: `#8A63F8` (Vibrant purple)
*   **Success Color**: `#00FF88` (Neon green for status pulse)
*   **Glass Background**: `rgba(20, 20, 25, 0.4)`
*   **Glass Border**: `rgba(255, 255, 255, 0.08)`

### Gradients
*   **Accent Gradient**: `linear-gradient(135deg, #8A63F8 0%, #5C43FA 100%)`
*   **Accent Gradient (Hover)**: `linear-gradient(135deg, #9C7AFA 0%, #6D56FB 100%)`
*   **Accent Text Gradient**: `linear-gradient(90deg, #9C7AFA 0%, #5A8CFF 100%)`
*   **Video Overlay Gradient**: `linear-gradient(90deg, rgba(5, 5, 8, 0.95) 0%, rgba(29, 29, 53, 0.182) 40%, rgba(5, 5, 8, 0.4) 100%)` (ensures text readability on the left while keeping the right side clear).

### Typography
*   **Primary Font (Headings & Body)**: `Outfit`, system-ui, -apple-system, sans-serif
*   **Secondary Font (Nav, Buttons, Labels)**: `Inter`, system-ui, -apple-system, sans-serif
*   **Font Weights**:
    *   Outfit: 300, 400, 500, 600, 700, 800
    *   Inter: 400, 500, 600

## 2. Layout Structure & Grid System
*   **Main Container (`.hero-section`)**: Flexbox column, minimum height `100vh`, `padding: 2rem 4rem`. Relative positioning with `z-index: 1`.
*   **Video Background (`.video-container`)**: Absolute positioning filling the screen, `z-index: -1`, with `object-fit: cover`.

## 3. Section-by-Section Content & Hierarchy

### Top Navigation (`.navbar`)
*   **Flex Layout**: Space-between, aligned center, `padding-bottom: 2rem`.
*   **Logo**: Display flex, gap `0.5rem`, size `1.2rem`, weight `700`, tracking `1px`. Icon size `1.8rem`. Phosphor Icon: `ph-cube-transparent`.
*   **Nav Links**: Flex, gap `2.5rem`. Text: uppercase, `0.85rem`, weight `500`, tracking `1px`. Font: Inter.
*   **Nav Actions**: Contains a "LET'S WORK TOGETHER" outline button.

### Hero Center Content (`.hero-content`)
*   **Flex Layout**: Flex 1 (fills remaining vertical space), centered vertically, `padding: 2rem 0`.
*   **Text Wrapper**: Max width `800px`.
*   **Greeting (`.greeting`)**: "HELLO, I'M". Font size `1.1rem`, weight `500`, tracking `2px`, color accent.
*   **Main Title (`.main-title`)**: "Creative Designer \n & Developer". Font size `4.5rem`, weight `700`, line-height `1.1`, tracking `-1px`. Pure white.
*   **Sub Title (`.sub-title`)**: "I build immersive digital experiences". Font size `1.8rem`, weight `500`, using the `.accent-text-gradient` clipped to text.
*   **CTA Group**: Flex layout, gap `1rem`. Buttons: "VIEW MY WORK" (primary) and "DOWNLOAD CV" (outline).

## 4. Precise Spacing, Margins, and Padding
*   Hero section padding: `2rem 4rem`
*   Navbar bottom padding: `2rem`
*   Greeting bottom margin: `1rem`
*   Main title bottom margin: `1rem`
*   Sub-title bottom margin: `2rem`
*   Description bottom margin: `3rem` (if present)
*   Hero footer top padding: `2rem`

## 5. UI Components & Styling Details

### Buttons
*   **Global Button Specs**: Inline-flex, center aligned, padding `0.9rem 2rem`, border-radius `8px`. Font: Inter, `0.85rem`, weight `600`, tracking `0.5px`, uppercase. Transition `0.3s ease`.
*   **Primary Button**: Uses accent gradient, text pure white. Box shadow: `0 8px 24px rgba(138, 99, 248, 0.25)`.
*   **Outline Button**: Transparent background, border `1px solid var(--glass-border)`, glass blur backdrop filter `8px`.

### Glassmorphism Panel (Availability Card)
*   **Styling**: Background `var(--glass-bg)`, backdrop filter `16px`, border `1px solid var(--glass-border)`, border-radius `16px`, padding `1.5rem 2rem`, max-width `320px`, box shadow `0 20px 40px rgba(0, 0, 0, 0.4)`.

## 6. Animations, Micro-interactions, & States

### Hover, Focus, and Active States
*   **Nav Links Hover/Active**: Color changes to primary white. Active links have an absolute positioned underline (bottom `-6px`, height `2px`, accent gradient).
*   **Primary Button Hover**: Uses hover accent gradient, translates Y `-2px`, intensifies box shadow to `0 12px 28px rgba(138, 99, 248, 0.4)`.
*   **Outline Button Hover**: Background changes to `rgba(255, 255, 255, 0.08)`, border color `rgba(255, 255, 255, 0.2)`.
*   **Social Links Hover**: Background changes to white, text to dark background, translate Y `-3px`.

### Keyframe Animations
*   **Fade Up (`.animate-fade-up`)**: Opacity 0 to 1, translate Y `30px` to `0`. Uses `cubic-bezier(0.16, 1, 0.3, 1)`, duration `0.8s`. Triggered on load with staggered delays (`0.1s`, `0.2s`, `0.3s`, `0.5s`).
*   **Scroll Indicator (`.wheel`)**: Translates down `15px` and fades out over `2s`, infinite loop.
*   **Status Pulse (`.pulse-dot`)**: Neon green dot with an absolute pseudo-element that scales from `1` to `2.5` and fades opacity `0.8` to `0` over `2s` infinite loop.

## 7. Images, Assets & Third-Party Resources
*   **Background Video**: 
    *   URL: `https://strvid.nyc3.cdn.digitaloceanspaces.com/cloudinary/portfolio_hero_bg_zuhahj.webm`
    *   Attributes: `autoplay`, `muted`, `playsinline`. Do not loop.
*   **Icons**: Phosphor Icons (Web script: `https://unpkg.com/@phosphor-icons/web`). Include `ph-cube-transparent`, `ph-list` for mobile toggle.
*   **Fonts**: Google Fonts for Inter and Outfit.

## 8. Technical Implementation & Architecture

### Frontend Stack
*   Pure HTML5 semantic structure.
*   Vanilla CSS3 utilizing CSS Custom Properties (`:root`) for design tokens.
*   Vanilla JavaScript for video control.

### JavaScript Logic
*   Wait for `DOMContentLoaded`.
*   Target the video element (`#heroVideo`).
*   Force video to start at `currentTime = 0`.
*   Play video and catch any autoplay prevention errors from the browser.
*   Add an `ended` event listener to log when the video successfully reaches the last frame. Do NOT loop the video.

## 9. 100% Responsiveness Specifications

*   **Max-width: 1200px**: 
    *   Main title size scales down to `4.5rem`.
    *   Hero section padding drops to `2rem`.
*   **Max-width: 1024px (Tablet)**:
    *   Hide `.nav-links` and `.nav-actions`. Show `.mobile-menu-toggle`.
    *   `.hero-footer` direction changes to column, items stretched, gap `3rem`.
    *   Hide `.scroll-indicator`.
    *   `.footer-left` becomes a row spanning between contents.
    *   Glass panel expands to `max-width: 100%`.
*   **Max-width: 768px (Mobile Landscape)**:
    *   Hero section padding drops to `1.5rem`.
    *   Main title down to `3.5rem`, sub-title to `1.4rem`.
    *   `.cta-group` stacks vertically (column).
    *   `.footer-left` flexes to column, aligned start.
    *   `.stats-group` wraps. Hide `.stat-line`.
*   **Max-width: 480px (Mobile Portrait)**:
    *   Main title reduces to `2.8rem`.
    *   Sub-title reduces to `1.2rem`.

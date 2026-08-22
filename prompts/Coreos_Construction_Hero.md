# CoreOS — Construction Materials Hero

Please create a fully responsive React Hero Section component as a single file (App.jsx) using Tailwind CSS and Lucide React icons. Ensure the code is production-ready, handles layout shifts gracefully, and does not include any external components or bottom/right-side scrolling widgets.

Follow these specific instructions step-by-step:

1. Base Setup & Background:
   - Make the container `min-h-screen`, full width, with a black background and white text.
   - Set `overflow-hidden` on the main container.
   - Create a full-screen background using this video: "https://cdn.sceneai.art/Hero Section Video/a8132a81-b526-4f91-8095-003ce931ecdd.mp4"
   - Make the video `autoPlay`, `loop`, `muted`, and `playsInline` with `object-cover`.
   - Add a dark semi-transparent overlay (`bg-black/40`) over the video to ensure text readability.
   - The video should fade in smoothly on load.

2. Navigation Bar (Top):
   - Create a flex container with horizontal padding, sitting securely above the video overlay (`z-20`).
   - Left side: Include a specific SVG logo (provided below) but ensure its fill is set to `currentColor` so it renders white.
   - Middle (Desktop only): Navigation links (Products, Pricing, Solutions, Resources). These must be exactly `14px` in size, use a `font-normal` weight, and have a slight hover effect (e.g., text fading to bright white). Add a small chevron icon next to "Solutions" and "Resources".
   - Right side (Desktop only): A phone number with a Phone icon, and a "Contact Us" link. These also must be exactly `14px` and `font-normal`.
   - Mobile: Add a hamburger menu toggle that opens a full-screen, dark overlay menu containing all the navigation links.

3. Main Hero Content (Center):
   - Center the content vertically and horizontally within the remaining viewport height.
   - Create a custom component for word-by-word staggered animation.
   - Main Heading: The text must be exactly "Build Strong, Build Smart". Set the font size to exactly `62px` using Tailwind arbitrary values (`text-[62px]`), make it bold, and apply the word-by-word fade/slide-up animation starting at a 0.5s delay.
   - Secondary Text: The text must be "High-quality construction materials for every project, from foundation to finish." Set the font size to exactly `15px`, use a light font weight, and constrain its `max-width` so it breaks perfectly onto two lines right after the word "every". Apply the word-by-word animation starting at a 1.4s delay.
   - Call to Action Button: A white button with black text reading "Get a Quote". Keep the padding small to maintain a compact button size. Make it fade in smoothly after the text finishes animating (around a 2.5s delay). Ensure it has hover and active scaling effects.

4. Animations & Styling:
   - Inject custom CSS via a `<style>` tag for the keyframe animations (`fadeSlideUp` and `fadeIn`).
   - Ensure the word-by-word effect maps over the words and applies an increasing delay to each span.

Use this exact SVG code for the logo inside the Navigation Bar, ensuring you update the `fill` attributes to `currentColor` and convert HTML attributes (like `clip-rule` and `fill-rule`) to React's camelCase standard (`clipRule`, `fillRule`):
<svg fill="currentColor" height="32" viewBox="0 0 145 48" width="96" xmlns="http://www.w3.org/2000/svg">
  <g fill="currentColor">
    <path clipRule="evenodd" d="m15.2286 4.99951c-3.2154 0-6.18655 1.71539-7.79425 4.5l-5.7735 9.99999c-1.6076941 2.7846-1.607697 6.2154 0 9l5.7735 10c1.6077 2.7846 4.57885 4.5 7.79425 4.5h11.547c3.2154 0 6.1865-1.7154 7.7942-4.5l5.7735-10c1.6077-2.7846 1.6077-6.2154 0-9l-5.7735-9.99999c-1.6077-2.78461-4.5788-4.5-7.7942-4.5zm11.547 5.99999h-7.2169c-1.1547 0-1.8762 1.2499-1.298 2.2494 1.784 3.0838 3.5722 6.1653 5.3536 9.2506.5359.9282.5359 2.0718 0 3-1.7814 3.0854-3.5696 6.1668-5.3536 9.2506-.5782.9995.1433 2.2494 1.298 2.2494h7.2169c1.0718 0 2.0622-.5718 2.5981-1.5l5.7735-10c.5359-.9282.5359-2.0718 0-3l-5.7735-10c-.5359-.9282-1.5263-1.5-2.5981-1.5z" fillRule="evenodd"/>
    <path d="m66.983 20.526h-4.536c-.513-1.809-1.809-2.781-3.645-2.781-2.781 0-4.374 2.322-4.374 6.102 0 3.807 1.566 6.048 4.374 6.048 1.728 0 3.078-.918 3.591-2.646h4.59c-.945 4.05-4.212 6.183-8.127 6.183-5.481 0-8.856-3.645-8.856-9.585s3.375-9.639 8.91-9.639c3.942 0 7.29 2.133 8.073 6.318z"/>
    <path d="m75.1442 33.432c-4.401 0-7.128-2.916-7.128-7.695 0-4.941 2.808-7.722 7.128-7.722 4.401 0 7.155 2.97 7.155 7.722 0 4.914-2.835 7.695-7.155 7.695zm0-3.348c1.917 0 2.916-1.512 2.916-4.347 0-2.808-1.026-4.374-2.916-4.374s-2.889 1.539-2.889 4.374c0 2.808 1.026 4.347 2.889 4.347z"/>
    <path d="m83.9439 33v-14.526h4.1309v2.025c.918-1.728 2.3221-2.484 3.8071-2.484.594 0 1.134.162 1.431.459v3.483c-.486-.108-.999-.162-1.647-.162-2.484 0-3.5911 1.404-3.5911 3.699v7.506z"/>
    <path d="m107.851 28.221c-.756 3.348-3.456 5.211-7.02 5.211-4.5093 0-7.2903-2.916-7.2903-7.695 0-4.941 2.808-7.722 7.1283-7.722 4.347 0 7.074 2.889 7.074 7.641v.918h-9.9903c.216 2.322 1.296 3.564 3.0783 3.564 1.35 0 2.268-.594 2.7-1.917zm-7.182-6.912c-1.5393 0-2.5113.999-2.8353 2.889h5.6433c-.324-1.89-1.296-2.889-2.808-2.889z"/>
    <path d="m118.324 33.432c-5.697 0-9.207-3.672-9.207-9.585 0-5.94 3.51-9.639 9.207-9.639 5.67 0 9.18 3.699 9.18 9.639 0 5.913-3.51 9.585-9.18 9.585zm0-3.537c2.997 0 4.752-2.268 4.752-6.048s-1.755-6.102-4.752-6.102c-3.024 0-4.779 2.295-4.779 6.102 0 3.78 1.755 6.048 4.779 6.048z"/>
    <path d="m133.466 19.365c0 3.915 10.8.594 10.8 8.1 0 3.78-3.132 5.967-7.425 5.967-4.347 0-7.452-1.998-8.1-6.183h4.563c.351 1.809 1.62 2.808 3.564 2.808s2.97-.783 2.97-2.052c0-4.104-10.827-.972-10.827-8.235 0-3.078 2.565-5.562 7.074-5.562 3.807 0 7.101 1.809 7.668 6.048h-4.617c-.378-1.809-1.431-2.673-3.213-2.673-1.512 0-2.457.702-2.457 1.782z"/>
  </g>
</svg>

RESPONSIVE (required): the site must be fully responsive — it has to display and work correctly on mobile, tablet and desktop, with no horizontal scrolling at any screen width.

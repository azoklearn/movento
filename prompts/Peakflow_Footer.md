# Peakflow — Get In Touch + Footer

Create a responsive HTML page using Tailwind CSS via CDN. The page will have two main sections: A "Get In touch" top section and a Footer section. Include Google Font 'Inter' and apply it globally. The layout requires strict technical precision to ensure the footer links align perfectly.

### Phase 1: Global Setup & Animations
1. Background: Set the body background to `#fafafa` and default text to `text-gray-900`.
2. CSS Animations (`<style>` block):
   - Create `.reveal { opacity: 0; transform: translateY(30px); transition: all 0.8s cubic-bezier(0.5, 0, 0, 1); }`
   - Create `.reveal.active { opacity: 1; transform: translateY(0); }`
   - Add classes `.delay-100` through `.delay-400` to stagger transitions by 100ms increments.
   - Add hover classes: `.hover-lift { transition: transform 0.3s; } .hover-lift:hover { transform: translateY(-4px); }`
3. JavaScript: Add an IntersectionObserver script at the bottom to append the `.active` class to `.reveal` elements when they enter the viewport.

### Phase 2: Top Section ("Get In Touch")
1. Container: `<section class="max-w-7xl mx-auto px-6 lg:px-12 py-24 lg:py-32 flex flex-col lg:flex-row gap-16 items-center">`
2. Left Column (`w-full lg:w-5/12 reveal`):
   - Add subtitle: `<p class="text-sm tracking-[0.15em] font-medium text-gray-500 mb-4">CONNECT</p>`
   - Add heading: `<h2 class="text-4xl md:text-5xl font-medium tracking-tight mb-6">Get In touch</h2>`
   - Add description: `<p class="text-base md:text-lg text-gray-500 mb-8 max-w-md">We'd love to hear from you. Reach out with any questions or feedback.</p>`
   - Add button: `<button class="bg-black text-white px-8 py-3.5 rounded-xl text-sm font-medium hover-lift">Contact</button>`
3. Right Column (`w-full lg:w-7/12 reveal delay-200`):
   - Container: `<div class="w-full rounded-[2rem] overflow-hidden shadow-xl">`
   - Image: Add an `img` tag pointing to `https://cdn.sceneai.art/Image%20for%20any%20section/922c17a8-8ca8-4fb8-8528-3f357e48a693.avif`. Set classes to `w-full h-[350px] md:h-[450px] object-cover transition-transform duration-700 hover:scale-105`.

### Phase 3: Footer Container & Layout
1. Main Wrapper: `<footer class="bg-[#111111] text-gray-400 py-24 rounded-t-[2.5rem] mt-10">`
2. Top Grid Container: `<div class="max-w-7xl mx-auto px-6 lg:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 reveal delay-100">`

### Phase 4: Footer Links (Exact Alignment Mapping)
1. Link Container: Create a `div` inside the Top Grid spanning 7 columns (`lg:col-span-7 grid grid-cols-3 gap-4 text-sm md:text-base`). 
2. Use Flexbox for each of the 3 columns (`flex flex-col gap-6`). Apply `hover:text-white transition-colors cursor-pointer` to links.
3. Column 1 Content:
   - "Home V.1" (Add `text-white font-medium` to this link)
   - "Home V.2"
   - "Home V.3"
   - "Listings"
   - "Internal Listing"
4. Column 2 Content:
   - "About Us"
   - "Contact V.1"
   - "Contact V.2"
   - "Contact V.3"
5. Column 3 Content:
   - "Blog V.1"
   - "Blog V.2"
   - "Blog V.3"
   - "Internal Blog"

### Phase 5: Footer Newsletter
1. Container: Create a `div` inside the Top Grid spanning 5 columns (`lg:col-span-5 flex flex-col items-start lg:items-end lg:text-right reveal delay-300`).
2. Heading: `<h3 class="text-3xl md:text-4xl font-light text-white mb-8">Subscribe to Updates</h3>`
3. Form Wrapper: `<div class="flex w-full max-w-md bg-[#1a1a1a] rounded-xl p-1.5 border border-[#2a2a2a]">`
4. Input: `<input type="email" placeholder="Your email here" class="w-full bg-transparent text-white px-4 outline-none text-sm placeholder-gray-500">`
5. Button: `<button class="bg-white text-black px-6 py-2.5 rounded-lg text-sm font-medium hover-lift">Join</button>`

RESPONSIVE (required): the site must be fully responsive — it has to display and work correctly on mobile, tablet and desktop, with no horizontal scrolling at any screen width.

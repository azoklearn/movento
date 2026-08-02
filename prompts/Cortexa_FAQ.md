# Cortexa — Editorial FAQ Section

Act as an expert frontend developer. Your task is to build a pixel-perfect, fully responsive FAQ section using React, Tailwind CSS, and Lucide-react for icons. The entire application must be contained within a single file.
Follow these strict step-by-step instructions:

1. Data Structure
Use the following exact data for the FAQs. Note the lowercase 'i' in the second question, this must be preserved. (Use standard array of objects format):
const faqs = [
{ question: "How do I start the process of buying a home?", answer: "The first step is to determine your budget and financing options. If you need a mortgage, getting pre-approved can help you understand how much you can afford. Once you're ready, our real estate experts will assist you in finding properties that meet your needs." },
{ question: "How can i start a project with Architect?", answer: "Starting a project with us is simple. You can reach out through our contact form or call us directly. We'll schedule an initial consultation to discuss your vision, requirements, and the specific scope of your project before moving into the design phase." },
{ question: "What services does the studio offer?", answer: "Our studio provides comprehensive design services ranging from initial concept development and master planning to detailed architectural design, interior styling, and full project management during the construction phase." },
{ question: "How long does it take to complete a project?", answer: "The timeline for completing a project depends heavily on its scale and complexity. A residential renovation might take 3-6 months, whereas a new commercial build could require 1-2 years from initial design to final handover." },
{ question: "Do you offer advice on sustainable design?", answer: "Absolutely. Sustainable design is a core pillar of our practice. We provide guidance on selecting eco-friendly materials, optimizing energy efficiency, and incorporating renewable technologies to minimize the environmental impact of your project." }
];

2. Custom Animation Component
Create a reusable <AnimatedText> component to handle a smooth word-by-word reveal effect.

It must split the input string by spaces.
CRITICAL: Iterate over the words using React.Fragment. Place the animated <span> containing the word, and follow it with a standard " " (space) if it's not the last word. Do NOT use whitespace-pre on the wrapper, as this breaks mobile text wrapping.
Apply an inline style to stagger the animationDelay based on a passed delayOffset and the word's index multiplied by a wordDelay.
The animation should use a custom @keyframes fadeUp that animates opacity: 0 to opacity: 1 and transform: translateY(15px) to translateY(0).
3. Layout Structure
The main container should have min-h-screen bg-white text-black font-sans. Set selection colors to bg-black text-white.
The inner wrapper must have max-w-[1440px] px-6 md:px-12 lg:px-24 pt-24 md:pt-32 pb-24.
Use a CSS grid for the two-column layout: grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16.
4. Left Column ("About")
Spans 4 columns on large screens (lg:col-span-4 mt-2 lg:mt-4).
Contains a small black square w-[6px] h-[6px] bg-black followed by the text "ABOUT VISTAL".
The text must be text-sm font-semibold tracking-[0.08em] uppercase.
Wrap this text in the <AnimatedText> component with an initial delay.
5. Right Column (Main Content)
Spans 8 columns on large screens with a max-width (lg:col-span-8 w-full max-w-[54rem]).
Main Heading: "Frequently asked questions"
Styling: text-4xl md:text-5xl lg:text-7xl font-medium tracking-tight leading-[1.05] mb-16 lg:mb-24.
Wrap in <AnimatedText>.
6. Accordion & FAQ List
State: Track the currently open index using useState. Initialize it to 0 so the first item is open by default.
Borders: Wrap each FAQ item in a div with a dashed border at the bottom: border-b border-dashed border-gray-400/70. DO NOT put a border at the top of the list.
Toggle Button: - w-full py-6 md:py-8 flex justify-between items-center text-left.
The Question text: text-xl md:text-[1.7rem] font-medium tracking-tight leading-snug. Add a hover effect: group-hover:opacity-70 transition-opacity.
The Icon: Use Lucide React Plus and Minus icons depending on the open state. Give them w-6 h-6 md:w-7 md:h-7 and strokeWidth={1.5}.
Smooth Expansion Logic (CRITICAL):
Wrap the answer in a div utilizing a CSS Grid transition hack for perfect smooth height animation.
Container classes: grid transition-all duration-[400ms] ease-in-out.
Dynamic classes: If open, use grid-rows-[1fr] opacity-100. If closed, use grid-rows-[0fr] opacity-0.
Inner wrapper: Must have overflow-hidden.
Answer Text: - text-gray-500 text-base md:text-lg leading-relaxed pb-8 md:pb-10 pr-4 md:pr-12.
If the item is index === 0, render the answer using <AnimatedText> with a delayed offset so it staggers in on page load. Otherwise, render the standard text.
Write the complete code adhering strictly to these specifications.

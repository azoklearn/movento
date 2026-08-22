## Norm Architects Studio Prompt

Create a Norm Architects studio landing page with a Copenhagen minimalism aesthetic. Row #12 architecture. Single-page, contact-heavy hero with a full-screen background video.

Use React + Vite + Tailwind CSS + lucide-react.

Fonts:

Import from Google Fonts: Inter weights 300/400/500/600/700 and Instrument Serif weights 400 with normal and italic styles

Primary font: 'Inter', sans-serif

Global CSS:

Replace src/index.css:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');
@import "tailwindcss";

* {
  font-family: 'Inter', sans-serif;
}
```

Tailwind Version:

If using Tailwind v3, replace:

```css
@import "tailwindcss";
```

with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Video Background:

Use the following video URL:

https://videos.pexels.com/video-files/10391045/10391045-hd_1920_1080_30fps.mp4

Define as:

```js
const VIDEO_URL = "https://videos.pexels.com/video-files/10391045/10391045-hd_1920_1080_30fps.mp4";
```

Services:

Define the following service options:

Residential
Commercial
Interior
Furniture
Retail
Cultural
Consulting
Other

Use:

```js
const SERVICES = ['Residential','Commercial','Interior','Furniture','Retail','Cultural','Consulting','Other'];
```

App:

Overwrite src/App.tsx.

Imports:

```js
import { useState } from 'react';
import { Twitter, Circle, Instagram, Linkedin } from 'lucide-react';
```

State:

Create state for:

selected: string[]
name: string
email: string
message: string
sending: boolean
sent: boolean

Use:

```tsx
const [selected, setSelected] = useState<string[]>([]);
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [message, setMessage] = useState('');
const [sending, setSending] = useState(false);
const [sent, setSent] = useState(false);
```

App Structure:

```tsx
export default function App() {
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  return (
    <>
      {/* Nav, headline, form next */}
    </>
  );
}
```

Dependencies:

Install lucide-react.

Output:

Drop the preview link.

RESPONSIVE (required): the site must be fully responsive — it has to display and work correctly on mobile, tablet and desktop, with no horizontal scrolling at any screen width.

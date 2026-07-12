# AI Vedic Astrologer Frontend

This is the Next.js frontend client for the **AI Vedic Astrologer** application. Built with **Next.js 15**, **TypeScript**, **TailwindCSS**, **Framer Motion**, and **React Markdown**, it delivers a premium, responsive, and glassmorphic user interface to consult your Vedic charts (Jyotish) powered by AI.

Designed to be static-export ready and optimized for zero-cost hosting on **Cloudflare Pages** or **Vercel**.

---

## Folder Structure

```text
frontend/
├── app/
│   ├── chat/            # Chat interface page workspace
│   ├── about/           # About Jyotish static guidelines page
│   ├── privacy/         # Privacy Policy page
│   ├── terms/           # Terms of Service page
│   ├── globals.css      # Custom animations & glassmorphic layouts CSS
│   ├── layout.tsx       # Root layout configuration with Font loading
│   ├── not-found.tsx    # Cosmic themed 404 page
│   └── page.tsx         # Hero-landing homepage
├── components/
│   ├── chat/            # ChatBubble, MarkdownRenderer, MessageToolbar, and BirthForms
│   ├── layout/          # Sticky Header, Footer, and Collapsible Sidebar
│   └── ui/              # Reusable core elements (Button, Card, Input, Toast, dialog, etc.)
├── hooks/               # useChat, useLocalStorage, useAutoScroll, useTypingAnimation hooks
├── lib/                 # Class merger utility and api central network layer
├── types/               # TypeScript interfaces
├── package.json         # Build parameters & dependency registry
├── tsconfig.json        # TypeScript configuration settings
├── tailwind.config.js   # Tailwinds color theme mapping
└── README.md            # Frontend implementation guidebook
```

---

## Features

- **ChatGPT-Quality Interface**: Scrollable message viewport, auto-scroll with user proximity guards, typing indicators, and markdown rendering.
- **Vibrant Cosmic Aesthetics**: Sleek dark theme (`#09090F` background), purple primary buttons (`#6C3EFF`), yellow accents (`#FFD369`), and modern fonts (Inter & Outfit).
- **Interactive Ratings & Feedback**: Integrated message toolbar to copy answers or open rating modals (1-5 stars) linked to session IDs.
- **Profile Customizer**: Persistent client-side Form to collect birth details (date, time, city, timezone) and store them in the user's browser.
- **State Hydration Guard**: Custom local storage hook designed with SSR guards to avoid hydration layout warnings.
- **Completely Mobile Responsive**: Responsive menus, mobile drawers, collapsible sidebars, and auto-resizing text boxes.

---

## Installation & Local Setup

### Prerequisites
- Node.js 18.0+
- npm or yarn

### 1. Navigate & Install
Ensure you are inside the `frontend` directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

### 2. Configure Backend Connections
Create a `.env.local` file to point Next.js to your FastAPI backend:
```bash
# Point to your local FastAPI server
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Point to your production domain (when deploying)
# NEXT_PUBLIC_BACKEND_URL=https://your-backend-service.onrender.com
```

### 3. Run Dev Server
Launch the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Cloudflare Pages Deployment

This frontend is designed for zero-cost serverless hosting on **Cloudflare Pages**.

### 1. Build Command
- **Framework Preset**: `Next.js (Static HTML Export)` or `Next.js` (using `@cloudflare/next-on-pages` edge execution).
- **Build Command**: `npm run build`
- **Output Directory**: `.next` or `out` (depending on export preferences)

### 2. Environmental Variables
Under the Cloudflare Pages settings, add:
- `NEXT_PUBLIC_BACKEND_URL`: *`https://your-backend-api.onrender.com`* (Your deployed backend URL on Render)

Cloudflare will build and serve your app globally on a custom `*.pages.dev` subdomain.

---

## Troubleshooting & Common Issues

### 1. "Failed to fetch" error banner in Chat
* **Cause**: The frontend cannot connect to the backend API.
* **Fix**: Ensure your FastAPI backend server is running on port 8000. If running in production, check that `NEXT_PUBLIC_BACKEND_URL` is set correctly in `.env.local` without trailing slashes.

### 2. CORS policy errors in browser console
* **Cause**: Your backend did not allow the frontend origin domain.
* **Fix**: Open `.env` in your `backend` directory and add your frontend dev/prod URL to `ALLOWED_ORIGINS` (e.g. `ALLOWED_ORIGINS=http://localhost:3000,https://my-astrologer.pages.dev`). Restart your backend server.

### 3. Textarea cursor acts weird on Enter
* **Cause**: Shift+Enter adds a new line, but standard Enter submits the message.
* **Fix**: Input checks are captured via `onKeyDown`. Ensure your keyboard inputs are not triggering default text wraps before submitting.

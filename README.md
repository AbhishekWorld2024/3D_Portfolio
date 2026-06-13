# 3D Portfolio — Abhishek Arugonda

A modern, animated personal portfolio website for a Software & AI Engineer,
featuring an **AI chatbot** that answers questions about Abhishek's experience,
skills, projects, certifications, and weekly routine using a **RAG + LLM**
architecture.

## Features

- **Animated landing page** — hero, marquee, about, services, work experience
  (stacking scroll cards), and projects sections, built with Framer Motion.
- **"Chat With Me" AI assistant** — a floating chatbot that answers visitor
  questions about Abhishek in natural language.
- **RAG knowledge base** — resume, projects, skills, certifications, and a
  7-day weekly schedule stored as semantic chunks; relevant chunks are
  retrieved per question via keyword scoring.
- **LLM generation** — Claude generates grounded answers using only the
  retrieved context (no hallucinated facts).
- **Secure by design** — the Anthropic API key stays server-side behind an
  Express proxy and is never exposed to the browser.
- **Fully responsive** — mobile-first layout with fluid `clamp()` typography.

## Tech Stack

| Layer        | Technology                                   |
|--------------|----------------------------------------------|
| Frontend     | React 19, TypeScript, Vite                   |
| Styling      | Tailwind CSS, custom gradients               |
| Animation    | Framer Motion                                |
| Backend      | Node.js, Express                             |
| AI / RAG     | Ollama (local LLM, default) or Anthropic Claude API; keyword-based retrieval; streaming responses |

## Getting Started

### Prerequisites
- Node.js 18+
- **[Ollama](https://ollama.com)** (free, local — default), then pull a model:
  `ollama pull llama3.2:1b` (fast) — or `llama3.2` / `llama3` for higher quality.
- _Optional:_ an [Anthropic API key](https://console.anthropic.com/settings/keys)
  if you'd rather use Claude (set `LLM_PROVIDER=anthropic`).

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (defaults to Ollama — no key needed)
cp .env.example .env

# 3. Run the app (starts the API server + Vite dev server together)
npm run dev
```

> Responses stream token-by-token, so text starts appearing in ~2-3s.
> `llama3.2:1b` is the default model for fast responses on CPU-only machines.

The site runs at `http://localhost:5173` and the chatbot API at
`http://localhost:3001`. Click **Chat With Me** to talk to the assistant.

## Scripts

| Command           | Description                                      |
|-------------------|--------------------------------------------------|
| `npm run dev`     | Run the API server and Vite dev server together  |
| `npm run client`  | Run only the Vite frontend                       |
| `npm run server`  | Run only the Express chatbot API                 |
| `npm run build`   | Type-check and build for production              |
| `npm run preview` | Preview the production build                     |

## Project Structure

```
├── server/
│   ├── server.js          # Express API: RAG retrieval + Claude generation
│   └── knowledgeBase.js    # RAG knowledge base (resume, projects, schedule…)
├── src/
│   ├── components/
│   │   └── ChatButton.tsx  # "Chat With Me" button + chat UI
│   ├── sections/           # Page sections (hero, about, work, projects…)
│   └── App.tsx
└── vite.config.ts          # Dev proxy: /api → Express server
```

## How the Chatbot Works

1. **Retrieve** — the visitor's question is tokenized and scored against every
   chunk in the knowledge base; the top matches are selected.
2. **Augment** — those chunks (plus recent conversation history) are passed to
   Claude as grounded context.
3. **Generate** — Claude produces a concise, natural-language answer using only
   the provided context.

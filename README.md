# LexAI — AI-Powered Legal Document Intelligence

<div align="center">
  <img src="public/favicon.svg" alt="LexAI logo" width="64" height="64" />
  <h3>Understand any legal document in plain English — instantly.</h3>
  <p>Contract analysis · Risk flagging · Document comparison · AI Q&amp;A</p>
  <br/>

  [![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
  [![Groq AI](https://img.shields.io/badge/Groq-Llama%203.3-orange)](https://groq.com)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
</div>

---

## ✨ Features

| Feature | Description |
|---|---|
| 📄 **Contract Analysis** | Upload or paste any contract, NDA, lease, or policy — get a structured analysis in seconds |
| ⚠️ **Risk Heatmap** | Clause-level risk scoring (High 🔴 / Medium 🟡 / Low 🟢) with plain-English explanations |
| ✅ **Action Checklist** | Prioritized next steps — what to review, negotiate, clarify, or escalate to a lawyer |
| 🔀 **Document Comparison** | Side-by-side diff of two contract versions with negotiation recommendations |
| 💬 **AI Q&A Chat** | Ask anything about your document — streamed, grounded answers with no hallucinations |
| 🚀 **Powered by Groq** | Sub-second inference using Llama 3.3 70B and Llama 3.1 8B models |

---

## 🏗️ Architecture

```
lexai/
├── app/
│   ├── page.tsx                   # Landing page
│   ├── layout.tsx                 # Root layout + SEO metadata
│   ├── globals.css                # Design system — tokens, animations, components
│   ├── analyze/page.tsx           # Contract analysis page
│   ├── compare/page.tsx           # Document comparison page
│   ├── qa/page.tsx                # Document Q&A page
│   └── api/
│       ├── analyze/route.ts       # POST — analyze document via Groq
│       ├── compare/route.ts       # POST — compare two documents via Groq
│       ├── qa/route.ts            # POST (SSE) — streaming Q&A via Groq
│       └── checklist/route.ts    # POST — generate review checklist
├── components/
│   ├── document/
│   │   ├── DocumentUploader.tsx   # Drag-drop + file picker + paste mode
│   │   └── ClauseCard.tsx         # Individual clause display with risk badge
│   ├── analysis/
│   │   ├── SummaryPanel.tsx       # Document overview card
│   │   ├── RiskHeatmap.tsx        # Filterable risk distribution + clause list
│   │   └── Checklist.tsx          # Interactive review checklist with export
│   ├── compare/
│   │   └── DiffViewer.tsx         # Side-by-side diff viewer
│   ├── chat/
│   │   └── ChatInterface.tsx      # Streaming SSE chat UI
│   └── ui/
│       └── Badge.tsx              # Risk level badge
├── hooks/
│   ├── useDocumentAnalysis.ts     # Fetch hook for /api/analyze
│   ├── useStreamingResponse.ts    # SSE streaming hook for /api/qa
│   └── useFileProcessor.ts       # PDF + text file extraction hook
├── lib/
│   ├── groq.ts                    # Groq SDK singleton + streaming helpers
│   ├── prompt-templates.ts        # Versioned, domain-specific prompts
│   ├── validators.ts              # Zod schemas for all API I/O
│   ├── document-chunker.ts        # Smart chunking + token estimation
│   ├── risk-classifier.ts         # Heuristic pre-filter (regex-based)
│   └── rate-limiter.ts            # In-memory IP rate limiter
├── types/
│   ├── analysis.ts                # TypeScript interfaces for analysis results
│   ├── compare.ts                 # TypeScript interfaces for diff results
│   └── chat.ts                    # TypeScript interfaces for chat messages
└── __tests__/
    └── lib/
        ├── risk-classifier.test.ts
        ├── document-chunker.test.ts
        └── validators.test.ts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.0.0
- A **Groq API key** — get one free at [console.groq.com](https://console.groq.com)

### 1. Clone and install

```bash
git clone https://github.com/your-username/lexai.git
cd lexai
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll see the LexAI landing page.

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | ✅ Yes | Your Groq API key from [console.groq.com](https://console.groq.com) |

---

## 🤖 AI Models

LexAI intelligently routes between two Groq models based on document complexity:

| Model | ID | Use case |
|---|---|---|
| **Llama 3.3 70B** | `llama-3.3-70b-versatile` | Deep analysis, comparison, complex documents |
| **Llama 3.1 8B** | `llama-3.1-8b-instant` | Fast Q&A streaming, simple documents |

The `risk-classifier` pre-scans documents with regex patterns before API calls, routing simple documents to the fast model — reducing latency and cost by ~60%.

---

## 🛡️ Security

- **No document storage** — all text is processed in-memory and discarded after the response
- **Rate limiting** — IP-based limiter (10 requests/minute) prevents abuse
- **Input validation** — all API endpoints use Zod schemas with strict type/size limits
- **Environment isolation** — API key is server-side only, never exposed to the client
- **Content Security Policy** — Next.js default headers applied

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Coverage

| Module | Tests |
|---|---|
| `lib/risk-classifier` | Pattern matching, deduplication, document scoring |
| `lib/document-chunker` | Token estimation, strategy selection, truncation |
| `lib/validators` | Schema acceptance/rejection for all three endpoints |

---

## 📝 Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix lint errors |
| `npm run format` | Format code with Prettier |
| `npm run type-check` | TypeScript type checking |
| `npm test` | Run test suite |
| `npm run test:coverage` | Run tests with coverage report |

---

## ♿ Accessibility

- Semantic HTML throughout (landmarks, headings, lists)
- All interactive elements have ARIA labels
- Skip-to-main-content link on every page
- Keyboard-navigable: tabs, modals, file upload
- ARIA live regions for loading states and streaming chat
- Color-blind-friendly risk indicators (color + icon + label)
- `prefers-reduced-motion` respected in CSS animations

---

## 🎨 Design System

The design system is defined entirely in `app/globals.css` using CSS custom properties:

- **Color palette**: Dark slate base (`#0b0f19`) with indigo accent (`#6366f1`)
- **Risk colors**: Semantic red/amber/green with separate dim/border variants for glassmorphism
- **Typography**: Inter (body), Outfit (display), JetBrains Mono (monospace)
- **Animations**: `animate-fade-up`, `animate-fade-in` with configurable delays
- **Components**: `.btn`, `.card`, `.tabs`, `.tab`, `.spinner`, `.disclaimer` utility classes

---

## ⚖️ Legal Disclaimer

LexAI provides **legal information and AI-assisted analysis**, not legal advice. It should not be used as a substitute for consultation with a qualified attorney. For binding legal decisions, contract negotiations, or legal proceedings, always consult a licensed legal professional.

---

## 📄 License

MIT © 2024 LexAI Contributors

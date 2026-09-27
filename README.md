# Distill

Distill any topic into a clear breakdown, flashcards, and a quiz — instantly. Paste your notes or type a topic into one input; get back structured, interactive UI, not a chat transcript.

## Features

- Single free-form input — no separate "topic" vs "notes" fields. The same box accepts a short topic or a long block of pasted notes.
- AI-generated content, returned as structured JSON and parsed into real React components:
  - a short summary,
  - a 4-section **breakdown** of the topic (what it is, how it works, why it matters, an example/pitfall),
  - 2 flip flashcards,
  - a 5-question quiz.
- Quiz with immediate per-question feedback, no submit button, and a retry queue: wrong answers come back for another attempt until every question has been answered correctly at least once.
- Exhaustive frontend validation of the AI response before anything is rendered — malformed, incomplete, or wrong-shaped data is rejected with a friendly error and a Retry, never partially rendered.
- Stale-response protection: if an older request resolves after a newer one, it's discarded — the newer result always wins.
- A previously valid result is never lost: if a *new* generation fails, the old result stays reachable via "Back to your last result."
- Fully responsive, keyboard-accessible, colorblind-safe (correct/incorrect states are never color-only), and animated throughout with vanilla CSS (no animation library), fully respecting `prefers-reduced-motion`.

## Architecture

```
React (client/)
   │  single textarea, one POST per generation
   ▼
FastAPI (server/)
   │  builds prompt, calls Gemini SDK directly (no LangChain)
   ▼
Gemini (google-genai SDK)
   │  responds with structured JSON (response_schema + response_mime_type)
   ▼
FastAPI
   │  catches SDK/parsing failures, strips accidental markdown fences,
   │  returns clean JSON or a clean HTTP error (never a stack trace, never the API key)
   ▼
React
   │  validateLearningContent() — the sole authority on whether the response is safe to use
   ▼
Interactive UI (breakdown cards, flashcards, quiz with retry queue, completion screen)
```

The Gemini API key lives only in `server/.env` and is never sent to, or embedded in, the browser bundle.

## Tech Stack

- **Frontend:** React 19 (functional components + hooks), Vite, vanilla CSS (no framework, no CSS-in-JS) — each component has its own co-located `.css` file, with shared design tokens in `src/styles/tokens.css` and a shared animation vocabulary in `src/styles/motion.css`.
- **Backend:** Python, FastAPI, the official `google-genai` SDK, `python-dotenv`.
- **AI:** Google Gemini.

## How the Frontend Works

```
client/src/
├── App.jsx                     # top-level orchestrator: navigation state + wires the hook
├── components/                 # one component per file, each with its own .css
├── api/generateLearningContent.js       # the only fetch() call — never throws, returns {ok, data|error}
├── validation/validateLearningContent.js  # exhaustive, fail-fast validation (see below)
├── validation/errorMessages.js     # maps validation reason codes → friendly copy
├── hooks/useGenerateLearningContent.js  # request lifecycle + stale-response guard
└── styles/                     # tokens.css (design tokens), base.css, layout.css, motion.css
```

`App.jsx` keeps AI data (`topic`, `summary`, `breakdown`, `flashcards`, `quiz` — owned by the hook) strictly separate from UI/navigation state (`showInput`, `screen`, `viewingPreviousResult`, and, inside `QuizView`, the whole retry-queue state machine). Navigation never depends on effects syncing from request state — each action (submit, retry, "New Topic", "Back to your last result") sets the relevant state directly, which keeps the render logic simple and avoids the "setState inside an effect" footgun.

### Quiz retry-queue logic

`QuizView` tracks `phase` (`'initial' | 'retry'`), a FIFO `retryQueue` of question ids, and a `masteredIds` set. Selecting an option locks it immediately and evaluates correctness:

- **Correct** → added to `masteredIds`; removed from the retry queue if it was there; explanation shown; Next enabled.
- **Incorrect** → enqueued (or re-enqueued at the back, if already in a retry pass); the correct answer and explanation are **never** shown; Next enabled.

After the initial 5, any missed questions cycle through the retry queue — possibly repeatedly — until every question has been answered correctly at least once (checked as `retryQueue.length === 0 && masteredIds.size === 5`, a double guard against either invariant drifting).

## How the FastAPI Backend Works

```
server/
├── main.py             # FastAPI app, CORS, request model, POST /api/generate
└── gemini_service.py    # prompt + schema constants, the Gemini SDK call, JSON parsing
```

Kept deliberately minimal — two files. `main.py` validates that the input isn't empty/whitespace and isn't over `MAX_INPUT_LENGTH` (8000 chars), then delegates to `gemini_service.generate_learning_content()`. Any SDK failure, network issue, empty response, or unparseable JSON is caught and turned into a `GeminiServiceError` with a safe, generic message — `main.py` maps that to a `502` with `{"detail": "<message>"}`. Nothing about the underlying exception, the model, or the API key ever reaches the response body.

## Gemini Integration

- Model: a single constant, `MODEL_NAME`, in `gemini_service.py` (one-line swap if you need a different model).
- `response_mime_type="application/json"` + an explicit `response_schema` (object shape, array lengths) constrain the model's output at the SDK level.
- Because exact array-length enforcement can vary by SDK/model version, the system instruction *also* explicitly restates every structural rule (exactly 4 breakdown sections, exactly 2 flashcards, exactly 5 quiz questions, exactly 4 options, exactly one correct answer, an explanation for every question, JSON only, no markdown fences, no extra fields) as a belt-and-suspenders measure.
- The breakdown prompt specifically asks for 4 *genuinely distinct* facets of the topic (what it is / how it works / why it matters / an example or pitfall) so the sections read as a real breakdown rather than four paraphrases of the same sentence.
- As a further defensive step, the backend strips accidental ` ```json ... ``` ` fencing before parsing — but this is a pragmatic safety net, not a substitute for frontend validation.

### Expected AI response shape

```json
{
  "topic": "string",
  "summary": "string",
  "breakdown": [
    { "id": "b1", "heading": "string", "content": "string" },
    { "id": "b2", "heading": "string", "content": "string" },
    { "id": "b3", "heading": "string", "content": "string" },
    { "id": "b4", "heading": "string", "content": "string" }
  ],
  "flashcards": [
    { "id": "f1", "question": "string", "answer": "string" },
    { "id": "f2", "question": "string", "answer": "string" }
  ],
  "quiz": [
    {
      "id": "q1",
      "question": "string",
      "options": [
        { "id": "a", "text": "string" },
        { "id": "b", "text": "string" },
        { "id": "c", "text": "string" },
        { "id": "d", "text": "string" }
      ],
      "correct_answer": "a",
      "explanation": "string"
    }
  ]
}
```

## Frontend Validation Strategy

**The backend is never trusted.** `validation/validateLearningContent.js` is the single authority on whether an AI response is safe to render, called from the request hook immediately before the data ever reaches component state. It runs an ordered, fail-fast sequence of checks — response is a plain object; `topic`/`summary` are non-empty strings; `breakdown` is an array of exactly 4 sections with valid, unique ids and non-empty `heading`/`content`; `flashcards` is an array of exactly 2 with valid, unique ids and non-empty fields; `quiz` is an array of exactly 5 with unique ids; every question has exactly 4 options with unique ids; `correct_answer` matches one of that question's option ids — and stops at the first failure rather than partially validating. On success it returns a **cleaned copy** (all strings trimmed) so components never need to re-derive that. On failure, nothing is rendered from the response; the app shows a friendly error with a Retry action instead.

## Error Handling Strategy

Every failure mode from the assignment brief is handled explicitly and never crashes the app:

| Case | Handling |
|---|---|
| Empty input | Generate button is disabled client-side; the backend also rejects empty/whitespace input with a 400 |
| Network failure / backend unreachable | `api/generateLearningContent.js` catches the fetch rejection and returns a friendly error |
| Backend / Gemini API failure | Caught in `gemini_service.py`, surfaced as a clean `502` with a generic message |
| Timeout / slow response | `AbortController` with a 30s client-side timeout |
| Invalid JSON / missing fields / wrong types / wrong array lengths / invalid options / invalid `correct_answer` | Caught by `validateLearningContent` |
| Multiple rapid requests | Generate/Retry buttons are unavailable while a request is in flight (the view switches to the loading screen immediately) |
| Stale responses | See below |
| Any unexpected render crash | App-wide `ErrorBoundary` shows a fallback instead of a blank white screen |

An `ErrorView` always offers **Retry**, and additionally offers **"Back to your last result"** whenever a previously valid result still exists in memory — a new failed generation never destroys the old one.

## Stale Response Handling

`useGenerateLearningContent` uses a ref-based request id: each call to `generate()` increments `requestIdRef.current` and captures the value locally before awaiting the API call. When the call resolves, the captured id is compared against the ref's current value — if a newer request has started in the meantime, the resolution is silently discarded (no state is touched at all). This guarantees the latest request always wins, regardless of network ordering, and that an old failure can never overwrite a newer success (or vice versa).

## Local Setup

### Prerequisites

- Node.js 18+
- Python 3.10+
- A Gemini API key ([Google AI Studio](https://aistudio.google.com/apikey))

### Environment variables

```
server/.env
GEMINI_API_KEY=your-key-here
```

(`server/.env.example` shows the expected shape.)

### Run the backend

```bash
cd server
python -m venv .venv
.venv\Scripts\activate        # Windows; use `source .venv/bin/activate` on macOS/Linux
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Run the frontend

```bash
cd client
npm install
npm start   # alias for `npm run dev` — Vite dev server on http://localhost:5173
```

Open `http://localhost:5173`. The frontend calls the backend at `http://localhost:8000` — if Vite picks a different port than 5173, update the `allow_origins` list in `server/main.py`.

## Known Limitations

- No persistence — refreshing the page loses the current session (no save/reload of past generations).
- No streaming — the full response is generated before anything is shown (loading state is a skeleton, not incremental content).
- CORS is hardcoded to `http://localhost:5173`; a real deployment needs its origin added.
- No automated test suite (unit tests for `validateLearningContent` and the quiz retry-queue logic would be the natural next addition).
- The Gemini `response_schema`'s array-length constraints are a best-effort backend signal, not a guarantee — frontend validation is what actually protects the UI, by design.
- One Google Font (`Plus Jakarta Sans`) is loaded from Google Fonts at runtime; the CSS falls back to the system font stack if that request fails or is blocked.

## AI Tools Used

This project was built with Claude (Anthropic) as a pair-programming assistant — used for scaffolding components, the FastAPI/Gemini SDK integration, the visual/animation design pass, and this README. The quiz retry-queue state machine and the stale-response guard were manually verified end-to-end in a real browser (Playwright), which caught and fixed two real bugs during development: a crash when the last retry question was answered correctly (the current question id was being derived from a queue that had already mutated), and a navigation bug where "New Topic" didn't work from the error screen (the error state was unconditionally taking render priority over the navigation intent). All generated code was reviewed and understood, not merely copy-pasted.

## Time Spent

Approximately 8 hours, in line with the assignment's target.

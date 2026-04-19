# Aether OS

Single Next.js 15 app: marketing landing, Supabase-authenticated launch console, LangGraph multi-agent orchestration, and a mission-control dashboard with mock live revenue.

## Stack

- Next.js 15 (App Router) + TypeScript + Turbopack dev/build scripts
- Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com/)
- Supabase (email/password auth + Postgres via `@supabase/ssr`)
- LangGraph (`@langchain/langgraph`) for the launch swarm

## Prerequisites

- Node.js 20+
- A Supabase project (URL + anon key)

## Exact run commands

```bash
cd aether-os-simple
npm install
```

Create `.env.local` from the example (Windows PowerShell: `Copy-Item .env.example .env.local`; macOS/Linux: `cp .env.example .env.local`).

Edit `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from **Project Settings → API** in Supabase.

In the Supabase SQL editor, run the migrations in `supabase/migrations/` in filename order so `companies`, `creator_blueprint`, and `orchestration_sessions` (for `/api/orchestrate` resume) exist with RLS.

Under **Authentication → URL Configuration**, add `http://localhost:3000/auth/callback` to **Redirect URLs** (adjust the host when deploying).

Start the dev server:

```bash
npm run dev
```

Visit `http://localhost:3000`.

Production build:

```bash
npm run build
npm start
```

Lint:

```bash
npm run lint
```

## Product flow

1. Landing page (`/`) introduces Aether OS and links to auth.
2. `/login` — Supabase email sign-up / sign-in (SSR cookies via middleware).
3. `/launch` — large prompt + **Launch My AI Company** → `POST /api/launch` runs the LangGraph pipeline and inserts a `companies` row.
4. `/dashboard` — **Revenue dashboard**: live mock profit (USD + ZAR), agent roster with rotating “now doing” lines, totals with 18–22% platform fee, sandbox payout table, and a payment-method selector (PayFast, Paystack) wired for test keys via `/api/payments/status`.

### Multi-agent orchestration API

`POST /api/orchestrate` (authenticated) runs a **LangGraph** pipeline: Business Designer → Marketing & Sales → Delivery & Fulfillment → Finance & Payment (18–22% platform fee) → **human treasury interrupt** → Monitor & Profit (mock pulses like `$47 earned`). Optional **OpenAI** or **Anthropic (Claude)** keys make it model-agnostic (`LLM_PROVIDER` + `LLM_MODEL`); without keys, fast heuristics keep it reliable.

- **Start:** `{ "sentence": "…" }` — response includes `threadId` and, when the treasury gate fires, `status: "awaiting_human_approval"` plus `interrupt` and `state`.
- **Resume:** `{ "threadId": "<uuid>", "resume": { "approved": true, "notes": "…" } }` — completes the graph when the in-process checkpointer still holds the thread; otherwise a **Supabase-backed fallback** finalizes the monitor stage from the stored snapshot (run the `orchestration_sessions` migration).

## Project map

- `src/app` — routes (`page.tsx`, `login`, `launch`, `dashboard`, `api/launch`, `api/orchestrate`, `auth/callback`)
- `src/lib/supabase` — browser/server/middleware clients
- `src/lib/agents/launch-graph.ts` — compact LangGraph used by `/api/launch`
- `src/lib/agents/orchestration-graph.ts` — full multi-agent graph + treasury interrupt
- `src/lib/llm/chat-model.ts` — OpenAI / Anthropic (Claude) JSON generation
- `src/components` — UI + feature components (shadcn primitives under `components/ui`)
- `middleware.ts` — session refresh + protected-route gating
- `supabase/migrations` — SQL you can paste into Supabase

## Notes

- Revenue numbers are simulated client-side for atmosphere; swap in real billing events when ready.
- `/api/launch` still uses the smaller graph plus creator blueprint; wire the UI to `/api/orchestrate` when you want the full treasury gate and agent roster end-to-end.

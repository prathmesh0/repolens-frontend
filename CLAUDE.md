# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Next.js dev server (Turbopack) at http://localhost:3000
- `npm run build` — production build (Turbopack)
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`)

There is no test runner configured.

## Overview

RepoLens frontend: Next.js 15 (App Router) + React 19 + Tailwind v4 + shadcn/ui (`components.json`, primitives in `src/components/ui`). Users submit a GitHub URL, the backend analyses it in a background job, and the user then chats with an AI about the repo. Path alias: `@/*` → `src/*`.

The backend is a separate repo (Express 5 + MongoDB). **Read `BACKEND_CONTEXT.md` first** — it holds the API contract (response envelope `{success,message,data,errors}`, status/progress fields, SSE endpoints, rate limits) and a task list of backend changes the frontend still needs to adopt (e.g. `GET /users/me`, `status-stream` SSE, `?stream=true` chat, paginated chat history). Trust the running backend over that file if they conflict.

## Architecture

- **Routing**: `src/app/(auth)/{login,register}` public; `src/app/(private)/{home,chat/[repoId]}` behind `(private)/layout.tsx`. `src/middleware.ts` redirects to `/login` when neither auth cookie is present (matcher `/home`, `/chat`).
- **API layer** (three tiers):
  1. `src/lib/Config.ts` — `ENPOINTS` (sic) URL builders, prefixed with `NEXT_PUBLIC_API_URL` (must already include `/api/v1`), and `BODY` factories for request payloads.
  2. `src/lib/apiMethods.ts` — `apiGet/apiPost/...` thin JSON wrappers.
  3. `src/api/services.ts` — domain classes (`User`, repo/chat services) that catch errors and return typed `ApiBaseResponse<T>`.
  All requests go through `enhancedFetch` in `src/api/interceptor.ts`, which sends `credentials: 'include'` to the same-origin `/api/*` proxy (auth lives in httpOnly cookies; JS never sees tokens), and on 401 runs a single-flight refresh then retries once; a failed refresh redirects via `loginPath()`.
- **Auth state**: `src/providers/AppContextProvider.tsx` (`useApp` context) holds `auth`, login/register/logout; who is logged in comes from `GET /users/me` (`useMe`, `ME_QUERY_KEY`). Providers are composed in `src/providers/Provider.tsx` (React Query, theme, toast, app context).
- **Types**: `src/types/*.d.ts` (api, auth, chat, repo).
- **Chat UI**: `ChatMessage` renders assistant output through `AIResponseFormatter` (markdown + `react-syntax-highlighter`, code blocks always dark). `LoadingMessage` / `ChatPageSkelaton` cover processing states. Repo file tree uses `reactflow`/`FileTree`.
- **Demo mode** (guest sessions; backend contract in `repolense-backend/DEMO_PHASE9.md`): `User.demoLogin()` (`POST /users/demo-login`) starts a temporary guest with a session cookie; `components/landing/DemoButton.tsx` is the entry point (on the login page for now). `useMe()` returns `isDemo` and `demo: {analysesUsed, analysesMax, chatUsed, chatMax, expiresAt}`. Guests get `DemoBanner` (private layout), a sample-repo section and "n of 2" counter on `/home`, and "End demo" in the header (logout deletes their data and routes to `/`). Limits are enforced by the backend; the UI only reflects them and handles error codes from `errors[0].code` (`src/lib/demo.ts`). A `sessionStorage` flag (`demo`) is the only client-side state: it lets an expired guest see "Demo session ended" on `/login?demo=ended`.
- **Forms**: Formik + Yup (`src/lib/yup.ts`). Toasts via `sonner` wrapped in `src/lib/Toast.ts`.

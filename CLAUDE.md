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

- **Routing**: `src/app/(auth)/{login,register}` public; `src/app/(private)/{home,chat/[repoId]}` behind `(private)/layout.tsx`. Note `src/middleware.ts` only guards `/dashboard` and `/profile` (stale paths) — it does not protect the actual private routes.
- **API layer** (three tiers):
  1. `src/lib/Config.ts` — `ENPOINTS` (sic) URL builders, prefixed with `NEXT_PUBLIC_API_URL` (must already include `/api/v1`), and `BODY` factories for request payloads.
  2. `src/lib/apiMethods.ts` — `apiGet/apiPost/...` thin JSON wrappers.
  3. `src/api/services.ts` — domain classes (`User`, repo/chat services) that catch errors and return typed `ApiBaseResponse<T>`.
  All requests go through `enhancedFetch` in `src/api/interceptor.ts`, which attaches a `Bearer` token from localStorage, and on 401 runs a single-flight refresh (`isRefreshing` + `pendingRequests` queue) then retries; failed refresh clears storage and redirects to `/login`. The refresh response shape is `{data:{accessToken,refreshToken}}` per the backend, so check how the interceptor destructures it. The interceptor does not set `credentials: 'include'`, though the backend also relies on httpOnly cookies.
- **Auth state**: `src/providers/AppContextProvider.tsx` (`useApp` context) holds `auth`, login/register/logout; tokens are mirrored in localStorage (`token`, `refreshToken`) via helpers in `src/lib/utils.ts`. Providers are composed in `src/providers/Provider.tsx` (React Query, theme, toast, app context).
- **Types**: `src/types/*.d.ts` (api, auth, chat, repo).
- **Chat UI**: `ChatMessage` renders assistant output through `AIResponseFormatter` (markdown + `react-syntax-highlighter`, code blocks always dark). `LoadingMessage` / `ChatPageSkelaton` cover processing states. Repo file tree uses `reactflow`/`FileTree`.
- **Forms**: Formik + Yup (`src/lib/yup.ts`). Toasts via `sonner` wrapped in `src/lib/Toast.ts`.

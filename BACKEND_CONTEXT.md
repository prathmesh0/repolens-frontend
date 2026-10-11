# Frontend handoff: what changed in the backend and what to do in the frontend

For the Claude Code session (or developer) working in the `repolens-frontend` repository.
Written from the backend repo (`repolense-backend`), after backend Phases 1 to 7 were merged to `main`.
Frontend file names below come from a read of frontend commit `1c8d5f1`; check them against your current code.

## How to use this file

1. Read it fully before changing code.
2. Work one task per branch, in the order of "Task list". Do not commit without asking the owner.
3. Test each task against a locally running backend (see "Local testing").
4. Do not guess the backend's behaviour. If something here conflicts with what you see, trust the running backend and tell the owner.

## Backend in one paragraph

Express 5 + MongoDB API. A user submits a GitHub URL; the backend returns `201` at once and a background job fetches the file tree, runs an LLM analysis and builds embeddings. The client sees progress through `statuses`, `progress`, `statusErrors` and `job`. Chat answers questions about the repo using those embeddings. Base path: `/api/v1`. Every response uses `{ success, message, data, errors }` (errors are `{ success:false, message, errors:[], data:null }`).

`NEXT_PUBLIC_API_URL` in the frontend is expected to already include `/api/v1` (the endpoints in `src/lib/Config.ts` append `/users/...`, `/repository/...`, `/aiChat/...`). Confirm this in `.env.local`.

## API contract (current)

Auth: httpOnly cookies `accessToken` / `refreshToken` are set on login and refresh. The same tokens are also returned in the response body, and `Authorization: Bearer <accessToken>` is accepted. Send `credentials: "include"` on every fetch.

| Method and path | Body / query | Success response `data` | Notes |
|---|---|---|---|
| `POST /users/register` | `{username,email,password}` | user | 409 if email exists |
| `POST /users/login` | `{email,password}` | `{user, accessToken, refreshToken}` | rate limited: 20 per 15 min per IP |
| `POST /users/logout` | none | `{}` | |
| `POST /users/refresh-token` | cookie, or `{refreshToken}` | **`{accessToken, refreshToken}`**, i.e. `res.data.accessToken` (not `res.accessToken`) | |
| **`GET /users/me`** (new) | none | `{_id, username, email, createdAt}` | `401` when not logged in. Use it as the one source of truth for "am I logged in". |
| `GET /users/repo-history?query=` | optional fuzzy search | array of `{repoId, repoName, repoOwner, messagePreview:{role,content}\|null, chatId, lastActive}` | `messagePreview.content` is cut at 500 characters |
| `POST /repository/analyse` | `{url}` | `{basicInfo: repo}` | `201` = new run queued. **`200` with message "already in progress" = a run is already live** for that repo; treat as success and show its progress. `400` bad URL. Limit: 10 per hour per user |
| `GET /repository/getRepoInfo/:repoId?info=basicAnalysis` | | `{basicInfo, statuses, progress, statusErrors, job}` | See fields below |
| `GET /repository/getRepoInfo/:repoId?info=fileStructure` | | `{fileStructure\|null, status}` | |
| `GET /repository/getRepoInfo/:repoId?info=aiAnalysis` | | `{aiAnalysis\|null, status}` | |
| `GET /repository/getRepoInfo/:repoId` | | everything above in one object | |
| **`GET /repository/status-stream/:repoId`** (new) | | Server-sent events, see below | |
| `POST /aiChat/chat/:repoId` | `{question}` (max 2000 chars) | `{answer, sources[], chatId}` | one JSON response |
| **`POST /aiChat/chat/:repoId?stream=true`** (new) | `{question}` | Server-sent events, see below | Limit: 15 messages per minute |
| `GET /aiChat/chat-history/:repoId?limit=&before=` | `limit` default and max 500; `before` = a message `_id` | `{messages:[{_id,role,content,createdAt}], chatId\|null, hasMore}` | Returns the **newest** `limit` messages, oldest first. Page back with `before=<_id of the first message>`. Old callers that send nothing still work |
| `GET /health/healthcheck` | | | |

Foreign or missing repo ids return `404` (same response, by design). A bad id format returns `400`. Rate limit hits return `429` with a message.

### Status fields

- `statuses`: `fileStructureStatus`, `aiStatus`, `embeddingStatus`, each `pending | processing | ready | failed`.
- `progress`: `{percent (0-100), fileStructure:{done,total}, embedding:{done,total}}`. Percent is weighted 30 / 20 / 50.
- `statusErrors`: `{fileStructure?, ai?, embedding?}`: short user-safe text for failed stages. Show it to the user.
- `job` (new): `null` when nothing is queued or running, otherwise `{status: "queued"|"running", position?, attempts}`. `position` is shown while waiting in line.
- The run is **finished** when `job` is `null` and no status is `processing`. Chat only works when `embeddingStatus === "ready"`.
- If file extraction fails, `aiStatus` and `embeddingStatus` become `failed` too.

### Progress stream: `GET /repository/status-stream/:repoId`

`Content-Type: text/event-stream`. Events:

```
event: status
data: {"statuses":{...},"progress":{...},"statusErrors":{...},"job":null|{...},"finished":false}

event: done
data: {}                       (or {"reconnect":true} after 15 minutes)

event: error
data: {"message":"..."}
```

- First `status` arrives immediately, then one per change (the server checks every 1.5 s). `finished: true` always comes with `done`, and then the server closes the stream.
- On `done` with `reconnect: true`, open the stream again. On a plain `done`, stop and refetch `getRepoInfo` once to get the final data (file structure, AI analysis).
- Max 5 open streams per user (`429` beyond that). Close the stream when the page unmounts.
- A plain `EventSource` works if you use cookie auth (cookies are sent with `withCredentials: true`). With the `/api` proxy rewrite (task G1) it also works without CORS. If you need the Bearer header, use `fetch` and read `response.body`.
- `getRepoInfo` polling still works; use it as the fallback if the stream fails.

### Chat stream: `POST /aiChat/chat/:repoId?stream=true`

`EventSource` cannot send a POST body, so use `fetch` with `credentials: "include"` and read `response.body.getReader()`; split the text on blank lines (`\n\n`), each block is `event: X\ndata: {json}`.

```
event: sources   data: {"sources":["src/a.js","src/b.js"]}     (first)
event: token     data: {"text":"..."}                           (many; append to the last assistant message)
event: done      data: {"chatId":"..."}                         (answer saved)
event: error     data: {"message":"..."}                        (answer failed; nothing saved)
```

- Problems before the model starts (not your repo, no embeddings yet, bad question) come back as a normal JSON error with the usual status code (`400`/`404`/`429`/`500`), **not** as a stream. Check `response.ok` and `Content-Type` before reading as a stream.
- If the user leaves the page, abort the fetch (`AbortController`); the server stops generating and saves nothing.
- Chat has memory: the backend reads the last 6 stored messages itself. The frontend sends only the new `question`. A follow-up like "explain more" works.
- The non-streaming `POST /aiChat/chat/:repoId` is unchanged and can remain as the fallback.

## The one known trap: fake chat messages

Today `GET /repository/getRepoInfo/...` also **writes** two messages into the chat history: a user message ("Basic Analysis", "AI Analysis", ...) and an assistant message containing a JSON dump of the response. The current frontend rebuilds its analysis cards from those stored messages when it loads `chat-history`.

- Do **not** remove or rely on this in isolation. The backend still writes these messages.
- The planned change: the backend stops writing them (reads must not write), and the frontend builds the cards from `getRepoInfo` data instead. This must ship **in the same release** on both sides. The owner will ask the backend session to remove the writes once the frontend part is ready.
- Until then, when rendering `chat-history`, an assistant message whose content is a JSON dump, and the user messages "Basic Analysis" / "Get File Structure" / "AI Analysis" / "Repository Info", are not real conversation. Stored chat can also contain real questions and answers.
- Plan for the frontend task: fetch `getRepoInfo` on page load to render the cards, render `chat-history` only as conversation, and ignore old dump messages (detect them by the user labels above).

## Task list (in order)

**1. Bug fixes with no backend dependency** (one branch each, or one small branch)
- G2: `refreshAccessToken` reads `data.accessToken` but the backend returns `data.data.accessToken` / `data.data.refreshToken`. It currently stores `undefined` and a later `JSON.parse` can throw. Fix the read and guard `JSON.parse` in `getFromLocalStorage`. (`src/api/interceptor.ts`, `src/lib/apiMethods.ts`)
- G3: in `enhancedFetch`, the request that triggered the refresh is added to `pendingRequests` after the queue was flushed, so its promise never resolves. Use one shared `refreshPromise`; on `401`, await it and retry once; on a second `401`, redirect to login.
- G6: `apiGet` / `apiPost` call `res.json()` without checking `res.ok`. Add one `request()` helper that checks `res.ok`, parses safely and throws a typed `ApiError` (status, message). Surface `message` from the backend body to the user.
- G4: `middleware.ts` protects `/dashboard` and `/profile`, which do not exist. Protect `/home` and `/chat/:path*`. (This only works properly once cookies are first-party; see task 4.)
- H7: remove the 1 s artificial delay on `/home`. H9: `isMobile` is hard-coded to `false` in `src/app/(private)/layout.tsx`. H10: remove unused packages (`reactflow`, old shadcn placeholder) after checking imports.

**2. Use the new backend features** (backwards compatible, safe to ship alone)
- G5: login state from `GET /users/me`: one TanStack query gates the private layout (skeleton while loading, redirect to `/login` on `401`). Remove the duplicated auth state in `AppContextProvider` (the `auth` and `token`/`user` copies in `localStorage`) and the flash on hydrate.
- H1: replace the manual "AI Analysis" / "try again" clicks. After `analyse`, open `status-stream` and show a 3-step progress bar (file structure, AI analysis, embeddings) plus `progress.percent`, `statusErrors` text for failed stages, and "position N in queue" when `job.status === "queued"`. Disable the chat input until `embeddingStatus === "ready"`. Fall back to polling `getRepoInfo?info=basicAnalysis` with `refetchInterval` if the stream errors.
- Handle `analyse` returning `200` "already in progress": go to the repo page and show its progress, do not show an error.
- H2: streaming chat via `?stream=true` (see above), appending tokens to the last assistant message, with an abort on unmount. Show `sources` under the answer.
- Chat history paging: load the latest page, and a "load earlier messages" action using `before` and `hasMore`.
- H3 / H8 while there: set `staleTime` of 30 to 60 s, debounce sidebar search (300 ms) with `keepPreviousData`.

**3. The shared-release change** (needs the owner and a backend change at the same time)
- A6 + F1/F2: build the analysis cards from `getRepoInfo` data instead of stored chat messages (see "The one known trap"). Include old dump messages being ignored. Then ask the owner to have the backend stop writing the fake messages.
- H4: chat state as plain data (`{id, role, type, content, payload}`) mapped to components at render time, with stable ids (not `key={i}`), instead of an array of JSX elements.

**4. Cookie-only auth (G1)**: needs the backend session as well
- Use the existing Next.js `/api/*` rewrite in `next.config.ts` so the API appears first-party; set `NEXT_PUBLIC_API_URL` to the same-origin path. Stop storing `token` / `refreshToken` in `localStorage` and stop sending the `Authorization` header; rely on the httpOnly cookies and `/users/me`.
- Ask the owner to have the backend session check cookie `SameSite`/`secure` settings and CORS for the new setup before shipping.
- After this, task G4's middleware matcher works (the cookie is on the frontend domain).

**5. Polish (later)**: H5 markdown with `react-markdown` + `remark-gfm` (keep `react-syntax-highlighter`, add a copy button), H6 virtualise `FileTree` and lazy-load `Particles`, bundle check.

## Local testing

1. Backend (separate repo): create `.env` with `PORT`, `MONGODB_URI`, `ACCESS_TOKEN_SECRET`, `ACCESS_TOKEN_EXPIRY`, `REFRESH_TOKEN_SECRET`, `REFRESH_TOKEN_EXPIRY`, `GROQ_API_KEY`, `GITHUB_TOKEN`, `CORS_ORIGIN=http://localhost:3000`. Use a dev database, not production. Run `npm install` then `npm run dev`. Health: `GET http://localhost:<PORT>/api/v1/health/healthcheck`.
2. Frontend: `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:<PORT>/api/v1` (check how `src/lib/Config.ts` and the rewrite in `next.config.ts` use it), then `npm run dev` (`http://localhost:3000`, already in the backend CORS allow-list).
3. Cookies: the backend sets `secure: true`. Browsers accept that on `localhost`. Different ports on `localhost` count as the same site.
4. Use a small public repo (a few files) so the analysis finishes in about a minute.
5. Manual checks per task:
   - Auth: log in, reload, confirm still logged in through `/users/me`; log out; let the access token expire (set a short `ACCESS_TOKEN_EXPIRY` such as `30s`) and confirm the next request refreshes once and does not hang or loop.
   - Progress: analyse a repo; watch the Network tab for a `text/event-stream` request to `status-stream` and events arriving one by one; the progress bar moves; chat is disabled until embeddings are ready; reload mid-analysis and confirm it resumes.
   - Failure: analyse a repo URL that does not exist; check the `statusErrors` text is shown.
   - Chat: ask a question and see tokens arrive gradually; ask "explain more" and confirm the answer refers to the previous one; leave the page mid-answer and confirm no error; reload and confirm the history shows the finished exchange only.
   - Duplicate submit: press analyse twice quickly; the second returns `200` "already in progress" and the UI shows the same run.
6. Run the frontend's lint and type check (`npm run lint`, `npx tsc --noEmit`) before each merge. There are no frontend tests yet; consider adding tests for the `request()` helper and the refresh flow (G2, G3, G6).
7. Auto-deploy note: the backend deploys from its `main` branch on Render; the frontend is on Vercel. A frontend change that depends on a new backend endpoint must only be merged after that backend change is live.

## Do not change without the owner

- Anything that needs the backend to change at the same time (task 3 and task 4).
- Environment variables or deployment settings on Vercel or Render.
- Committing or pushing: ask first.

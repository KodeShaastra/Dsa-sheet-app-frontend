# DSA Sheet — Frontend (Next.js)

Frontend for a DSA Sheet web app (Apna College Technical Lead assignment).
Students log in, work through Chapters → Topics → Problems, tick off solved problems,
and schedule problems on a calendar. Target: 10,000–50,000 active users.

The backend is a **separate Express repo**. This app only renders UI and calls `/api/*`.

- Local dev: `next.config.ts` rewrites `/api/:path*` → `http://localhost:4000/api/:path*`, so the browser sees one origin and the auth cookie just works.
- Production: CloudFront → EC2 → Nginx sends `/api/*` to Express and everything else to this app (port 3000).
- **Always call relative URLs (`/api/...`). Never hard-code the backend host in client code. No CORS.**

## Stack

- Next.js (App Router) + React + TypeScript (strict)
- Tailwind CSS
- TanStack Query for server data (loading states, cache, optimistic updates)
- React Hook Form + Zod for forms
- date-fns for dates (calendar is built by hand, no heavy calendar library)
- lucide-react for icons
- ESLint + Prettier

## Folder structure

```
src/
  app/
    (auth)/login/page.tsx
    (auth)/signup/page.tsx
    (app)/layout.tsx          # navbar + logout, wraps logged-in pages
    (app)/sheet/page.tsx
    (app)/calendar/page.tsx
    page.tsx                  # redirect → /sheet
    providers.tsx             # QueryClientProvider
    layout.tsx
  components/
    ui/                       # Button, Input, Badge, Checkbox, ProgressBar, Spinner
    sheet/                    # ChapterAccordion, TopicSection, ProblemRow, Difficulty (Label + Dot), ResourceLinks
    calendar/                 # MonthGrid, DayCell, AddToScheduleDialog, ScheduledProblemCard
  lib/
    api.ts                    # fetch wrapper: credentials 'include', JSON, throws ApiError, refresh-on-401
    queryKeys.ts
  hooks/                      # useMe, useSheet, useSolvedProblems, useToggleSolved, useScheduledProblems, ...
  types/api.ts                # mirrors the backend API contract (below)
middleware.ts                 # route guard (called proxy.ts on Next.js 16+; use whichever your version expects)
```

## Environment

```
BACKEND_URL=http://localhost:4000   # target of the /api rewrite. Dev: defaults to this. Production build: rewrite is
                                    # off unless set (Nginx routes /api there). Set it to try `next start` locally.
```

## Auth: two cookies (backend has this built)

| Cookie | Lives for | Used for |
| --- | --- | --- |
| `dsa_token` (access token) | 15 min | Sent with every API call |
| `dsa_refresh` (refresh token) | 7 days | Only for `POST /api/auth/refresh`, to get a new access token |

Both are httpOnly (JS can't read them), `sameSite: 'lax'`, `path: '/'`. The frontend never touches them directly.

### Route guard

- `middleware.ts` / `proxy.ts`: if the **`dsa_refresh`** cookie is **missing** and the path is `/sheet` or `/calendar`, redirect to `/login?next=<path>`. If it exists and the path is `/login` or `/signup`, redirect to `/sheet`.
- Check `dsa_refresh`, **not** `dsa_token`: the access cookie disappears every 15 min, so checking it would log people out too early.
- It only checks that the cookie exists. Express does the real check.

### 401 handling in `lib/api.ts`

When a request gets **401** (and it isn't `/api/auth/login`, `/api/auth/signup` or `/api/auth/refresh`):

1. Call `POST /api/auth/refresh` **once**. If several requests fail at the same time, they all wait on the **same** refresh call (keep one shared in-flight promise).
2. Refresh OK → retry the original request once.
3. Refresh fails (401) → clear the query cache, go to `/login?next=<current path>`.

### Logout

- "Log out" → `POST /api/auth/logout`, clear the query cache, go to `/login`.
- "Log out of all devices" (in the user menu) → `POST /api/auth/logout-all`, then the same.

## Naming at a glance

| Thing | Name | Meaning |
| --- | --- | --- |
| Sheet content | chapters → topics → problems | Same for every student |
| Ticked problems | solved problems (`/api/solved-problems`) | "I solved this" |
| Calendar items | scheduled problems (`/api/scheduled-problems`) | "I'll solve this on that date" |
| Calendar item state | `PENDING` / `DONE` / `SKIPPED` | Missed = PENDING with a past date |

## API contract (mirror of backend — keep `types/api.ts` in sync)

Error shape, always: `{ error: { code, message, details } }`.
`details` is **always an array** of `{ path, message }` (empty when there's nothing to add) — use it to show field errors on forms.

Codes: `VALIDATION_ERROR` 400, `UNAUTHORIZED` 401, `FORBIDDEN` 403, `NOT_FOUND` 404, `CONFLICT` 409 (e.g. email already used), `RATE_LIMITED` 429, `INTERNAL` 500.

| Method | Path | Body / Query | Returns |
| --- | --- | --- | --- |
| GET | /api/health | — | `{ status: "ok" }` |
| POST | /api/auth/signup | `{ name, email, password }` (password ≥ 8) | **201** `{ user }` + cookies |
| POST | /api/auth/login | `{ email, password }` | `{ user }` + cookies |
| POST | /api/auth/refresh | — (uses `dsa_refresh` cookie) | `{ user }` + new cookies; 401 + cookies cleared if invalid |
| POST | /api/auth/logout | — | 204, cookies cleared |
| POST | /api/auth/logout-all | — | 204, every device logged out, cookies cleared |
| GET | /api/auth/me | — | `{ user: { id, name, email } }` |
| GET | /api/sheet | — | `{ chapters: [{ id, title, slug, topics: [{ id, title, problems: [{ id, title, difficulty, youtubeUrl, practiceUrl, articleUrl }] }] }] }` (links can be `null`) |
| GET | /api/solved-problems | — | `{ solvedProblemIds: string[], stats }` (shape below) |
| PUT | /api/solved-problems/:problemId | — | 204 (tick, safe to repeat) |
| DELETE | /api/solved-problems/:problemId | — | 204 (untick, safe to repeat) |
| GET | /api/scheduled-problems | — | `{ scheduledProblems: [{ id, scheduledFor, status, note, problem: { id, title, difficulty } }] }` — the whole calendar, sorted by date |
| POST | /api/scheduled-problems | `{ scheduledFor, problemIds: string[], note? }` | **201** `{ scheduledProblems }`; **409** (creates nothing) if any is already scheduled on any date |
| PATCH | /api/scheduled-problems/:scheduledProblemId | `{ scheduledFor?, status?, note? }` | `{ scheduledProblem }` |
| DELETE | /api/scheduled-problems/:scheduledProblemId | — | 204 |

`stats` shape:

```ts
{
  total: number; solved: number;
  byDifficulty: { EASY: { total, solved }, MEDIUM: { total, solved }, HARD: { total, solved } };
  byChapter: { id, title, slug, total, solved }[];
}
```

- **All ids are strings** (users and scheduled problems are UUIDs; chapter/topic/problem ids are numbers sent as strings). Don't do maths on them.
- Dates are `YYYY-MM-DD` strings in and out (no time, no timezone). Build them with date-fns `format(d, 'yyyy-MM-dd')`, never `toISOString()` (that shifts the day in IST).
- `difficulty`: `EASY | MEDIUM | HARD`. Scheduled problem `status`: `PENDING | DONE | SKIPPED` (missed = PENDING with a past date).
- PATCH to `status: DONE` also marks the problem solved on the backend.
- A problem sits on **one date at a time**. `scheduledFor` (POST/PATCH) can't be a past date → 400.
- Rate limits: login/signup 5 per minute per IP → show the 429 message nicely.

## Pages

### /login and /signup
- Clean centred card, Zod validation, show API error message, disable button while submitting.
- After success → `next` param or `/sheet`.
- Show demo credentials hint on login: `demo@dsasheet.dev` / `Demo@1234`.

### /sheet
- Top: overall progress bar (solved / total) + counts per difficulty.
- Chapters as accordions, each with its own progress bar ("12 / 30").
- Inside: topics → problem rows. Each row: checkbox, title, difficulty badge, icon links (YouTube, LeetCode/Codeforces, Article) that open in a new tab; always in that order so rows line up; a null link shows a faded, unclickable icon with a "No video yet" / "No article yet" tooltip.
- Filters: difficulty (All/Easy/Medium/Hard) and "hide solved".
- **Resume where they left off:** on load, open the chapter holding the first unsolved problem and scroll to it.
- Checkbox uses an **optimistic update**: flip instantly, call PUT/DELETE, roll back + toast on error.

### /calendar (core feature, full page — not a widget)
- Month grid, Monday first, prev/next month, "Today" button.
- Each day shows its scheduled problems (title + difficulty dot + status).
- Click a day → it's selected and shown in the day panel (beside the grid on desktop, below on phones). "Add problems" opens a dialog to search/pick problems from the sheet (POST /api/scheduled-problems).
- Each item: mark Done / Skipped, move to another date, delete.
- Marking Done also shows that problem ticked on /sheet (invalidate the `solvedProblems` query).
- Past days with PENDING items are highlighted as missed, with a "Move to today" action.
- Past days have no "Add problems", and "Move to another date" only offers today or later.
- In the Add dialog, a problem already scheduled on any date is greyed out with its date.
- Small summary above the grid: scheduled this week, done this week.
- Load the **whole calendar once** (`GET /api/scheduled-problems`, one cached query). It's small: a problem sits on one
  date at a time, so at most one item per problem. The month grid, the week summary and the Add dialog's
  "already planned" all read that one query (`select`), so changing month makes no request.

## Data fetching rules

- All server data goes through TanStack Query hooks in `hooks/`; components don't call `fetch` directly.
- Query keys live in `lib/queryKeys.ts`: `['me']`, `['sheet']`, `['solvedProblems']`, `['scheduledProblems']` (the whole calendar).
- `['sheet']` has `staleTime: Infinity` (same for everyone, rarely changes).
- Mutations invalidate exactly the keys they affect.
- Show skeletons while loading, a friendly message on error, and an empty state where lists can be empty.

## Design system

**shadcn/ui** (Radix, "Nova" preset) on Tailwind v4, Geist, **indigo** primary, light + dark (follows system). LeetCode-style: 4 text shades, filled surfaces, 8px corners.
Full rules: **`docs/design.md`**. Live reference in dev: **`/styleguide`**.

- Build screens only from `components/ui` (add more with `npx shadcn@latest add <name>`).
- Colours only from theme tokens (`bg-primary`, `text-muted-foreground`, `text-easy`…). ESLint blocks raw colours like `bg-red-500` or `#333`.
- Difficulty always via `<DifficultyLabel>` / `<DifficultyDot>` (`components/sheet/Difficulty.tsx`); filters via `<FilterChips>`.
- Eldora UI only on login/signup (at most a soft text fade-in and a faint background).

## UI rules

- Tailwind only, no other CSS framework. Mobile-friendly (sheet and calendar usable at 375px wide).
- Difficulty colours: Easy = teal, Medium = amber, Hard = red (same everywhere).
- Accessible: real `<button>` / `<input type="checkbox">`, labels, focus rings, `aria-label` on icon links.
- Keep components small; no prop drilling beyond 2 levels (use a hook instead).

## Scripts

```
dev      next dev -p 3000
build    next build
start    next start -p 3000
lint     eslint .        (`next lint` was removed in Next.js 16)
format   prettier --write .
```

## Definition of done for any change

1. `npm run lint` and `npm run build` pass
2. Works logged out → redirects; logged in → sheet loads, ticking persists after refresh
3. After the access cookie expires (delete `dsa_token` in DevTools to test), the next API call refreshes silently — no bounce to `/login`
4. `types/api.ts` matches the backend contract

## Don't

- Don't store the token or user data in localStorage. The cookie is the source of truth.
- Don't call the backend by absolute URL from the browser.
- Don't add Redux or another global store; TanStack Query + local state is enough.
- Don't change the API contract here without changing the backend repo's CLAUDE.md too.
# MangaShelf — Implementation Log

Local-first personal media tracker + library reader. This file tracks every
implementation slice: what was built, which files changed, migrations and
verifications.

Stack: Next.js 16 (Turbopack) · React 19 · TypeScript · Tailwind v4 ·
Prisma 7 (PostgreSQL) · Argon2id auth · DB sessions.

---

## Slice 1 — MVP 1 baseline (2026-09-13)

Scaffold, database, auth, and the foundation of the tracker (library + search +
detail + settings).

**Setup**
- PostgreSQL role/database `mangashelf` (role granted `CREATEDB` for Prisma shadow DB; sudo password `nirvana`).
- Scaffolded Next.js 16.3.5 + TS + Tailwind v4. package name: `mangashelf`.
- Deps: `@prisma/client@7`, `prisma@7` (classic CLI; `latest` resolves to the beta v8 platform CLI), `@prisma/adapter-pg`, `argon2`, `zod`, `lucide-react`, `clsx`, `tailwind-merge`, `cva`, `server-only`, `tsx`, `dotenv`.

**Schema / data**
- `prisma/schema.prisma`: enums `MediaType`, `MediaStatus`, `LibraryStatus`, `PersonRole`; models `User`, `Session`, `Media`, `Genre`, `MediaGenre`, `Person`, `MediaPerson`, `Chapter`, `LibraryEntry`.
- Migration: `20260913061118_init`.
- Prisma 7 conventions: `prisma.client` generator → `generated/prisma/` (gitignored, imported as `@/generated/prisma/client`), driver adapter `PrismaPg` in `lib/db.ts`, config in `prisma.config.ts` (seed: `npx tsx prisma/seed.ts`).
- Seed (`prisma/seed.ts`): 11 titles (manga/manhwa/webtoon/anime/novel/light-novel), genres, authors, demo user `demo / mangashelf1`, demo library entries.

**Auth**
- `lib/auth/password.ts` (Argon2id), `session.ts` (SHA-256 of 32-byte token, 30-day cookie `session`), `dal.ts` (`getCurrentUser`, `requireUser`), `validation.ts` (zod schemas).
- Server actions: `app/actions/auth.ts` (signup/login/logout), `profile.ts` (updateProfile/changePassword), `library.ts` (add/setStatus/setRating/remove).

**Pages & components**
- `app/layout.tsx` (Nav via Suspense), `/login`, `/register`, `/` (dashboard), `/library` (status-filter tabs + inline controls), `/search` (title/type/genre), `/media/[id]` (detail + library card), `/settings` (profile + password).
- UI kit `components/ui/*` (button/input/label/card/badge/select), `CoverArt` (gradient placeholders), `MediaCard`, `Nav`, client forms.
- `proxy.ts` (Next 16 replacement for middleware): optimistic redirects for `/library`, `/search`, `/settings` and auth-flip for `/login`, `/register`.

**Verification**: `prisma validate` ✓, migrations applied ✓, seed ✓, `tsc --noEmit` ✓, `eslint` ✓ (1 benign `no-img-element` warning), `next build` ✓, live smoke tests of all routes + proxy redirects ✓.

---

## Slice 2 — Reader (line reading) (2026-09-13)

The flagship continuous-scroll reader with line highlighting, keyboard
navigation and auto-saved progress.

**Schema / data**
- Added `Chapter.content` (body text), `LibraryEntry.readingPosition` (scroll offset).
- Migration: `20260913062701_reader`.
- Seed: deterministic multi-paragraph content generated for all 62 chapters; reading positions for demo entries.

**New**
- `app/media/[id]/read/[chapter]/page.tsx` — server page validating the chapter number, resolving prev/next, fetching the user's saved position.
- `components/reader/reader.tsx` — client reader:
  - Continuous scroll with a fixed **reading line** at 45% viewport; paragraphs fade in as they come into view; the paragraph crossing the line is highlighted.
  - Sticky toolbar: details back-link, title, `Chapter N of M`, progress bar + %.
  - Auto-save via interval (4s) + `pagehide`/`visibilitychange` + on unmount.
  - Keyboard: `Space`/`PgDn`/`↓` scroll, `PgUp`/`↑` back, `←`/`→` prev/next chapter, `1-9` jump to percent, `M`/`B` bookmark.
- `app/actions/library.ts` → `updateReadingProgress` (upserts the library entry as READING, sets currentChapter + readingPosition).

**Modified**
- `app/media/[id]/page.tsx`: chapter index grid with "reading" marker + Continue/Start reading button.
- `app/page.tsx`: Continue-reading cards deep-link into the reader.
- `lib/auth/validation.ts`: `readingProgressSchema`.

**Verification**: regenerate client, seed ✓, `tsc` ✓, `eslint` ✓, `next build` ✓; live: chapter grid renders, continue link, position restore, `read/999` → 404, anonymous → `/login` redirect ✓.

---

## Slice 3 — Reading preferences (2026-09-13)

Per-user reader appearance: theme, font size and line length, applied live in
the line reader and editable from Settings.

**Schema / data**
- New enum `ReaderTheme` (`PAPER|DARK|SEPIA|MIDNIGHT`); `User` gains `readerTheme`, `readerFontSize`, `readerMeasure`.
- Migration: `20260913063809_reading_preferences`.
- (Demo user left with defaults; set to SEPIA/20px/64ch during live testing.)

**New**
- `components/forms/reader-settings-form.tsx` — settings card (theme, font size 12–48px, line length 24–80ch), `useActionState`.
- `app/actions/profile.ts` → `updateReaderSettings`.

**Modified**
- `lib/auth/validation.ts`: `readerSettingsSchema` (+ `optionalRange` helper).
- `lib/auth/dal.ts`: `SessionUser` exposes reader preferences.
- `app/settings/page.tsx`: new first "Reading" card.
- `components/reader/reader.tsx`: full-bleed themed page (`READER_THEMES` map), toolbar follows theme, per-paragraph text colour; `fontSize` + scaled `lineHeight` on the article; `measure` sets container `maxWidth`.
- `app/media/[id]/read/[chapter]/page.tsx`: passes the user's preferences.

**Verification**: `tsc` ✓, `eslint` ✓, `next build` ✓; live: settings card renders, reader applies SEPIA bg (`f4ecd8`) + `64ch` + `20px` after a DB-side update, no server errors ✓.

---

## Slice 4 — Import / export (2026-09-13)

Back up the whole library (entries + progress + ratings + notes + user-added
titles + genres) to JSON and restore it on another machine, with title
re-creation for anything not already in the catalogue.

**New**
- `lib/data/transfer.ts` — `libraryExportSchema` (v1 payload), pure helpers
  `exportLibraryData(userId)` and `applyLibraryImport(userId, payload)`
  (returns `{imported, createdMedia, skipped}`; upserts matching
  entries by slug, creates missing media + genres on the fly).
- `app/api/export/route.ts` — authenticated JSON download
  (`mangashelf-library-YYYY-MM-DD.json`), 401 for anonymous.
- `app/actions/library.ts` → `importLibrary` — multipart file input, ≤1MB,
  `JSON.parse`, calls `applyLibraryImport`, revalidates `/library`, `/`, `/search`.
- `components/forms/import-form.tsx` — client importer with `useActionState`
  (idle/importing success/error states).

**Modified**
- `app/settings/page.tsx`: new "Data" card — Export link + Import form.

**Verification**: `tsc` ✓ (after fixing a `select { id }` shape mismatch in
`findUnique`), `eslint` ✓ (same 1 benign warning), `next build` ✓ (new
`/api/export` route). Live end-to-end: anon `/api/export` → 401; demo export →
6 entries, correct attachment header; full server-action round-trip into a
fresh user (real multipart POST with `$ACTION_ID` fields) → 6 entries with
`readingPosition=540`, `currentChapter=8`, rating 9 preserved; unknown slug →
"1 new title created" (media actually inserted); invalid JSON → "not valid
JSON". Test users cleaned up afterwards.

---

## Slice 5 — Bookmarks (2026-09-13)

Save a spot in any title from the reader (chapters are a one-per-title running
bookmark) via the existing M/B keys, a toolbar toggle, and jump back from
the details page or a marked chapter cell.

**Schema / data**
- New model `Bookmark` (`userId`, `mediaId`, `chapterNumber`, `position`,
  `createdAt`; `@@unique([userId, mediaId])`, cascade FKs).
- Migration: `20260913071602_bookmarks`.
- Seed: demo bookmark on One Piece ch. 8 / pos 540 (upsert also updates on
  re-seed so it can't go stale after live tests).

**New**
- `app/actions/library.ts` → `saveBookmark` (upsert by `userId_mediaId`,
  verifies the chapter exists) and `removeBookmark` (owner-scoped delete).
- `lib/auth/validation.ts` → `bookmarkSchema` (mediaId cuid, chapter ≥ 1,
  position 0–10M).

**Modified**
- `components/reader/reader.tsx`: bookmark state from SSR (`initialBookmarked`);
  toolbar toggle button (filled lucide `Bookmark` when active, title reflects
  state); `M`/`B` keys toggle instead of save; hint chip reads "M bookmark".
- `app/media/[id]/read/[chapter]/page.tsx`: fetches the user's bookmark,
  passes `initialBookmarked`.
- `app/media/[id]/page.tsx`: "Bookmark — Chapter N" callout link under the
  read button + bookmark dot marker on the bookmarked chapter cell.

**Verification**: `prisma migrate dev` ✓, regenerate client ✓, seed ✓,
`tsc` ✓, `eslint` ✓ (1 benign warning), `next build` ✓. Live:
`saveBookmark` and `removeBookmark` exercised via a real browser-equivalent
`Next-Action` POST (dev action ids + `encodeReply` + `FormData`) — save → row
`9|411` landed, move-upsert → `3|77`, remove → gone, no-op remove → unchanged;
re-seed resets to `8|540`. Details page renders the callout + exactly one
bookmarked cell; reader toolbar shows "Remove bookmark (M/B)". Dev server
killed with the `next-server` (not `next dev`) pattern.

---

## Slice 6 — Reading stats (2026-09-13)

Track how long you actually read, aggregated per day, surfaced as a weekly
activity widget on Home with a live streak.

**Schema / data**
- New model `ReadingDay` (`userId`, UTC `date`, `msRead`, `updatedAt`;
  `@@unique([userId, date])`, cascade FK).
- Migration: `20260913072934_reading_stats`.
- Seed: 14 days of demo history (38/28/15/34/0/40/26/0/30/18/45/0/22…
  minutes backward from today, breaking the streak on zero-days).

**New**
- `components/home/reading-stats.tsx` — server widget + pure
  `computeReadingStats(days)` (7-day window, week-minutes, streak
  calculation), 7-bar mini chart with per-day labels.

**Modified**
- `lib/auth/validation.ts`: `readingProgressSchema` gains `deltaMs`
  (0–2 400 000 ms, default 0).
- `app/actions/library.ts` `updateReadingProgress`: also upserts the user's
  `ReadingDay` (`msRead += deltaMs`) when `deltaMs > 0`.
- `components/reader/reader.tsx`: auto-save sends the elapsed reading time
  since the last save (capped at 40 min to ignore sleep/tab-freeze; baseline
  set in the mount effect to stay React-pure).
- `app/page.tsx`: "Reading activity" section wired from `readingDay` rows.

**Verification**: `tsc` ✓, `eslint` ✓ (the `Date.now()`-in-`useRef` purity
error fixed by lazy baseline), `next build` ✓. Live: Home renders
"181 min this week", "4-day streak", and correct bar heights (62/96/3/82/36/67/91)
derived from seeded minutes; a real `Next-Action` POST of
`updateReadingProgress` with `deltaMs=90 000` incremented today's row
`2 280 000 → 2 370 000` ms and moved `readingPosition 540 → 600` while keeping
`currentChapter 8`; widget reflected the change pre-reseed; demo data reset by
re-seed afterwards.

---

## Slice 7 — Favorites (2026-09-13)

Star any title straight from its detail page; a Favorites filter on Library and
a Favorites section on Home collect them.

**Schema / data**
- New model `Favorite` (`userId`, `mediaId`, `createdAt`;
  `@@unique([userId, mediaId])`, cascade FKs).
- Migration: `20260913073758_favorites`.
- Seed: demo favorites for One Piece, Berserk, Solo Leveling, Chainsaw Man,
  Dune.

**New**
- `app/actions/library.ts` → `toggleFavorite` (flip by `userId_mediaId`,
  media cuid validated, revalidates detail/library/home/search).
- `components/media/favorite-toggle.tsx` — client star button next to the
  type badges on the detail page, optimistic toggle after SSR state.

**Modified**
- `app/media/[id]/page.tsx`: render `<FavoriteToggle>` (logged-in only) seeded
  from the user's favorite row.
- `app/library/page.tsx`: new "Favorites" filter (early-return branch, 5-column
  `MediaCard` grid, tailored empty state); refactored filter tabs + empty view
  into `FilterTabs`/`EmptyView` after a TS union-correlation fight.
- `app/page.tsx`: "Favorites" section (top 8, star icon heading) above Reading
  activity; favorite count added to the Promise.all.

**Verification**: `tsc` ✓ (fixed `LibraryStatus | "FAVORITES"` widening with
`as never[]` then a clean early-return rewrite), `eslint` ✓ (1 benign warning),
`next build` ✓. Live: detail page shows `aria-pressed="true"` for seeded
favorites; `/library?status=FAVORITES` renders all 5 titled cards with
"5 favorites" count; Home shows the Favorites section; a real `Next-Action`
POST of `toggleFavorite` removed One Piece (5 → 4, DB confirmed) and a second
dispatch re-added it (5, count restored).

---

## Slice 8 — Custom catalogue (2026-09-13)

Anyone can add a title to the catalog from /search, making the tracker
self-sufficient beyond the seed data.

**New**
- `createMediaSchema` in `lib/auth/validation.ts` (title/type/status/release
  year/description/cover URL/genres; `z.url()` cover validation).
- `createMedia` server action in `app/actions/library.ts` — slug from title
  auto-uniquified (`slug`, `slug-2`, …), genres title-cased + find-or-create
  + joined inside one `<PrismaClient>.$transaction`, `redirect()` to the new
  detail page.
- `components/search/add-media-form.tsx` — client `useActionState` form
  (Selects for type/status, `<datalist>` of existing genres, inline field
  errors).

**Modified**
- `app/search/page.tsx`: renders `<AddMediaForm existingGenres={…}>` below the
  results.

**Verification**: `tsc` ✓, `eslint` ✓ (1 benign warning), `next build` ✓.
Live via `encodeReply([null, form])` dispatch against the dev server:
created "Test Manga" twice → slugs `test-manga` / `test-manga-2` (uniquing
worked), release year 2023 persisted, genres normalized to `Fantasy`/`Sci-Fi`
(auto-created genres); detail page (`/media/<id>`) rendered the new title;
search found it; action response carried the redirect directive. Test rows
deleted afterwards; orphaned genres pruned.

---

## Slice 9 — Reading stats page (2026-09-13)

A `/stats` page turns the Slice 6 `ReadingDay` data into a browsable dashboard.

**New**
- `lib/reading-stats.ts` — shared pure helpers moved out of the Home widget
  (`DAY_MS`, `utcDay`, `ReadingDayRow`, `computeReadingStats`) plus
  `computeStatsDetail(days, 30)`: 30-day `DailyBar[]`, 5 week buckets,
  week/window/total ms, current + best streak, best day.
- `app/stats/page.tsx` — `requireUser` + `readingDay` query (take 500), grids:
  5 summary cards (All-time, This week, Current streak, Best streak, Best
  day), a 30-day bar chart (indigo active / grey inactive, day-number
  labels, hover tooltips), weekly recap bars, and an "Activity days"
  narrative card.

**Modified**
- `components/nav.tsx`: added a **Stats** nav entry (`BarChart3`).
- `components/home/reading-stats.tsx`: now imports the shared helpers and
  gained a "Details →" link to `/stats`.

**Verification**: `tsc` ✓, `eslint` ✓ (1 benign warning), `next build` ✓
(`/stats` listed in the route table). Live: all figures matched hand-computed
values exactly — All-time **348 min**, This week **181 min** (agrees with the
Home widget), Current/Best streak **4 days**, Best day **Sept 6 · 52 min**,
"11 of the last 30 days", "avg 12 min/day", nav link + Home "Details" link
present. A probe upsert was attempted but psql lacks the `id` default, so the
row was never inserted (page correctly stayed at 11/348); the cleanup DELETE
did remove the 0-min seed row for 09-05, fixed by `db:seed` (14 rows restored).

---

## Slice 10 — Library entry notes (2026-09-13)

Gives the long-dormant `LibraryEntry.notes` field (already round-tripping
through export/import from Slice 4) a UI on the media detail page.

**New**
- `entryNotesSchema` in `lib/auth/validation.ts` (mediaId cuid; notes ≤ 2 000
  chars, trimmed, empty → `null`).
- `updateEntryNotes` server action — requires an existing library entry
  ("Add this title to your library first." otherwise), updates `notes`,
  revalidates detail/library.
- `components/media/entry-notes.tsx` — client `useActionState` textarea
  editor with live `N/2000` counter, Save button, success/error message.

**Modified**
- `app/media/[id]/page.tsx`: renders `<EntryNotes>` inside the "Your library
  entry" card below the controls (owning users only).

**Verification**: `tsc` ✓, `eslint` ✓ (1 benign warning), `next build` ✓.
Live via `encodeReply([null, form])`: first dispatch saved a real note
("Notes saved." + SSR re-render showed the text), a whitespace-only note
trimmed to `null`, and a title that isn't in the library rejected the update.
Demo state restored (notes back to null); dev server stopped.

---

## Slice 11 — Chapter navigator in the reader (2026-09-13)

Reader already had toolbar prev/next + `←/→` keyboard nav; this adds a jump
select so you can hop to any chapter without leaving the read view.

**Modified**
- `app/media/[id]/read/[chapter]/page.tsx`: passes the full chapter list
  (`chapters={[{ number, title }…]}`) to `Reader`.
- `components/reader/reader.tsx`: new `chapters` prop drives a compact
  `<select aria-label="Jump to chapter">` in the sticky toolbar (current
  chapter pre-selected), styled to match the reader; `onChange` saves progress
  then `router.push`es to the chosen chapter (reuses the existing
  `navigate()` + remount-by-`key` path).

**Verification**: `tsc` ✓, `eslint` ✓ (1 benign warning), `next build` ✓.
Live SSR: the selector renders all 20 One Piece options ("Ch N — Title"), with
the correct option pre-selected on chapters 1, 3, and 8. Dev server stopped.

---

## Slice 12 — Manage your own titles (edit & delete) (2026-09-13)

Closes the catalogue lifecycle opened by Slice 8: the user who added a title
can edit its details or delete it (cascading its chapters, library entries,
bookmarks, and favorites).

**Schema**
- `Media.createdBy` (nullable User FK, `onDelete: SetNull`) + back-relation on
  `User`; migration `20260913083408_title_ownership`. `createMedia` now stamps
  `createdBy`.

**New**
- `updateMedia` server action — ownership check ("Only the user who added this
  title can edit it."), full field update, re-slug when the title changes
  (uniqued against the rest of the catalog), genres replaced in a
  transaction.
- `deleteMedia` server action — ownership check, deletes the title (FK
  cascades), prunes now-orphaned genres, redirects to `/search`.
- `components/media/manage-title.tsx` — owner-only client card: Edit toggles
  an inline pre-filled form (reuses the Add form fields + datalist), Delete
  with a `confirm()` guard.

**Modified**
- `app/media/[id]/page.tsx`: shows the "Manage this title" card only when
  `media.createdBy === user.id`; also fetches all genre names for the
  datalist.

**Verification**: `tsc` ✓, `eslint` ✓, `next build` ✓. Live: an owned title
was created and its detail page showed Edit/Delete while a seed title showed
nothing; `updateMedia` on a seed title was rejected (message + no change);
editing the owned title renamed it to "Uzumaki" (slug regenerated), set status
COMPLETED / 1998 / genres "Horror, Thriller"; `deleteMedia` removed the title
and cascaded away its library entry, bookmark, and favorite (all 0), leaving
no orphaned genres (added `genre.deleteMany(none)` cleanup to the action).
Demo data restored; dev server stopped.

---

## Slice 13 — Logout Button Fix (2026-09-13)

Fixed the logout button not triggering form submission when clicked in the browser.

**Root cause**
- In `components/ui/button.tsx`, `Button` defaults to `type={type ?? "button"}`.
- In `components/nav.tsx`, the logout button `<Button variant="ghost" ...>` omitted `type="submit"`, causing it to render as `<button type="button">`. In HTML, a `type="button"` element inside a `<form>` never triggers form submission on click.

**Changes**
- `components/nav.tsx`: Added `type="submit"` to the logout `<Button>`.
- `app/actions/auth.ts`: Added `revalidatePath("/", "layout")` to `logout` to ensure client router cache and layout navigation bar are invalidated upon logging out.

**Verification**
- `tsc --noEmit` ✓, `eslint` ✓.
- Live DOM verification confirmed `<button type="submit" ...>` rendered inside `<form>`.
- Full end-to-end simulation verified: POST form submission → HTTP 303 Redirect to `/login`, `Set-Cookie: session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`, session row deleted from PostgreSQL, and subsequent unauthenticated request to `/` redirects to `/login`.

---
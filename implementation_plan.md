# MangaShelf — Full Architecture & Roadmap Implementation Plan

This implementation plan maps the complete architectural vision for **MangaShelf** (a local-first personal media tracker and reader) across 6 phased milestones. It marks what has already been built and verified, identifies the gaps, and details the technical design for the next milestone (**Phase 3: Local File Support & Comic Reader**).

---

## Global System Status & Audit Matrix

```
[x] PHASE 1: Foundation & Core Tracker (MVP 1 Baseline)
[x] PHASE 2: Reading Habit Tracking & Analytics (MVP 2)
[ ] PHASE 3: Local File Support & Comic Reader (MVP 3) ──► (NEXT IMMEDIATE MILESTONE)
[ ] PHASE 4: Community, Reviews & Custom Lists (MVP 4)
[ ] PHASE 5: Metadata Providers & Discovery (MVP 5)
[ ] PHASE 6: Containerization & Deployment (MVP 6)
```

---

### Phase-by-Phase Checklist

### Phase 1: Foundation & Core Tracker (Status: ✅ 100% COMPLETE)
- [x] **Tech Stack Setup**: Next.js 16 (App Router + Turbopack) + React 19 + TypeScript 5 + Tailwind CSS v4.
- [x] **Local Authentication**: Zero third-party auth (no Google, no OAuth). Pure username + password with **Argon2id** password hashing.
- [x] **Session Management**: SHA-256 session tokens, 30-day expiration, HTTP-only secure cookie, DB session tracking.
- [x] **Proxy Route Protection**: Next.js 16 `proxy.ts` optimistic route redirection for `/library`, `/search`, `/settings`, `/login`, `/register`.
- [x] **Core Entity Models (`prisma/schema.prisma`)**:
  - [x] `User`: Account profile (`username`, `passwordHash`, `displayName`, `bio`, `avatar`, reader preferences).
  - [x] `Media`: Central media model for `MANGA`, `MANHWA`, `MANHUA`, `WEBTOON`, `COMIC`, `ANIME`, `LIGHT_NOVEL`, `NOVEL`, `OTHER` with publication status (`ONGOING`, `COMPLETED`, `HIATUS`, `CANCELLED`, `UNKNOWN`).
  - [x] `Genre` & `MediaGenre`: Normalized many-to-many taxonomy.
  - [x] `Person` & `MediaPerson`: Author, Artist, Writer, Illustrator, Creator relationship.
  - [x] `Chapter`: Chapter numbering, volume numbering, titles, release dates.
- [x] **Core Pages & Navigation**:
  - [x] `/login` & `/register`: Client validation with Zod, accessible error messaging.
  - [x] `/`: Home dashboard with greeting, continue reading cards, library counts, recent additions.
  - [x] `/library`: Filter tabs (`READING`, `PLAN_TO_READ`, `COMPLETED`, `ON_HOLD`, `DROPPED`, `FAVORITES`) with inline status/rating controls.
  - [x] `/search`: Multi-attribute search by title, media type, and genre.
  - [x] `/media/[id]`: Detail page with cover art, metadata, chapter index, library tracker card.
  - [x] `/settings`: Profile updates, password changes, reader appearance settings.
- [x] **Catalogue Management**:
  - [x] User-created media titles with automatic slug de-duplication.
  - [x] Owner title editing and cascading deletion.

---

### Phase 2: Reading Habit Tracking & Analytics (Status: ✅ 100% COMPLETE)
- [x] **Reading Progress & Bookmarks**:
  - [x] `LibraryEntry.readingPosition`: Pixel-level scroll progress saved per title.
  - [x] `Bookmark`: 1-per-title spot saver (`chapterNumber` + `position`) toggled via reader UI or `M`/`B` shortcuts.
- [x] **Continuous Text Line Reader**:
  - [x] 45% viewport focal line with active paragraph highlighting and fade-in transitions.
  - [x] 4 themes (`PAPER`, `DARK`, `SEPIA`, `MIDNIGHT`) with persistent per-user settings.
  - [x] Font size (12–48px) and line measure (24–80ch) controls.
  - [x] Chapter jump selector dropdown in sticky toolbar.
  - [x] Auto-save debounce reporting elapsed reading time (`deltaMs`).
- [x] **Reading Habits & Analytics**:
  - [x] `ReadingDay` model: UTC midnight day buckets storing reading milliseconds.
  - [x] Home activity widget: 7-day mini bar chart with live streak calculation.
  - [x] Full `/stats` page: All-time reading minutes, 30-day bar chart, weekly summaries, best day records.
- [x] **Favorites**: Star titles from media detail page, dedicated Favorites filter tab in Library, top favorites section on Home.
- [x] **Personal Notes**: Up to 2,000 character notes per library entry.
- [x] **Data Portability**: Full JSON export (`/api/export`) and import (`/settings`) with schema validation and automatic title reconstruction.

---

### Phase 3: Local File Support & Comic Reader (Status: 🔲 NOT IMPLEMENTED — NEXT MILESTONE)
- [ ] **Data Model for Local Files**:
  - [ ] `LocalFile` model in `prisma/schema.prisma` (`mediaId`, `filePath`, `fileType`, `fileSize`, `fileHash`, `pageCount`, `chapterNumber`, `volumeNumber`).
- [ ] **Archive Extraction & Stream API**:
  - [ ] Node-based CBZ/ZIP reader extracting images on-the-fly without extracting full archives to disk.
  - [ ] Streaming API endpoint `/api/reader/[fileId]/page/[pageNumber]` returning WebP/JPEG/PNG.
  - [ ] Optional PDF support via pdfjs/canvas or PDF page streaming.
- [ ] **Comic & Webtoon Reader UI**:
  - [ ] Dual-engine reader: Switch between **Text Mode** (current paragraph reader) and **Comic Mode** (image pages).
  - [ ] Manga Mode: Right-to-Left (RTL) reading with single or double page view.
  - [ ] Webtoon Mode: Vertical continuous strip of seamless page images.
  - [ ] Comic Mode: Left-to-Right (LTR) page-flipping.
  - [ ] Zoom/Fit options: Fit-width, Fit-height, Original size.
  - [ ] Fullscreen toggle (F11 / button) and auto-hiding controls.
- [ ] **Local Filesystem Scanner**:
  - [ ] Configurable library folder path (e.g. `data/library/`).
  - [ ] Auto-discovery script (`scripts/scan-library.ts`) and in-app "Scan Library" trigger in `/settings`.
  - [ ] Folder and naming parser: extracts title and volume/chapter (e.g. `Manga/One Piece/Volume 01.cbz`).

---

### Phase 4: Community, Reviews & Custom Lists (Status: 🔲 NOT IMPLEMENTED — FUTURE)
- [ ] **Reviews & Spoilers**:
  - [ ] `Review` model (`userId`, `mediaId`, `rating`, `title`, `body`, `spoiler`, timestamps).
  - [ ] Spoiler toggle: Blurred/hidden by default with click-to-reveal.
- [ ] **Custom Lists**:
  - [ ] `CustomList` and `CustomListItem` models ("Peak Fiction", "My Top 20", etc.).
  - [ ] Public vs Private list visibility.
  - [ ] Drag-and-drop or position ordering of list items.
- [ ] **User Profiles & Privacy**:
  - [ ] Public user profile pages: `/profile/[username]`.
  - [ ] Privacy controls: Profile visibility (Public/Private), Library visibility (Public/Followers/Private).
- [ ] **Social Interactions**:
  - [ ] Follow/Unfollow users.
  - [ ] Activity stream: "User finished One Piece", "User rated Solo Leveling 10/10".

---

### Phase 5: Metadata Providers & Discovery (Status: 🔲 NOT IMPLEMENTED — FUTURE)
- [ ] **Decoupled Metadata Importer**:
  - [ ] Pluggable `MetadataProvider` interface (AniList, MangaDex, Jikan).
  - [ ] In-app search against external providers with 1-click import into local PostgreSQL database.
- [ ] **Discovery & Recommendations**:
  - [ ] Content-based recommendation algorithm (genre overlap + author overlap + user rating similarity).
  - [ ] "Recommended for you" and "Similar Titles" sections.

---

### Phase 6: Containerization & Deployment (Status: 🔲 NOT IMPLEMENTED — FUTURE)
- [ ] **Docker & Compose**:
  - [ ] `docker-compose.yml` defining `web` (Next.js) and `db` (PostgreSQL 16).
  - [ ] Docker volumes for persistent Postgres data and local comic archives.
  - [ ] Environment configuration template for turnkey local startup (`docker compose up`).

---

## Detailed Plan for Next Milestone: Phase 3 (Local Files & Comic Reader)

### Proposed Changes

#### 1. Database Schema
#### [MODIFY] [schema.prisma](file:///home/justine/Documents/reader/prisma/schema.prisma)
Add `FileType` enum and `LocalFile` model:
```prisma
enum FileType {
  CBZ
  CBR
  PDF
  EPUB
  FOLDER
}

model LocalFile {
  id            String    @id @default(cuid())
  mediaId       String
  filePath      String    // Absolute or library-relative path on host disk
  fileType      FileType
  fileSize      BigInt
  fileHash      String?
  pageCount     Int?
  chapterNumber Float?
  volumeNumber  Int?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  media Media @relation(fields: [mediaId], references: [id], onDelete: Cascade)

  @@index([mediaId])
  @@map("local_files")
}
```

#### 2. Local File & Archive Parser Engine
#### [NEW] [lib/reader/archive.ts](file:///home/justine/Documents/reader/lib/reader/archive.ts)
- Implement pure Node.js CBZ/ZIP reading using `jszip` or built-in streams.
- Read image manifest: sort page entries naturally (`001.jpg`, `002.jpg`, etc., ignoring OSX `__MACOSX` metadata).
- Provide streaming buffer for any individual page index without loading the entire archive into RAM.

#### 3. Stream API Endpoint
#### [NEW] [app/api/reader/[fileId]/page/[pageIndex]/route.ts](file:///home/justine/Documents/reader/app/api/reader/[fileId]/page/[pageIndex]/route.ts)
- Authenticated endpoint verifying user session.
- Fetches the `LocalFile` record.
- Serves the specific page image with proper MIME type (`image/jpeg`, `image/png`, `image/webp`) and caching headers (`Cache-Control: private, max-age=86400`).

#### 4. Comic Image Reader Component
#### [NEW] [components/reader/comic-reader.tsx](file:///home/justine/Documents/reader/components/reader/comic-reader.tsx)
- Add mode switch:
  - **Manga Mode (RTL)**: Left arrow goes to next page, right arrow goes to previous page.
  - **Comic Mode (LTR)**: Standard page order.
  - **Webtoon Mode**: Continuous vertical image stream with lazy loading.
  - **Double Page Mode**: Side-by-side display of pages with auto-detection for wide spreads.
- Display page counter (`Page X / Y`) and progress bar.
- Keyboard bindings: `ArrowLeft`, `ArrowRight`, `Space`, `F` (fullscreen), `M` (bookmark).

#### 5. Local Library Scanner
#### [NEW] [lib/data/scanner.ts](file:///home/justine/Documents/reader/lib/data/scanner.ts)
- Crawl the configured library root folder (e.g. `./library` or user-defined path in `.env`).
- Parse folder hierarchy: `[Category]/[Title]/[Filename]` or `[Title]/[Filename]`.
- Match against existing `Media` by slug or title; create placeholder `Media` if not found.
- Associate detected `.cbz` / `.pdf` files as `LocalFile` entries.
#### [NEW] [app/actions/scanner.ts](file:///home/justine/Documents/reader/app/actions/scanner.ts)
- Server action to run scan on demand from `/settings`.

---

## Verification Plan

### Automated Tests
- Schema migration: `npm run db:migrate` creating `local_files` table.
- Parser unit check: Test script opening a sample `.cbz` file and extracting page count and image stream.
- TypeScript & Lint: `npx tsc --noEmit` and `npm run lint`.

### Manual Verification
- Place a sample `.cbz` file in `./library/Manga/One Piece/Volume 01.cbz`.
- Run library scan from Settings.
- Verify `Volume 01` appears on the One Piece detail page under "Local Library".
- Open the comic reader: test RTL page turning, Webtoon continuous scroll, zoom controls, and progress persistence.

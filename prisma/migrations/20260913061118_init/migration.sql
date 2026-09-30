-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('MANGA', 'MANHWA', 'MANHUA', 'WEBTOON', 'COMIC', 'ANIME', 'LIGHT_NOVEL', 'NOVEL', 'OTHER');

-- CreateEnum
CREATE TYPE "MediaStatus" AS ENUM ('ONGOING', 'COMPLETED', 'HIATUS', 'CANCELLED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "LibraryStatus" AS ENUM ('READING', 'COMPLETED', 'ON_HOLD', 'DROPPED', 'PLAN_TO_READ');

-- CreateEnum
CREATE TYPE "PersonRole" AS ENUM ('AUTHOR', 'ARTIST', 'WRITER', 'ILLUSTRATOR', 'CREATOR');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "type" "MediaType" NOT NULL,
    "status" "MediaStatus" NOT NULL DEFAULT 'ONGOING',
    "coverImage" TEXT,
    "releaseYear" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "genres" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "genres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_genres" (
    "mediaId" TEXT NOT NULL,
    "genreId" TEXT NOT NULL,

    CONSTRAINT "media_genres_pkey" PRIMARY KEY ("mediaId","genreId")
);

-- CreateTable
CREATE TABLE "persons" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "biography" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_persons" (
    "mediaId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "role" "PersonRole" NOT NULL,

    CONSTRAINT "media_persons_pkey" PRIMARY KEY ("mediaId","personId")
);

-- CreateTable
CREATE TABLE "chapters" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "chapterNumber" INTEGER,
    "volumeNumber" INTEGER,
    "title" TEXT,
    "releaseDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "status" "LibraryStatus" NOT NULL DEFAULT 'PLAN_TO_READ',
    "rating" INTEGER,
    "currentChapter" INTEGER,
    "notes" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "library_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_tokenHash_key" ON "sessions"("tokenHash");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "media_slug_key" ON "media"("slug");

-- CreateIndex
CREATE INDEX "media_type_idx" ON "media"("type");

-- CreateIndex
CREATE INDEX "media_title_idx" ON "media"("title");

-- CreateIndex
CREATE UNIQUE INDEX "genres_name_key" ON "genres"("name");

-- CreateIndex
CREATE INDEX "media_persons_personId_idx" ON "media_persons"("personId");

-- CreateIndex
CREATE INDEX "chapters_mediaId_volumeNumber_idx" ON "chapters"("mediaId", "volumeNumber");

-- CreateIndex
CREATE UNIQUE INDEX "chapters_mediaId_chapterNumber_key" ON "chapters"("mediaId", "chapterNumber");

-- CreateIndex
CREATE INDEX "library_entries_userId_status_idx" ON "library_entries"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "library_entries_userId_mediaId_key" ON "library_entries"("userId", "mediaId");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_genres" ADD CONSTRAINT "media_genres_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_genres" ADD CONSTRAINT "media_genres_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "genres"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_persons" ADD CONSTRAINT "media_persons_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_persons" ADD CONSTRAINT "media_persons_personId_fkey" FOREIGN KEY ("personId") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_entries" ADD CONSTRAINT "library_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_entries" ADD CONSTRAINT "library_entries_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

import Link from "next/link";
import { notFound } from "next/navigation";
import { Bookmark as BookmarkIcon } from "lucide-react";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/dal";
import {
  MEDIA_STATUS_LABEL,
  MEDIA_TYPE_LABEL,
  PERSON_ROLE_LABEL,
} from "@/lib/constants";
import { CoverArt } from "@/components/cover-art";
import { FavoriteToggle } from "@/components/media/favorite-toggle";
import { EntryNotes } from "@/components/media/entry-notes";
import { ManageTitle } from "@/components/media/manage-title";
import {
  AddToLibraryForm,
  LibraryEntryControls,
} from "@/components/library/library-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { $Enums } from "@/generated/prisma/client";

export default async function MediaDetailPage(props: PageProps<"/media/[id]">) {
  const { id } = await props.params;
  const user = await getCurrentUser();

  const media = await db.media.findUnique({
    where: { id },
    include: {
      genres: {
        select: { genre: { select: { id: true, name: true } } },
      },
      mediaPersons: {
        select: {
          role: true,
          person: { select: { id: true, name: true } },
        },
      },
      chapters: {
        orderBy: { chapterNumber: "asc" },
        select: { chapterNumber: true, title: true },
      },
    },
  });

  if (!media) notFound();

  const chapters = media.chapters
    .filter(
      (c): c is (typeof media.chapters)[number] & { chapterNumber: number } =>
        c.chapterNumber !== null,
    )
    .map((c) => ({ number: c.chapterNumber, title: c.title }));

  const entry = user
    ? await db.libraryEntry.findUnique({
        where: { userId_mediaId: { userId: user.id, mediaId: media.id } },
      })
    : null;

const bookmark = user
    ? await db.bookmark.findUnique({
        where: { userId_mediaId: { userId: user.id, mediaId: media.id } },
      })
    : null;

const favorite = user
    ? await db.favorite.findUnique({
        where: { userId_mediaId: { userId: user.id, mediaId: media.id } },
        select: { id: true },
      })
    : null;

  const allGenres = await db.genre.findMany({
    select: { name: true },
    orderBy: { name: "asc" },
  });

  const startChapter =
    entry?.currentChapter ?? (chapters.length > 0 ? chapters[0].number : null);

  const creators = media.mediaPersons.map((mp) => ({
    role: mp.role as $Enums.PersonRole,
    name: mp.person.name,
    personId: mp.person.id,
  }));

  const roles = [...new Set(creators.map((c) => c.role))] as $Enums.PersonRole[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link
        href={user ? "/search" : "/login"}
        className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        ← Back
      </Link>

      <div className="mt-4 flex flex-col gap-8 md:flex-row">
        <div className="mx-auto w-56 shrink-0 overflow-hidden rounded-lg border border-zinc-200 shadow-sm dark:border-zinc-800 md:mx-0 md:w-64">
          <div className="aspect-[3/4]">
            <CoverArt
              title={media.title}
              imageUrl={media.coverImage}
              iconClassName="text-5xl"
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent">{MEDIA_TYPE_LABEL[media.type]}</Badge>
              <Badge variant="outline">{MEDIA_STATUS_LABEL[media.status]}</Badge>
              {media.releaseYear ? <Badge variant="secondary">{media.releaseYear}</Badge> : null}
              {user ? <FavoriteToggle mediaId={media.id} initial={favorite !== null} /> : null}
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{media.title}</h1>
          </div>

          {media.genres.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5">
              {media.genres.map(({ genre }) => (
                <Badge key={genre.id} variant="secondary">
                  {genre.name}
                </Badge>
              ))}
            </div>
          ) : null}

          {media.description ? (
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
              {media.description}
            </p>
          ) : null}

<div className="flex flex-wrap gap-x-8 gap-y-3">
              {roles.map((role) => (
                <div key={role} className="flex flex-col gap-0.5">
                  <span className="text-xs uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                    {PERSON_ROLE_LABEL[role]}s
                  </span>
                  <span className="text-sm font-medium">
                    {creators
                      .filter((c) => c.role === role)
                      .map((c) => c.name)
                      .join(", ")}
                  </span>
                </div>
              ))}
              {chapters.length > 0 ? (
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                    Chapters
                  </span>
                  <span className="text-sm font-medium">{chapters.length}</span>
                </div>
              ) : null}
            </div>

          {user && startChapter ? (
            <Link
              href={`/media/${media.id}/read/${startChapter}`}
              className="inline-flex w-fit items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              {entry?.currentChapter ? (
                <>
                  Continue reading
                  <span className="font-normal opacity-80">
                    Chapter {entry.currentChapter}
                  </span>
                </>
              ) : (
                <>
                  Start reading
                  <span className="font-normal opacity-80">
                    Chapter {startChapter}
                  </span>
                </>
              )}
            </Link>
          ) : null}

          {bookmark ? (
            <Link
              href={`/media/${media.id}/read/${bookmark.chapterNumber}`}
              className="inline-flex w-fit items-center gap-2 rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
            >
              <BookmarkIcon className="h-4 w-4 fill-current" />
              Bookmark — Chapter {bookmark.chapterNumber}
            </Link>
          ) : null}

          <Card className="mt-2">
            <CardContent className="flex flex-col gap-4 pt-6">
              <h2 className="text-base font-semibold">
                {entry ? "Your library entry" : "Track this title"}
              </h2>

              {entry ? (
                <>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                    <span>
                      {entry.currentChapter
                        ? `Chapter ${entry.currentChapter}`
                        : "No chapter progress yet"}
                    </span>
                    {entry.rating ? (
                      <span>Rated {entry.rating}/10</span>
                    ) : (
                      <span>Unrated</span>
                    )}
                  </div>
                  <LibraryEntryControls entry={entry} />
                  <hr className="border-zinc-200 dark:border-zinc-800" />
                  <EntryNotes mediaId={media.id} initial={entry.notes} />
                </>
              ) : user ? (
                <>
                  <AddToLibraryForm mediaId={media.id} />
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Your reading status, rating, and progress are tracked
                    locally in your own library.
                  </p>
                </>
              ) : (
                <div className="flex flex-col items-start gap-3">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Log in to add this title to your library.
                  </p>
                  <Link
                    href="/login"
                    className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    Log in
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {user && media.createdBy === user.id ? (
            <Card className="mt-2">
              <CardContent className="flex flex-col gap-3 pt-5">
                <h2 className="text-base font-semibold">Manage this title</h2>
                <ManageTitle
                  mediaId={media.id}
                  title={media.title}
                  type={media.type}
                  status={media.status}
                  releaseYear={media.releaseYear}
                  coverImage={media.coverImage}
                  description={media.description}
                  genreNames={media.genres.map(({ genre }) => genre.name)}
                  existingGenres={allGenres.map((g) => g.name)}
                />
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      {chapters.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-lg font-semibold">
            Chapters <span className="font-normal text-zinc-400">({chapters.length})</span>
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {chapters.map((chapter) => {
              const isCurrent = chapter.number === entry?.currentChapter;
              const isBookmarked = chapter.number === bookmark?.chapterNumber;
              return (
                <Link
                  key={chapter.number}
                  href={`/media/${media.id}/read/${chapter.number}`}
                  className={cn(
                    "flex flex-col gap-0.5 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                    isCurrent
                      ? "border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-950"
                      : "border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-900",
                  )}
                >
                  <span className="flex items-center font-medium">
                    Chapter {chapter.number}
                    {isBookmarked ? (
                      <BookmarkIcon className="ml-1.5 h-3.5 w-3.5 fill-current text-indigo-500" />
                    ) : null}
                    {isCurrent ? (
                      <span className="ml-1.5 font-normal text-indigo-600 dark:text-indigo-400">
                        reading
                      </span>
                    ) : null}
                  </span>
                  {chapter.title ? (
                    <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                      {chapter.title}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}
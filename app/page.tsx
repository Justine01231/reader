import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ListPlus, Star } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { CoverArt } from "@/components/cover-art";
import { MediaCard } from "@/components/media-card";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LIBRARY_STATUS_LABEL } from "@/lib/constants";
import type { $Enums } from "@/generated/prisma/client";
import { ReadingStats } from "@/components/home/reading-stats";

export const metadata: Metadata = { title: "Home" };

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Burning the midnight oil";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function HomePage() {
  const user = await requireUser();

  const [continueReading, stats, recentEntries, readingDays, favorites] = await Promise.all([
    db.libraryEntry.findMany({
      where: { userId: user.id, status: "READING" },
      include: { media: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    db.libraryEntry.groupBy({
      by: ["status"],
      where: { userId: user.id },
      _count: { _all: true },
    }),
    db.libraryEntry.findMany({
      where: { userId: user.id },
      include: { media: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    db.readingDay.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 30,
    }),
    db.favorite.findMany({
      where: { userId: user.id },
      include: { media: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const totalEntries = stats.reduce((sum, s) => sum + s._count._all, 0);
  const statMap = new Map(stats.map((s) => [s.status, s._count._all]));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">
        {greeting()}, {user.displayName}
      </h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {totalEntries} {totalEntries === 1 ? "title" : "titles"} in your library
      </p>

      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <BookOpen className="h-5 w-5" /> Continue reading
          </h2>
          <Link href="/library" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
            View library
          </Link>
        </div>

        {continueReading.length === 0 ? (
          <Card className="mt-4">
            <CardContent className="flex flex-col items-start gap-3 py-8">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Nothing in progress yet. Add a title to your library to start
                tracking it.
              </p>
              <Link href="/search" className={buttonVariants()}>
                Browse titles
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {continueReading.map((entry) => (
              <Link
                key={entry.id}
                href={`/media/${entry.mediaId}/read/${entry.currentChapter ?? 1}`}
                className="group flex gap-3 rounded-lg p-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <div className="h-28 w-20 shrink-0 overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800">
                  <CoverArt
                    title={entry.media.title}
                    imageUrl={entry.media.coverImage}
                    iconClassName="text-lg"
                  />
                </div>
                <div className="flex min-w-0 flex-col justify-center gap-1">
                  <span className="line-clamp-2 font-medium group-hover:underline">
                    {entry.media.title}
                  </span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {entry.currentChapter
                      ? `Chapter ${entry.currentChapter}`
                      : "In progress"}
                  </span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    {LIBRARY_STATUS_LABEL[entry.status]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {favorites.length > 0 ? (
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Star className="h-5 w-5 text-amber-500" /> Favorites
            </h2>
            <Link href="/library?status=FAVORITES" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
              View all
            </Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {favorites.map((f) => (
              <MediaCard key={f.id} media={f.media} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-10">
        <ReadingStats days={readingDays} />
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Your library</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {([
            { status: "READING" as const, label: "Reading" },
            { status: "COMPLETED" as const, label: "Completed" },
            { status: "ON_HOLD" as const, label: "On Hold" },
            { status: "DROPPED" as const, label: "Dropped" },
            { status: "PLAN_TO_READ" as const, label: "Plan to Read" },
          ] satisfies { status: $Enums.LibraryStatus; label: string }[]).map(({ status, label }) => (
            <Link
              key={status}
              href={`/library?status=${status}`}
              className={buttonVariants({
                variant: "secondary",
                className: "h-auto flex-col items-start gap-1 px-4 py-3",
              })}
            >
              <span className="text-2xl font-semibold">
                {statMap.get(status) ?? 0}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <ListPlus className="h-5 w-5" /> Recently added
          </h2>
          <Link href="/library" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
            See all
          </Link>
        </div>
        {recentEntries.length === 0 ? (
          <Card className="mt-4">
            <CardContent className="py-8">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Your library is empty. Search for a title to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {recentEntries.map((entry) => (
              <MediaCard key={entry.id} media={entry.media} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
import type { Metadata } from "next";
import Link from "next/link";
import { $Enums } from "@/generated/prisma/client";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { LIBRARY_STATUS_LABEL } from "@/lib/constants";
import { CoverArt } from "@/components/cover-art";
import { MediaCard } from "@/components/media-card";
import { LibraryCardActions } from "@/components/library/library-actions";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactElement } from "react";

export const metadata: Metadata = { title: "Library" };

type FilterValue = $Enums.LibraryStatus | "ALL" | "FAVORITES";

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "FAVORITES", label: "Favorites" },
  { value: "READING", label: "Reading" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "DROPPED", label: "Dropped" },
  { value: "PLAN_TO_READ", label: "Plan to Read" },
];

function FilterTabs({ active }: { active: FilterValue }): ReactElement {
  return (
    <nav className="mt-6 flex flex-wrap items-center gap-2">
      {FILTERS.map(({ value, label }) => (
        <Link
          key={value}
          href={value === "ALL" ? "/library" : `/library?status=${value}`}
          className={cn(
            "rounded-full border px-3.5 py-1 text-sm transition-colors",
            active === value
              ? "border-zinc-900 bg-zinc-900 text-zinc-50 dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
              : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800",
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

function EmptyView({ message }: { message: string }): ReactElement {
  return (
    <Card className="mt-6">
      <CardContent className="flex flex-col items-start gap-3 py-10">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{message}</p>
        <Link
          href="/search"
          className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Browse the catalog
        </Link>
      </CardContent>
    </Card>
  );
}

export default async function LibraryPage(
  props: PageProps<"/library">,
) {
  const user = await requireUser();
  const { status } = await props.searchParams;

  const activeFilter = (Array.isArray(status)
    ? status[0]
    : status ?? "ALL") as FilterValue;

  if (activeFilter === "FAVORITES") {
    const favorites = await db.favorite.findMany({
      where: { userId: user.id },
      include: { media: true },
      orderBy: { createdAt: "desc" },
    });

    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight">Library</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {favorites.length} {favorites.length === 1 ? "favorite" : "favorites"}
        </p>
        <FilterTabs active={activeFilter} />
        {favorites.length === 0 ? (
          <EmptyView message="No favorites yet. Star titles from their detail page." />
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {favorites.map((f) => (
              <MediaCard key={f.id} media={f.media} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const entries =
    activeFilter === "ALL"
      ? await db.libraryEntry.findMany({
          where: { userId: user.id },
          include: { media: true },
          orderBy: { updatedAt: "desc" },
        })
      : await db.libraryEntry.findMany({
          where: { userId: user.id, status: activeFilter },
          include: { media: true },
          orderBy: { updatedAt: "desc" },
        });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Library</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        {entries.length} {entries.length === 1 ? "title" : "titles"}
      </p>
      <FilterTabs active={activeFilter} />

      {entries.length === 0 ? (
        <EmptyView message="Nothing in this view yet." />
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map((entry) => (
            <Card key={entry.id} className="flex flex-col gap-4 p-4">
              <div className="flex gap-3">
                <Link
                  href={`/media/${entry.mediaId}`}
                  className="h-36 w-24 shrink-0 overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800"
                >
                  <CoverArt
                    title={entry.media.title}
                    imageUrl={entry.media.coverImage}
                    iconClassName="text-xl"
                  />
                </Link>
                <div className="flex min-w-0 flex-col gap-1.5">
                  <Link
                    href={`/media/${entry.mediaId}`}
                    className="line-clamp-3 font-medium hover:underline"
                  >
                    {entry.media.title}
                  </Link>
                  <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                    {LIBRARY_STATUS_LABEL[entry.status]}
                  </span>
                  {entry.currentChapter ? (
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      Chapter {entry.currentChapter}
                    </span>
                  ) : null}
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    {entry.rating ? `Rating: ${entry.rating}/10` : "Unrated"}
                  </span>
                </div>
              </div>
              <LibraryCardActions entry={entry} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
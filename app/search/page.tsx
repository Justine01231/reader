import type { Metadata } from "next";
import { $Enums } from "@/generated/prisma/client";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { MEDIA_TYPES } from "@/lib/constants";
import { MediaCard } from "@/components/media-card";
import { AddMediaForm } from "@/components/search/add-media-form";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Search" };

function asArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export default async function SearchPage(props: PageProps<"/search">) {
  await requireUser();
  const searchParams = await props.searchParams;

  const q = (searchParams.q as string | undefined)?.trim() ?? "";
  const types = asArray(searchParams.type);
  const genresSelected = asArray(searchParams.genre);

  const genres = await db.genre.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const typeFilters = MEDIA_TYPES.filter((t) => types.includes(t.value)).map(
    (t) => t.value as $Enums.MediaType,
  );

  const where = {
    ...(q
      ? {
          title: { contains: q, mode: "insensitive" as const },
        }
      : {}),
    ...(typeFilters.length > 0 ? { type: { in: typeFilters } } : {}),
    ...(genresSelected.length > 0
      ? { genres: { some: { genreId: { in: genresSelected } } } }
      : {}),
  };

  const results =
    q || types.length > 0 || genresSelected.length > 0
      ? await db.media.findMany({
          where,
          include: { genres: { select: { genre: { select: { name: true } } } } },
          orderBy: { title: "asc" },
          take: 100,
        })
      : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Search</h1>

      <form method="GET" action="/search" className="mt-6 flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search titles…"
            className="h-9 min-w-64 flex-1 rounded-md border border-zinc-300 bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700 sm:flex-none sm:flex-1"
          />
          <Select
            name="type"
            defaultValue={types[0] ?? ""}
            className="h-9 w-44"
          >
            <option value="">All types</option>
            {MEDIA_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
          <button
            type="submit"
            className="h-9 rounded-md bg-zinc-900 px-4 text-sm font-medium text-zinc-50 hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Search
          </button>
        </div>

        <fieldset className="flex flex-wrap items-center gap-2">
          <legend className="sr-only">Filter by genre</legend>
          {genres.map((genre) => (
            <label
              key={genre.id}
              className="flex cursor-pointer items-center gap-1.5"
            >
              <input
                type="checkbox"
                name="genre"
                value={genre.id}
                defaultChecked={genresSelected.includes(genre.id)}
                className="h-4 w-4 rounded border-zinc-300 accent-zinc-900 dark:border-zinc-700"
              />
              <span
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-xs",
                  genresSelected.includes(genre.id)
                    ? "border-indigo-600 bg-indigo-100 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-900/50 dark:text-indigo-300"
                    : "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400",
                )}
              >
                {genre.name}
              </span>
            </label>
          ))}
        </fieldset>
      </form>

      <section className="mt-8">
        {q || types.length > 0 || genresSelected.length > 0 ? (
          <>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {results.length} {results.length === 1 ? "result" : "results"}
            </p>
            {results.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-zinc-300 py-16 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                No titles matched your search.
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {results.map((media) => (
                  <MediaCard key={media.id} media={media} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-zinc-300 py-16 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            Start typing to search your catalog.
          </div>
        )}
      </section>

      <section className="mt-10">
        <AddMediaForm existingGenres={genres.map((genre) => genre.name)} />
      </section>
    </div>
  );
}
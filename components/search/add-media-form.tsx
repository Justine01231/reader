"use client";

import { useActionState } from "react";
import { createMedia } from "@/app/actions/library";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { MEDIA_STATUSES, MEDIA_TYPES } from "@/lib/constants";

export function AddMediaForm({ existingGenres }: { existingGenres: string[] }) {
  const [state, action, pending] = useActionState(createMedia, null);

  return (
    <form
      action={action}
      className="rounded-xl border border-dashed border-zinc-300 p-5 dark:border-zinc-700"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-base font-semibold">Add a title to the catalog</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Titles you add appear in search and are saved locally.
        </p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="title">Title</Label>
          <input
            id="title"
            type="text"
            name="title"
            required
            maxLength={200}
            placeholder="e.g. Frieren: Beyond Journey's End"
            className="h-9 rounded-md border border-zinc-300 bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700"
          />
          {state?.errors?.title ? (
            <p className="text-xs text-red-600 dark:text-red-400">
              {state.errors.title[0]}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="type">Type</Label>
          <Select id="type" name="type" defaultValue="MANGA" className="h-9">
            {MEDIA_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="status">Status</Label>
          <Select id="status" name="status" defaultValue="ONGOING" className="h-9">
            {MEDIA_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="releaseYear">Release year (optional)</Label>
          <input
            id="releaseYear"
            type="number"
            name="releaseYear"
            min={1000}
            max={2200}
            placeholder="2020"
            className="h-9 rounded-md border border-zinc-300 bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="coverImage">Cover image URL (optional)</Label>
          <input
            id="coverImage"
            type="url"
            name="coverImage"
            maxLength={2000}
            placeholder="https://….jpg"
            className="h-9 rounded-md border border-zinc-300 bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700"
          />
          {state?.errors?.coverImage ? (
            <p className="text-xs text-red-600 dark:text-red-400">
              {state.errors.coverImage[0]}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="genres">Genres (comma separated, optional)</Label>
          <input
            id="genres"
            type="text"
            name="genres"
            list="catalog-genres"
            maxLength={1000}
            placeholder="Fantasy, Adventure"
            className="h-9 rounded-md border border-zinc-300 bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700"
          />
          <datalist id="catalog-genres">
            {existingGenres.map((genre) => (
              <option key={genre} value={genre} />
            ))}
          </datalist>
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="description">Description (optional)</Label>
          <textarea
            id="description"
            name="description"
            rows={3}
            maxLength={4000}
            className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700"
          />
          {state?.errors?.description ? (
            <p className="text-xs text-red-600 dark:text-red-400">
              {state.errors.description[0]}
            </p>
          ) : null}
        </div>
      </div>

      {state?.message ? (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" className="mt-4" disabled={pending}>
        {pending ? "Adding…" : "Add title"}
      </Button>
    </form>
  );
}
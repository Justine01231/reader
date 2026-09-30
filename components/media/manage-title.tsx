"use client";

import { useActionState, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deleteMedia, updateMedia } from "@/app/actions/library";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { MEDIA_STATUSES, MEDIA_TYPES } from "@/lib/constants";
import type { $Enums } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

type ManageTitleProps = {
  mediaId: string;
  title: string;
  type: $Enums.MediaType;
  status: $Enums.MediaStatus;
  releaseYear: number | null;
  coverImage: string | null;
  description: string | null;
  genreNames: string[];
  existingGenres: string[];
};

export function ManageTitle({
  mediaId,
  title,
  type,
  status,
  releaseYear,
  coverImage,
  description,
  genreNames,
  existingGenres,
}: ManageTitleProps) {
  const [editing, setEditing] = useState(false);
  const [state, action, pending] = useActionState(updateMedia, null);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {editing ? null : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEditing(true)}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        )}
        <form
          action={deleteMedia}
          onSubmit={(e) => {
            if (!window.confirm("Delete this title? Its chapters, library entries, bookmarks, and favorites are removed too.")) {
              e.preventDefault();
            }
          }}
        >
          <input type="hidden" name="mediaId" value={mediaId} />
          <Button type="submit" variant="ghost" size="sm" className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </form>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          You added this title.
        </span>
      </div>

      {editing ? (
        <form action={action} className="flex flex-col gap-4">
          <input type="hidden" name="mediaId" value={mediaId} />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="manage-title">Title</Label>
              <input
                id="manage-title"
                type="text"
                name="title"
                required
                maxLength={200}
                defaultValue={title}
                className={cn(
                  "h-9 rounded-md border border-zinc-300 bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700",
                  state?.errors?.title && "border-red-500",
                )}
              />
              {state?.errors?.title ? (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {state.errors.title[0]}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="manage-type">Type</Label>
              <Select id="manage-type" name="type" defaultValue={type} className="h-9">
                {MEDIA_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="manage-status">Status</Label>
              <Select id="manage-status" name="status" defaultValue={status} className="h-9">
                {MEDIA_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="manage-year">Release year (optional)</Label>
              <input
                id="manage-year"
                type="number"
                name="releaseYear"
                min={1000}
                max={2200}
                defaultValue={releaseYear ?? ""}
                className="h-9 rounded-md border border-zinc-300 bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="manage-cover">Cover image URL (optional)</Label>
              <input
                id="manage-cover"
                type="url"
                name="coverImage"
                maxLength={2000}
                defaultValue={coverImage ?? ""}
                className="h-9 rounded-md border border-zinc-300 bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700"
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="manage-genres">Genres (comma separated)</Label>
              <input
                id="manage-genres"
                type="text"
                name="genres"
                list="catalog-genres"
                maxLength={1000}
                defaultValue={genreNames.join(", ")}
                className="h-9 rounded-md border border-zinc-300 bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700"
              />
              <datalist id="catalog-genres">
                {existingGenres.map((genre) => (
                  <option key={genre} value={genre} />
                ))}
              </datalist>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="manage-description">Description (optional)</Label>
              <textarea
                id="manage-description"
                name="description"
                rows={3}
                maxLength={4000}
                defaultValue={description ?? ""}
                className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700"
              />
            </div>
          </div>

          {state?.message ? (
            <p
              className={
                state.success
                  ? "text-sm text-emerald-600 dark:text-emerald-400"
                  : "text-sm text-red-600 dark:text-red-400"
              }
            >
              {state.message}
            </p>
          ) : null}

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save changes"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setEditing(false);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
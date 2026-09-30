import {
  addToLibrary,
  removeFromLibrary,
  setLibraryRating,
  setLibraryStatus,
} from "@/app/actions/library";
import { $Enums } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { LIBRARY_STATUSES, RATINGS } from "@/lib/constants";

const STATUS_LABELS = Object.fromEntries(
  LIBRARY_STATUSES.map((s) => [s.value, s.label]),
) as Record<$Enums.LibraryStatus, string>;

/** Upsert form shown on the media detail page when the title is not yet in the library. */
export function AddToLibraryForm({ mediaId }: { mediaId: string }) {
  return (
    <form action={addToLibrary} className="flex items-end gap-2">
      <input type="hidden" name="mediaId" value={mediaId} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="add-status">Status</Label>
        <Select id="add-status" name="status" defaultValue="PLAN_TO_READ" className="w-44">
          {LIBRARY_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
      </div>
      <Button type="submit">Add to library</Button>
    </form>
  );
}

/** Row of controls to manage an existing library entry. */
export function LibraryEntryControls({
  entry,
}: {
  entry: { id: string; status: $Enums.LibraryStatus; rating: number | null };
}) {
  return (
    <div className="flex flex-wrap items-end gap-4">
      <form action={setLibraryStatus} className="flex items-end gap-2">
        <input type="hidden" name="entryId" value={entry.id} />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`status-${entry.id}`}>Status</Label>
          <Select
            id={`status-${entry.id}`}
            name="status"
            defaultValue={entry.status}
            className="w-44"
          >
            {LIBRARY_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" variant="secondary" size="sm">
          Save
        </Button>
      </form>

      <form action={setLibraryRating} className="flex items-end gap-2">
        <input type="hidden" name="entryId" value={entry.id} />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`rating-${entry.id}`}>Rating</Label>
          <Select
            id={`rating-${entry.id}`}
            name="rating"
            defaultValue={entry.rating ? String(entry.rating) : ""}
            className="w-28"
          >
            <option value="">Unrated</option>
            {RATINGS.map((r) => (
              <option key={r} value={r}>
                {r} / 10
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit" variant="secondary" size="sm">
          Save
        </Button>
      </form>

      <form action={removeFromLibrary}>
        <input type="hidden" name="entryId" value={entry.id} />
        <Button type="submit" variant="destructive" size="sm">
          Remove
        </Button>
      </form>
    </div>
  );
}

/** Compact per-entry controls for the library list. */
export function LibraryCardActions({
  entry,
}: {
  entry: { id: string; status: $Enums.LibraryStatus; rating: number | null };
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Status
        </span>
        <form action={setLibraryStatus} className="flex flex-1 gap-1.5">
          <input type="hidden" name="entryId" value={entry.id} />
          <Select
            name="status"
            defaultValue={entry.status}
            aria-label="Status"
            className="h-8 flex-1"
          >
            {LIBRARY_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="secondary" size="sm">
            Save
          </Button>
        </form>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          Rating
        </span>
        <form action={setLibraryRating} className="flex flex-1 gap-1.5">
          <input type="hidden" name="entryId" value={entry.id} />
          <Select
            name="rating"
            defaultValue={entry.rating ? String(entry.rating) : ""}
            aria-label="Rating"
            className="h-8 flex-1"
          >
            <option value="">—</option>
            {RATINGS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="secondary" size="sm">
            Save
          </Button>
        </form>
      </div>

      <form action={removeFromLibrary}>
        <input type="hidden" name="entryId" value={entry.id} />
        <Button type="submit" variant="ghost" size="sm" className="text-red-600 dark:text-red-400">
          Remove from library
        </Button>
      </form>
    </div>
  );
}

export { STATUS_LABELS };
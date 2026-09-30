"use client";

import { useActionState, useState } from "react";
import { updateEntryNotes } from "@/app/actions/library";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const MAX_NOTES = 2000;

export function EntryNotes({
  mediaId,
  initial,
}: {
  mediaId: string;
  initial: string | null;
}) {
  const [state, action, pending] = useActionState(updateEntryNotes, null);
  const [notes, setNotes] = useState(initial ?? "");

  return (
    <form action={action} className="flex flex-col gap-2">
      <input type="hidden" name="mediaId" value={mediaId} />
      <Label htmlFor="entry-notes">Notes</Label>
      <textarea
        id="entry-notes"
        name="notes"
        rows={3}
        maxLength={MAX_NOTES}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Thoughts, progress reminders, spoiler warnings…"
        className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700"
      />
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          {notes.length}/{MAX_NOTES}
        </span>
        <div className="flex items-center gap-2">
          {state?.message ? (
            <span
              className={
                state.success
                  ? "text-xs text-emerald-600 dark:text-emerald-400"
                  : "text-xs text-red-600 dark:text-red-400"
              }
            >
              {state.message}
            </span>
          ) : null}
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Saving…" : "Save notes"}
          </Button>
        </div>
      </div>
    </form>
  );
}
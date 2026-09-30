"use client";

import { useActionState } from "react";
import { importLibrary } from "@/app/actions/library";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function ImportForm() {
  const [state, action, pending] = useActionState(importLibrary, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="import-file">MangaShelf export (.json)</Label>
        <input
          id="import-file"
          type="file"
          name="file"
          accept="application/json,.json"
          required
          disabled={pending}
          className="block w-full text-sm text-zinc-600 file:mr-3 file:rounded-md file:border file:border-zinc-300 file:bg-zinc-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-100 dark:text-zinc-400 dark:file:border-zinc-700 dark:file:bg-zinc-900 dark:file:text-zinc-300 dark:hover:file:bg-zinc-800"
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Existing entries are updated; missing titles are created. Max 1MB.
        </p>
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

      <Button type="submit" disabled={pending}>
        {pending ? "Importing…" : "Import library"}
      </Button>
    </form>
  );
}
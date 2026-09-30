"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfileForm({
  displayName,
  bio,
}: {
  displayName: string;
  bio: string | null;
}) {
  const [state, action, pending] = useActionState(updateProfile, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          name="displayName"
          defaultValue={displayName}
          required
        />
        {state?.errors?.displayName ? (
          <p className="text-sm text-red-600 dark:text-red-400">
            {state.errors.displayName[0]}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bio">Bio</Label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={bio ?? ""}
          placeholder="A short introduction…"
          className="flex min-h-24 w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:placeholder:text-zinc-500"
        />
        {state?.errors?.bio ? (
          <p className="text-sm text-red-600 dark:text-red-400">
            {state.errors.bio[0]}
          </p>
        ) : null}
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
        {pending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
"use client";

import { useActionState } from "react";
import { changePassword } from "@/app/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="currentPassword">Current password</Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
        {state?.errors?.currentPassword ? (
          <p className="text-sm text-red-600 dark:text-red-400">
            {state.errors.currentPassword[0]}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="newPassword">New password</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
        />
        {state?.errors?.newPassword ? (
          <ul className="text-sm text-red-600 dark:text-red-400">
            {state.errors.newPassword.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword">Confirm new password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
        />
        {state?.errors?.confirmPassword ? (
          <p className="text-sm text-red-600 dark:text-red-400">
            {state.errors.confirmPassword[0]}
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
        {pending ? "Changing…" : "Change password"}
      </Button>
    </form>
  );
}
"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const [state, action, pending] = useActionState(signup, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          placeholder="e.g. john"
          autoComplete="username"
          autoCapitalize="none"
          required
        />
        {state?.errors?.username ? (
          <ul className="text-sm text-red-600 dark:text-red-400">
            {state.errors.username.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="At least 8 characters with letters and numbers"
          autoComplete="new-password"
          required
        />
        {state?.errors?.password ? (
          <ul className="text-sm text-red-600 dark:text-red-400">
            {state.errors.password.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          required
        />
        {state?.errors?.confirmPassword ? (
          <ul className="text-sm text-red-600 dark:text-red-400">
            {state.errors.confirmPassword.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        ) : null}
      </div>

      {state?.message ? (
        <p className="text-sm text-red-600 dark:text-red-400">{state.message}</p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100">
          Log in
        </Link>
      </p>
    </form>
  );
}
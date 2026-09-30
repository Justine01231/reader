"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          placeholder="your_username"
          autoComplete="username"
          required
        />
        {state?.errors?.username ? (
          <p className="text-sm text-red-600 dark:text-red-400">
            {state.errors.username[0]}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
        {state?.errors?.password ? (
          <p className="text-sm text-red-600 dark:text-red-400">
            {state.errors.password[0]}
          </p>
        ) : null}
      </div>

      {state?.message ? (
        <p className="text-sm text-red-600 dark:text-red-400">{state.message}</p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Logging in…" : "Log in"}
      </Button>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100">
          Sign up
        </Link>
      </p>
    </form>
  );
}
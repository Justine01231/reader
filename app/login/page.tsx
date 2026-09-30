import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms/login-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Log in to your library
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Log in</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
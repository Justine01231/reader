import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/forms/register-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/dal";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Local library, tracker, and reader — all yours.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Sign up</CardTitle>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}
import type { Metadata } from "next";
import Link from "next/link";
import { Download, HardDriveDownload } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { ProfileForm } from "@/components/forms/profile-form";
import { PasswordForm } from "@/components/forms/password-form";
import { ReaderSettingsForm } from "@/components/forms/reader-settings-form";
import { ImportForm } from "@/components/forms/import-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <div className="mt-6 flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Data</CardTitle>
            <CardDescription>
              Your shelf is local-first — back it up or move it to another
              machine anytime.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label>Export</Label>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Download everything in your library as a JSON file, including
                your progress, ratings, notes and the titles you added.
              </p>
              <Link
                href="/api/export"
                className="inline-flex w-fit items-center gap-2 rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
              >
                <Download className="h-4 w-4" />
                Export library
              </Link>
            </div>

            <div className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
              <div className="flex items-center gap-1.5">
                <HardDriveDownload className="h-4 w-4 text-zinc-400" />
                <Label>Import</Label>
              </div>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Restore a previous export. Entries are matched by slug;
                anything missing is created.
              </p>
              <div className="mt-2">
                <ImportForm />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reading</CardTitle>
            <CardDescription>
              How the line reader looks while you read.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReaderSettingsForm
              theme={user.readerTheme}
              fontSize={user.readerFontSize}
              measure={user.readerMeasure}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              How you appear across MangaShelf.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Username</Label>
              <p className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                {user.username}
              </p>
            </div>
            <ProfileForm displayName={user.displayName} bio={user.bio} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change password</CardTitle>
            <CardDescription>
              Passwords are hashed with Argon2id — never stored in plain text.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
"use client";

import { useActionState } from "react";
import { updateReaderSettings } from "@/app/actions/profile";
import { $Enums } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const THEMES: { value: $Enums.ReaderTheme; label: string }[] = [
  { value: "PAPER", label: "Paper" },
  { value: "DARK", label: "Dark" },
  { value: "SEPIA", label: "Sepia" },
  { value: "MIDNIGHT", label: "Midnight" },
];

const FONT_SIZES = [16, 18, 20, 22, 24, 28, 32, 40];
const MEASURES = [30, 36, 42, 48, 56, 64, 72];

export function ReaderSettingsForm({
  theme,
  fontSize,
  measure,
}: {
  theme: $Enums.ReaderTheme;
  fontSize: number | null;
  measure: number | null;
}) {
  const [state, action, pending] = useActionState(updateReaderSettings, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reader-theme">Reader theme</Label>
        <Select id="reader-theme" name="theme" defaultValue={theme} className="w-52">
          {THEMES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reader-font-size">Font size</Label>
        <Select
          id="reader-font-size"
          name="fontSize"
          defaultValue={fontSize ?? ""}
          className="w-52"
        >
          <option value="">Default</option>
          {FONT_SIZES.map((size) => (
            <option key={size} value={size}>
              {size}px
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reader-measure">Line length</Label>
        <Select
          id="reader-measure"
          name="measure"
          defaultValue={measure ?? ""}
          className="w-52"
        >
          <option value="">Default</option>
          {MEASURES.map((m) => (
            <option key={m} value={m}>
              {m}ch
            </option>
          ))}
        </Select>
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
        {pending ? "Saving…" : "Save preferences"}
      </Button>
    </form>
  );
}
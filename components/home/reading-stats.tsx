import Link from "next/link";
import { Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { computeReadingStats } from "@/lib/reading-stats";

export function ReadingStats({
  days,
}: {
  days: { date: Date; msRead: number }[];
}) {
  const { week, weekMs, streak } = computeReadingStats(days);
  const maxMs = Math.max(...week.map((d) => d.ms), 1);
  const minutes = Math.round(weekMs / 60_000);

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Flame className="h-4 w-4 text-orange-500" />
            Reading activity
          </h2>
          <div className="flex items-center gap-2">
            {streak > 0 ? (
              <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                {streak}-day streak
              </span>
            ) : null}
            <Link
              href="/stats"
              className="text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Details
            </Link>
          </div>
        </div>

        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {minutes}
          </span>{" "}
          min this week
        </p>

        <div className="flex h-24 items-end gap-1.5">
          {week.map((day) => {
            const active = day.ms > 0;
            const height =
              active ? Math.max(6, Math.round((day.ms / maxMs) * 96)) : 3;
            return (
              <div
                key={day.label}
                className="flex min-w-0 flex-1 flex-col items-center gap-1"
                title={`${day.label}: ${Math.round(day.ms / 60_000)} min`}
              >
                <div
                  className={active ? "w-full rounded-t bg-indigo-500" : "w-full rounded bg-zinc-200 dark:bg-zinc-800"}
                  style={{ height: `${height}px` }}
                />
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
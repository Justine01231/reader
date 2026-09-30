import type { Metadata } from "next";
import { CalendarRange, Flame, TrendingUp } from "lucide-react";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { computeStatsDetail } from "@/lib/reading-stats";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Reading stats" };

function formatMinutes(ms: number) {
  return Math.round(ms / 60_000);
}

export default async function StatsPage() {
  const user = await requireUser();

  const days = await db.readingDay.findMany({
    where: { userId: user.id },
    orderBy: { date: "asc" },
    take: 500,
  });

  const stats = computeStatsDetail(days, 30);
  const maxMs = Math.max(...stats.daily.map((d) => d.ms), 1);
  const maxWeekMs = Math.max(...stats.weeks.map((w) => w.ms), 1);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Reading stats</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Time spent reading, tracked in your reader.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="flex flex-col gap-1 pt-5">
            <p className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <TrendingUp className="h-3.5 w-3.5" /> All-time
            </p>
            <p className="text-2xl font-semibold">
              {formatMinutes(stats.totalMs)} <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">min</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-1 pt-5">
            <p className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <CalendarRange className="h-3.5 w-3.5" /> This week
            </p>
            <p className="text-2xl font-semibold">
              {formatMinutes(stats.weekMs)} <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">min</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-1 pt-5">
            <p className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <Flame className="h-3.5 w-3.5 text-orange-500" /> Current streak
            </p>
            <p className="text-2xl font-semibold">
              {stats.streak} <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">{stats.streak === 1 ? "day" : "days"}</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-1 pt-5">
            <p className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <Flame className="h-3.5 w-3.5 text-orange-500" /> Best streak
            </p>
            <p className="text-2xl font-semibold">
              {stats.bestStreak} <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">{stats.bestStreak === 1 ? "day" : "days"}</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-1 pt-5">
            <p className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <CalendarRange className="h-3.5 w-3.5" /> Best day
            </p>
            <p className="text-2xl font-semibold">
              {stats.bestDay ? formatMinutes(stats.bestDay.ms) : 0}{" "}
              <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400">min</span>
            </p>
          </CardContent>
        </Card>
      </div>

      <section className="mt-8">
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Last 30 days</h2>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {formatMinutes(stats.windowMs)} min total
              </span>
            </div>
            <div className="flex h-40 items-end gap-[3px]">
              {stats.daily.map((day) => {
                const active = day.ms > 0;
                const height = active
                  ? Math.max(4, Math.round((day.ms / maxMs) * 160))
                  : 2;
                return (
                  <div
                    key={day.iso}
                    className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-1"
                    title={`${day.weekday} ${day.iso}: ${formatMinutes(day.ms)} min`}
                  >
                    <div
                      className={
                        active
                          ? "w-full rounded-t bg-indigo-500"
                          : "w-full rounded bg-zinc-200 dark:bg-zinc-800"
                      }
                      style={{ height: `${height}px` }}
                    />
                    <span className="text-[8px] text-zinc-400 dark:text-zinc-500">
                      {day.dayOfMonth}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-zinc-400 dark:text-zinc-500">
              <span>
                Months:{" "}
                {[...new Set(stats.daily.map((d) => d.month))].join(" · ")}
              </span>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Weekly recap</h2>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                avg {Math.round(formatMinutes(stats.windowMs) / 30)} min/day
              </span>
            </div>
            <div className="flex h-28 items-end gap-2">
              {stats.weeks.map((week) => {
                const active = week.ms > 0;
                const height = active
                  ? Math.max(4, Math.round((week.ms / maxWeekMs) * 108))
                  : 2;
                return (
                  <div
                    key={week.iso}
                    className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1"
                    title={`Week of ${week.iso}: ${formatMinutes(week.ms)} min`}
                  >
                    <div
                      className={
                        active
                          ? "w-full rounded-t bg-emerald-500"
                          : "w-full rounded bg-zinc-200 dark:bg-zinc-800"
                      }
                      style={{ height: `${height}px` }}
                    />
                    <span className="text-[9px] text-zinc-400 dark:text-zinc-500">
                      {week.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3 pt-6">
            <h2 className="text-base font-semibold">Activity days</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              You read on{" "}
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                {stats.daily.filter((d) => d.ms > 0).length}
              </span>{" "}
              of the last 30 days
              {stats.bestDay ? (
                <>
                  , peaking on{" "}
                  <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {new Date(`${stats.bestDay.iso}T00:00:00Z`).toLocaleDateString(
                      undefined,
                      { month: "long", day: "numeric", timeZone: "UTC" },
                    )}
                  </span>{" "}
                  at {formatMinutes(stats.bestDay.ms)} minutes.
                </>
              ) : (
                "."
              )}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {stats.bestStreak > 1
                ? `Your longest run was ${stats.bestStreak} consecutive days.`
                : stats.streak >= 2
                  ? `You're on a ${stats.streak}-day streak right now.`
                  : "Start a streak by reading on consecutive days."}
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
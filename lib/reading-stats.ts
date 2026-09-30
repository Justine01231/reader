export const DAY_MS = 86_400_000;

export type ReadingDayRow = { date: Date; msRead: number };

export function utcDay(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export function computeReadingStats(days: ReadingDayRow[]) {
  const byDay = new Map(
    days.map((d) => [d.date.toISOString().slice(0, 10), d.msRead]),
  );

  const today = utcDay(new Date());
  const week: { label: string; ms: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(today.getTime() - i * DAY_MS);
    week.push({
      label: day.toLocaleDateString(undefined, {
        weekday: "short",
        timeZone: "UTC",
      }),
      ms: byDay.get(day.toISOString().slice(0, 10)) ?? 0,
    });
  }
  const weekMs = week.reduce((sum, d) => sum + d.ms, 0);

  let streak = 0;
  let cursor = today;
  if ((byDay.get(cursor.toISOString().slice(0, 10)) ?? 0) === 0) {
    cursor = new Date(today.getTime() - DAY_MS);
  }
  while ((byDay.get(cursor.toISOString().slice(0, 10)) ?? 0) > 0) {
    streak++;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }

  return { week, weekMs, streak };
}

export type DailyBar = {
  iso: string;
  weekday: string;
  dayOfMonth: number;
  month: string;
  ms: number;
};

export type WeekBucket = {
  iso: string;
  label: string;
  ms: number;
};

export function computeStatsDetail(days: ReadingDayRow[], lookback = 30) {
  const byDay = new Map(
    days.map((d) => [d.date.toISOString().slice(0, 10), d.msRead]),
  );

  const today = utcDay(new Date());
  const daily: DailyBar[] = [];
  for (let i = lookback - 1; i >= 0; i--) {
    const day = new Date(today.getTime() - i * DAY_MS);
    const iso = day.toISOString().slice(0, 10);
    daily.push({
      iso,
      weekday: day.toLocaleDateString(undefined, {
        weekday: "short",
        timeZone: "UTC",
      }),
      dayOfMonth: day.getUTCDate(),
      month: day.toLocaleDateString(undefined, {
        month: "short",
        timeZone: "UTC",
      }),
      ms: byDay.get(iso) ?? 0,
    });
  }

  const windowMs = daily.reduce((sum, d) => sum + d.ms, 0);
  const totalMs = days.reduce((sum, d) => sum + d.msRead, 0);

  const weeks: WeekBucket[] = [];
  const perWeekStart = new Map<string, number>();
  for (const d of daily) {
    const date = new Date(`${d.iso}T00:00:00Z`);
    const offset = (date.getUTCDay() + 6) % 7;
    const weekStart = new Date(date.getTime() - offset * DAY_MS);
    const key = weekStart.toISOString().slice(0, 10);
    perWeekStart.set(key, (perWeekStart.get(key) ?? 0) + d.ms);
  }
  const startingDay = new Date(today.getTime() - (daily.length - 1) * DAY_MS);
  const offset = (startingDay.getUTCDay() + 6) % 7;
  let weekCursor = new Date(startingDay.getTime() - offset * DAY_MS);
  for (let i = 0; i < 5; i++) {
    const key = weekCursor.toISOString().slice(0, 10);
    weeks.push({
      iso: key,
      label: weekCursor.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }),
      ms: perWeekStart.get(key) ?? 0,
    });
    weekCursor = new Date(weekCursor.getTime() + 7 * DAY_MS);
  }

  let streak = 0;
  let cursor = today;
  if ((byDay.get(cursor.toISOString().slice(0, 10)) ?? 0) === 0) {
    cursor = new Date(today.getTime() - DAY_MS);
  }
  while ((byDay.get(cursor.toISOString().slice(0, 10)) ?? 0) > 0) {
    streak++;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }

  let bestStreak = 0;
  let run = 0;
  let prev: Date | null = null;
  const activeDays = [...byDay.entries()]
    .filter(([, ms]) => ms > 0)
    .map(([iso]) => new Date(`${iso}T00:00:00Z`))
    .sort((a, b) => a.getTime() - b.getTime());
  for (const day of activeDays) {
    if (prev && day.getTime() - prev.getTime() === DAY_MS) {
      run++;
    } else {
      run = 1;
    }
    bestStreak = Math.max(bestStreak, run);
    prev = day;
  }

  let bestDay: { iso: string; ms: number } | null = null;
  for (const [iso, ms] of byDay.entries()) {
    if (ms > 0 && (!bestDay || ms > bestDay.ms)) {
      bestDay = { iso, ms };
    }
  }

  return {
    daily,
    weeks,
    weekMs: daily
      .slice(-7)
      .reduce((sum, d) => sum + d.ms, 0),
    windowMs,
    totalMs,
    streak,
    bestStreak,
    bestDay,
  };
}
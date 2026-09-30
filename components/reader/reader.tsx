"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Bookmark, RefreshCw } from "lucide-react";
import { removeBookmark, saveBookmark, updateReadingProgress } from "@/app/actions/library";
import type { $Enums } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

const READER_THEMES: Record<
  $Enums.ReaderTheme,
  { page: string; bar: string; text: string }
> = {
  PAPER: {
    page: "bg-zinc-50 dark:bg-zinc-950",
    bar: "border-zinc-200 bg-zinc-50/95 dark:border-zinc-800 dark:bg-zinc-950/95",
    text: "text-zinc-700 dark:text-zinc-200",
  },
  DARK: {
    page: "bg-zinc-950",
    bar: "border-zinc-800 bg-zinc-950/95 text-zinc-200",
    text: "text-zinc-300",
  },
  SEPIA: {
    page: "bg-[#f4ecd8]",
    bar: "border-[#e2d5b6] bg-[#f4ecd8]/95 text-[#4a3b28]",
    text: "text-[#4a3b28]",
  },
  MIDNIGHT: {
    page: "bg-[#0f1626]",
    bar: "border-[#1f2a44] bg-[#0f1626]/95 text-zinc-200",
    text: "text-zinc-300",
  },
};

type ReaderProps = {
  mediaId: string;
  mediaTitle: string;
  chapterNumber: number;
  chapterCount: number;
  chapterTitle: string | null;
  paragraphs: string[];
  chapters: { number: number; title: string | null }[];
  prevHref: string | null;
  nextHref: string | null;
  initialPosition: number;
  theme: $Enums.ReaderTheme;
  fontSize: number | null;
  measure: number | null;
  initialBookmarked: boolean;
};

export function Reader({
  mediaId,
  mediaTitle,
  chapterNumber,
  chapterCount,
  chapterTitle,
  paragraphs,
  chapters,
  prevHref,
  nextHref,
  initialPosition,
  theme,
  fontSize,
  measure,
  initialBookmarked,
}: ReaderProps) {
  const router = useRouter();
  const paragraphRefs = useRef<(HTMLElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const positionRef = useRef(initialPosition);
  const lastSavedRef = useRef(-1);
  const lastSaveAtRef = useRef(0);

  const [activeIndex, setActiveIndex] = useState(-1);
  const [revealedUntil, setRevealedUntil] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);

  const saveNow = useCallback(() => {
    lastSavedRef.current = -1;
    const position = positionRef.current;
    lastSavedRef.current = position;

    const now = Date.now();
    let deltaMs = lastSaveAtRef.current > 0 ? now - lastSaveAtRef.current : 0;
    lastSaveAtRef.current = now;
    if (deltaMs < 0 || deltaMs > 2_400_000) deltaMs = 0;

    const fd = new FormData();
    fd.set("mediaId", mediaId);
    fd.set("chapterNumber", String(chapterNumber));
    fd.set("positionY", String(Math.round(position)));
    fd.set("deltaMs", String(deltaMs));
    startTransition(() => {
      void updateReadingProgress(fd);
    });
  }, [mediaId, chapterNumber]);

  const toggleBookmark = useCallback(() => {
    const fd = new FormData();
    fd.set("mediaId", mediaId);
    if (bookmarked) {
      startTransition(() => {
        void removeBookmark(fd);
      });
    } else {
      fd.set("chapterNumber", String(chapterNumber));
      fd.set("position", String(Math.round(positionRef.current)));
      startTransition(() => {
        void saveBookmark(fd);
      });
    }
    setBookmarked((prev) => !prev);
  }, [bookmarked, mediaId, chapterNumber]);

  const saveRef = useRef(saveNow);

  useEffect(() => {
    saveRef.current = saveNow;
  }, [saveNow]);

  const compute = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;

      const scrollY = window.scrollY;
      const innerHeight = window.innerHeight;
      const lineY = scrollY + innerHeight * 0.45;
      const viewportBottom = scrollY + innerHeight;

      let active = -1;
      let revealed = -1;
      paragraphRefs.current.forEach((el, i) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const absTop = rect.top + scrollY;
        const absBottom = rect.bottom + scrollY;
        if (absTop <= lineY && absBottom >= lineY) active = i;
        if (absTop < viewportBottom) revealed = i;
      });
      setActiveIndex(active);
      setRevealedUntil((prev) => Math.max(prev, revealed));

      positionRef.current = scrollY;
      const max = document.documentElement.scrollHeight - innerHeight;
      setProgress(
        max > 0 ? Math.min(100, Math.max(0, (scrollY / max) * 100)) : 0,
      );
    });
  }, []);

  useEffect(() => {
    window.scrollTo(0, initialPosition);
    lastSaveAtRef.current = Date.now();
    requestAnimationFrame(compute);
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);

    const save = () => saveRef.current();
    const id = window.setInterval(save, 4000);
    const onPageHide = () => saveRef.current();
    const onVisibility = () => {
      if (document.visibilityState === "hidden") saveRef.current();
    };
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
      window.clearInterval(id);
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("visibilitychange", onVisibility);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      saveRef.current();
    };
  }, [compute, initialPosition]);

  const navigate = useCallback(
    (href: string | null) => {
      if (!href) return;
      saveNow();
      router.push(href);
    },
    [router, saveNow],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;

      switch (event.code) {
        case "Space":
          event.preventDefault();
          window.scrollBy({ top: window.innerHeight * 0.9, behavior: "smooth" });
          break;
        case "ArrowDown":
        case "PageDown":
          event.preventDefault();
          window.scrollBy({
            top:
              event.code === "PageDown"
                ? window.innerHeight
                : window.innerHeight * 0.6,
            behavior: "smooth",
          });
          break;
        case "ArrowUp":
        case "PageUp":
          event.preventDefault();
          window.scrollBy({
            top:
              event.code === "PageUp"
                ? -window.innerHeight
                : -window.innerHeight * 0.6,
            behavior: "smooth",
          });
          break;
        case "ArrowLeft":
          event.preventDefault();
          navigate(prevHref);
          break;
        case "ArrowRight":
          event.preventDefault();
          navigate(nextHref);
          break;
        case "KeyM":
        case "KeyB":
          event.preventDefault();
          toggleBookmark();
          break;
        default:
          if (/^Digit[1-9]$/.test(event.code)) {
            event.preventDefault();
            const tenth = Number(event.code.slice(5)) / 9;
            const max = Math.max(
              0,
              document.documentElement.scrollHeight - window.innerHeight,
            );
            window.scrollTo({
              top: Math.round(tenth * max),
              behavior: "smooth",
            });
          }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate, prevHref, nextHref, saveNow, toggleBookmark]);

  return (
    <div className={cn("min-h-screen transition-colors", READER_THEMES[theme].page)}>
      <div
        className="mx-auto max-w-3xl px-4"
        style={{ maxWidth: measure ? `${measure}ch` : undefined }}
      >
        <div
          className={cn(
            "sticky top-0 z-40 -mx-4 border-b backdrop-blur",
            READER_THEMES[theme].bar,
          )}
        >
        <div className="flex items-center gap-3 px-4 py-2.5">
          <Link
            href={`/media/${mediaId}`}
            className="flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
            title="Back to details"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Details</span>
          </Link>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium leading-tight">
              {mediaTitle}
            </p>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              Chapter {chapterNumber} of {chapterCount}
              {chapterTitle ? ` · ${chapterTitle}` : ""}
            </p>
          </div>

          <span className="tabular-nums text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {Math.round(progress)}%
          </span>

          <select
            value={String(chapterNumber)}
            onChange={(e) => navigate(`/media/${mediaId}/read/${e.target.value}`)}
            aria-label="Jump to chapter"
            className="h-8 max-w-36 rounded-md border border-zinc-300 bg-transparent px-1.5 text-xs text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300"
          >
            {chapters.map((c) => (
              <option key={c.number} value={c.number}>
                Ch {c.number}
                {c.title ? ` — ${c.title}` : ""}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleBookmark}
              className={cn(
                "rounded-md p-1.5 transition-colors",
                bookmarked
                  ? "text-indigo-600"
                  : "text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
              )}
              title={
                bookmarked ? "Remove bookmark (M/B)" : "Bookmark this spot (M/B)"
              }
            >
              <Bookmark
                className={cn("h-4 w-4", bookmarked && "fill-current")}
              />
            </button>
            <button
              type="button"
              disabled={!prevHref}
              onClick={() => navigate(prevHref)}
              className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900 disabled:pointer-events-none disabled:opacity-30 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              title="Previous chapter (←)"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={!nextHref}
              onClick={() => navigate(nextHref)}
              className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-zinc-200 hover:text-zinc-900 disabled:pointer-events-none disabled:opacity-30 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              title="Next chapter (→)"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="h-0.5 w-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full bg-indigo-600 transition-[width] duration-150"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 top-[45%] z-10">
        <div className="mx-auto flex max-w-3xl items-center px-4">
          <span className="mr-1.5 h-3 w-3 rounded-full bg-indigo-500 shadow" />
          <span className="h-px flex-1 bg-indigo-500/40" />
        </div>
      </div>

      <article
        className="pb-40 pt-10"
        style={{
          fontSize: fontSize ? `${fontSize}px` : undefined,
          lineHeight: fontSize ? `${Math.round(fontSize * 1.55)}px` : undefined,
        }}
      >
        <header className="mb-8">
          <p className="text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            {mediaTitle}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            Chapter {chapterNumber}
            {chapterTitle ? ` — ${chapterTitle}` : ""}
          </h1>
        </header>

        {paragraphs.map((paragraph, i) => (
          <p
            key={i}
            ref={(el) => {
              paragraphRefs.current[i] = el;
            }}
            className={cn(
              "mb-6 transition-all duration-700",
              READER_THEMES[theme].text,
              i <= revealedUntil
                ? "translate-y-0 opacity-100"
                : "translate-y-3 opacity-0",
              i === activeIndex &&
                "text-indigo-900 ring-1 ring-indigo-200 dark:text-indigo-100 dark:ring-indigo-900",
              fontSize ? "leading-6" : "text-[17px] leading-8",
              i === activeIndex && "bg-indigo-50 px-3 py-1 rounded-lg dark:bg-indigo-950",
            )}
          >
            {paragraph}
          </p>
        ))}
      </article>

      <div className="fixed bottom-4 left-1/2 z-20 -translate-x-1/2">
        <div className="flex items-center gap-3 rounded-full border border-zinc-200 bg-zinc-50/95 px-4 py-2 text-xs text-zinc-500 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95 dark:text-zinc-400">
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <BookOpen className="h-3.5 w-3.5" /> Space scroll
          </span>
          <span className="hidden items-center gap-1.5 whitespace-nowrap sm:flex">
            <Bookmark className="h-3.5 w-3.5" /> M bookmark
          </span>
          <span className="hidden items-center gap-1.5 whitespace-nowrap sm:flex">
            <ArrowLeft className="h-3.5 w-3.5" />
            <ArrowRight className="h-3.5 w-3.5" /> chapter
          </span>
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <RefreshCw className="h-3.5 w-3.5" /> auto-saved
          </span>
        </div>
      </div>
      </div>
    </div>
  );
}
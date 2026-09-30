import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { Reader } from "@/components/reader/reader";

export const metadata: Metadata = { title: "Read" };

export default async function ReaderPage(
  props: PageProps<"/media/[id]/read/[chapter]">,
) {
  const user = await requireUser();
  const { id, chapter: chapterParam } = await props.params;
  const chapterNumber = Number(chapterParam);
  if (!Number.isInteger(chapterNumber) || chapterNumber < 1) notFound();

  const media = await db.media.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      chapters: {
        where: { chapterNumber: { not: null } },
        orderBy: { chapterNumber: "asc" },
        select: { chapterNumber: true, title: true, content: true },
      },
    },
  });
  if (!media) notFound();

  type ChapterRow = {
    chapterNumber: number | null;
    title: string | null;
    content: string | null;
  };

  const chapters = media.chapters.filter(
    (c): c is ChapterRow & { chapterNumber: number } =>
      c.chapterNumber !== null,
  );
  const index = chapters.findIndex((c) => c.chapterNumber === chapterNumber);
  if (index === -1) notFound();

  const chapter = chapters[index];
  const paragraphs = (chapter.content ?? "").split(/\n{2,}/).filter(Boolean);

  const entry = await db.libraryEntry.findUnique({
    where: { userId_mediaId: { userId: user.id, mediaId: id } },
    select: { readingPosition: true },
  });

  const bookmark = await db.bookmark.findUnique({
    where: { userId_mediaId: { userId: user.id, mediaId: id } },
    select: { chapterNumber: true, position: true },
  });

  const prev = chapters[index - 1];
  const next = chapters[index + 1];

  return (
    <Reader
      key={`${id}-${chapterNumber}`}
      mediaId={media.id}
      mediaTitle={media.title}
      chapterNumber={chapterNumber}
      chapterCount={chapters.length}
      chapterTitle={chapter.title}
      paragraphs={paragraphs}
      chapters={chapters.map((c) => ({ number: c.chapterNumber, title: c.title }))}
      prevHref={prev ? `/media/${id}/read/${prev.chapterNumber}` : null}
      nextHref={next ? `/media/${id}/read/${next.chapterNumber}` : null}
      initialPosition={entry?.readingPosition ?? 0}
      theme={user.readerTheme}
      fontSize={user.readerFontSize}
      measure={user.readerMeasure}
      initialBookmarked={bookmark !== null}
    />
  );
}
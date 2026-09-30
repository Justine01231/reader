import "server-only";
import { z } from "zod";
import { $Enums } from "@/generated/prisma/client";
import { db } from "@/lib/db";

// ---------------------------------------------------------------------------
// Payload schema — the shape both exporter and importer agree on.
// ---------------------------------------------------------------------------

export const libraryExportSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string(),
  entries: z.array(
    z.object({
      media: z.object({
        slug: z.string().min(1),
        title: z.string().min(1),
        type: z.nativeEnum($Enums.MediaType),
        status: z.nativeEnum($Enums.MediaStatus).optional(),
        releaseYear: z.number().int().nullable().optional(),
        description: z.string().nullable().optional(),
        genres: z.array(z.string()).optional(),
      }),
      status: z.nativeEnum($Enums.LibraryStatus),
      rating: z.number().int().min(1).max(10).nullable().optional(),
      currentChapter: z.number().int().min(1).nullable().optional(),
      readingPosition: z.number().int().min(0).nullable().optional(),
      notes: z.string().nullable().optional(),
      startedAt: z.string().nullable().optional(),
      completedAt: z.string().nullable().optional(),
    }),
  ),
});

export type LibraryExport = z.infer<typeof libraryExportSchema>;

export type ImportResult = {
  imported: number;
  createdMedia: number;
  skipped: number;
};

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export async function exportLibraryData(
  userId: string,
): Promise<LibraryExport> {
  const entries = await db.libraryEntry.findMany({
    where: { userId },
    include: {
      media: {
        include: {
          genres: { select: { genre: { select: { name: true } } } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    entries: entries.map((e) => ({
      media: {
        slug: e.media.slug,
        title: e.media.title,
        type: e.media.type,
        status: e.media.status,
        releaseYear: e.media.releaseYear,
        description: e.media.description,
        genres: e.media.genres.map((g) => g.genre.name),
      },
      status: e.status,
      rating: e.rating,
      currentChapter: e.currentChapter,
      readingPosition: e.readingPosition,
      notes: e.notes,
      startedAt: e.startedAt?.toISOString() ?? null,
      completedAt: e.completedAt?.toISOString() ?? null,
    })),
  };
}

// ---------------------------------------------------------------------------
// Import
// ---------------------------------------------------------------------------

async function ensureGenres(names: string[] | undefined): Promise<string[]> {
  const created: string[] = [];
  for (const name of names ?? []) {
    const genre = await db.genre.upsert({
      where: { name },
      update: {},
      create: { name },
      select: { id: true },
    });
    created.push(genre.id);
  }
  return created;
}

export async function applyLibraryImport(
  userId: string,
  payload: unknown,
): Promise<ImportResult> {
  const parsed = libraryExportSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error("Invalid MangaShelf export file.");
  }

  const result: ImportResult = { imported: 0, createdMedia: 0, skipped: 0 };

  for (const item of parsed.data.entries) {
    const { media, ...entryData } = item;

    let mediaRow = await db.media.findUnique({
      where: { slug: media.slug },
      select: { id: true },
    });
    if (!mediaRow) {
      const genreIds = await ensureGenres(media.genres);
      mediaRow = await db.media.create({
        data: {
          slug: media.slug,
          title: media.title,
          type: media.type,
          status: media.status ?? "ONGOING",
          releaseYear: media.releaseYear ?? null,
          description: media.description ?? null,
          genres: genreIds.length
            ? { create: genreIds.map((genreId) => ({ genreId })) }
            : undefined,
        },
        select: { id: true },
      });
      result.createdMedia += 1;
    }

    const data = {
      status: entryData.status,
      rating: entryData.rating ?? null,
      currentChapter: entryData.currentChapter ?? null,
      readingPosition: entryData.readingPosition ?? null,
      notes: entryData.notes ?? null,
      startedAt: entryData.startedAt ? new Date(entryData.startedAt) : null,
      completedAt: entryData.completedAt
        ? new Date(entryData.completedAt)
        : null,
    };

    await db.libraryEntry.upsert({
      where: { userId_mediaId: { userId, mediaId: mediaRow.id } },
      create: { userId, mediaId: mediaRow.id, ...data },
      update: data,
    });
    result.imported += 1;
  }

  return result;
}
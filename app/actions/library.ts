"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { $Enums } from "@/generated/prisma/client";
import { requireUser } from "@/lib/auth/dal";
import {
  bookmarkSchema,
  createMediaSchema,
  entryNotesSchema,
  readingProgressSchema,
  type FormState,
} from "@/lib/auth/validation";
import { applyLibraryImport } from "@/lib/data/transfer";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const statusSchema = z.nativeEnum($Enums.LibraryStatus);
const ratingSchema = z
  .union([z.literal(""), z.coerce.number().int().min(1).max(10)])
  .transform((v) => (v === "" ? null : v));

function parseFormData(formData: FormData) {
  return {
    entryId: String(formData.get("entryId") ?? ""),
    mediaId: String(formData.get("mediaId") ?? ""),
    status: String(formData.get("status") ?? ""),
    rating: String(formData.get("rating") ?? ""),
  };
}

export async function addToLibrary(formData: FormData) {
  const user = await requireUser();

  const mediaId = String(formData.get("mediaId") ?? "");
  const status = statusSchema.safeParse(formData.get("status") ?? "PLAN_TO_READ");
  if (!mediaId || !status.success) return;

  const media = await db.media.findUnique({
    where: { id: mediaId },
    select: { id: true },
  });
  if (!media) return;

  const now = new Date();
  const existing = await db.libraryEntry.findUnique({
    where: { userId_mediaId: { userId: user.id, mediaId } },
  });

  if (existing) {
    await db.libraryEntry.update({
      where: { id: existing.id },
      data: {
        status: status.data,
        startedAt:
          existing.startedAt ??
          (status.data === "READING" ? now : null),
        completedAt:
          status.data === "COMPLETED" ? now : null,
      },
    });
  } else {
    await db.libraryEntry.create({
      data: {
        userId: user.id,
        mediaId,
        status: status.data,
        startedAt: status.data === "READING" ? now : null,
        completedAt: status.data === "COMPLETED" ? now : null,
      },
    });
  }

  revalidatePath(`/media/${mediaId}`);
  revalidatePath("/library");
  revalidatePath("/");
}

export async function setLibraryStatus(formData: FormData) {
  const user = await requireUser();
  const { entryId, status } = parseFormData(formData);
  const parsed = statusSchema.safeParse(status);
  if (!entryId || !parsed.success) return;

  const existing = await db.libraryEntry.findUnique({
    where: { id: entryId },
    select: { userId: true, mediaId: true, startedAt: true },
  });
  if (!existing || existing.userId !== user.id) return;

  const now = new Date();
  await db.libraryEntry.update({
    where: { id: entryId },
    data: {
      status: parsed.data,
      startedAt: existing.startedAt ?? (parsed.data === "READING" ? now : null),
      completedAt: parsed.data === "COMPLETED" ? now : null,
    },
  });

  revalidatePath(`/media/${existing.mediaId}`);
  revalidatePath("/library");
  revalidatePath("/");
}

export async function setLibraryRating(formData: FormData) {
  const user = await requireUser();
  const { entryId, rating } = parseFormData(formData);
  const parsed = ratingSchema.safeParse(rating);
  if (!entryId || !parsed.success) return;

  const existing = await db.libraryEntry.findUnique({
    where: { id: entryId },
    select: { userId: true, mediaId: true },
  });
  if (!existing || existing.userId !== user.id) return;

  await db.libraryEntry.update({
    where: { id: entryId },
    data: { rating: parsed.data },
  });

  revalidatePath(`/media/${existing.mediaId}`);
  revalidatePath("/library");
  revalidatePath("/");
}

export async function removeFromLibrary(formData: FormData) {
  const user = await requireUser();
  const { entryId } = parseFormData(formData);
  if (!entryId) return;

  const existing = await db.libraryEntry.findUnique({
    where: { id: entryId },
    select: { userId: true, mediaId: true },
  });
  if (!existing || existing.userId !== user.id) return;

  await db.libraryEntry.delete({ where: { id: entryId } });

  revalidatePath(`/media/${existing.mediaId}`);
  revalidatePath("/library");
  revalidatePath("/");
}

export async function importLibrary(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { message: "Select a MangaShelf JSON file to import." };
  }
  if (file.size === 0 || file.size > 1_000_000) {
    return { message: "Import file must be between 1 byte and 1MB." };
  }

  let text: string;
  try {
    text = await file.text();
  } catch {
    return { message: "Could not read the selected file." };
  }

  let payload: unknown;
  try {
    payload = JSON.parse(text);
  } catch {
    return { message: "That file is not valid JSON." };
  }

  try {
    const result = await applyLibraryImport(user.id, payload);
    revalidatePath("/library");
    revalidatePath("/");
    revalidatePath("/search");
    return {
      success: true,
      message: `Imported ${result.imported} ${result.imported === 1 ? "entry" : "entries"} (${result.createdMedia} ${result.createdMedia === 1 ? "new title" : "new titles"} created, ${result.skipped} skipped).`,
    };
  } catch {
    return { message: "Invalid MangaShelf export file." };
  }
}

export async function updateReadingProgress(formData: FormData) {
  const user = await requireUser();

  const parsed = readingProgressSchema.safeParse({
    mediaId: formData.get("mediaId"),
    chapterNumber: formData.get("chapterNumber"),
    positionY: formData.get("positionY"),
    deltaMs: formData.get("deltaMs") ?? 0,
  });
  if (!parsed.success) return;

  const { mediaId, chapterNumber, positionY, deltaMs } = parsed.data;

  const chapter = await db.chapter.findUnique({
    where: { mediaId_chapterNumber: { mediaId, chapterNumber } },
    select: { id: true },
  });
  if (!chapter) return;

  await db.libraryEntry.upsert({
    where: { userId_mediaId: { userId: user.id, mediaId } },
    create: {
      userId: user.id,
      mediaId,
      status: "READING",
      currentChapter: chapterNumber,
      readingPosition: positionY,
      startedAt: new Date(),
    },
    update: {
      status: "READING",
      currentChapter: chapterNumber,
      readingPosition: positionY,
    },
  });

  if (deltaMs > 0) {
    const dayStart = new Date(new Date().toISOString().slice(0, 10));
    await db.readingDay.upsert({
      where: { userId_date: { userId: user.id, date: dayStart } },
      create: { userId: user.id, date: dayStart, msRead: deltaMs },
      update: { msRead: { increment: deltaMs } },
    });
  }

  revalidatePath(`/media/${mediaId}`);
  revalidatePath("/library");
  revalidatePath("/");
}

export async function saveBookmark(formData: FormData) {
  const user = await requireUser();

  const parsed = bookmarkSchema.safeParse({
    mediaId: formData.get("mediaId"),
    chapterNumber: formData.get("chapterNumber"),
    position: formData.get("position") ?? 0,
  });
  if (!parsed.success) return;

  const { mediaId, chapterNumber, position } = parsed.data;

  const chapter = await db.chapter.findUnique({
    where: { mediaId_chapterNumber: { mediaId, chapterNumber } },
    select: { id: true },
  });
  if (!chapter) return;

  await db.bookmark.upsert({
    where: { userId_mediaId: { userId: user.id, mediaId } },
    create: {
      userId: user.id,
      mediaId,
      chapterNumber,
      position,
    },
    update: { chapterNumber, position },
  });

  revalidatePath(`/media/${mediaId}`);
  revalidatePath("/library");
  revalidatePath("/");
}

export async function removeBookmark(formData: FormData) {
  const user = await requireUser();

  const mediaId = String(formData.get("mediaId") ?? "");
  if (!mediaId) return;

  const existing = await db.bookmark.findUnique({
    where: { userId_mediaId: { userId: user.id, mediaId } },
    select: { id: true },
  });
  if (!existing) return;

  await db.bookmark.delete({ where: { id: existing.id } });

  revalidatePath(`/media/${mediaId}`);
  revalidatePath("/library");
  revalidatePath("/");
}

export async function toggleFavorite(formData: FormData) {
  const user = await requireUser();

  const mediaId = String(formData.get("mediaId") ?? "");
  if (!z.string().cuid().safeParse(mediaId).success) return;

  const media = await db.media.findUnique({
    where: { id: mediaId },
    select: { id: true },
  });
  if (!media) return;

  const existing = await db.favorite.findUnique({
    where: { userId_mediaId: { userId: user.id, mediaId } },
    select: { id: true },
  });

  if (existing) {
    await db.favorite.delete({ where: { id: existing.id } });
  } else {
    await db.favorite.create({ data: { userId: user.id, mediaId } });
  }

  revalidatePath(`/media/${mediaId}`);
  revalidatePath("/library");
  revalidatePath("/");
  revalidatePath("/search");
}

function titleCaseGenre(name: string): string {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function createMedia(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();

  const parsed = createMediaSchema.safeParse({
    title: formData.get("title"),
    type: formData.get("type"),
    status: formData.get("status") ?? "ONGOING",
    releaseYear: formData.get("releaseYear"),
    description: formData.get("description"),
    coverImage: formData.get("coverImage"),
    genres: formData.get("genres") ?? "",
  });
  if (!parsed.success) {
    return {
      errors: z.flattenError(parsed.error).fieldErrors,
      message: "Fix the highlighted fields.",
    };
  }

  const { title, type, status, releaseYear, description, coverImage } =
    parsed.data;

  let slug = slugify(title);
  let counter = 2;
  while (
    await db.media.findUnique({ where: { slug }, select: { id: true } })
  ) {
    slug = `${slugify(title)}-${counter}`;
    counter += 1;
  }

  const genreNames = [
    ...new Map(
      parsed.data.genres
        .split(",")
        .map((g) => titleCaseGenre(g))
        .filter((g) => g.length > 0)
        .map((g) => [g.toLowerCase(), g]),
    ).values(),
  ].slice(0, 15);

  const media = await db.$transaction(async (tx) => {
    const created = await tx.media.create({
      data: {
        title,
        slug,
        type,
        status,
        releaseYear,
        description,
        coverImage,
        createdBy: user.id,
      },
    });
    for (const name of genreNames) {
      const genre = await tx.genre.upsert({
        where: { name },
        update: {},
        create: { name },
      });
      await tx.mediaGenre.create({
        data: { mediaId: created.id, genreId: genre.id },
      });
    }
    return created;
  });

  revalidatePath("/search");
  revalidatePath("/");
  redirect(`/media/${media.id}`);
}

export async function updateEntryNotes(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();

  const parsed = entryNotesSchema.safeParse({
    mediaId: formData.get("mediaId"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    return {
      errors: z.flattenError(parsed.error).fieldErrors,
      message: "Fix the highlighted field.",
    };
  }

  const entry = await db.libraryEntry.findUnique({
    where: {
      userId_mediaId: { userId: user.id, mediaId: parsed.data.mediaId },
    },
    select: { id: true },
  });
  if (!entry) {
    return { message: "Add this title to your library first." };
  }

  await db.libraryEntry.update({
    where: { id: entry.id },
    data: { notes: parsed.data.notes },
  });

  revalidatePath(`/media/${parsed.data.mediaId}`);
  revalidatePath("/library");
  return { success: true, message: "Notes saved." };
}

export async function updateMedia(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();

  const mediaId = String(formData.get("mediaId") ?? "");
  if (!z.string().cuid().safeParse(mediaId).success) {
    return { message: "Invalid media id." };
  }

  const parsed = createMediaSchema.safeParse({
    title: formData.get("title"),
    type: formData.get("type"),
    status: formData.get("status") ?? "ONGOING",
    releaseYear: formData.get("releaseYear"),
    description: formData.get("description"),
    coverImage: formData.get("coverImage"),
    genres: formData.get("genres") ?? "",
  });
  if (!parsed.success) {
    return {
      errors: z.flattenError(parsed.error).fieldErrors,
      message: "Fix the highlighted fields.",
    };
  }

  const media = await db.media.findUnique({
    where: { id: mediaId },
    select: { id: true, title: true, createdBy: true },
  });
  if (!media) return { message: "Title not found." };
  if (media.createdBy !== user.id) {
    return { message: "Only the user who added this title can edit it." };
  }

  const { title, type, status, releaseYear, description, coverImage } =
    parsed.data;

  let slug = media.title === title ? undefined : slugify(title);
  if (slug !== undefined) {
    let candidate = slug;
    let counter = 2;
    while (
      await db.media.findFirst({
        where: { slug: candidate, NOT: { id: media.id } },
        select: { id: true },
      })
    ) {
      candidate = `${slug}-${counter}`;
      counter += 1;
    }
    slug = candidate;
  }

  const genreNames = [
    ...new Map(
      parsed.data.genres
        .split(",")
        .map((g) => titleCaseGenre(g))
        .filter((g) => g.length > 0)
        .map((g) => [g.toLowerCase(), g]),
    ).values(),
  ].slice(0, 15);

  await db.$transaction(async (tx) => {
    await tx.media.update({
      where: { id: media.id },
      data: {
        title,
        slug: slug as string | undefined,
        type,
        status,
        releaseYear,
        description,
        coverImage,
      },
    });
    await tx.mediaGenre.deleteMany({ where: { mediaId: media.id } });
    for (const name of genreNames) {
      const genre = await tx.genre.upsert({
        where: { name },
        update: {},
        create: { name },
      });
      await tx.mediaGenre.create({
        data: { mediaId: media.id, genreId: genre.id },
      });
    }
  });

  revalidatePath(`/media/${media.id}`);
  revalidatePath("/search");
  revalidatePath("/");
  revalidatePath("/library");
  return { success: true, message: "Title updated." };
}

export async function deleteMedia(formData: FormData) {
  const user = await requireUser();

  const mediaId = String(formData.get("mediaId") ?? "");
  if (!z.string().cuid().safeParse(mediaId).success) return;

  const media = await db.media.findUnique({
    where: { id: mediaId },
    select: { id: true, createdBy: true },
  });
  if (!media) return;
  if (media.createdBy !== user.id) return;

  await db.media.delete({ where: { id: media.id } });
  await db.genre.deleteMany({ where: { media: { none: {} } } });

  revalidatePath("/search");
  revalidatePath("/");
  revalidatePath("/library");
  redirect("/search");
}
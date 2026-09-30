import { z } from "zod";
import { $Enums } from "@/generated/prisma/client";

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters.")
  .max(32, "Username must be at most 32 characters.")
  .regex(/^[a-z0-9_]+$/, "Use only lowercase letters, numbers, and underscores.")
  .transform((v) => v.toLowerCase());

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128, "Password must be at most 128 characters.")
  .regex(/[a-zA-Z]/, "Password must contain at least one letter.")
  .regex(/[0-9]/, "Password must contain at least one number.");

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, "Display name is required.")
  .max(64, "Display name must be at most 64 characters.");

export const registerSchema = z
  .object({
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
});

export const profileSchema = z.object({
  displayName: displayNameSchema,
  bio: z.string().trim().max(500, "Bio must be at most 500 characters."),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const libraryEntrySchema = z.object({
  mediaId: z.string().cuid(),
  status: z.nativeEnum($Enums.LibraryStatus),
  rating: z
    .union([z.literal(""), z.coerce.number().int().min(1).max(10)])
    .transform((v) => (v === "" ? null : v))
    .nullable(),
});

export const readingProgressSchema = z.object({
  mediaId: z.string().cuid(),
  chapterNumber: z.coerce.number().int().min(1),
  positionY: z.coerce.number().int().min(0).max(10_000_000),
  // Time spent reading since the last save (ms), for reading stats.
  deltaMs: z.coerce.number().int().min(0).max(2_400_000).default(0),
});

export const bookmarkSchema = z.object({
  mediaId: z.string().cuid(),
  chapterNumber: z.coerce.number().int().min(1),
  position: z.coerce.number().int().min(0).max(10_000_000).default(0),
});

const optionalRange = (min: number, max: number) =>
  z
    .union([z.literal(""), z.coerce.number().int().min(min).max(max)])
    .transform((v) => (v === "" ? null : v))
    .nullable();

export const readerSettingsSchema = z.object({
  theme: z.nativeEnum($Enums.ReaderTheme),
  fontSize: optionalRange(12, 48),
  measure: optionalRange(24, 80),
});

export const entryNotesSchema = z.object({
  mediaId: z.string().cuid(),
  notes: z
    .union([
      z.literal(""),
      z
        .string()
        .trim()
        .max(2000, "Notes must be at most 2,000 characters."),
    ])
    .transform((v) => (v === "" ? null : v))
    .nullable(),
});

const optionalText = (max: number) =>
  z
    .union([z.literal(""), z.string().trim().max(max)])
    .transform((v) => (v === "" ? null : v))
    .nullable();

export const createMediaSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(200),
  type: z.nativeEnum($Enums.MediaType),
  status: z.nativeEnum($Enums.MediaStatus),
  releaseYear: optionalRange(1000, 2200),
  description: optionalText(4000),
  coverImage: z
    .union([z.literal(""), z.url().max(2000)])
    .transform((v) => (v === "" ? null : v))
    .nullable(),
  genres: z.string().trim().max(1000).default(""),
});

export type FormState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
} | null;
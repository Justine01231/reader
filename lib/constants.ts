import { $Enums } from "@/generated/prisma/client";

export const APP_NAME = "MangaShelf";

export const MEDIA_TYPES: { value: $Enums.MediaType; label: string }[] = [
  { value: "MANGA", label: "Manga" },
  { value: "MANHWA", label: "Manhwa" },
  { value: "MANHUA", label: "Manhua" },
  { value: "WEBTOON", label: "Webtoon" },
  { value: "COMIC", label: "Comic" },
  { value: "ANIME", label: "Anime" },
  { value: "LIGHT_NOVEL", label: "Light Novel" },
  { value: "NOVEL", label: "Novel" },
  { value: "OTHER", label: "Other" },
];

export const MEDIA_TYPE_LABEL: Record<$Enums.MediaType, string> =
  Object.fromEntries(MEDIA_TYPES.map((t) => [t.value, t.label])) as Record<
    $Enums.MediaType,
    string
  >;

export const MEDIA_STATUSES: { value: $Enums.MediaStatus; label: string }[] = [
  { value: "ONGOING", label: "Ongoing" },
  { value: "COMPLETED", label: "Completed" },
  { value: "HIATUS", label: "On Hiatus" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "UNKNOWN", label: "Unknown" },
];

export const MEDIA_STATUS_LABEL: Record<$Enums.MediaStatus, string> =
  Object.fromEntries(MEDIA_STATUSES.map((s) => [s.value, s.label])) as Record<
    $Enums.MediaStatus,
    string
  >;

export const LIBRARY_STATUSES: {
  value: $Enums.LibraryStatus;
  label: string;
}[] = [
  { value: "READING", label: "Reading" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "DROPPED", label: "Dropped" },
  { value: "PLAN_TO_READ", label: "Plan to Read" },
];

export const LIBRARY_STATUS_LABEL: Record<$Enums.LibraryStatus, string> =
  Object.fromEntries(
    LIBRARY_STATUSES.map((s) => [s.value, s.label]),
  ) as Record<$Enums.LibraryStatus, string>;

export const PERSON_ROLE_LABEL: Record<$Enums.PersonRole, string> = {
  AUTHOR: "Author",
  ARTIST: "Artist",
  WRITER: "Writer",
  ILLUSTRATOR: "Illustrator",
  CREATOR: "Creator",
};

export const RATINGS = Array.from({ length: 10 }, (_, i) => i + 1);
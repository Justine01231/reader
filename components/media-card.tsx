import Link from "next/link";
import { $Enums } from "@/generated/prisma/client";
import { CoverArt } from "@/components/cover-art";
import { Badge } from "@/components/ui/badge";
import { MEDIA_TYPE_LABEL } from "@/lib/constants";

interface MediaSummary {
  id: string;
  slug: string;
  title: string;
  type: $Enums.MediaType;
  coverImage: string | null;
  releaseYear: number | null;
}

export function MediaCard({ media }: { media: MediaSummary }) {
  return (
    <Link
      href={`/media/${media.id}`}
      className="group flex flex-col gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 rounded-md"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800">
        <CoverArt title={media.title} imageUrl={media.coverImage} />
        <div className="absolute right-1.5 top-1.5">
          <Badge variant="secondary" className="text-[10px]">
            {MEDIA_TYPE_LABEL[media.type]}
          </Badge>
        </div>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="line-clamp-2 text-sm font-medium text-zinc-900 group-hover:text-zinc-600 dark:text-zinc-100 dark:group-hover:text-zinc-300">
          {media.title}
        </span>
        {media.releaseYear ? (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {media.releaseYear}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
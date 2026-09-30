"use client";

import { startTransition, useState } from "react";
import { Star } from "lucide-react";
import { toggleFavorite } from "@/app/actions/library";
import { cn } from "@/lib/utils";

export function FavoriteToggle({
  mediaId,
  initial,
}: {
  mediaId: string;
  initial: boolean;
}) {
  const [favorite, setFavorite] = useState(initial);

  const toggle = () => {
    const fd = new FormData();
    fd.set("mediaId", mediaId);
    startTransition(() => {
      void toggleFavorite(fd);
    });
    setFavorite((prev) => !prev);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={favorite}
      title={favorite ? "Remove from favorites" : "Add to favorites"}
      className={cn(
        "rounded-md p-1.5 transition-colors",
        favorite
          ? "text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-950"
          : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200",
      )}
    >
      <Star className={cn("h-5 w-5", favorite && "fill-current")} />
    </button>
  );
}
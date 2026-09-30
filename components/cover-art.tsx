import { cn } from "@/lib/utils";

const GRADIENTS = [
  "from-indigo-500 via-purple-500 to-pink-500",
  "from-emerald-500 via-teal-500 to-cyan-500",
  "from-orange-500 via-amber-500 to-yellow-500",
  "from-rose-500 via-red-500 to-orange-500",
  "from-blue-500 via-indigo-500 to-violet-500",
  "from-fuchsia-500 via-pink-500 to-rose-500",
  "from-sky-500 via-blue-500 to-indigo-500",
  "from-lime-500 via-emerald-500 to-teal-500",
];

function gradientFor(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash * 31 + title.charCodeAt(i)) | 0;
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

function initials(title: string): string {
  const words = title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3);
  return words.map((w) => w[0]!.toUpperCase()).join("");
}

interface CoverArtProps {
  title: string;
  imageUrl?: string | null;
  className?: string;
  iconClassName?: string;
}

/**
 * Local-first cover: renders the provided image when available, otherwise a
 * deterministic gradient placeholder with the title's initials. No remote
 * dependencies are required.
 */
export function CoverArt({
  title,
  imageUrl,
  className,
  iconClassName,
}: CoverArtProps) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={title}
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={cn(
        "flex h-full w-full items-center justify-center bg-gradient-to-br",
        gradientFor(title),
        className,
      )}
    >
      <span
        className={cn(
          "font-bold text-white/90 drop-shadow-sm",
          iconClassName ?? "text-2xl",
        )}
      >
        {initials(title) || "?"}
      </span>
    </div>
  );
}
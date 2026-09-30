import "dotenv/config";
import { PrismaClient, $Enums } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../lib/auth/password";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const GENRES = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
  "Historical",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Seinen",
  "Shounen",
  "Slice of Life",
  "Supernatural",
  "Thriller",
  "Psychological",
  "Isekai",
  "Sports",
  "Mecha",
];

type SeedMedia = {
  title: string;
  slug: string;
  type: "MANGA" | "MANHWA" | "WEBTOON" | "COMIC" | "ANIME" | "LIGHT_NOVEL" | "NOVEL";
  status: "ONGOING" | "COMPLETED" | "HIATUS" | "CANCELLED" | "UNKNOWN";
  description: string;
  releaseYear: number;
  genres: string[];
  persons: { name: string; role: "AUTHOR" | "ARTIST" | "WRITER" | "ILLUSTRATOR" | "CREATOR" }[];
  chapters?: number;
};

const MEDIA: SeedMedia[] = [
  {
    title: "One Piece",
    slug: "one-piece",
    type: "MANGA",
    status: "ONGOING",
    description:
      "Monkey D. Luffy sets sail with his crew in search of the legendary treasure, the One Piece, to become the next King of the Pirates.",
    releaseYear: 1997,
    genres: ["Action", "Adventure", "Comedy", "Fantasy", "Shounen"],
    persons: [{ name: "Eiichiro Oda", role: "AUTHOR" }],
    chapters: 20,
  },
  {
    title: "Berserk",
    slug: "berserk",
    type: "MANGA",
    status: "HIATUS",
    description:
      "Guts, a lone mercenary with a cursed brand, fights against demons in a brutal medieval world while hunting the man who betrayed him.",
    releaseYear: 1989,
    genres: ["Action", "Fantasy", "Horror", "Drama", "Seinen"],
    persons: [
      { name: "Kentaro Miura", role: "AUTHOR" },
      { name: "Kentaro Miura", role: "ARTIST" },
    ],
  },
  {
    title: "Solo Leveling",
    slug: "solo-leveling",
    type: "MANHWA",
    status: "COMPLETED",
    description:
      "Weakest hunter Sung Jin-woo gains the power to level up after a near-death experience, rising to become the world's strongest.",
    releaseYear: 2021,
    genres: ["Action", "Fantasy", "Adventure"],
    persons: [
      { name: "Chugong", role: "AUTHOR" },
      { name: "h-goon", role: "ARTIST" },
    ],
    chapters: 30,
  },
  {
    title: "Omniscient Reader's Viewpoint",
    slug: "omniscient-readers-viewpoint",
    type: "WEBTOON",
    status: "ONGOING",
    description:
      "When the world of a novel he wrote becomes reality, the sole reader, Kim Dok-ja, uses his knowledge of the story to survive.",
    releaseYear: 2020,
    genres: ["Action", "Fantasy", "Drama", "Psychological"],
    persons: [
      { name: "Sing Shong", role: "AUTHOR" },
      { name: "Sleepy-C", role: "ARTIST" },
    ],
  },
  {
    title: "The Beginning After the End",
    slug: "the-beginning-after-the-end",
    type: "WEBTOON",
    status: "ONGOING",
    description:
      "A powerful king reincarnates into a new world of magic and monsters, seeking the family he never had in his past life.",
    releaseYear: 2018,
    genres: ["Action", "Fantasy", "Adventure", "Drama"],
    persons: [
      { name: "TurtleMe", role: "AUTHOR" },
      { name: "Fuyuki23", role: "ARTIST" },
    ],
  },
  {
    title: "Vagabond",
    slug: "vagabond",
    type: "MANGA",
    status: "HIATUS",
    description:
      "A fictionalized account of the life of Miyamoto Musashi, the legendary swordsman, as he grows beyond violence.",
    releaseYear: 1998,
    genres: ["Action", "Drama", "Seinen", "Historical"],
    persons: [
      { name: "Takehiko Inoue", role: "AUTHOR" },
      { name: "Takehiko Inoue", role: "ARTIST" },
    ],
  },
  {
    title: "Chainsaw Man",
    slug: "chainsaw-man",
    type: "MANGA",
    status: "ONGOING",
    description:
      "Denji, a poor devil hunter, merges with his pet devil Pochita to become Chainsaw Man and hunts devils for the government.",
    releaseYear: 2018,
    genres: ["Action", "Horror", "Comedy", "Shounen"],
    persons: [{ name: "Tatsuki Fujimoto", role: "AUTHOR" }],
    chapters: 12,
  },
  {
    title: "One-Punch Man",
    slug: "one-punch-man",
    type: "MANGA",
    status: "ONGOING",
    description:
      "Saitama, a hero who can defeat any opponent with a single punch, searches for a worthy challenge.",
    releaseYear: 2012,
    genres: ["Action", "Comedy", "Sci-Fi"],
    persons: [
      { name: "ONE", role: "AUTHOR" },
      { name: "Yusuke Murata", role: "ARTIST" },
    ],
  },
  {
    title: "Fullmetal Alchemist: Brotherhood",
    slug: "fullmetal-alchemist-brotherhood",
    type: "ANIME",
    status: "COMPLETED",
    description:
      "Two brothers search for the Philosopher's Stone to restore their bodies after a failed alchemical ritual.",
    releaseYear: 2009,
    genres: ["Action", "Adventure", "Drama", "Fantasy"],
    persons: [{ name: "Hiromu Arakawa", role: "CREATOR" }],
  },
  {
    title: "Dune",
    slug: "dune",
    type: "NOVEL",
    status: "COMPLETED",
    description:
      "Paul Atreides navigates desert planet Arrakis, political intrigue, and a prophetic destiny in Frank Herbert's science-fiction epic.",
    releaseYear: 1965,
    genres: ["Sci-Fi", "Adventure", "Drama"],
    persons: [{ name: "Frank Herbert", role: "AUTHOR" }],
  },
  {
    title: "Re:Zero - Starting Life in Another World",
    slug: "rezero-starting-life-in-another-world",
    type: "LIGHT_NOVEL",
    status: "ONGOING",
    description:
      "Subaru Natsuki is summoned to a fantasy world and discovers that whenever he dies, time rewinds to a checkpoint — and it resets his memories only of what happened after the checkpoint.",
    releaseYear: 2014,
    genres: ["Fantasy", "Drama", "Isekai", "Psychological"],
    persons: [
      { name: "Tappei Nagatsuki", role: "AUTHOR" },
      { name: "Shinichirou Otsuka", role: "ARTIST" },
    ],
  },
];

const OPENING_BEATS = [
  "the morning sun crept over the rooftops",
  "the crowd fell silent",
  "dust hung in the air after the long walk",
  "a distant bell rang twice",
  "the road ahead curved into the mist",
  "footsteps echoed down the empty street",
  "the sky turned the color of old copper",
  "it began to rain, softly at first",
  "an old man at the corner told a strange story",
  "the lanterns flickered as the wind picked up",
];

const BEATS = [
  "A voice called out across the square, and everyone turned.",
  "They exchanged a long look, saying more than words could.",
  "Beneath the surface, something old and patient stirred.",
  "For a moment, the world held its breath.",
  "A choice had been made, and there was no going back.",
  "The map showed a route that no one else had taken.",
  "Trust was a wound still healing, and neither of them rushed it.",
  "Somewhere below, metal scraped against stone.",
  "The plan was simple, which meant it would not stay simple.",
  "History repeated itself quietly, in a different voice.",
  "They counted the days backward, then forward again.",
  "The answer had been in front of them the entire time.",
  "A rumor traveled faster than the messengers sent to stop it.",
  "Rain washed the chalk away from the old signpost.",
  "Courage, it turned out, was mostly not running early.",
];

const ENDING_BEATS = [
  "When it was over, only the wind remained to testify.",
  "They left the way they had come, though nothing was the same.",
  "The door closed, and the city leaned back against the night.",
  "Tomorrow, they knew, would ask everything of them.",
  "And so the story paused, mid-breath, waiting to be continued.",
];

function chapterContent(title: string, chapterNumber: number): string {
  const rng = (n: number) => {
    const x = Math.sin(chapterNumber * 999 + n * 137) * 10000;
    return Math.abs(Math.floor(x)) % 1000;
  };
  const pick = <T,>(arr: T[], n: number) => arr[rng(n) % arr.length];

  const paragraphs: string[] = [];
  const count = 6 + (rng(1) % 4);

  for (let i = 0; i < count; i++) {
    const beat = pick(BEATS, i * 3 + 2);
    const beat2 = pick(BEATS, i * 5 + 3);
    paragraphs.push(
      `${pick(OPENING_BEATS, i === 0 ? 0 : i + 11)}. ${beat} ${beat2} ` +
        `The chapter of ${title} turned another page, carrying its characters ` +
        `toward whatever the next panel would reveal, one quiet moment at a time.`,
    );
  }

  paragraphs.push(pick(ENDING_BEATS, 7));
  paragraphs.push(`— end of chapter ${chapterNumber} —`);
  return paragraphs.join("\n\n");
}

async function main() {
  for (const name of GENRES) {
    await db.genre.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  for (const item of MEDIA) {
    const genres = await Promise.all(
      item.genres.map((name) =>
        db.genre.findUniqueOrThrow({ where: { name } }),
      ),
    );

    const persons = [];
    const seen = new Set<string>();
    for (const p of item.persons) {
      if (seen.has(p.name)) continue;
      seen.add(p.name);
      const person = await db.person.upsert({
        where: { id: p.name },
        update: {},
        create: { id: p.name, name: p.name },
        select: { id: true },
      });
      persons.push({ id: person.id, role: p.role });
    }

    const media = await db.media.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        description: item.description,
        type: item.type,
        status: item.status,
        releaseYear: item.releaseYear,
        genres: {
          deleteMany: {},
          create: genres.map((g) => ({ genreId: g.id })),
        },
        mediaPersons: {
          deleteMany: {},
          create: persons.map((p) => ({ personId: p.id, role: p.role })),
        },
      },
      create: {
        title: item.title,
        slug: item.slug,
        description: item.description,
        type: item.type,
        status: item.status,
        releaseYear: item.releaseYear,
        genres: { create: genres.map((g) => ({ genreId: g.id })) },
        mediaPersons: {
          create: persons.map((p) => ({ personId: p.id, role: p.role })),
        },
      },
      select: { id: true },
    });

    if (item.chapters) {
      await db.chapter.deleteMany({ where: { mediaId: media.id } });
      await db.chapter.createMany({
        data: Array.from({ length: item.chapters }, (_, i) => ({
          mediaId: media.id,
          chapterNumber: i + 1,
          title: `Chapter ${i + 1}`,
          content: chapterContent(item.title, i + 1),
        })),
      });
    }
  }

  const demoUser = await db.user.upsert({
    where: { username: "demo" },
    update: { displayName: "Demo Reader" },
    create: {
      username: "demo",
      displayName: "Demo Reader",
      passwordHash: await hashPassword("mangashelf1"),
      bio: "Just here to browse my titles.",
    },
    select: { id: true },
  });

  type LibraryData = {
    status: $Enums.LibraryStatus;
    rating?: number;
    currentChapter?: number;
    readingPosition?: number;
  };

  const library: Record<string, LibraryData> = {
    "one-piece": { status: "READING", rating: 9, currentChapter: 8, readingPosition: 540 },
    "berserk": { status: "ON_HOLD", rating: 10 },
    "solo-leveling": { status: "COMPLETED", rating: 10, currentChapter: 179, readingPosition: 720 },
    "omniscient-readers-viewpoint": { status: "DROPPED", rating: 5 },
    "chainsaw-man": { status: "READING", rating: 8, currentChapter: 3, readingPosition: 0 },
    "dune": { status: "PLAN_TO_READ" },
  };

  for (const [slug, data] of Object.entries(library)) {
    const media = await db.media.findUnique({ where: { slug } });
    if (!media) continue;
    await db.libraryEntry.upsert({
      where: { userId_mediaId: { userId: demoUser.id, mediaId: media.id } },
      update: {
        status: data.status,
        rating: data.rating,
        currentChapter: data.currentChapter,
        readingPosition: data.readingPosition,
      },
      create: {
        userId: demoUser.id,
        mediaId: media.id,
        status: data.status,
        rating: data.rating,
        currentChapter: data.currentChapter,
        readingPosition: data.readingPosition,
      },
    });
  }

  // Demo bookmark: One Piece ch. 8.
  const onePiece = await db.media.findUnique({ where: { slug: "one-piece" } });
  if (onePiece) {
    await db.bookmark.upsert({
      where: { userId_mediaId: { userId: demoUser.id, mediaId: onePiece.id } },
      update: { chapterNumber: 8, position: 540 },
      create: {
        userId: demoUser.id,
        mediaId: onePiece.id,
        chapterNumber: 8,
        position: 540,
      },
    });
  }

  // Demo reading history (last 14 days); a zero-day breaks the streak.
  const dayMinutes: [number, number][] = [
    [13, 22], [12, 0], [11, 45], [10, 18], [9, 30],
    [8, 0], [7, 52], [6, 26], [5, 40], [4, 0],
    [3, 34], [2, 15], [1, 28], [0, 38],
  ];
  for (const [daysAgo, minutes] of dayMinutes) {
    const date = new Date(new Date().toISOString().slice(0, 10));
    date.setUTCDate(date.getUTCDate() - daysAgo);
    await db.readingDay.upsert({
      where: { userId_date: { userId: demoUser.id, date } },
      update: { msRead: minutes * 60_000 },
      create: { userId: demoUser.id, date, msRead: minutes * 60_000 },
    });
  }

  // Demo favorites.
  for (const slug of ["one-piece", "berserk", "solo-leveling", "chainsaw-man", "dune"]) {
    const media = await db.media.findUnique({ where: { slug }, select: { id: true } });
    if (!media) continue;
    await db.favorite.upsert({
      where: { userId_mediaId: { userId: demoUser.id, mediaId: media.id } },
      update: {},
      create: { userId: demoUser.id, mediaId: media.id },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { $Enums } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { getSessionToken, hashToken } from "@/lib/auth/session";

export type SessionUser = {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  bio: string | null;
  readerTheme: $Enums.ReaderTheme;
  readerFontSize: number | null;
  readerMeasure: number | null;
};

export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = await getSessionToken();
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) return null;

  return {
    id: session.user.id,
    username: session.user.username,
    displayName: session.user.displayName,
    avatar: session.user.avatar,
    bio: session.user.bio,
    readerTheme: session.user.readerTheme,
    readerFontSize: session.user.readerFontSize,
    readerMeasure: session.user.readerMeasure,
  };
});

export const requireUser = cache(async (): Promise<SessionUser> => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
});
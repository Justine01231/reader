"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  changePasswordSchema,
  profileSchema,
  readerSettingsSchema,
  type FormState,
} from "@/lib/auth/validation";

export async function updateProfile(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();

  const parsed = profileSchema.safeParse({
    displayName: formData.get("displayName"),
    bio: formData.get("bio"),
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      displayName: parsed.data.displayName,
      bio: parsed.data.bio || null,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/");
  return { success: true, message: "Profile updated." };
}

export async function changePassword(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const current = await db.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });
  if (!current) return { message: "Something went wrong." };

  const valid = await verifyPassword(
    parsed.data.currentPassword,
    current.passwordHash,
  );
  if (!valid) {
    return {
      message: "Current password is incorrect.",
      errors: { currentPassword: ["Current password is incorrect."] },
    };
  }

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword) },
  });

  return { success: true, message: "Password changed." };
}

export async function updateReaderSettings(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();

  const parsed = readerSettingsSchema.safeParse({
    theme: formData.get("theme"),
    fontSize: formData.get("fontSize"),
    measure: formData.get("measure"),
  });
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      readerTheme: parsed.data.theme,
      readerFontSize: parsed.data.fontSize,
      readerMeasure: parsed.data.measure,
    },
  });

  revalidatePath("/settings");
  return { success: true, message: "Reading preferences saved." };
}
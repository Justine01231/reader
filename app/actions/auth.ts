"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import {
  loginSchema,
  registerSchema,
  type FormState,
} from "@/lib/auth/validation";

function fieldErrors(
  error: import("zod").ZodError,
): Record<string, string[]> {
  return error.flatten().fieldErrors;
}

export async function signup(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error), message: "Validation failed." };
  }

  const { username, password } = parsed.data;

  const existing = await db.user.findUnique({
    where: { username },
    select: { id: true },
  });
  if (existing) {
    return {
      message: "That username is already taken.",
      errors: { username: ["This username is already in use."] },
    };
  }

  const user = await db.user.create({
    data: {
      username,
      passwordHash: await hashPassword(password),
      displayName: username,
    },
    select: { id: true },
  });

  await createSession(user.id);
  redirect("/");
}

export async function login(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: fieldErrors(parsed.error), message: "Validation failed." };
  }

  const { username, password } = parsed.data;

  const user = await db.user.findUnique({
    where: { username: username.toLowerCase() },
  });

  if (!user) {
    return { message: "Invalid username or password." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { message: "Invalid username or password." };
  }

  await createSession(user.id);
  redirect("/");
}

export async function logout(): Promise<void> {
  await destroySession();
  revalidatePath("/", "layout");
  redirect("/login");
}
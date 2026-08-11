"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createSession, currentUser, destroySession } from "@/lib/auth";
import {
  availableHandle,
  createUser,
  emailTaken,
  handleTaken,
  updateProfile,
  verifyCredentials,
} from "@/lib/users";

export type AuthFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  ok?: boolean;
};

function fieldErrorsFrom(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

const signUpSchema = z.object({
  name: z.string().min(2, "Enter your name.").max(60, "That name is too long."),
  handle: z
    .string()
    .regex(/^[a-z0-9_]{3,20}$/, "Use 3–20 letters, numbers, or underscores.")
    .or(z.literal("")),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters.").max(128, "That password is too long."),
});

export async function signUpAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse({
    name: text(formData, "name"),
    handle: text(formData, "handle").toLowerCase(),
    email: text(formData, "email").toLowerCase(),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const { name, email, password } = parsed.data;
  const requestedHandle = parsed.data.handle?.trim();

  if (emailTaken(email)) {
    return { fieldErrors: { email: "An account already uses this email." } };
  }

  if (requestedHandle && handleTaken(requestedHandle)) {
    return { fieldErrors: { handle: "That handle is taken." } };
  }

  const handle = requestedHandle || availableHandle(name.split(/\s+/)[0] ?? "member");
  const user = await createUser({ email, handle, name, password });

  await createSession(user.id);
  revalidatePath("/", "layout");
  redirect("/library");
}

const signInSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export async function signInAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signInSchema.safeParse({
    email: text(formData, "email").toLowerCase(),
    password: String(formData.get("password") ?? ""),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const user = await verifyCredentials(parsed.data.email, parsed.data.password);
  if (!user) {
    return { error: "That email and password combination does not match an account." };
  }

  await createSession(user.id);
  revalidatePath("/", "layout");

  const next = String(formData.get("next") ?? "");
  redirect(next.startsWith("/") ? next : "/library");
}

export async function signOutAction() {
  await destroySession();
  revalidatePath("/", "layout");
  redirect("/");
}

const profileSchema = z.object({
  name: z.string().min(2, "Enter your name.").max(60, "That name is too long."),
  bio: z.string().max(280, "Keep your bio under 280 characters."),
});

export async function updateProfileAction(
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const user = await currentUser();
  if (!user) return { error: "Sign in to update your profile." };

  const parsed = profileSchema.safeParse({
    name: text(formData, "name"),
    bio: text(formData, "bio"),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  updateProfile(user.id, parsed.data);
  revalidatePath("/library");
  revalidatePath(`/u/${user.handle}`);
  return { ok: true };
}

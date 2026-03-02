"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signupSchema, loginSchema, forgotPasswordSchema } from "@/lib/validators/auth";

export async function signUp(formData: {
  email: string;
  password: string;
  full_name: string;
}) {
  const validated = signupSchema.parse(formData);
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: validated.email,
    password: validated.password,
    options: {
      data: {
        full_name: validated.full_name,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function signIn(formData: { email: string; password: string; next?: string }) {
  const validated = loginSchema.parse({ email: formData.email, password: formData.password });
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: validated.email,
    password: validated.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect(formData.next || "/browse");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/browse");
}

export async function resetPassword(formData: { email: string }) {
  const validated = forgotPasswordSchema.parse(formData);
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(validated.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { error: "you must be logged in" };
  }

  // Re-authenticate with current password to verify it
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: data.currentPassword,
  });
  if (authError) {
    return { error: "current password is incorrect" };
  }

  const { error } = await supabase.auth.updateUser({ password: data.newPassword });
  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}

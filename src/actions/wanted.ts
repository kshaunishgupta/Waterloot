"use server";

import { createClient } from "@/lib/supabase/server";
import { wantedPostSchema } from "@/lib/validators/wanted";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createWantedPost(data: {
  title: string;
  description: string;
  category_id?: string | null;
  budget_min?: number | null;
  budget_max?: number | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to post a wanted listing" };
  }

  const validated = wantedPostSchema.parse(data);

  const { data: post, error } = await supabase
    .from("wanted_posts")
    .insert({
      ...validated,
      user_id: user.id,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/wanted");
  revalidatePath("/");
  redirect("/wanted");
}

export async function deleteWantedPost(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in" };
  }

  const { error } = await supabase
    .from("wanted_posts")
    .delete()
    .eq("id", postId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/wanted");
  revalidatePath("/");
  return { success: true };
}

export async function fulfillWantedPost(postId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in" };
  }

  const { error } = await supabase
    .from("wanted_posts")
    .update({ status: "fulfilled" })
    .eq("id", postId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/wanted");
  revalidatePath("/");
  return { success: true };
}

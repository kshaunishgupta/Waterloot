"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveListing(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in" };
  }

  const { error } = await supabase.from("saved_listings").insert({
    user_id: user.id,
    listing_id: listingId,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Already saved" };
    }
    return { error: error.message };
  }

  revalidatePath("/saved");
  return { success: true };
}

export async function unsaveListing(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in" };
  }

  const { error } = await supabase
    .from("saved_listings")
    .delete()
    .eq("user_id", user.id)
    .eq("listing_id", listingId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/saved");
  return { success: true };
}

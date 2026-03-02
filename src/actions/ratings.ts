"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/** Rate a seller (like or dislike). Calling again with the same value removes the rating. */
export async function rateSeller(
  sellerId: string,
  isLike: boolean,
  listingId?: string
): Promise<{ error?: string; removed?: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to rate a seller" };
  if (user.id === sellerId) return { error: "You cannot rate yourself" };

  // Check for an existing rating
  const { data: existing } = await supabase
    .from("seller_ratings")
    .select("id, is_like")
    .eq("buyer_id", user.id)
    .eq("seller_id", sellerId)
    .maybeSingle();

  if (existing) {
    if (existing.is_like === isLike) {
      // Same vote — remove it (toggle off)
      await supabase.from("seller_ratings").delete().eq("id", existing.id);
      revalidatePath(`/profile/${sellerId}`);
      return { removed: true };
    } else {
      // Different vote — update it
      await supabase
        .from("seller_ratings")
        .update({ is_like: isLike })
        .eq("id", existing.id);
      revalidatePath(`/profile/${sellerId}`);
      return {};
    }
  }

  // No existing rating — insert
  const { error } = await supabase.from("seller_ratings").insert({
    buyer_id: user.id,
    seller_id: sellerId,
    listing_id: listingId ?? null,
    is_like: isLike,
  });

  if (error) return { error: error.message };
  revalidatePath(`/profile/${sellerId}`);
  return {};
}

/** Fetch the current user's existing vote for a seller (null = no vote). */
export async function getMyRating(
  sellerId: string
): Promise<{ is_like: boolean | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { is_like: null };

  const { data } = await supabase
    .from("seller_ratings")
    .select("is_like")
    .eq("buyer_id", user.id)
    .eq("seller_id", sellerId)
    .maybeSingle();

  return { is_like: data?.is_like ?? null };
}

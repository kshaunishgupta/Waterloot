"use server";

import { createClient } from "@/lib/supabase/server";

export async function getSellerEmail(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to contact the seller" };
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("title, seller_id")
    .eq("id", listingId)
    .single();

  if (!listing) {
    return { error: "Listing not found" };
  }

  if (listing.seller_id === user.id) {
    return { error: "You cannot contact yourself" };
  }

  const { data: sellerProfile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", listing.seller_id)
    .single();

  if (!sellerProfile?.email) {
    return { error: "Could not retrieve seller contact" };
  }

  const subject = `Re: ${listing.title} on Waterloot`;

  return {
    email: sellerProfile.email,
    subject,
  };
}

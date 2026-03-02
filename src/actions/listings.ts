"use server";

import { createClient } from "@/lib/supabase/server";
import { listingSchema } from "@/lib/validators/listing";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createListing(data: {
  title: string;
  description: string;
  category_id: string;
  price: number;
  condition: string;
  images: string[];
  isbn?: string;
  book_title?: string;
  book_author?: string;
  book_edition?: string;
  course_code?: string;
  instagram?: string;
  discord?: string;
  contact_phone?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to create a listing" };
  }

  const validated = listingSchema.parse(data);

  const { data: listing, error } = await supabase
    .from("listings")
    .insert({
      ...validated,
      seller_id: user.id,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/browse");
  revalidatePath("/");
  redirect(`/listings/${listing.id}`);
}

export async function updateListing(
  listingId: string,
  data: {
    title: string;
    description: string;
    category_id: string;
    price: number;
    condition: string;
    images: string[];
    isbn?: string;
    book_title?: string;
    book_author?: string;
    book_edition?: string;
    course_code?: string;
    instagram?: string;
    discord?: string;
    contact_phone?: string;
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in" };
  }

  const validated = listingSchema.parse(data);

  // Get existing listing to clean up removed images
  const { data: existing } = await supabase
    .from("listings")
    .select("images, seller_id")
    .eq("id", listingId)
    .single();

  if (!existing || existing.seller_id !== user.id) {
    return { error: "Listing not found or you don't have permission" };
  }

  // Delete removed images from storage
  const removedImages = (existing.images as string[]).filter(
    (url: string) => !validated.images.includes(url)
  );
  for (const url of removedImages) {
    const path = extractStoragePath(url);
    if (path) {
      await supabase.storage.from("listing-images").remove([path]);
    }
  }

  const { error } = await supabase
    .from("listings")
    .update(validated)
    .eq("id", listingId)
    .eq("seller_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/browse");
  revalidatePath(`/listings/${listingId}`);
  revalidatePath("/");
  redirect(`/listings/${listingId}`);
}

export async function deleteListing(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in" };
  }

  // Get images to clean up
  const { data: listing } = await supabase
    .from("listings")
    .select("images, seller_id")
    .eq("id", listingId)
    .single();

  if (!listing || listing.seller_id !== user.id) {
    return { error: "Listing not found or you don't have permission" };
  }

  // Delete images from storage
  for (const url of listing.images as string[]) {
    const path = extractStoragePath(url);
    if (path) {
      await supabase.storage.from("listing-images").remove([path]);
    }
  }

  const { error } = await supabase
    .from("listings")
    .delete()
    .eq("id", listingId)
    .eq("seller_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/browse");
  revalidatePath("/");
  redirect("/browse");
}

export async function markAsSold(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in" };
  }

  const { error } = await supabase
    .from("listings")
    .update({ status: "sold" })
    .eq("id", listingId)
    .eq("seller_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/browse");
  revalidatePath(`/listings/${listingId}`);
  return { success: true };
}

export async function reactivateListing(listingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in" };
  }

  const { error } = await supabase
    .from("listings")
    .update({ status: "active" })
    .eq("id", listingId)
    .eq("seller_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/browse");
  revalidatePath(`/listings/${listingId}`);
  return { success: true };
}

function extractStoragePath(url: string): string | null {
  try {
    const match = url.match(/\/storage\/v1\/object\/public\/listing-images\/(.+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

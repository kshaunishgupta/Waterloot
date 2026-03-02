import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ListingDetail } from "@/components/listings/listing-detail";
import type { Metadata } from "next";

interface ListingPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ListingPageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("title, description, price, images")
    .eq("id", id)
    .single();

  if (!listing) {
    return { title: "Listing Not Found — Waterloot" };
  }

  return {
    title: `${listing.title} — Waterloot`,
    description: listing.description.slice(0, 160),
    openGraph: {
      title: listing.title,
      description: listing.description.slice(0, 160),
      images: listing.images?.[0] ? [listing.images[0]] : [],
    },
  };
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: listing } = await supabase
    .from("listings")
    .select(
      `
      *,
      seller:profiles!seller_id(*),
      category:categories!category_id(*)
    `
    )
    .eq("id", id)
    .single();

  if (!listing) {
    notFound();
  }

  let isSaved = false;
  let isAdmin = false;
  if (user) {
    const [savedResult, profileResult] = await Promise.all([
      supabase
        .from("saved_listings")
        .select("id")
        .eq("user_id", user.id)
        .eq("listing_id", id)
        .single(),
      supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single(),
    ]);
    isSaved = !!savedResult.data;
    isAdmin = profileResult.data?.role === "admin";
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <ListingDetail
        listing={listing as any}
        currentUserId={user?.id || null}
        isSaved={isSaved}
        isAdmin={isAdmin}
      />
    </div>
  );
}

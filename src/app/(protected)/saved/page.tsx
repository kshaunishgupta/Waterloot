import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import Link from "next/link";
import { ListingCard } from "@/components/listings/listing-card";

export default async function SavedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: savedListings } = await supabase
    .from("saved_listings")
    .select(
      `
      listing:listings!listing_id(
        *,
        seller:profiles!seller_id(full_name, avatar_url),
        category:categories!category_id(name, slug)
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const listings = (savedListings || [])
    .map((s: any) => s.listing)
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-white">
        saved listings
      </h1>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-neutral-800 bg-neutral-900 py-16">
          <Heart className="h-12 w-12 text-neutral-600" />
          <h3 className="mt-4 text-lg font-medium text-white">
            no saved listings
          </h3>
          <p className="mt-2 text-sm text-neutral-500">
            save listings you&apos;re interested in to find them later
          </p>
          <Link
            href="/browse"
            className="mt-4 bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            browse listings
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((listing: any) => (
            <ListingCard
              key={listing.id}
              listing={{
                ...listing,
                seller_name: listing.seller?.full_name || "",
                seller_avatar: listing.seller?.avatar_url || null,
                category_name: listing.category?.name || "",
                category_slug: listing.category?.slug || "",
                total_count: 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

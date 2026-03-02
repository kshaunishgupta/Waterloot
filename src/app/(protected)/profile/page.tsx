import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ListingCard } from "@/components/listings/listing-card";
import { WantedPostsList } from "@/components/wanted/wanted-posts-list";
import ProfileHeader from "@/components/profile/profile-header";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  const { data: listings } = await supabase
    .from("listings")
    .select(`*, category:categories!category_id(name, slug)`)
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  const { data: wantedPosts } = await supabase
    .from("wanted_posts")
    .select("*, category:categories!category_id(name, slug)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const { data: savedListings } = await supabase
    .from("saved_listings")
    .select(`
      listing:listings!listing_id(
        *,
        seller:profiles!seller_id(full_name, avatar_url),
        category:categories!category_id(name, slug)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <ProfileHeader profile={profile} isOwn />

      {/* My Listings */}
      <section className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">my listings</h2>
          <Link
            href="/listings/new"
            className="flex items-center gap-2 border border-neutral-700 px-3 py-1.5 text-sm font-medium text-neutral-300 hover:bg-neutral-800"
          >
            <Plus className="h-4 w-4" />
            new listing
          </Link>
        </div>
        {listings && listings.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing: any) => (
              <ListingCard
                key={listing.id}
                isLoggedIn={true}
                listing={{
                  ...listing,
                  seller_name: profile.full_name,
                  seller_avatar: profile.avatar_url,
                  category_name: listing.category?.name || "",
                  category_slug: listing.category?.slug || "",
                  total_count: 0,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="border border-neutral-800 bg-neutral-900 py-12 text-center">
            <p className="text-neutral-500">
              you haven&apos;t listed anything yet
            </p>
            <Link
              href="/listings/new"
              className="mt-4 inline-flex items-center gap-2 bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              <Plus className="h-4 w-4" />
              create your first listing
            </Link>
          </div>
        )}
      </section>

      {/* My Wanted Posts */}
      <section id="wanted-posts" className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">my wanted posts</h2>
          <Link
            href="/wanted/new"
            className="flex items-center gap-2 border border-neutral-700 px-3 py-1.5 text-sm font-medium text-neutral-300 hover:bg-neutral-800"
          >
            <Plus className="h-4 w-4" />
            post wanted
          </Link>
        </div>
        <WantedPostsList posts={wantedPosts || []} isOwn={true} />
      </section>

      {/* Saved Listings */}
      <section className="mt-10">
        <h2 className="mb-4 text-xl font-bold text-white">
          saved items
        </h2>
        {savedListings && savedListings.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {savedListings.map((saved: any) => {
              const listing = saved.listing;
              if (!listing) return null;
              return (
                <ListingCard
                  key={listing.id}
                  isLoggedIn={true}
                  listing={{
                    ...listing,
                    seller_name: listing.seller?.full_name || "",
                    seller_avatar: listing.seller?.avatar_url || null,
                    category_name: listing.category?.name || "",
                    category_slug: listing.category?.slug || "",
                    total_count: 0,
                  }}
                />
              );
            })}
          </div>
        ) : (
          <div className="border border-neutral-800 bg-neutral-900 py-12 text-center">
            <p className="text-neutral-500">no saved items yet</p>
          </div>
        )}
      </section>
    </div>
  );
}

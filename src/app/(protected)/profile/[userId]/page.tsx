import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ListingCard } from "@/components/listings/listing-card";
import ProfileHeader from "@/components/profile/profile-header";
import { SellerRating } from "@/components/ratings/seller-rating";
import { WantedPostsList } from "@/components/wanted/wanted-posts-list";

interface PublicProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { userId } = await params;
  const supabase = await createClient();

  const { data: { user: currentUser } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (!profile) notFound();

  const [listingsResult, approvalResult, userRatingResult, wantedResult] = await Promise.all([
    supabase
      .from("listings")
      .select("*, category:categories!category_id(name, slug)")
      .eq("seller_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false }),
    supabase.rpc("get_seller_approval", { p_seller_id: userId }),
    currentUser
      ? supabase
          .from("seller_ratings")
          .select("is_like")
          .eq("buyer_id", currentUser.id)
          .eq("seller_id", userId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase
      .from("wanted_posts")
      .select("*, category:categories!category_id(name, slug)")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false }),
  ]);

  const listings = listingsResult.data || [];
  const wantedPosts = wantedResult.data || [];

  const approval = (approvalResult.data as any)?.[0] ?? null;
  const totalRatings: number = Number(approval?.total_ratings ?? 0);
  const likeCount: number = Number(approval?.like_count ?? 0);
  const approvalPct: number | null = approval?.approval_pct != null ? Number(approval.approval_pct) : null;

  const userVote: boolean | null = (userRatingResult.data as any)?.is_like ?? null;

  const isOwn = currentUser?.id === userId;
  const canRate = !!currentUser && !isOwn;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <ProfileHeader
        profile={profile}
        isOwn={isOwn}
        approvalPct={approvalPct}
        totalRatings={totalRatings}
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        {/* Left: Listings + Wanted */}
        <div className="space-y-10 lg:col-span-2">
          {/* Listings */}
          <section>
            <h2 className="mb-4 text-xl font-bold text-white">
              listings by <span className="brand-name">{profile.full_name.toLowerCase()}</span>
            </h2>
            {listings.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {listings.map((listing: any) => (
                  <ListingCard
                    key={listing.id}
                    isLoggedIn={!!currentUser}
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
                <p className="text-neutral-500">no active listings</p>
              </div>
            )}
          </section>

          {/* Wanted posts */}
          {(isOwn || wantedPosts.length > 0) && (
            <section>
              <h2 className="mb-4 text-xl font-bold text-white">wanted posts</h2>
              <WantedPostsList posts={wantedPosts} isOwn={isOwn} />
            </section>
          )}
        </div>

        {/* Right: Seller Rating */}
        <section>
          <div className="border border-neutral-700 bg-neutral-900 p-5">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              seller rating
            </h2>
            <SellerRating
              sellerId={userId}
              canRate={canRate}
              initialApprovalPct={approvalPct}
              initialTotalRatings={totalRatings}
              initialLikeCount={likeCount}
              initialUserVote={userVote}
            />
            {!currentUser && (
              <p className="mt-3 text-xs text-neutral-500">
                <a href={`/login?next=/profile/${userId}`} className="text-primary-400 hover:underline">
                  sign in
                </a>{" "}
                to rate this seller.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

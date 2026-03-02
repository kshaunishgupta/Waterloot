import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Megaphone, Plus, Search } from "lucide-react";
import { WantedListings } from "@/components/wanted/wanted-listings";
import { WantedFilters } from "@/components/wanted/wanted-filters";
import type { WantedPostWithDetails } from "@/lib/types";

interface WantedPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    date?: string;
    condition?: string;
    min_budget?: string;
    max_budget?: string;
  }>;
}

export default async function WantedPage({ searchParams }: WantedPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("display_order");

  const allCategories = categories || [];

  let dateAfter: string | null = null;
  if (params.date === "24h") dateAfter = new Date(Date.now() - 86400000).toISOString();
  else if (params.date === "7d") dateAfter = new Date(Date.now() - 7 * 86400000).toISOString();
  else if (params.date === "30d") dateAfter = new Date(Date.now() - 30 * 86400000).toISOString();

  const selectedSlugs = params.category ? params.category.split(",").filter(Boolean) : [];

  let query = supabase
    .from("wanted_posts")
    .select(
      `*,
      user:profiles!user_id(id, full_name, avatar_url, email, phone, role, is_banned, created_at, updated_at),
      category:categories!category_id(*)`
    )
    .eq("status", "active");

  if (params.q) query = query.ilike("title", `%${params.q}%`);

  if (selectedSlugs.length > 0) {
    const categoryIds = allCategories
      .filter((c) => selectedSlugs.includes(c.slug))
      .map((c) => c.id);
    if (categoryIds.length === 1) query = query.eq("category_id", categoryIds[0]);
    else if (categoryIds.length > 1) query = query.in("category_id", categoryIds);
  }

  if (dateAfter) query = query.gte("created_at", dateAfter);

  // Budget filters — match posts whose budget range overlaps with the requested range
  const minBudget = params.min_budget ? parseFloat(params.min_budget) : null;
  const maxBudget = params.max_budget ? parseFloat(params.max_budget) : null;
  if (minBudget !== null && !isNaN(minBudget)) query = query.gte("budget_max", minBudget);
  if (maxBudget !== null && !isNaN(maxBudget)) query = query.lte("budget_min", maxBudget);

  query = query.order("created_at", { ascending: false });

  const { data: posts } = await query;
  const count = posts?.length ?? 0;

  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">wanted</h1>
        <Link
          href="/wanted/new"
          className="flex items-center gap-2 border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
        >
          <Plus className="h-4 w-4" />
          post wanted
        </Link>
      </div>

      {/* Search bar */}
      <form className="mb-3">
        <div className="relative">
          <button
            type="submit"
            className="absolute left-0 top-0 flex h-full items-center px-3 text-neutral-500 transition-colors hover:text-white"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <input
            type="text"
            name="q"
            defaultValue={params.q}
            placeholder="search wanted posts..."
            className="w-full border border-neutral-700 bg-neutral-900 py-3 pl-10 pr-4 text-sm text-white placeholder:text-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </form>

      <div className="flex gap-6">
        <aside className="hidden w-64 shrink-0 lg:block">
          <WantedFilters
            categories={allCategories}
            currentFilters={{
              category: params.category,
              date: params.date,
              condition: params.condition,
              min_budget: params.min_budget,
              max_budget: params.max_budget,
            }}
          />
        </aside>

        <div className="flex-1 min-w-0">
          <p className="mb-4 text-sm text-neutral-500">
            {count} post{count !== 1 ? "s" : ""} found
          </p>

          {count === 0 ? (
            <div className="flex flex-col items-center justify-center border border-neutral-800 bg-neutral-900 py-16">
              <Megaphone className="h-12 w-12 text-neutral-700" />
              <p className="mt-4 text-lg font-medium text-neutral-300">no wanted posts found</p>
              <p className="mt-2 text-sm text-neutral-500">try adjusting your search or filters</p>
              <Link
                href="/wanted/new"
                className="mt-6 flex items-center gap-2 border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white"
              >
                <Plus className="h-4 w-4" />
                post wanted
              </Link>
            </div>
          ) : (
            <WantedListings
              posts={posts as WantedPostWithDetails[]}
              isLoggedIn={isLoggedIn}
              isAdmin={isAdmin}
            />
          )}
        </div>
      </div>
    </div>
  );
}

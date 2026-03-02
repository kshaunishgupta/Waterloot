import { createClient } from "@/lib/supabase/server";
import { Search } from "lucide-react";
import { ListingFilters } from "@/components/listings/listing-filters";
import { BrowseListings } from "@/components/listings/browse-listings";
import { SortBar } from "@/components/listings/sort-bar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Pagination } from "@/components/ui/pagination";
import { SORT_OPTIONS } from "@/lib/constants";
import type { SearchResult } from "@/lib/types";

interface BrowsePageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;   // comma-separated slugs
    condition?: string;
    min_price?: string;
    max_price?: string;
    date?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
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

  const page = parseInt(params.page || "1", 10);
  const pageSize = 12;

  const selectedSlugs = params.category ? params.category.split(",").filter(Boolean) : [];
  const selectedConditions = params.condition ? params.condition.split(",").filter(Boolean) : [];
  const multiCategory = selectedSlugs.length > 1;
  const multiCondition = selectedConditions.length > 1;
  const useDirectQuery = multiCategory || multiCondition;

  let listings: SearchResult[] = [];
  let totalCount = 0;

  if (useDirectQuery) {
    // Multi-category or multi-condition: direct query
    let query = supabase
      .from("listings")
      .select(`
        id, title, description, price, condition,
        images, status, isbn, book_title, book_author, book_edition, course_code,
        seller_id, created_at, category_id,
        seller:profiles!seller_id(full_name, avatar_url),
        category:categories!category_id(name, slug)
      `)
      .eq("status", "active");

    if (selectedSlugs.length > 0) {
      const categoryIds = allCategories
        .filter((c) => selectedSlugs.includes(c.slug))
        .map((c) => c.id);
      if (categoryIds.length === 1) query = query.eq("category_id", categoryIds[0]);
      else if (categoryIds.length > 1) query = query.in("category_id", categoryIds);
    }

    if (params.q) query = query.ilike("title", `%${params.q}%`);
    if (selectedConditions.length === 1) query = query.eq("condition", selectedConditions[0]);
    else if (selectedConditions.length > 1) query = query.in("condition", selectedConditions);
    if (params.min_price) query = query.gte("price", parseFloat(params.min_price));
    if (params.max_price) query = query.lte("price", parseFloat(params.max_price));
    if (dateAfter) query = query.gte("created_at", dateAfter);

    const sortBy = params.sort || "newest";
    if (sortBy === "price_asc") query = query.order("price", { ascending: true });
    else if (sortBy === "price_desc") query = query.order("price", { ascending: false });
    else if (sortBy === "oldest") query = query.order("created_at", { ascending: true });
    else query = query.order("created_at", { ascending: false });

    query = query.range((page - 1) * pageSize, page * pageSize - 1);

    const { data } = await query;
    listings = ((data || []) as any[]).map((l) => ({
      id: l.id,
      title: l.title,
      description: l.description,
      price: l.price,
      condition: l.condition,
      images: l.images,
      status: l.status,
      isbn: l.isbn,
      book_title: l.book_title,
      book_author: l.book_author,
      book_edition: l.book_edition,
      course_code: l.course_code,
      seller_id: l.seller_id,
      seller_name: (l.seller as any)?.full_name || "",
      seller_avatar: (l.seller as any)?.avatar_url || null,
      category_id: l.category_id,
      category_name: (l.category as any)?.name || "",
      category_slug: (l.category as any)?.slug || "",
      created_at: l.created_at,
      total_count: 0,
    }));
    totalCount = listings.length;
  } else {
    // Single / no category, single / no condition: use RPC
    const { data: results, error: rpcError } = await supabase.rpc("search_listings", {
      search_query: params.q || null,
      filter_category: selectedSlugs.length === 1
        ? (allCategories.find((c) => c.slug === selectedSlugs[0])?.id ?? null)
        : null,
      filter_condition: selectedConditions.length === 1 ? selectedConditions[0] : null,
      filter_location: null,
      filter_min_price: params.min_price ? parseFloat(params.min_price) : null,
      filter_max_price: params.max_price ? parseFloat(params.max_price) : null,
      filter_date_after: dateAfter,
      sort_by: params.sort || "newest",
      page_number: page,
      page_size: pageSize,
    });
    if (rpcError) {
      console.error("[browse] search_listings RPC error:", rpcError.message, rpcError.code);
    }
    listings = (results || []) as SearchResult[];
    totalCount = listings[0]?.total_count || 0;
  }

  const totalPages = Math.ceil(totalCount / pageSize);

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

  function buildPageHref(p: number): string {
    const q = new URLSearchParams();
    if (params.q) q.set("q", params.q);
    if (params.category) q.set("category", params.category);
    if (params.condition) q.set("condition", params.condition);
    if (params.min_price) q.set("min_price", params.min_price);
    if (params.max_price) q.set("max_price", params.max_price);
    if (params.date) q.set("date", params.date);
    if (params.sort) q.set("sort", params.sort);
    q.set("page", String(p));
    return `/browse?${q.toString()}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">browse listings</h1>
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
            placeholder="search listings..."
            className="w-full border border-neutral-700 bg-neutral-900 py-3 pl-10 pr-4 text-sm text-white placeholder:text-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </form>

      {/* Breadcrumb */}
      <Breadcrumb
        segments={[
          { label: "waterloot", href: "/" },
          { label: "browse", href: "/browse" },
          ...(params.category
            ? params.category.split(",").filter(Boolean).map((slug) => ({
                label: allCategories.find((c) => c.slug === slug)?.name.toLowerCase() ?? slug,
              }))
            : []),
          ...(params.q ? [{ label: `"${params.q}"` }] : []),
          ...(params.sort && params.sort !== "newest"
            ? [{ label: `sorted by ${SORT_OPTIONS.find((s) => s.value === params.sort)?.label.toLowerCase() ?? params.sort}` }]
            : []),
        ]}
      />

      {/* Sort bar — horizontal, visible on all screen sizes */}
      <SortBar currentSort={params.sort || "newest"} />

      <div className="flex gap-6">
        <aside className="hidden w-64 shrink-0 lg:block">
          <ListingFilters
            categories={allCategories}
            currentFilters={{
              category: params.category,
              condition: params.condition,
              min_price: params.min_price,
              max_price: params.max_price,
              date: params.date,
              sort: params.sort,
            }}
          />
        </aside>

        <div className="flex-1 min-w-0">
          {!useDirectQuery && (
            <p className="mb-4 text-sm text-neutral-500">
              {totalCount} listing{totalCount !== 1 ? "s" : ""} found
            </p>
          )}

          <BrowseListings listings={listings} isLoggedIn={isLoggedIn} isAdmin={isAdmin} />

          <Pagination page={page} totalPages={totalPages} buildHref={buildPageHref} />
        </div>
      </div>
    </div>
  );
}

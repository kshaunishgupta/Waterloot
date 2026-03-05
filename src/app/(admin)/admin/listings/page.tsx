"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { removeListing, restoreListing } from "@/actions/admin";
import { formatDate, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AdminListing {
  id: string;
  title: string;
  price: number;
  status: string;
  created_at: string;
  seller: { full_name: string; email: string } | null;
}

export default function AdminListingsPage() {
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const supabase = createClient();

  useEffect(() => {
    async function fetchListings() {
      const { data } = await supabase
        .from("listings")
        .select("id, title, price, status, created_at, seller:profiles!seller_id(full_name, email)")
        .order("created_at", { ascending: false });
      setListings((data as any) || []);
      setLoading(false);
    }
    fetchListings();
  }, [supabase]);

  const filteredListings =
    statusFilter === "all"
      ? listings
      : listings.filter((l) => l.status === statusFilter);

  async function handleRemove(listingId: string) {
    await removeListing(listingId);
    setListings((prev) =>
      prev.map((l) =>
        l.id === listingId ? { ...l, status: "removed" } : l
      )
    );
  }

  async function handleRestore(listingId: string) {
    await restoreListing(listingId);
    setListings((prev) =>
      prev.map((l) =>
        l.id === listingId ? { ...l, status: "active" } : l
      )
    );
  }

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "success" as const;
      case "sold":
        return "secondary" as const;
      case "removed":
        return "destructive" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">
        Listing Moderation
      </h1>

      <div className="mb-4 flex gap-2">
        {["all", "active", "sold", "removed"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === status
                ? "bg-primary-600 text-white"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto border border-neutral-800 bg-neutral-900">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-800 bg-neutral-950">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">Title</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">Price</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">Seller</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">Posted</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">Loading...</td>
              </tr>
            ) : filteredListings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">No listings found</td>
              </tr>
            ) : (
              filteredListings.map((listing) => (
                <tr key={listing.id} className="hover:bg-neutral-800">
                  <td className="px-4 py-3">
                    <Link
                      href={`/listings/${listing.id}`}
                      className="font-medium text-primary-600 hover:underline"
                    >
                      {listing.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-400">
                    {formatPrice(listing.price)}
                  </td>
                  <td className="px-4 py-3 text-neutral-400">
                    {listing.seller?.full_name || "Unknown"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusBadgeVariant(listing.status)}>
                      {listing.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {formatDate(listing.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    {listing.status === "active" && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemove(listing.id)}
                      >
                        Remove
                      </Button>
                    )}
                    {listing.status === "removed" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleRestore(listing.id)}
                      >
                        Restore
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

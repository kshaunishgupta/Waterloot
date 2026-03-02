"use client";

import { useState, useEffect } from "react";
import { LayoutGrid, List } from "lucide-react";
import { ListingCard } from "@/components/listings/listing-card";
import { ListingRow } from "@/components/listings/listing-row";
import type { SearchResult } from "@/lib/types";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "list";

interface BrowseListingsProps {
  listings: SearchResult[];
  isLoggedIn?: boolean;
  isAdmin?: boolean;
}

const VIEW_KEY = "waterloot:browse-view";

export function BrowseListings({ listings, isLoggedIn = false, isAdmin = false }: BrowseListingsProps) {
  const [view, setView] = useState<ViewMode>("grid");

  useEffect(() => {
    const stored = localStorage.getItem(VIEW_KEY);
    if (stored === "grid" || stored === "list") setView(stored);
  }, []);

  function handleSetView(v: ViewMode) {
    setView(v);
    localStorage.setItem(VIEW_KEY, v);
  }

  return (
    <div>
      {/* View toggle */}
      <div className="mb-4 flex items-center justify-end gap-1">
        <button
          onClick={() => handleSetView("grid")}
          title="photo grid"
          className={cn(
            "rounded-md p-2 text-xs transition-colors flex items-center gap-1.5",
            view === "grid"
              ? "bg-primary-600 text-white"
              : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
          )}
        >
          <LayoutGrid className="h-4 w-4" />
          <span className="hidden sm:inline">photos</span>
        </button>
        <button
          onClick={() => handleSetView("list")}
          title="text list"
          className={cn(
            "rounded-md p-2 text-xs transition-colors flex items-center gap-1.5",
            view === "list"
              ? "bg-primary-600 text-white"
              : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
          )}
        >
          <List className="h-4 w-4" />
          <span className="hidden sm:inline">list</span>
        </button>
      </div>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 py-16">
          <p className="text-lg font-medium text-neutral-300">no listings found</p>
          <p className="mt-2 text-sm text-neutral-500">try adjusting your search or filters</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} isLoggedIn={isLoggedIn} isAdmin={isAdmin} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {listings.map((listing) => (
            <ListingRow key={listing.id} listing={listing} isLoggedIn={isLoggedIn} isAdmin={isAdmin} />
          ))}
        </div>
      )}
    </div>
  );
}

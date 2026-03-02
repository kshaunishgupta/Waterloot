"use client";

import { useState, useEffect } from "react";
import { LayoutGrid, List } from "lucide-react";
import { WantedCard } from "@/components/wanted/wanted-card";
import { WantedRow } from "@/components/wanted/wanted-row";
import { cn } from "@/lib/utils";
import type { WantedPostWithDetails } from "@/lib/types";

type ViewMode = "grid" | "list";

interface WantedListingsProps {
  posts: WantedPostWithDetails[];
  isLoggedIn?: boolean;
  isAdmin?: boolean;
}

const VIEW_KEY = "waterloot:wanted-view";

export function WantedListings({ posts, isLoggedIn = false, isAdmin = false }: WantedListingsProps) {
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
          title="grid view"
          className={cn(
            "rounded-md p-2 text-xs transition-colors flex items-center gap-1.5",
            view === "grid"
              ? "bg-primary-600 text-white"
              : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
          )}
        >
          <LayoutGrid className="h-4 w-4" />
          <span className="hidden sm:inline">grid</span>
        </button>
        <button
          onClick={() => handleSetView("list")}
          title="list view"
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

      {view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <WantedCard key={post.id} post={post} isLoggedIn={isLoggedIn} isAdmin={isAdmin} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <WantedRow key={post.id} post={post} isLoggedIn={isLoggedIn} isAdmin={isAdmin} />
          ))}
        </div>
      )}
    </div>
  );
}

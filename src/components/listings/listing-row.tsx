"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import { formatPrice, formatDate, formatCondition } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ModDeleteButton } from "@/components/ui/mod-delete-button";
import type { SearchResult } from "@/lib/types";

const conditionBadgeClass: Record<string, string> = {
  new: "bg-blue-900 border-blue-700 text-blue-300",
  like_new: "bg-blue-800 border-blue-600 text-blue-300",
  good: "bg-blue-700 border-blue-500 text-blue-200",
  fair: "bg-blue-600 border-blue-400 text-blue-100",
};

export function ListingRow({
  listing,
  isLoggedIn = false,
  isAdmin = false,
}: {
  listing: SearchResult;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
}) {
  const hasImage = listing.images && listing.images.length > 0;

  return (
    <div className="group relative flex items-center gap-4 border border-neutral-800 bg-neutral-900 px-4 py-3 transition-colors hover:bg-neutral-800">
      {/* Cover link */}
      <Link
        href={`/listings/${listing.id}`}
        className="absolute inset-0 z-10"
        aria-label={listing.title}
      />

      {/* Tiny thumbnail */}
      <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-neutral-800">
        {hasImage ? (
          <Image
            src={listing.images[0]}
            alt={listing.title}
            fill
            className="object-cover"
            sizes="48px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Title */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{listing.title.toLowerCase()}</p>
        {isLoggedIn ? (
          <p className="text-xs text-neutral-400">{listing.seller_name.toLowerCase()}</p>
        ) : (
          <p className="text-xs italic text-neutral-600">sign in to view</p>
        )}
      </div>

      {/* Category */}
      <span className="hidden text-xs text-neutral-500 sm:block shrink-0">
        {listing.category_name?.toLowerCase()}
      </span>

      {/* Condition badge */}
      <div className="hidden shrink-0 md:block">
        <Badge className={conditionBadgeClass[listing.condition] ?? "bg-neutral-800 border-neutral-600 text-neutral-300"}>
          {formatCondition(listing.condition).toLowerCase()}
        </Badge>
      </div>

      {/* Date */}
      <span className="hidden shrink-0 items-center gap-1 text-xs text-neutral-500 lg:flex">
        <Clock className="h-3 w-3" />
        {formatDate(listing.created_at)}
      </span>

      {/* Price */}
      <p className="shrink-0 text-sm font-bold text-primary-400">
        {formatPrice(listing.price).toLowerCase()}
      </p>

      {/* Mod delete */}
      {isAdmin && (
        <div className="relative z-20 shrink-0">
          <ModDeleteButton type="listing" id={listing.id} />
        </div>
      )}
    </div>
  );
}

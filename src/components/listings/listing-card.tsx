"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice, formatDate, formatCondition } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ModDeleteButton } from "@/components/ui/mod-delete-button";
import type { SearchResult } from "@/lib/types";

interface ListingCardProps {
  listing: SearchResult;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
}

const conditionBadgeClass: Record<string, string> = {
  new: "bg-blue-900 border-blue-700 text-blue-300",
  like_new: "bg-blue-800 border-blue-600 text-blue-300",
  good: "bg-blue-700 border-blue-500 text-blue-200",
  fair: "bg-blue-600 border-blue-400 text-blue-100",
};

const categoryBadgeClass = "bg-violet-900 border-violet-700 text-violet-300";

export function ListingCard({ listing, isLoggedIn = false, isAdmin = false }: ListingCardProps) {
  const hasImage = listing.images && listing.images.length > 0;
  const isTextbook = listing.category_slug === "textbooks";

  return (
    <div
      className={cn(
        "group relative overflow-hidden border border-neutral-800 bg-neutral-900",
        "transition-shadow duration-200 hover:shadow-md hover:shadow-black/40"
      )}
    >
      {/* Cover link — makes the whole card clickable */}
      <Link
        href={`/listings/${listing.id}`}
        className="absolute inset-0 z-10"
        aria-label={listing.title}
      />

      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-neutral-800">
        {hasImage ? (
          <Image
            src={listing.images[0]}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {isTextbook && (
          <div className="absolute left-2 top-2 z-20">
            <Badge variant="default" className="gap-1 bg-primary-600 text-white border-primary-600">
              <BookOpen className="h-3 w-3" />
              textbook
            </Badge>
          </div>
        )}

        {listing.status === "sold" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="bg-neutral-900 px-3 py-1.5 text-sm font-semibold text-neutral-100">
              sold
            </span>
          </div>
        )}

        {/* Mod delete button */}
        {isAdmin && (
          <ModDeleteButton
            type="listing"
            id={listing.id}
            className="absolute right-2 top-2 z-20"
          />
        )}
      </div>

      {/* Content */}
      <div className="p-3.5">
        <h3 className="text-lg font-bold text-neutral-200 group-hover:text-primary-400 line-clamp-2">
          {listing.title.toLowerCase()}
        </h3>
        <p className="mt-0.5 text-sm font-medium text-primary-400">{formatPrice(listing.price).toLowerCase()}</p>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Badge
            className={conditionBadgeClass[listing.condition] ?? "bg-neutral-800 border-neutral-600 text-neutral-300"}
          >
            {formatCondition(listing.condition).toLowerCase()}
          </Badge>
          {listing.category_name && (
            <Badge className={categoryBadgeClass}>
              {listing.category_name.toLowerCase()}
            </Badge>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
          {isLoggedIn ? (
            <span className="truncate">{listing.seller_name.toLowerCase()}</span>
          ) : (
            <span className="truncate italic text-neutral-600">sign in to view</span>
          )}
          <span className="flex shrink-0 items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(listing.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
}

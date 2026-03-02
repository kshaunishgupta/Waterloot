"use client";

import { useState, useTransition } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { rateSeller } from "@/actions/ratings";

interface SellerRatingProps {
  sellerId: string;
  listingId?: string;
  /** Can the current user submit a rating? (must be logged in and not the seller) */
  canRate: boolean;
  initialApprovalPct: number | null;
  initialTotalRatings: number;
  initialLikeCount: number;
  /** Current user's existing vote: true = liked, false = disliked, null = no vote */
  initialUserVote: boolean | null;
}

export function SellerRating({
  sellerId,
  listingId,
  canRate,
  initialApprovalPct,
  initialTotalRatings,
  initialLikeCount,
  initialUserVote,
}: SellerRatingProps) {
  const [isPending, startTransition] = useTransition();
  const [userVote, setUserVote] = useState<boolean | null>(initialUserVote);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [totalRatings, setTotalRatings] = useState(initialTotalRatings);
  const [error, setError] = useState<string | null>(null);

  const approvalPct =
    totalRatings === 0
      ? null
      : Math.round((likeCount / totalRatings) * 100);

  function handleVote(isLike: boolean) {
    if (!canRate || isPending) return;
    setError(null);

    // Optimistic update
    const prevVote = userVote;
    const prevLikes = likeCount;
    const prevTotal = totalRatings;

    if (prevVote === isLike) {
      // Toggle off
      setUserVote(null);
      setLikeCount((c) => (isLike ? c - 1 : c));
      setTotalRatings((t) => t - 1);
    } else {
      if (prevVote !== null) {
        // Switching vote
        setLikeCount((c) => (isLike ? c + 1 : c - 1));
      } else {
        // New vote
        if (isLike) setLikeCount((c) => c + 1);
        setTotalRatings((t) => t + 1);
      }
      setUserVote(isLike);
    }

    startTransition(async () => {
      const result = await rateSeller(sellerId, isLike, listingId);
      if (result.error) {
        // Revert optimistic update
        setUserVote(prevVote);
        setLikeCount(prevLikes);
        setTotalRatings(prevTotal);
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-3">
      {/* Approval summary */}
      <div className="text-sm text-neutral-300">
        {totalRatings === 0 ? (
          <span className="text-neutral-500">no ratings yet</span>
        ) : (
          <>
            liked by{" "}
            <span className="font-semibold text-primary-400">{approvalPct}%</span>{" "}
            of buyers
            <span className="ml-1 text-neutral-500">
              ({totalRatings} {totalRatings === 1 ? "rating" : "ratings"})
            </span>
          </>
        )}
      </div>

      {/* Like / Dislike buttons */}
      {canRate && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleVote(true)}
            disabled={isPending}
            className={cn(
              "flex items-center gap-1.5 border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
              userVote === true
                ? "border-primary-500 bg-primary-900 text-primary-300"
                : "border-neutral-700 bg-neutral-800 text-neutral-400 hover:border-primary-600 hover:text-primary-400"
            )}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            like
            {likeCount > 0 && <span className="ml-0.5">({likeCount})</span>}
          </button>
          <button
            onClick={() => handleVote(false)}
            disabled={isPending}
            className={cn(
              "flex items-center gap-1.5 border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50",
              userVote === false
                ? "border-red-500 bg-red-950 text-red-300"
                : "border-neutral-700 bg-neutral-800 text-neutral-400 hover:border-red-700 hover:text-red-400"
            )}
          >
            <ThumbsDown className="h-3.5 w-3.5" />
            dislike
            {totalRatings - likeCount > 0 && (
              <span className="ml-0.5">({totalRatings - likeCount})</span>
            )}
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

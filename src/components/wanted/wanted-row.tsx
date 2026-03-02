import Link from "next/link";
import { Clock } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";
import { ModDeleteButton } from "@/components/ui/mod-delete-button";
import type { WantedPostWithDetails } from "@/lib/types";

interface WantedRowProps {
  post: WantedPostWithDetails;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
}

export function WantedRow({ post, isLoggedIn = false, isAdmin = false }: WantedRowProps) {
  const hasBudget = post.budget_min != null || post.budget_max != null;

  return (
    <div className="group relative flex items-center gap-4 border border-neutral-800 bg-neutral-900 px-4 py-3 transition-colors hover:bg-neutral-800">
      {/* Cover link */}
      <Link
        href={`/wanted/${post.id}`}
        className="absolute inset-0 z-10"
        aria-label={post.title}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white">{post.title.toLowerCase()}</p>
        {isLoggedIn ? (
          <p className="text-xs text-neutral-400">{post.user.full_name.toLowerCase()}</p>
        ) : (
          <p className="text-xs italic text-neutral-600">sign in to view</p>
        )}
      </div>

      {post.category && (
        <span className="hidden shrink-0 text-xs text-neutral-500 sm:block">
          {post.category.name.toLowerCase()}
        </span>
      )}

      {hasBudget && (
        <p className="hidden shrink-0 text-sm font-semibold text-primary-400 md:block">
          {post.budget_min != null && post.budget_max != null
            ? `${formatPrice(post.budget_min)} – ${formatPrice(post.budget_max)}`
            : post.budget_min != null
            ? `≥ ${formatPrice(post.budget_min)}`
            : `≤ ${formatPrice(post.budget_max!)}`}
        </p>
      )}

      <span className="hidden shrink-0 items-center gap-1 text-xs text-neutral-500 lg:flex">
        <Clock className="h-3 w-3" />
        {formatDate(post.created_at)}
      </span>

      {isAdmin && (
        <div className="relative z-20 shrink-0">
          <ModDeleteButton type="wanted" id={post.id} />
        </div>
      )}
    </div>
  );
}

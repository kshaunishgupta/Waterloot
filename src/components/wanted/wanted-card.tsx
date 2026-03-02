import Link from "next/link";
import { formatDate, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ModDeleteButton } from "@/components/ui/mod-delete-button";
import type { WantedPostWithDetails } from "@/lib/types";

interface WantedCardProps {
  post: WantedPostWithDetails;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
}

export function WantedCard({ post, isLoggedIn = false, isAdmin = false }: WantedCardProps) {
  const hasBudget = post.budget_min != null || post.budget_max != null;

  return (
    <div className="group relative border border-neutral-800 bg-neutral-900 p-5 transition-shadow hover:shadow-md hover:shadow-black/40">
      {/* Full-card link */}
      <Link href={`/wanted/${post.id}`} className="absolute inset-0 z-10" aria-label={post.title} />

      {/* Mod delete button */}
      {isAdmin && (
        <div className="absolute right-2 top-2 z-30">
          <ModDeleteButton type="wanted" id={post.id} />
        </div>
      )}

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-neutral-100 transition-colors group-hover:text-primary-400">
              {post.title.toLowerCase()}
            </h3>
            <p className="mt-1 line-clamp-2 text-sm text-neutral-400">
              {post.description}
            </p>
          </div>
          {hasBudget && (
            <div className="shrink-0 text-right">
              <p className="text-xs text-neutral-500">budget</p>
              <p className="text-sm font-semibold text-primary-400">
                {post.budget_min != null && post.budget_max != null
                  ? `${formatPrice(post.budget_min)} – ${formatPrice(post.budget_max)}`
                  : post.budget_min != null
                  ? `≥ ${formatPrice(post.budget_min)}`
                  : `≤ ${formatPrice(post.budget_max!)}`}
              </p>
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {post.category && (
            <Badge className="bg-violet-900 border-violet-700 text-violet-300">
              {post.category.name.toLowerCase()}
            </Badge>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Avatar
                  src={post.user.avatar_url}
                  alt={post.user.full_name}
                  fallback={post.user.full_name?.charAt(0)?.toUpperCase()}
                  size="sm"
                />
                <Link
                  href={`/profile/${post.user.id}`}
                  className="relative z-20 text-sm font-medium text-neutral-400 transition-colors hover:text-primary-400"
                >
                  {post.user.full_name.toLowerCase()}
                </Link>
              </>
            ) : (
              <span className="text-xs italic text-neutral-600">sign in to view</span>
            )}
          </div>
          <span className="text-xs text-neutral-500">
            {formatDate(post.created_at)}
          </span>
        </div>
      </div>
    </div>
  );
}

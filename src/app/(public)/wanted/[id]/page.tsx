import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatPrice } from "@/lib/utils";
import { WantedContactButton } from "@/components/wanted/wanted-contact-button";
import type { WantedPostWithDetails } from "@/lib/types";

interface WantedDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function WantedDetailPage({ params }: WantedDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  const { data: post } = await supabase
    .from("wanted_posts")
    .select(
      `*,
      user:profiles!user_id(id, full_name, avatar_url, email, phone, role, is_banned, created_at, updated_at),
      category:categories!category_id(*)`
    )
    .eq("id", id)
    .single();

  if (!post) notFound();

  const typedPost = post as WantedPostWithDetails;
  const hasBudget = typedPost.budget_min != null || typedPost.budget_max != null;

  const budgetLabel =
    typedPost.budget_min != null && typedPost.budget_max != null
      ? `${formatPrice(typedPost.budget_min)} – ${formatPrice(typedPost.budget_max)}`
      : typedPost.budget_min != null
      ? `≥ ${formatPrice(typedPost.budget_min)}`
      : `≤ ${formatPrice(typedPost.budget_max!)}`;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Back */}
      <Link
        href="/wanted"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        back to wanted
      </Link>

      <div className="border border-neutral-800 bg-neutral-900 p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white">{typedPost.title.toLowerCase()}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {typedPost.category && (
                <Badge className="bg-violet-900 border-violet-700 text-violet-300">
                  <Tag className="mr-1 h-3 w-3" />
                  {typedPost.category.name.toLowerCase()}
                </Badge>
              )}
              <Badge
                className={
                  typedPost.status === "active"
                    ? "bg-green-900 border-green-700 text-green-300"
                    : "bg-neutral-800 border-neutral-600 text-neutral-400"
                }
              >
                {typedPost.status}
              </Badge>
            </div>
          </div>

          {hasBudget && (
            <div className="shrink-0 text-right">
              <p className="text-xs text-neutral-500">budget</p>
              <p className="text-xl font-bold text-primary-400">{budgetLabel}</p>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="mt-6">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            description
          </h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-300">
            {typedPost.description}
          </p>
        </div>

        {/* Divider */}
        <div className="my-6 border-t border-neutral-800" />

        {/* Poster info */}
        <div className="flex items-center justify-between gap-4">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Avatar
                src={typedPost.user.avatar_url}
                alt={typedPost.user.full_name}
                fallback={typedPost.user.full_name?.charAt(0)?.toUpperCase()}
                size="md"
              />
              <div>
                <Link
                  href={`/profile/${typedPost.user.id}`}
                  className="text-sm font-semibold text-white transition-colors hover:text-primary-400"
                >
                  {typedPost.user.full_name.toLowerCase()}
                </Link>
                <div className="flex items-center gap-1 text-xs text-neutral-500">
                  <Calendar className="h-3 w-3" />
                  <span>joined {formatDate(typedPost.user.created_at)}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm italic text-neutral-500">
              <Link href={`/login?next=/wanted/${typedPost.id}`} className="text-primary-400 hover:underline">
                sign in
              </Link>{" "}
              to view poster info
            </p>
          )}

          <div className="flex items-center gap-1 text-xs text-neutral-500">
            <Calendar className="h-3 w-3" />
            <span>posted {formatDate(typedPost.created_at)}</span>
          </div>
        </div>

        {/* Contact */}
        {isLoggedIn && (
          <div className="mt-6">
            <WantedContactButton
              email={typedPost.user.email}
              postTitle={typedPost.title}
            />
          </div>
        )}
      </div>
    </div>
  );
}

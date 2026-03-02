"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteWantedPost } from "@/actions/wanted";
import { formatDate } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface WantedPost {
  id: string;
  title: string;
  description: string;
  budget_min?: number | null;
  budget_max?: number | null;
  created_at: string;
  category?: { name: string } | null;
}

interface WantedPostsListProps {
  posts: WantedPost[];
  isOwn: boolean;
}

export function WantedPostsList({ posts, isOwn }: WantedPostsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-900 py-8 text-center">
        <p className="text-neutral-500">no wanted posts</p>
        {isOwn && (
          <a href="/wanted/new" className="mt-2 block text-sm text-primary-400 hover:underline">
            + post to wanted
          </a>
        )}
      </div>
    );
  }

  function handleDelete(postId: string) {
    setDeletingId(postId);
    startTransition(async () => {
      await deleteWantedPost(postId);
      setDeletingId(null);
      setConfirmId(null);
    });
  }

  return (
    <>
      <div className="space-y-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="flex items-start justify-between gap-4 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-neutral-100">{post.title}</p>
              <p className="mt-0.5 line-clamp-2 text-sm text-neutral-400">{post.description}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                {post.category && (
                  <span className="rounded bg-neutral-800 px-2 py-0.5">{post.category.name}</span>
                )}
                {(post.budget_min || post.budget_max) && (
                  <span>
                    budget:{" "}
                    {post.budget_min ? formatPrice(post.budget_min) : ""}
                    {post.budget_min && post.budget_max ? " – " : ""}
                    {post.budget_max ? formatPrice(post.budget_max) : ""}
                  </span>
                )}
                <span>{formatDate(post.created_at)}</span>
              </div>
            </div>
            {isOwn && (
              <button
                onClick={() => setConfirmId(post.id)}
                disabled={isPending && deletingId === post.id}
                className="shrink-0 rounded-md p-1.5 text-neutral-600 transition-colors hover:bg-red-950 hover:text-red-400"
                title="delete wanted post"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <Modal
        isOpen={!!confirmId}
        onClose={() => setConfirmId(null)}
        title="delete wanted post"
      >
        <p className="text-sm text-neutral-400">
          are you sure you want to delete this wanted post? this action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setConfirmId(null)} disabled={isPending}>
            cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => confirmId && handleDelete(confirmId)}
            loading={isPending}
          >
            delete
          </Button>
        </div>
      </Modal>
    </>
  );
}

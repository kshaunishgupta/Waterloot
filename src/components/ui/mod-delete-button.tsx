"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { removeListing, removeWantedPost } from "@/actions/admin";

interface ModDeleteButtonProps {
  type: "listing" | "wanted";
  id: string;
  /** Extra classes on the trigger button (position, z-index, etc.) */
  className?: string;
}

export function ModDeleteButton({ type, id, className = "" }: ModDeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      if (type === "listing") await removeListing(id);
      else await removeWantedPost(id);
      setOpen(false);
    });
  }

  return (
    <>
      <button
        type="button"
        title="remove (mod)"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className={`flex items-center justify-center bg-red-700 p-1.5 text-white transition-colors hover:bg-red-600 ${className}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="remove (mod)">
        <p className="text-sm text-neutral-400">
          remove this {type === "listing" ? "listing" : "wanted post"} from the
          platform? it will be hidden from all users. this action can be undone
          from the admin panel.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setOpen(false)} disabled={isPending}>
            cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} loading={isPending}>
            remove
          </Button>
        </div>
      </Modal>
    </>
  );
}

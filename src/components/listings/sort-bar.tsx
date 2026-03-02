"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { SORT_OPTIONS } from "@/lib/constants";

interface SortBarProps {
  currentSort: string;
}

export function SortBar({ currentSort }: SortBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setSort = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "newest") {
        params.delete("sort");
      } else {
        params.set("sort", value);
      }
      params.delete("page");
      router.push(`/browse?${params.toString()}`);
    },
    [router, searchParams]
  );

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 border-b border-neutral-800 pb-4">
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-widest text-neutral-500">
        sort by
      </span>
      <div className="flex flex-wrap gap-1.5">
        {SORT_OPTIONS.map((option) => {
          const isActive = currentSort === option.value;
          return (
            <button
              key={option.value}
              onClick={() => setSort(option.value)}
              className={cn(
                "border px-3 py-1 text-xs font-medium transition-colors",
                isActive
                  ? "border-primary-500 bg-primary-600 text-white"
                  : "border-neutral-700 bg-neutral-900 text-neutral-400 hover:border-neutral-500 hover:text-white"
              )}
            >
              {option.label.toLowerCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

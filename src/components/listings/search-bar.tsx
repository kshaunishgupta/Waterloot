"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";

interface SearchBarProps {
  defaultValue?: string;
}

export function SearchBar({ defaultValue = "" }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(defaultValue);
  const debouncedQuery = useDebounce(query, 300);

  const updateSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set("q", value.trim());
      } else {
        params.delete("q");
      }
      // Reset page on new search
      params.delete("page");
      router.push(`/browse?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Update URL when debounced value changes
  useEffect(() => {
    // Only update if the debounced query differs from the current URL param
    const currentQ = searchParams.get("q") || "";
    if (debouncedQuery.trim() !== currentQ) {
      updateSearch(debouncedQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const handleClear = () => {
    setQuery("");
    // Immediately clear search without waiting for debounce
    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("page");
    router.push(`/browse?${params.toString()}`);
  };

  return (
    <div className="relative w-full">
      {/* Search icon */}
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
        <Search className="h-4 w-4 text-neutral-400" />
      </div>

      {/* Input */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search listings..."
        className={cn(
          "block w-full border border-neutral-700 bg-neutral-800 py-2.5 pl-10 pr-10 text-sm text-neutral-100",
          "placeholder:text-neutral-500",
          "transition-colors",
          "focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        )}
        aria-label="Search listings"
      />

      {/* Clear button */}
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-neutral-400 hover:text-neutral-200"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

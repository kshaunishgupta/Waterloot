"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DATE_FILTERS, CONDITIONS } from "@/lib/constants";
import type { Category } from "@/lib/types";

interface CurrentFilters {
  category?: string;
  date?: string;
  condition?: string;
  min_budget?: string;
  max_budget?: string;
}

interface WantedFiltersProps {
  categories: Category[];
  currentFilters: CurrentFilters;
}

export function WantedFilters({ categories, currentFilters }: WantedFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [localMin, setLocalMin] = useState(currentFilters.min_budget || "");
  const [localMax, setLocalMax] = useState(currentFilters.max_budget || "");

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(`/wanted?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const toggleCategory = useCallback(
    (slug: string) => {
      const current = currentFilters.category
        ? currentFilters.category.split(",").filter(Boolean)
        : [];
      const updated = current.includes(slug)
        ? current.filter((s) => s !== slug)
        : [...current, slug];
      updateParam("category", updated.length > 0 ? updated.join(",") : null);
    },
    [currentFilters.category, updateParam]
  );

  const applyBudget = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (localMin) params.set("min_budget", localMin); else params.delete("min_budget");
    if (localMax) params.set("max_budget", localMax); else params.delete("max_budget");
    router.push(`/wanted?${params.toString()}`, { scroll: false });
  }, [router, searchParams, localMin, localMax]);

  const clearFilters = useCallback(() => {
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    if (q) params.set("q", q);
    setLocalMin("");
    setLocalMax("");
    router.push(`/wanted?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const selectedCategories = currentFilters.category
    ? currentFilters.category.split(",").filter(Boolean)
    : [];

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    currentFilters.date ||
    currentFilters.condition ||
    currentFilters.min_budget ||
    currentFilters.max_budget;

  // Same housing split as browse
  const housingParent = categories.find((c) => c.slug === "housing");
  const housingSubcategories = housingParent
    ? categories.filter(
        (c) => c.parent_id === housingParent.id && c.slug !== "wanted-housing"
      )
    : [];
  const housingIds = new Set(
    [housingParent?.id, ...housingSubcategories.map((c) => c.id)].filter(Boolean)
  );
  const regularCategories = categories.filter(
    (c) => !housingIds.has(c.id) && !c.parent_id
  );

  return (
    <aside className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-100">
          <SlidersHorizontal className="h-4 w-4" />
          filters
        </h2>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs font-medium text-primary-400 hover:text-primary-300"
          >
            <X className="h-3 w-3" />
            clear all
          </button>
        )}
      </div>

      {/* Category */}
      <FilterSection title="category">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateParam("category", null)}
            className={cn(
              "border px-3 py-1.5 text-xs font-medium transition-colors",
              selectedCategories.length === 0
                ? "border-primary-500 bg-primary-600 text-white"
                : "border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-neutral-600 hover:text-white"
            )}
          >
            all
          </button>
          {regularCategories.map((cat) => {
            const isSelected = selectedCategories.includes(cat.slug);
            return (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.slug)}
                className={cn(
                  "border px-3 py-1.5 text-xs font-medium transition-colors",
                  isSelected
                    ? "border-primary-500 bg-primary-600 text-white"
                    : "border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-neutral-600 hover:text-white"
                )}
              >
                {cat.name.toLowerCase()}
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Housing */}
      {housingSubcategories.length > 0 && (
        <FilterSection title="housing">
          <div className="flex flex-wrap gap-2">
            {housingSubcategories.map((cat) => {
              const isSelected = selectedCategories.includes(cat.slug);
              return (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.slug)}
                  className={cn(
                    "border px-3 py-1.5 text-xs font-medium transition-colors",
                    isSelected
                      ? "border-primary-500 bg-primary-600 text-white"
                      : "border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-neutral-600 hover:text-white"
                  )}
                >
                  {cat.name.toLowerCase()}
                </button>
              );
            })}
          </div>
        </FilterSection>
      )}

      {/* Condition */}
      <FilterSection title="condition">
        <div className="space-y-1.5">
          {CONDITIONS.map((cond) => {
            const selectedConditions = currentFilters.condition
              ? currentFilters.condition.split(",")
              : [];
            const isChecked = selectedConditions.includes(cond.value);
            return (
              <label
                key={cond.value}
                className="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm hover:bg-neutral-800"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {
                    const updated = isChecked
                      ? selectedConditions.filter((c) => c !== cond.value)
                      : [...selectedConditions, cond.value];
                    updateParam("condition", updated.length > 0 ? updated.join(",") : null);
                  }}
                  className="h-4 w-4 border-neutral-600 bg-neutral-800 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-neutral-300">{cond.label.toLowerCase()}</span>
              </label>
            );
          })}
        </div>
      </FilterSection>

      {/* Budget Range */}
      <FilterSection title="budget range">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="min"
            min={0}
            value={localMin}
            onChange={(e) => {
              const val = e.target.value;
              setLocalMin(val);
              if (val === "") {
                const params = new URLSearchParams(searchParams.toString());
                params.delete("min_budget");
                router.push(`/wanted?${params.toString()}`, { scroll: false });
              }
            }}
            onKeyDown={(e) => e.key === "Enter" && applyBudget()}
            className="text-sm"
          />
          <span className="text-neutral-500">—</span>
          <Input
            type="number"
            placeholder="max"
            min={0}
            value={localMax}
            onChange={(e) => {
              const val = e.target.value;
              setLocalMax(val);
              if (val === "") {
                const params = new URLSearchParams(searchParams.toString());
                params.delete("max_budget");
                router.push(`/wanted?${params.toString()}`, { scroll: false });
              }
            }}
            onKeyDown={(e) => e.key === "Enter" && applyBudget()}
            className="text-sm"
          />
          <button
            onClick={applyBudget}
            className="shrink-0 border border-neutral-700 px-2.5 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:border-neutral-500 hover:text-white"
          >
            confirm
          </button>
        </div>
      </FilterSection>

      {/* Date Posted */}
      <FilterSection title="date posted">
        <div className="space-y-1.5">
          {DATE_FILTERS.map((df) => (
            <label
              key={df.value}
              className="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm hover:bg-neutral-800"
            >
              <input
                type="radio"
                name="wanted-date"
                checked={df.value === "" ? !currentFilters.date : currentFilters.date === df.value}
                onChange={() => updateParam("date", df.value === "" ? null : df.value)}
                className="h-4 w-4 border-neutral-600 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-neutral-300">{df.label.toLowerCase()}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {hasActiveFilters && (
        <Button variant="secondary" size="sm" onClick={clearFilters} className="w-full">
          clear all filters
        </Button>
      )}
    </aside>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold tracking-wider text-neutral-500">
        {title}
      </h3>
      {children}
    </div>
  );
}

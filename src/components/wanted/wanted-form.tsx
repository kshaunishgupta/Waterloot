"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { wantedPostSchema } from "@/lib/validators/wanted";
import type { Category } from "@/lib/types";
import type { ZodError } from "zod";

interface WantedFormProps {
  categories: Category[];
  onSubmit: (data: any) => Promise<{ error?: string } | void>;
}

interface FieldErrors {
  [key: string]: string | undefined;
}

export function WantedForm({ categories, onSubmit }: WantedFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const categoryOptions = [
    { value: "", label: "Any Category" },
    ...categories.map((c) => ({ value: c.id, label: c.name })),
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitError(null);

    const formData = {
      title: title.trim(),
      description: description.trim(),
      category_id: categoryId || null,
      budget_min: budgetMin ? parseFloat(budgetMin) : null,
      budget_max: budgetMax ? parseFloat(budgetMax) : null,
    };

    const result = wantedPostSchema.safeParse(formData);
    if (!result.success) {
      const zodError = result.error as ZodError;
      const fieldErrors: FieldErrors = {};
      for (const issue of zodError.issues) {
        const fieldName = issue.path[0] as string;
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await onSubmit(result.data);
      if (res && res.error) {
        setSubmitError(res.error);
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {submitError}
        </div>
      )}

      <Input
        label="What are you looking for?"
        placeholder="e.g., MATH 137 textbook, used desk lamp"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={errors.title}
        maxLength={120}
        required
      />

      <Textarea
        label="Description"
        placeholder="Provide more details about the item you're looking for..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        error={errors.description}
        rows={4}
        maxLength={1000}
        required
      />

      <Select
        label="Category (optional)"
        options={categoryOptions}
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        error={errors.category_id}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Min Budget (CAD)"
          type="number"
          placeholder="0"
          min={0}
          value={budgetMin}
          onChange={(e) => setBudgetMin(e.target.value)}
          error={errors.budget_min}
        />
        <Input
          label="Max Budget (CAD)"
          type="number"
          placeholder="100"
          min={0}
          value={budgetMax}
          onChange={(e) => setBudgetMax(e.target.value)}
          error={errors.budget_max}
        />
      </div>

      <Button type="submit" size="lg" className="w-full" loading={submitting}>
        Post Wanted Listing
      </Button>
    </form>
  );
}

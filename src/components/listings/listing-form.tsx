"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { ImageUpload } from "@/components/listings/image-upload";
import { listingSchema } from "@/lib/validators/listing";
import { CONDITIONS } from "@/lib/constants";
import type { Category, Listing } from "@/lib/types";
import type { ZodError } from "zod";

interface ListingFormProps {
  categories: Category[];
  initialData?: Partial<Listing>;
  onSubmit: (data: any) => Promise<{ error?: string; success?: boolean } | void>;
  isEditing?: boolean;
}

interface FieldErrors {
  [key: string]: string | undefined;
}

export function ListingForm({ categories, initialData, onSubmit, isEditing = false }: ListingFormProps) {
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [price, setPrice] = useState<string>(
    initialData?.price != null ? String(initialData.price) : ""
  );
  const [condition, setCondition] = useState(initialData?.condition ?? "");
  const [images, setImages] = useState<string[]>(initialData?.images ?? []);

  // Textbook fields
  const [isbn, setIsbn] = useState(initialData?.isbn ?? "");
  const [bookTitle, setBookTitle] = useState(initialData?.book_title ?? "");
  const [bookAuthor, setBookAuthor] = useState(initialData?.book_author ?? "");
  const [bookEdition, setBookEdition] = useState(initialData?.book_edition ?? "");
  const [courseCode, setCourseCode] = useState(initialData?.course_code ?? "");

  // Contact fields
  const [instagram, setInstagram] = useState(initialData?.instagram ?? "");
  const [discord, setDiscord] = useState(initialData?.discord ?? "");
  const [contactPhone, setContactPhone] = useState(initialData?.contact_phone ?? "");

  const [isFree, setIsFree] = useState(initialData?.price === 0);
  const [isbnLoading, setIsbnLoading] = useState(false);
  const [isbnError, setIsbnError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const isTextbook =
    selectedCategory?.slug === "textbooks" ||
    selectedCategory?.name.toLowerCase() === "textbooks";

  useEffect(() => {
    if (!isTextbook) {
      setIsbn(""); setBookTitle(""); setBookAuthor(""); setBookEdition(""); setCourseCode("");
      setIsbnError(null);
    }
  }, [isTextbook]);

  const handleIsbnLookup = async () => {
    const trimmed = isbn.trim();
    if (!trimmed) { setIsbnError("Please enter an ISBN"); return; }
    setIsbnLoading(true);
    setIsbnError(null);
    try {
      const res = await fetch(`/api/isbn?isbn=${encodeURIComponent(trimmed)}`);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "ISBN lookup failed");
      }
      const data = await res.json();
      if (data.title) setBookTitle(data.title);
      if (data.author) setBookAuthor(data.author);
      if (data.edition) setBookEdition(data.edition);
    } catch (err) {
      setIsbnError(err instanceof Error ? err.message : "ISBN lookup failed");
    } finally {
      setIsbnLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitError(null);

    const formData = {
      title: title.trim(),
      description: description.trim(),
      category_id: categoryId,
      price: Math.round((parseFloat(price) || 0) * 100) / 100,
      condition,
      images,
      ...(isTextbook && {
        isbn: isbn.trim() || undefined,
        book_title: bookTitle.trim() || undefined,
        book_author: bookAuthor.trim() || undefined,
        book_edition: bookEdition.trim() || undefined,
        course_code: courseCode.trim() || undefined,
      }),
      instagram: instagram.trim() || undefined,
      discord: discord.trim() || undefined,
      contact_phone: contactPhone.trim() || undefined,
    };

    const result = listingSchema.safeParse(formData);
    if (!result.success) {
      const zodError = result.error as ZodError;
      const fieldErrors: FieldErrors = {};
      for (const issue of zodError.issues) {
        const fieldName = issue.path[0] as string;
        if (!fieldErrors[fieldName]) fieldErrors[fieldName] = issue.message;
      }
      setErrors(fieldErrors);
      setTimeout(() => {
        formRef.current
          ?.querySelector('[aria-invalid="true"], [role="alert"]')
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return;
    }

    setSubmitting(true);
    try {
      const res = await onSubmit(result.data);
      if (res && res.error) setSubmitError(res.error);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const categoryOptions = categories
    .filter((c) => {
      if (c.slug === "housing" || c.slug === "wanted-housing") return false;
      if (c.parent_id) return false;
      return true;
    })
    .sort((a, b) => {
      const aIsOther = a.slug === "other" || a.name.toLowerCase() === "other";
      const bIsOther = b.slug === "other" || b.name.toLowerCase() === "other";
      if (aIsOther && !bIsOther) return 1;
      if (!aIsOther && bIsOther) return -1;
      return 0;
    })
    .map((c) => ({ value: c.id, label: c.name }));
  const conditionOptions = CONDITIONS.map((c) => ({ value: c.value, label: c.label }));

  // Form section label style
  const labelClass = "mb-1.5 block text-sm font-medium text-neutral-200";
  // Sub-card style (textbook/contact sections)
  const subCard = "space-y-4 rounded-lg border border-neutral-700 bg-neutral-800 p-4";

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <div className="rounded-lg border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-400">
          {submitError}
        </div>
      )}

      <div>
        <label className={labelClass}>title</label>
        <Input
          placeholder="what are you selling?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          maxLength={120}
          required
        />
      </div>

      <div>
        <label className={labelClass}>category</label>
        <Select
          placeholder="select a category"
          options={categoryOptions}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          error={errors.category_id}
          required
        />
      </div>

      <div>
        <label className={labelClass}>description</label>
        <Textarea
          placeholder="describe your item in detail..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          rows={5}
          maxLength={2000}
          required
        />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="text-sm font-medium text-neutral-200">price (CAD)</label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-400">
            <input
              type="checkbox"
              checked={isFree}
              onChange={(e) => {
                const checked = e.target.checked;
                setIsFree(checked);
                if (checked) setPrice("0");
              }}
              className="h-4 w-4 border-neutral-600 bg-neutral-800 text-primary-600 focus:ring-primary-500"
            />
            free
          </label>
        </div>
        <Input
          type="number"
          placeholder="0.00"
          min={0}
          max={99999}
          step={0.01}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onWheel={(e) => (e.target as HTMLInputElement).blur()}
          error={errors.price}
          disabled={isFree}
          required
        />
      </div>

      <div>
        <label className={labelClass}>condition</label>
        <Select
          placeholder="select condition"
          options={conditionOptions}
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          error={errors.condition}
          required
        />
      </div>

      <div>
        <label className={labelClass}>photos (optional)</label>
        <ImageUpload
          images={images}
          onChange={setImages}
          userId={initialData?.seller_id ?? ""}
        />
        {errors.images && (
          <p className="mt-1.5 text-sm text-red-400">{errors.images}</p>
        )}
      </div>

      {/* Textbook Fields */}
      {isTextbook && (
        <div className={subCard}>
          <h3 className="text-sm font-semibold text-neutral-200">textbook details</h3>
          <div>
            <label className={labelClass}>isbn</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="e.g., 978-0-13-468599-1"
                  value={isbn}
                  onChange={(e) => { setIsbn(e.target.value); setIsbnError(null); }}
                  error={isbnError ?? errors.isbn}
                />
              </div>
              <Button type="button" variant="secondary" size="md" onClick={handleIsbnLookup} disabled={isbnLoading || !isbn.trim()}>
                {isbnLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                lookup
              </Button>
            </div>
          </div>
          <div><label className={labelClass}>book title</label><Input placeholder="book title" value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} error={errors.book_title} /></div>
          <div><label className={labelClass}>author</label><Input placeholder="author name" value={bookAuthor} onChange={(e) => setBookAuthor(e.target.value)} error={errors.book_author} /></div>
          <div><label className={labelClass}>edition</label><Input placeholder="e.g., 4th edition" value={bookEdition} onChange={(e) => setBookEdition(e.target.value)} error={errors.book_edition} /></div>
          <div><label className={labelClass}>course code</label><Input placeholder="e.g., CS 135" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} error={errors.course_code} maxLength={20} /></div>
        </div>
      )}

      {/* Contact Fields */}
      <div className={subCard}>
        <div>
          <h3 className="text-sm font-semibold text-neutral-200">additional contact (optional)</h3>
          <p className="mt-0.5 text-xs text-neutral-500">buyers will see these after signing in to contact you.</p>
        </div>
        <div><label className={labelClass}>instagram username</label><Input placeholder="@yourhandle" value={instagram} onChange={(e) => setInstagram(e.target.value)} error={errors.instagram} maxLength={30} /></div>
        <div><label className={labelClass}>discord username</label><Input placeholder="username#0000 or username" value={discord} onChange={(e) => setDiscord(e.target.value)} error={errors.discord} maxLength={40} /></div>
        <div><label className={labelClass}>phone number</label><Input placeholder="+1 (519) 000-0000" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} error={errors.contact_phone} maxLength={20} /></div>
      </div>

      <Button type="submit" size="lg" className="w-full" loading={submitting}>
        {isEditing ? "update listing" : "create listing"}
      </Button>
    </form>
  );
}

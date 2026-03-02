import { z } from "zod";

export const listingSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title must be 120 characters or less"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be 2000 characters or less"),
  category_id: z.string().uuid("Please select a category"),
  price: z.coerce
    .number()
    .min(0, "Price must be 0 or more")
    .max(99999, "Price must be under $100,000"),
  condition: z.enum(["new", "like_new", "good", "fair"], {
    errorMap: () => ({ message: "Please select a condition" }),
  }),
  // Images no longer required (min 0)
  images: z
    .array(z.string().url())
    .max(6, "Maximum 6 images allowed")
    .default([]),

  // Textbook-specific fields
  isbn: z.string().optional(),
  book_title: z.string().optional(),
  book_author: z.string().optional(),
  book_edition: z.string().optional(),
  course_code: z.string().max(20).optional(),

  // Contact fields
  instagram: z.string().max(30).optional(),
  discord: z.string().max(40).optional(),
  contact_phone: z.string().max(20).optional(),
});

export type ListingInput = z.infer<typeof listingSchema>;

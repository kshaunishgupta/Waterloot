import { z } from "zod";

export const reviewSchema = z.object({
  seller_id: z.string().uuid(),
  listing_id: z.string().uuid().optional().nullable(),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string().max(500, "Comment must be 500 characters or less").optional().nullable(),
  is_anonymous: z.boolean().default(false),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

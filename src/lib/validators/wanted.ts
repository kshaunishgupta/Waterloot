import { z } from "zod";

export const wantedPostSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title must be 120 characters or less"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be 1000 characters or less"),
  category_id: z.string().uuid().optional().nullable(),
  budget_min: z.coerce.number().min(0).optional().nullable(),
  budget_max: z.coerce.number().min(0).optional().nullable(),
});

export type WantedPostInput = z.infer<typeof wantedPostSchema>;

import { z } from "zod";

export const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be 100 characters or less"),
  bio: z.string().max(500, "Bio must be 500 characters or less").optional(),
  phone: z
    .string()
    .max(20)
    .optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;

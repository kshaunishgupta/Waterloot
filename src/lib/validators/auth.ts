import { z } from "zod";

export const signupSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .refine(
      (email) => email.endsWith("@uwaterloo.ca"),
      "You must use your @uwaterloo.ca email address"
    ),
  password: z.string().min(8, "Password must be at least 8 characters"),
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be 100 characters or less"),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .refine(
      (email) => email.endsWith("@uwaterloo.ca"),
      "You must use your @uwaterloo.ca email address"
    ),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

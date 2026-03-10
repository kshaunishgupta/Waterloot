"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { forgotPasswordSchema } from "@/lib/validators/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ForgotPasswordFormProps {
  onSubmit: (data: { email: string }) => Promise<void>;
  error?: string;
}

export function ForgotPasswordForm({
  onSubmit,
  error,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFieldErrors({});

    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (field && !errors[field as string]) {
          errors[field as string] = issue.message;
        }
      }
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(result.data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <p className="mb-4 text-sm text-gray-600">
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </p>
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
          autoComplete="email"
          required
        />
      </div>

      <Button type="submit" loading={loading} className="w-full">
        Send Reset Link
      </Button>

      <p className="text-center text-sm text-gray-600">
        <Link
          href="/login"
          className="font-medium text-primary-600 transition-colors hover:text-primary-700"
        >
          Back to Log In
        </Link>
      </p>
    </form>
  );
}

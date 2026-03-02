"use client";

import { useState } from "react";
import { resetPassword } from "@/actions/auth";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Mail } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string>("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(data: { email: string }) {
    setError("");
    const result = await resetPassword(data);
    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="border border-neutral-700 bg-neutral-900 p-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center bg-primary-900/30">
          <Mail className="h-8 w-8 text-primary-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">
          check your email
        </h1>
        <p className="mt-3 text-sm text-neutral-400">
          if an account exists with that email, we sent a password reset link.
        </p>
        <div className="mt-8">
          <Link
            href="/login"
            className="text-sm font-medium text-primary-400 hover:underline"
          >
            back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-neutral-700 bg-neutral-900 p-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white">
          reset your password
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          enter your email and we&apos;ll send you a reset link
        </p>
      </div>
      <ForgotPasswordForm onSubmit={handleSubmit} error={error} />
    </div>
  );
}

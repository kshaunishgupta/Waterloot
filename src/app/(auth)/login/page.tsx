"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "@/actions/auth";
import { LoginForm } from "@/components/auth/login-form";
import { Suspense } from "react";

function LoginPageContent() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || undefined;
  const [error, setError] = useState<string>("");

  async function handleSubmit(data: { email: string; password: string; next?: string }) {
    setError("");
    const result = await signIn({ ...data, next });
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Welcome back</h1>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          Log in to your Waterloot account
        </p>
      </div>
      <LoginForm onSubmit={handleSubmit} error={error} />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}

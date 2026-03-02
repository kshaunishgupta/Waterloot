"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/actions/auth";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  const [error, setError] = useState<string>("");
  const router = useRouter();

  async function handleSubmit(data: {
    email: string;
    password: string;
    full_name: string;
  }) {
    setError("");
    const result = await signUp(data);
    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      router.push("/verify-email");
    }
  }

  return (
    <div className="border border-neutral-700 bg-neutral-900 p-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white">
          create your account
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          join waterloot with your uwaterloo email
        </p>
      </div>
      <SignupForm onSubmit={handleSubmit} error={error} />
    </div>
  );
}

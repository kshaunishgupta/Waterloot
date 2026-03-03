"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updatePasswordAfterReset } from "@/actions/auth";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("passwords do not match");
      return;
    }

    startTransition(async () => {
      const result = await updatePasswordAfterReset({ password });
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/browse");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-200">
          new password
        </label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-200">
          confirm new password
        </label>
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          required
        />
      </div>
      <Button type="submit" className="w-full" loading={isPending}>
        set new password
      </Button>
    </form>
  );
}

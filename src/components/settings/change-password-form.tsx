"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { changePassword } from "@/actions/auth";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword.length < 8) {
      setError("new password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("passwords do not match");
      return;
    }

    startTransition(async () => {
      const result = await changePassword({ currentPassword, newPassword });
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      {success && (
        <p className="text-sm text-green-400">password updated successfully.</p>
      )}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-200">
          current password
        </label>
        <Input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-200">
          new password
        </label>
        <Input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
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
      <Button type="submit" variant="default" loading={isPending}>
        update password
      </Button>
    </form>
  );
}

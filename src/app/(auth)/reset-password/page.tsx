"use client";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="border border-neutral-700 bg-neutral-900 p-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white">set new password</h1>
        <p className="mt-2 text-sm text-neutral-400">
          choose a new password for your account
        </p>
      </div>
      <ResetPasswordForm />
    </div>
  );
}

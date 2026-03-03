"use client";

import { Suspense, useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { KeyRound } from "lucide-react";

function ConfirmContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tokenHash = searchParams.get("token_hash");
  const next = searchParams.get("next") ?? "/reset-password";

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    if (!tokenHash) {
      setError("invalid reset link. please request a new one.");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: "recovery",
      });

      if (error) {
        setError("this link has expired or already been used. please request a new one.");
      } else {
        router.replace(next);
      }
    });
  }

  return (
    <div className="border border-neutral-700 bg-neutral-900 p-8 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center bg-primary-900/30">
        <KeyRound className="h-8 w-8 text-primary-400" />
      </div>
      <h1 className="text-2xl font-bold text-white">reset your password</h1>
      <p className="mt-3 text-sm text-neutral-400">
        click the button below to continue to the password reset form.
      </p>

      {error && (
        <p className="mt-4 text-sm text-red-400">{error}</p>
      )}

      <div className="mt-8">
        <Button onClick={handleConfirm} loading={isPending} className="w-full">
          continue to reset password
        </Button>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="border border-neutral-700 bg-neutral-900 p-8 text-center">
        <h1 className="text-2xl font-bold text-white">loading...</h1>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Supabase sends auth errors (e.g. expired reset links) as hash fragments to
// the Site URL. Since hashes are client-side only, we detect them here and
// forward the user to a useful page instead of silently failing.
export function AuthErrorRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash.includes("error=")) return;

    const params = new URLSearchParams(hash.slice(1)); // strip leading #
    const errorCode = params.get("error_code");

    if (errorCode === "otp_expired") {
      router.replace("/forgot-password?expired=1");
    } else if (params.get("error")) {
      router.replace("/login?error=auth");
    }
  }, [router]);

  return null;
}

import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ChangePasswordForm } from "@/components/settings/change-password-form";

export const metadata: Metadata = {
  title: "settings — waterloot",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="mb-8 text-2xl font-bold text-white">settings</h1>

      <div className="space-y-6">
        {/* Profile */}
        <section className="rounded-xl border border-neutral-700 bg-neutral-900 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">profile</h2>
          <p className="text-sm text-neutral-400">
            update your profile information and avatar.
          </p>
          <Link
            href="/profile"
            className="mt-4 inline-block rounded-lg border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800"
          >
            edit profile
          </Link>
        </section>

        {/* Wanted Posts */}
        <section className="rounded-xl border border-neutral-700 bg-neutral-900 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">wanted posts</h2>
          <p className="text-sm text-neutral-400">
            manage your wanted posts — view or delete them from your profile.
          </p>
          <Link
            href="/profile#wanted-posts"
            className="mt-4 inline-block rounded-lg border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800"
          >
            manage wanted posts
          </Link>
        </section>

        {/* Password */}
        <section className="rounded-xl border border-neutral-700 bg-neutral-900 p-6">
          <h2 className="mb-1 text-lg font-semibold text-white">change password</h2>
          <p className="text-sm text-neutral-400">
            choose a new password for your account.
          </p>
          <ChangePasswordForm />
        </section>

        {/* Admin panel — only shown to admins */}
        {isAdmin && (
          <section className="rounded-xl border border-primary-700 bg-neutral-900 p-6">
            <h2 className="mb-4 text-lg font-semibold text-primary-400">admin panel</h2>
            <p className="text-sm text-neutral-400">
              manage listings, users, and reports.
            </p>
            <Link
              href="/admin"
              className="mt-4 inline-block rounded-lg border border-primary-600 px-4 py-2 text-sm font-medium text-primary-400 transition-colors hover:bg-primary-600 hover:text-white"
            >
              open admin panel
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}

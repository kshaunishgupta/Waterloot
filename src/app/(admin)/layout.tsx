import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import Link from "next/link";
import { LayoutDashboard, Users, ShoppingBag, Flag } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/browse");

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950">
      <Navbar
        user={
          profile
            ? {
                id: profile.id,
                full_name: profile.full_name,
                avatar_url: profile.avatar_url,
                role: profile.role,
              }
            : null
        }
      />
      <div className="flex flex-1">
        {/* Admin Sidebar */}
        <aside className="hidden w-64 border-r border-neutral-800 bg-neutral-950 p-4 lg:block">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            admin panel
          </h2>
          <nav className="space-y-1">
            <AdminNavLink href="/admin" icon={<LayoutDashboard className="h-4 w-4" />}>
              dashboard
            </AdminNavLink>
            <AdminNavLink href="/admin/users" icon={<Users className="h-4 w-4" />}>
              users
            </AdminNavLink>
            <AdminNavLink href="/admin/listings" icon={<ShoppingBag className="h-4 w-4" />}>
              listings
            </AdminNavLink>
            <AdminNavLink href="/admin/reports" icon={<Flag className="h-4 w-4" />}>
              reports
            </AdminNavLink>
          </nav>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

function AdminNavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-800 transition-colors"
    >
      {icon}
      {children}
    </Link>
  );
}

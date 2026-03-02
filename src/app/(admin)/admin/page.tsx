import { createAdminClient } from "@/lib/supabase/admin";
import { Users, ShoppingBag, Flag, TrendingUp } from "lucide-react";

export default async function AdminDashboardPage() {
  const admin = createAdminClient();

  const [
    { count: userCount },
    { count: listingCount },
    { count: activeListingCount },
    { count: reportCount },
  ] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("listings").select("*", { count: "exact", head: true }),
    admin
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    admin
      .from("reports")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">
        admin dashboard
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Users className="h-5 w-5 text-primary-600" />}
          label="Total Users"
          value={userCount || 0}
        />
        <StatCard
          icon={<ShoppingBag className="h-5 w-5 text-green-600" />}
          label="Active Listings"
          value={activeListingCount || 0}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
          label="Total Listings"
          value={listingCount || 0}
        />
        <StatCard
          icon={<Flag className="h-5 w-5 text-red-600" />}
          label="Pending Reports"
          value={reportCount || 0}
        />
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="border border-neutral-800 bg-neutral-900 p-6">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm font-medium text-neutral-500">{label.toLowerCase()}</span>
      </div>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

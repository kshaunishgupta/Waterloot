"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { resolveReport } from "@/actions/admin";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AdminReport {
  id: string;
  reason: string;
  description: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  reporter: { full_name: string } | null;
  listing: { id: string; title: string } | null;
  reported_user: { id: string; full_name: string } | null;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const supabase = createClient();

  useEffect(() => {
    async function fetchReports() {
      const { data } = await supabase
        .from("reports")
        .select(
          `
          *,
          reporter:profiles!reporter_id(full_name),
          listing:listings!listing_id(id, title),
          reported_user:profiles!reported_user_id(id, full_name)
        `
        )
        .order("created_at", { ascending: false });
      setReports((data as any) || []);
      setLoading(false);
    }
    fetchReports();
  }, [supabase]);

  const filteredReports =
    statusFilter === "all"
      ? reports
      : reports.filter((r) => r.status === statusFilter);

  async function handleResolve(reportId: string) {
    const notes = prompt("Add admin notes (optional):");
    await resolveReport(reportId, {
      status: "resolved",
      admin_notes: notes || undefined,
    });
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? { ...r, status: "resolved", admin_notes: notes }
          : r
      )
    );
  }

  async function handleDismiss(reportId: string) {
    await resolveReport(reportId, { status: "dismissed" });
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId ? { ...r, status: "dismissed" } : r
      )
    );
  }

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "warning" as const;
      case "resolved":
        return "success" as const;
      case "dismissed":
        return "secondary" as const;
      default:
        return "secondary" as const;
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900">Reports</h1>

      <div className="mb-4 flex gap-2">
        {["pending", "resolved", "dismissed", "all"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === status
                ? "bg-primary-600 text-white"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto border border-neutral-800 bg-neutral-900">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-800 bg-neutral-950">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">Reporter</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">Target</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">Reason</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">Date</th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">Loading...</td>
              </tr>
            ) : filteredReports.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">No reports found</td>
              </tr>
            ) : (
              filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-neutral-800">
                  <td className="px-4 py-3 text-neutral-700">
                    {report.reporter?.full_name || "Unknown"}
                  </td>
                  <td className="px-4 py-3">
                    {report.listing ? (
                      <Link
                        href={`/listings/${report.listing.id}`}
                        className="text-primary-600 hover:underline"
                      >
                        {report.listing.title}
                      </Link>
                    ) : report.reported_user ? (
                      <span className="text-neutral-700">
                        User: {report.reported_user.full_name}
                      </span>
                    ) : (
                      <span className="text-neutral-400">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">
                      {report.reason.replace("_", " ")}
                    </Badge>
                    {report.description && (
                      <p className="mt-1 text-xs text-neutral-500">
                        {report.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusBadgeVariant(report.status)}>
                      {report.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {formatDate(report.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    {report.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleResolve(report.id)}
                        >
                          Resolve
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDismiss(report.id)}
                        >
                          Dismiss
                        </Button>
                      </div>
                    )}
                    {report.admin_notes && (
                      <p className="mt-1 text-xs text-neutral-400">
                        Note: {report.admin_notes}
                      </p>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

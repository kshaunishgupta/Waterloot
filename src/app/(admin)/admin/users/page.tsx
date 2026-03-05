"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { banUser, unbanUser, promoteToAdmin, demoteToStudent } from "@/actions/admin";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Profile } from "@/lib/types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function fetchUsers() {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      setUsers(data || []);
      setLoading(false);
    }
    fetchUsers();
  }, [supabase]);

  const filteredUsers = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleBan(userId: string) {
    await banUser(userId);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_banned: true } : u))
    );
  }

  async function handleUnban(userId: string) {
    await unbanUser(userId);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_banned: false } : u))
    );
  }

  async function handlePromote(userId: string) {
    await promoteToAdmin(userId);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: "admin" as const } : u))
    );
  }

  async function handleDemote(userId: string) {
    await demoteToStudent(userId);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: "student" as const } : u))
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-white">
        User Management
      </h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full max-w-md border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm text-neutral-200 placeholder-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div className="overflow-x-auto border border-neutral-800 bg-neutral-900">
        <table className="w-full text-sm">
          <thead className="border-b border-neutral-800 bg-neutral-950">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">
                Name
              </th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">
                Email
              </th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">
                Role
              </th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">
                Status
              </th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">
                Joined
              </th>
              <th className="px-4 py-3 text-left font-medium text-neutral-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                  Loading...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-800">
                  <td className="px-4 py-3 font-medium text-neutral-200">
                    {user.full_name}
                  </td>
                  <td className="px-4 py-3 text-neutral-400">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.is_banned ? "destructive" : "success"}>
                      {user.is_banned ? "Banned" : "Active"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {user.is_banned ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleUnban(user.id)}
                        >
                          Unban
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleBan(user.id)}
                        >
                          Ban
                        </Button>
                      )}
                      {user.role === "student" ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handlePromote(user.id)}
                        >
                          Make Admin
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDemote(user.id)}
                        >
                          Remove Admin
                        </Button>
                      )}
                    </div>
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

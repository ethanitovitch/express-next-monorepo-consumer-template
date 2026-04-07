"use client";

import { useState } from "react";
import { Page } from "@/components/dashboard/Page";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import {
  useAdminStats,
  useAdminUsers,
  useImpersonateUser,
  useAddUserCredits,
} from "@/hooks/api/useAdmin";
import { useSession } from "@/lib/auth-client";
import { Users, Search, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { toast } from "sonner";
import type { AdminUser } from "@shared/types/src";

function Pagination({
  page,
  totalPages,
  onPageChange,
  total,
  limit,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  total: number;
  limit: number;
}) {
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
      <p className="text-sm text-muted-foreground">
        Showing {start} to {end} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4 text-foreground" />
        </button>
        <span className="text-sm text-foreground px-2">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded border border-border bg-card hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4 text-foreground" />
        </button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { data: session } = useSession();
  const [usersSearch, setUsersSearch] = useState("");
  const [usersPage, setUsersPage] = useState(1);

  const [isAddCreditsModalOpen, setIsAddCreditsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; email: string } | null>(null);
  const [creditsAmount, setCreditsAmount] = useState("");
  const [creditsReason, setCreditsReason] = useState("");

  const LIMIT = 20;
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: usersData, isLoading: usersLoading } = useAdminUsers({
    page: usersPage,
    limit: LIMIT,
    search: usersSearch || undefined,
  });
  const impersonateMutation = useImpersonateUser();
  const addCreditsMutation = useAddUserCredits();

  const handleImpersonate = (userId: string, userName: string) => {
    impersonateMutation.mutate(userId, {
      onSuccess: (result) => {
        if (result.error) {
          toast.error(result.error.message || "Failed to impersonate user");
        } else {
          toast.success(`Now impersonating ${userName}`);
          window.location.href = "/dashboard";
        }
      },
      onError: () => toast.error("Failed to impersonate user"),
    });
  };

  const handleOpenAddCreditsModal = (user: AdminUser) => {
    setSelectedUser({ id: user.id, email: user.email });
    setCreditsAmount("");
    setCreditsReason("");
    setIsAddCreditsModalOpen(true);
  };

  const handleAddCredits = () => {
    if (!selectedUser) return;
    const amount = parseInt(creditsAmount, 10);
    if (isNaN(amount) || amount < 1) {
      toast.error("Please enter a valid amount");
      return;
    }

    addCreditsMutation.mutate(
      { userId: selectedUser.id, amount, reason: creditsReason || undefined },
      {
        onSuccess: (result) => {
          toast.success(
            `Added ${amount} credits to ${selectedUser.email}. New balance: ${result.newBalance}`,
          );
          setIsAddCreditsModalOpen(false);
          setSelectedUser(null);
        },
        onError: () => toast.error("Failed to add credits"),
      },
    );
  };

  return (
    <Page title="Admin" subtitle="Manage users and credits">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-semibold text-foreground">
                {statsLoading ? "..." : stats?.users ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Card title="Users">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={usersSearch}
            onChange={(e) => {
              setUsersSearch(e.target.value);
              setUsersPage(1);
            }}
            placeholder="Search by email or name..."
            className="w-full pl-10 pr-4 py-2 text-sm text-foreground placeholder-muted-foreground bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
          />
        </div>

        {usersLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading users...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-foreground">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Name</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Credits</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Verified</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Created</th>
                    <th className="text-left py-3 px-4 font-medium text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersData?.data?.map((user: AdminUser) => (
                    <tr key={user.id} className="border-b border-border/50 hover:bg-muted">
                      <td className="py-3 px-4 text-foreground">{user.email}</td>
                      <td className="py-3 px-4 text-muted-foreground">{user.name || "-"}</td>
                      <td className="py-3 px-4 text-muted-foreground">{user.creditBalance}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs rounded-full ${
                            user.emailVerified
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {user.emailVerified ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs rounded-full ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {user.role === "admin" ? "Admin" : "User"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleOpenAddCreditsModal(user)}
                            className="inline-flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline"
                          >
                            <Plus className="h-3 w-3" />
                            Credits
                          </button>
                          {user.id !== session?.user?.id && (
                            <button
                              onClick={() =>
                                handleImpersonate(user.id, user.name || user.email)
                              }
                              disabled={impersonateMutation.isPending}
                              className="text-xs text-[var(--color-primary)] hover:underline disabled:opacity-50"
                            >
                              Impersonate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {usersData?.pagination && usersData.pagination.totalPages > 1 && (
              <Pagination
                page={usersData.pagination.page}
                totalPages={usersData.pagination.totalPages}
                total={usersData.pagination.total}
                limit={usersData.pagination.limit}
                onPageChange={setUsersPage}
              />
            )}
          </>
        )}
      </Card>

      <Modal
        isOpen={isAddCreditsModalOpen}
        onClose={() => {
          setIsAddCreditsModalOpen(false);
          setSelectedUser(null);
        }}
        title="Add Credits"
        subtitle={selectedUser ? `Add interview credits to ${selectedUser.email}` : undefined}
      >
        <div className="space-y-4">
          <Input
            label="Number of Credits"
            type="number"
            min={1}
            value={creditsAmount}
            onChange={(e) => setCreditsAmount(e.target.value)}
            placeholder="Enter amount"
            required
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-foreground">Reason (optional)</label>
            <textarea
              value={creditsReason}
              onChange={(e) => setCreditsReason(e.target.value)}
              placeholder="e.g., Promotional credits..."
              className="w-full rounded-xl border border-border px-3 py-2 text-sm text-foreground outline-none transition focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] resize-none placeholder:text-muted-foreground"
              rows={2}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddCreditsModalOpen(false);
                setSelectedUser(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAddCredits} disabled={addCreditsMutation.isPending || !creditsAmount}>
              Add Credits
            </Button>
          </div>
        </div>
      </Modal>
    </Page>
  );
}

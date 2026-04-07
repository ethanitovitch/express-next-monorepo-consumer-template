import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api";
import { admin } from "@/lib/auth-client";
import type {
  AdminStats,
  AdminUsersResponse,
} from "@shared/types/src";
import { QUERY_KEYS, ENDPOINTS } from "@/lib/config";

export function useAdminStats() {
  return useQuery({
    queryKey: QUERY_KEYS.adminStats(),
    queryFn: async () => {
      return get<AdminStats>(ENDPOINTS.ADMIN.STATS);
    },
  });
}

export function useAdminUsers(params: { page?: number; limit?: number; search?: string } = {}) {
  const { page = 1, limit = 20, search } = params;
  return useQuery({
    queryKey: ["admin", "users", { page, limit, search }],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.set("page", String(page));
      searchParams.set("limit", String(limit));
      if (search) searchParams.set("search", search);
      return get<AdminUsersResponse>(`${ENDPOINTS.ADMIN.USERS}?${searchParams.toString()}`);
    },
  });
}

export function useImpersonateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      return admin.impersonateUser({ userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

export function useStopImpersonation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return admin.stopImpersonating();
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

export function useAddUserCredits() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { userId: string; amount: number; reason?: string }) => {
      return post<{ success: boolean; newBalance: number }>(
        ENDPOINTS.ADMIN.ADD_CREDITS(params.userId),
        { amount: params.amount, reason: params.reason }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}



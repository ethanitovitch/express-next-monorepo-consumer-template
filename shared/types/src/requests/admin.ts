import { z } from 'zod';
import { PaginationRequestSchema, PaginatedResponse } from './pagination';

// Admin Users
export const AdminUsersRequestSchema = PaginationRequestSchema.extend({
  search: z.string().optional(),
});

export type AdminUsersRequest = z.infer<typeof AdminUsersRequestSchema>;

export type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  role: string | null;
  emailVerified: boolean;
  creditBalance: number;
};

export type AdminUsersResponse = PaginatedResponse<AdminUser>;

// Stats
export type AdminStats = {
  users: number;
};

// Add Credits
export const AddUserCreditsRequestSchema = z.object({
  userId: z.string(),
  amount: z.number().int().min(1),
  reason: z.string().optional(),
});

export type AddUserCreditsRequest = z.infer<typeof AddUserCreditsRequestSchema>;


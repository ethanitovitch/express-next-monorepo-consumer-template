import { DBAccount, DBUser } from '@shared/db/src/types';
import { z } from 'zod';

export type AccountResponse = DBAccount;
export type UserResponse = DBUser;

export const GetUserCreditBalanceRequestSchema = z.object({
  userId: z.string(),
});

export type GetUserCreditBalanceRequest = z.infer<
  typeof GetUserCreditBalanceRequestSchema
>;

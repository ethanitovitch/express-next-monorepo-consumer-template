import { db } from '@/lib/db'
import { withIdAndTimestamps } from './utils'

export const getSubscriptionFromStripeSubscriptionId = async (
  subscriptionId: string,
) => {
  return await db
    .selectFrom('subscription')
    .where('stripeSubscriptionId', '=', subscriptionId)
    .selectAll()
    .executeTakeFirst()
}

export const createCreditTransaction = async (
  userId: string,
  paymentInvoiceId: string,
  amount: number,
  metadata: any,
) => {
  return await db
    .insertInto('credit_transaction')
    .values(
      withIdAndTimestamps({
        userId,
        paymentInvoiceId,
        amount: amount,
        type: 'interview',
        metadata: metadata,
      }),
    )
    .execute()
}

export const getUserCreditBalance = async (userId: string) => {
  const result = await db
    .selectFrom('credit_transaction')
    .where('userId', '=', userId)
    .select((eb) => eb.fn.sum<number>('amount').as('balance'))
    .executeTakeFirst()
  return result?.balance ?? 0
}

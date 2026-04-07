import { AuthRequestHandler } from '@/types/handlers'
import { db } from '@/lib/db'
import {
  AdminUsersRequestSchema,
  type AdminUsersResponse,
  type AdminStats,
  type AddUserCreditsRequest,
} from '@shared/types/src'
import { sql } from 'kysely'
import { withIdAndTimestamps } from '@/repositories/utils'

export const getAdminStats: AuthRequestHandler<{}> = async (req, res) => {
  const usersCount = await db
    .selectFrom('user')
    .select(db.fn.countAll().as('count'))
    .executeTakeFirst()

  const response: AdminStats = {
    users: Number(usersCount?.count || 0),
  }

  res.json(response)
}

export const getAdminUsers: AuthRequestHandler<{}> = async (req, res) => {
  const params = AdminUsersRequestSchema.parse(req.query)
  const { page, limit, search } = params
  const offset = (page - 1) * limit

  let query = db
    .selectFrom('user')
    .leftJoin('credit_transaction', 'credit_transaction.userId', 'user.id')
    .select([
      'user.id',
      'user.email',
      'user.name',
      'user.createdAt',
      'user.role',
      'user.emailVerified',
      sql<number>`coalesce(sum("credit_transaction"."amount"), 0)::int`.as(
        'creditBalance',
      ),
    ])
    .groupBy([
      'user.id',
      'user.email',
      'user.name',
      'user.createdAt',
      'user.role',
      'user.emailVerified',
    ])

  if (search) {
    const searchLower = `%${search.toLowerCase()}%`
    query = query.where((eb) =>
      eb.or([
        eb(sql`lower("user"."email")`, 'like', searchLower),
        eb(sql`lower("user"."name")`, 'like', searchLower),
      ]),
    )
  }

  const getCount = async () => {
    if (search) {
      const searchLower = `%${search.toLowerCase()}%`
      const result = await db
        .selectFrom('user')
        .select(sql<number>`count(distinct "user"."id")`.as('count'))
        .where((eb) =>
          eb.or([
            eb(sql`lower("user"."email")`, 'like', searchLower),
            eb(sql`lower("user"."name")`, 'like', searchLower),
          ]),
        )
        .executeTakeFirst()
      return result
    }
    return db
      .selectFrom('user')
      .select(db.fn.countAll().as('count'))
      .executeTakeFirst()
  }

  const [users, totalResult] = await Promise.all([
    query
      .orderBy('user.createdAt', 'desc')
      .limit(limit)
      .offset(offset)
      .execute(),
    getCount(),
  ])

  const total = Number(totalResult?.count || 0)
  const totalPages = Math.ceil(total / limit)

  const response: AdminUsersResponse = {
    data: users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      createdAt: u.createdAt.toISOString(),
      role: u.role,
      emailVerified: u.emailVerified,
      creditBalance: u.creditBalance,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  }

  res.json(response)
}

export const addUserCredits: AuthRequestHandler<
  AddUserCreditsRequest
> = async (req, res) => {
  const { userId, amount, reason } = req.validated

  await db
    .insertInto('credit_transaction')
    .values(
      withIdAndTimestamps({
        userId,
        paymentInvoiceId: `admin-${Date.now()}`,
        amount,
        type: 'interview',
        metadata: JSON.stringify({
          reason: reason || 'Admin credit adjustment',
          addedBy: req.user.id,
          addedByEmail: req.user.email,
        }),
      }),
    )
    .execute()

  const result = await db
    .selectFrom('credit_transaction')
    .where('userId', '=', userId)
    .select((eb) => eb.fn.sum<number>('amount').as('balance'))
    .executeTakeFirst()

  res.json({
    success: true,
    newBalance: result?.balance ?? 0,
  })
}

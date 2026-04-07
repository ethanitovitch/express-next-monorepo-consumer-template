import { findAccountByUserId } from '@/repositories/user.repository'
import { getUserCreditBalance as getUserCreditBalanceRepository } from '@/repositories/subscription.repository'
import { AuthRequestHandler } from '@/types/handlers'
import { GetUserCreditBalanceRequest } from '@shared/types/src'

export const getUser: AuthRequestHandler<{}> = async (req, res) => {
  const user = req.user
  res.json(user)
}

export const getAccount: AuthRequestHandler<{}> = async (req, res) => {
  const account = await findAccountByUserId(req.user.id)
  res.json(account)
}

export const getUserCreditBalance: AuthRequestHandler<
  GetUserCreditBalanceRequest
> = async (req, res) => {
  if (req.user.id !== req.validated.userId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' })
  }
  const balance = await getUserCreditBalanceRepository(req.validated.userId)
  return res.json({ balance })
}

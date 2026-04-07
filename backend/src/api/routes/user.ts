import { Router } from 'express'
import {
  getUser,
  getAccount,
  getUserCreditBalance,
} from '@/api/controllers/user.controller'
import { authenticatedRoute } from './utils'
import { withBetterAuth } from '../middlewares/auth'
import { validateAndMerge } from '../middlewares/validationMiddleware'
import { GetUserCreditBalanceRequestSchema } from '@shared/types/src'

const router = Router()

router.get('/me', withBetterAuth, authenticatedRoute<{}>(getUser))

router.get('/account', withBetterAuth, authenticatedRoute<{}>(getAccount))
router.get(
  '/:userId/credit-balance',
  withBetterAuth,
  validateAndMerge(GetUserCreditBalanceRequestSchema),
  authenticatedRoute(getUserCreditBalance),
)

export default router

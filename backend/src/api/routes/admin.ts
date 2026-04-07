import { Router } from 'express'
import { withBetterAuth } from '../middlewares/auth'
import { adminOnlyRoute } from './utils'
import {
  getAdminStats,
  getAdminUsers,
  addUserCredits,
} from '@/api/controllers/admin.controller'
import { validateAndMerge } from '@/api/middlewares/validationMiddleware'
import {
  AddUserCreditsRequestSchema,
  AddUserCreditsRequest,
} from '@shared/types/src'

const router = Router()

router.get('/stats', withBetterAuth, adminOnlyRoute<{}>(getAdminStats))
router.get('/users', withBetterAuth, adminOnlyRoute<{}>(getAdminUsers))
router.post(
  '/users/:userId/credits',
  withBetterAuth,
  validateAndMerge(AddUserCreditsRequestSchema),
  adminOnlyRoute<AddUserCreditsRequest>(addUserCredits),
)

export default router

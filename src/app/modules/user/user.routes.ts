import express from 'express'
import { UserController } from './user.controller'
import auth from '../../middlewares/auth'
import { ENUM_USER_ROLE } from '../../../enums/user'

const router = express.Router()

router.get('/balance', auth(ENUM_USER_ROLE.ADMIN), UserController.getBalance)

router.get('/manage', auth(ENUM_USER_ROLE.ADMIN), UserController.manageUsers)

// Admin Routes
router.patch(
  '/admin/agents/:id/approve',
  auth(ENUM_USER_ROLE.ADMIN),
  UserController.approveAgent
)

router.patch(
  '/admin/:id/block',
  auth(ENUM_USER_ROLE.ADMIN),
  UserController.blockUser
)

export const UserRoutes = router

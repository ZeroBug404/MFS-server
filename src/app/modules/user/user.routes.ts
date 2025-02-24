import express from 'express'
import { UserController } from './user.controller'
import auth from '../../middlewares/auth'
import { ENUM_USER_ROLE } from '../../../enums/user'

const router = express.Router()

router.get(
  '/balance',
  auth(ENUM_USER_ROLE.USER),
  auth(ENUM_USER_ROLE.ADMIN),
  auth(ENUM_USER_ROLE.AGENT),
  UserController.getBalance
)

router.get('/manage', UserController.manageUsers)
router.patch('/admin/:id/block', UserController.blockUser)

// Admin Routes
// router.get('/admin/users', UserController.getAllUsers);
router.patch(
  '/admin/agents/:id/approve',
  auth(ENUM_USER_ROLE.ADMIN),
  UserController.approveAgent
)

export const UserRoutes = router

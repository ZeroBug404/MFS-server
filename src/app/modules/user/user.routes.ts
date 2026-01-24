import express from 'express'
import { ENUM_USER_ROLE } from '../../../enums/user'
import auth from '../../middlewares/auth'
import { UserController } from './user.controller'

const router = express.Router()

router.get(
  '/balance',
  auth(ENUM_USER_ROLE.ADMIN, ENUM_USER_ROLE.USER, ENUM_USER_ROLE.AGENT),
  UserController.getBalance
)

router.get('/manage', UserController.manageUsers)

// User Profile Routes (authenticated users)
router.get(
  '/profile/me',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.AGENT, ENUM_USER_ROLE.ADMIN),
  UserController.getMyProfile
)

router.patch(
  '/profile/me',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.AGENT, ENUM_USER_ROLE.ADMIN),
  UserController.updateMyProfile
)

router.patch(
  '/profile/change-pin',
  auth(ENUM_USER_ROLE.USER, ENUM_USER_ROLE.AGENT, ENUM_USER_ROLE.ADMIN),
  UserController.changePin
)

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

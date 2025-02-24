import express from 'express'
import { TransactionController } from './transaction.controller'
import auth from '../../middlewares/auth'
import { ENUM_USER_ROLE } from '../../../enums/user'

const router = express.Router()

// User/Agent
router.post('/send', auth(ENUM_USER_ROLE.USER), TransactionController.sendMoney)
router.post(
  '/cash-in',
  auth(ENUM_USER_ROLE.AGENT),
  TransactionController.cashIn
)
router.post(
  '/cash-out',
  auth(ENUM_USER_ROLE.USER),
  TransactionController.cashOut
)

router.get(
  '/',
  auth(ENUM_USER_ROLE.USER),
  auth(ENUM_USER_ROLE.ADMIN),
  auth(ENUM_USER_ROLE.AGENT),
  TransactionController.getHistory
)

// Admin
router.get(
  '/admin/transactions',
  auth(ENUM_USER_ROLE.ADMIN),
  TransactionController.adminGetTransactions
)

// router.get('/admin/users', authMiddleware, adminMiddleware, UserController.getAllUsers);
// router.patch('/admin/agents/:id/approve', authMiddleware, adminMiddleware, UserController.approveAgent);

export const TreansactionRoutes = router

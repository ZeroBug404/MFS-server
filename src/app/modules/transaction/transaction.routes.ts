import express from 'express'
import { ENUM_USER_ROLE } from '../../../enums/user'
import auth from '../../middlewares/auth'
import { TransactionController } from './transaction.controller'

const router = express.Router()

// User/Agent
router.post('/send', auth(ENUM_USER_ROLE.USER), TransactionController.sendMoney)

router.post(
  '/cash-in',
  auth(ENUM_USER_ROLE.AGENT),
  TransactionController.cashIn
)

router.post('/agent-cash-in', TransactionController.agentCashIn)

router.post(
  '/cash-out',
  auth(ENUM_USER_ROLE.USER),
  TransactionController.cashOut
)

router.get('/', TransactionController.getHistory)

router.get('/stats', TransactionController.getDashboardStats)

router.get(
  '/metrics',
  auth(ENUM_USER_ROLE.ADMIN),
  TransactionController.getSystemMetrics
)

// Admin
router.get(
  '/admin/transactions',
  auth(ENUM_USER_ROLE.ADMIN),
  TransactionController.adminGetTransactions
)

export const TreansactionRoutes = router

import express from 'express'
import { TransactionController } from './transaction.controller'
import auth from '../../middlewares/auth'
import { ENUM_USER_ROLE } from '../../../enums/user'

const router = express.Router()

// User/Agent
router.post('/send', auth(ENUM_USER_ROLE.USER), TransactionController.sendMoney)

router.post(
  "/cash-in",
  TransactionController.cashIn
);

router.post(
  "/agent-cash-in",
  TransactionController.agentCashIn
);

router.post(
  '/cash-out',
  auth(ENUM_USER_ROLE.USER),
  TransactionController.cashOut
)

router.get(
  '/',
  // auth(ENUM_USER_ROLE.USER),
  // auth(ENUM_USER_ROLE.ADMIN),
  // auth(ENUM_USER_ROLE.AGENT),
  TransactionController.getHistory
)

// Admin
router.get(
  '/admin/transactions',
  auth(ENUM_USER_ROLE.ADMIN),
  TransactionController.adminGetTransactions
)

export const TreansactionRoutes = router

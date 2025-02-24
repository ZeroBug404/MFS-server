import express from 'express'
import { TransactionController } from './transaction.controller'

const router = express.Router()

// Transaction Routes
router.post('/send', TransactionController.sendMoney)

// // Admin Routes
// router.get('/admin/users', authMiddleware, adminMiddleware, UserController.getAllUsers);
// router.patch('/admin/agents/:id/approve', authMiddleware, adminMiddleware, UserController.approveAgent);

export const TreansactionRoutes = router;

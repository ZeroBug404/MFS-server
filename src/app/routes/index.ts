import express from 'express'
import { AuthRoutes } from '../modules/auth/auth.route'
import { TreansactionRoutes } from '../modules/transaction/transaction.routes'

const router = express.Router()

const moduleRoutes = [
  { path: '/auth', route: AuthRoutes },
  { path: '/transaction', route: TreansactionRoutes },
]

moduleRoutes.forEach(route => router.use(route.path, route.route))
export default router

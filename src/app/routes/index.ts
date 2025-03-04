import express from 'express'
import { AuthRoutes } from '../modules/auth/auth.route'
import { TreansactionRoutes } from '../modules/transaction/transaction.routes'
import { UserRoutes } from '../modules/user/user.routes'

const router = express.Router()

const moduleRoutes = [
  { path: '/auth', route: AuthRoutes },
  { path: '/transactions', route: TreansactionRoutes },
  { path: '/users', route: UserRoutes },
]

moduleRoutes.forEach(route => router.use(route.path, route.route))
export default router

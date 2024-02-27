import express from 'express'
import { AuthRoutes } from '../modules/auth/auth.route'
import { statesRoutes } from './../modules/States/state.routes'

const router = express.Router()

const moduleRoutes = [
  { path: '/states', route: statesRoutes },
  { path: '/auth', route: AuthRoutes },
]

moduleRoutes.forEach(route => router.use(route.path, route.route))
export default router

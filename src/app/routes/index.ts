import express from 'express'
import { statesRoutes } from './../modules/States/state.routes'

const router = express.Router()

const moduleRoutes = [{ path: '/states', route: statesRoutes }]

moduleRoutes.forEach(route => router.use(route.path, route.route))
export default router

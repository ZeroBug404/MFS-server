import express, { Router } from 'express'
import { statesControllers } from './state.controller'

const router: Router = express.Router()

router.get('/', statesControllers.getAllStates)

export const statesRoutes = router

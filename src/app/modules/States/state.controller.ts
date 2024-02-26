import { NextFunction, Request, Response } from 'express'

import sendResponse from '../../../utils/responseHandler'
import { stateServices } from './state.service'

const getAllStates = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await stateServices.getStates()
    // console.log(result)
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'Successfully fetched all states',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}

export const statesControllers = { getAllStates }

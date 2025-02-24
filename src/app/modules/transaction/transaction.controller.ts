import { Request, Response } from 'express'

import config from '../../../config'
import sendResponse from '../../../utils/responseHandler'
import catchAsync from '../../../shared/catchAsync'
import httpStatus from 'http-status'
import { TransactionService } from './transaction.service'

const sendMoney = catchAsync(async (req: Request, res: Response) => {
  // console.log(req.body, 'req.body');

  const result = await TransactionService.sendMoney(
    req.body.senderId,
    req.body.recipientPhone,
    req.body.amount
  )

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User created successfully',
    data: result,
  })
})

export const TransactionController = {
  sendMoney,
}

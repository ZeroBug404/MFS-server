import { Request, Response } from 'express'

import sendResponse from '../../../utils/responseHandler'
import catchAsync from '../../../shared/catchAsync'
import httpStatus from 'http-status'
import { TransactionService } from './transaction.service'
import { Transaction } from './transaction.model'

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
    message: 'Send money successfully',
    data: result,
  })
})

const cashIn = catchAsync(async (req: Request, res: Response) => {
  // console.log(req.body, 'req.body');

  const result = await TransactionService.cashIn(
    req.body.agentId,
    req.body.recipientPhone,
    req.body.amount
  )

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Cash-in successfully',
    data: result,
  })
})

const cashOut = catchAsync(async (req: Request, res: Response) => {
  // console.log(req.body, 'req.body');

  const result = await TransactionService.cashOut(
    req.body.userId,
    req.body.agentPhone,
    req.body.amount
  )

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Cash-out successfully',
    data: result,
  })
})

const getHistory = async (req: Request, res: Response) => {
  const transactions = await TransactionService.getTransactions(req.body._id)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User history get successfully',
    data: transactions,
  })
}

const adminGetTransactions = async (req: Request, res: Response) => {
  const transactions = await Transaction.find()
    .populate('from to', 'name mobile role')
    .sort({ createdAt: -1 })
  res.json({ success: true, data: transactions })
}

export const TransactionController = {
  sendMoney,
  cashIn,
  cashOut,
  getHistory,
  adminGetTransactions,
}

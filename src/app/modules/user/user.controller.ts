import httpStatus from 'http-status'
import { UserService } from './user.service'
import sendResponse from '../../../utils/responseHandler'
import { Request, Response } from 'express'

const getPendingAgents = async (req: Request, res: Response) => {
  const agents = await UserService.getPendingAgents()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User created successfully',
    data: agents,
  })
}

const approveAgent = async (req: Request, res: Response) => {
  const result = await UserService.approveAgent(req.params.id)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User approved successfully',
    data: result,
  })
}

const getBalance = async (req: Request, res: Response) => {
  console.log(req.query);  
   
  const balance = await UserService.getBalance(req.query)

  console.log(balance);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `User balance is ${balance}`,
    data: balance,
  })
}

const manageUsers = async (req: Request, res: Response) => {
  const users = await UserService.getAllUsers(req.query.search as string)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User retrieved successfully',
    data: users,
  })
}

const blockUser = async (req: Request, res: Response) => {
  const user = await UserService.blockUser(req.params.id)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User blocked successfully',
    data: user,
  })
}

export const UserController = {
  getPendingAgents,
  approveAgent,
  getBalance,
  manageUsers,
  blockUser,
}

import { Request, Response } from 'express'
import httpStatus from 'http-status'
import { ApiError } from '../../../errors/ApiErrors'
import catchAsync from '../../../shared/catchAsync'
import sendResponse from '../../../utils/responseHandler'
import { UserService } from './user.service'

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
  console.log(req.query)

  const balance = await UserService.getBalance(req.query)

  console.log(balance)

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
    message: 'Status changed successfully',
    data: user,
  })
}

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const phoneNo = (req.user as any)?.contactNo
  if (!phoneNo) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated')
  }

  const user = await UserService.getMyProfile(phoneNo)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile retrieved successfully',
    data: user,
  })
})

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
  const phoneNo = (req.user as any)?.contactNo
  if (!phoneNo) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated')
  }

  const user = await UserService.updateMyProfile(phoneNo, req.body)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile updated successfully',
    data: user,
  })
})

const changePin = catchAsync(async (req: Request, res: Response) => {
  const phoneNo = (req.user as any)?.contactNo
  if (!phoneNo) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User not authenticated')
  }

  const { oldPin, newPin } = req.body

  if (!oldPin || !newPin) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'Old PIN and new PIN are required'
    )
  }

  if (newPin.length !== 5) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'PIN must be exactly 5 digits')
  }

  await UserService.changePin(phoneNo, oldPin, newPin)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'PIN changed successfully',
    data: null,
  })
})

export const UserController = {
  getPendingAgents,
  approveAgent,
  getBalance,
  manageUsers,
  blockUser,
  getMyProfile,
  updateMyProfile,
  changePin,
}

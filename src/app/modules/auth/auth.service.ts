import httpStatus from 'http-status'
import { Secret } from 'jsonwebtoken'

import config from '../../../config'
import { ApiError } from '../../../errors/ApiErrors'
import { jwtHelpers } from '../../../helper/jwtHelper'
import { EmailService } from '../../../services/email.service'

import { User } from '../user/user.model'
import {
    ILoginUser,
    ILoginUserResponse,
    IRefreshTokenResponse,
} from './auth.interface'

const register = async (data: any) => {
  if (data.role === 'user') data.balance = 40
  if (data.role === 'agent') data.balance = 100000

  const result = await User.create(data)

  // Send welcome email (don't block registration if email fails)
  try {
    await EmailService.sendWelcomeEmail(result.email, result.name, result.role)
  } catch (error) {
    console.error('Failed to send welcome email:', error)
    // Continue with registration even if email fails
  }

  // Validate JWT configuration before creating tokens
  if (!config.jwt.secret || !config.jwt.refresh_secret) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'JWT configuration is missing. Please check your environment variables.'
    )
  }

  if (!config.jwt.expires_in || !config.jwt.refresh_expires_in) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'JWT expiration configuration is missing. Please check your environment variables.'
    )
  }

  const accessToken = jwtHelpers.createToken(
    { userId: result._id, contactNo: data.phoneNo, role: data.role },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  )

  const refreshToken = jwtHelpers.createToken(
    { userId: result._id, contactNo: data.phoneNo, role: data.role },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string
  )

  return {
    accessToken,
    refreshToken,
  }
}

const loginUser = async (payload: ILoginUser): Promise<ILoginUserResponse> => {
  const { phoneNo, pin } = payload

  const isUserExist = await User.findOne({ phoneNo }).select(
    '_id phoneNo pin role isActive'
  )

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist')
  }

  if (isUserExist.isActive === false) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      'Your account has been blocked. Please contact support.'
    )
  }

  if (
    isUserExist.pin &&
    !(await User.isPasswordMatched(pin, isUserExist.pin))
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'PIN is incorrect')
  }

  // Validate JWT configuration before creating tokens
  if (!config.jwt.secret || !config.jwt.refresh_secret) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'JWT configuration is missing. Please check your environment variables.'
    )
  }

  if (!config.jwt.expires_in || !config.jwt.refresh_expires_in) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'JWT expiration configuration is missing. Please check your environment variables.'
    )
  }

  //create access token & refresh token
  const { phoneNo: contactNo, role, _id: userId } = isUserExist
  const accessToken = jwtHelpers.createToken(
    { userId, contactNo, role },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  )

  const refreshToken = jwtHelpers.createToken(
    { userId, contactNo, role },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string
  )

  return {
    accessToken,
    refreshToken,
  }
}

const refreshToken = async (token: string): Promise<IRefreshTokenResponse> => {
  //verify token
  // invalid token - synchronous
  let verifiedToken = null
  try {
    verifiedToken = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_secret as Secret
    )
  } catch (err) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid Refresh Token')
  }

  const { phoneNo } = verifiedToken

  // checking deleted user's refresh token

  const isUserExist = await User.isUserExist(phoneNo)
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist')
  }
  //generate new token

  const newAccessToken = jwtHelpers.createToken(
    {
      phoneNo: isUserExist.phoneNo,
      role: isUserExist.role,
    },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  )

  return {
    accessToken: newAccessToken,
  }
}

export const AuthService = {
  register,
  loginUser,
  refreshToken,
}

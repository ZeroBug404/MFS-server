import httpStatus from 'http-status'
import { Secret } from 'jsonwebtoken'

import config from '../../../config'
import { ApiError } from '../../../errors/ApiErrors'
import { jwtHelpers } from '../../../helper/jwtHelper'

import {
  ILoginUser,
  ILoginUserResponse,
  IRefreshTokenResponse,
} from './auth.interface'
import { User } from '../user/user.model'

const register = async (data: any) => {
  if (data.role === 'user') data.balance = 40
  if (data.role === 'agent') data.balance = 100000

  // console.log(data)

  const result = await User.create(data)

  const accessToken = jwtHelpers.createToken(
    { contactNo: data.phoneNo, role: data.role },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  )

  const refreshToken = jwtHelpers.createToken(
    { contactNo: data.phoneNo, role: data.role },
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

  const isUserExist = await User.isUserExist(phoneNo)

  // console.log('isUserExist', isUserExist)

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist')
  }

  // console.log('isUserExist', isUserExist)

  // const passMatched = await User.isPasswordMatched(pin, isUserExist.pin)

  // console.log('passMatched', passMatched)

  // console.log('isUserExist.pin', isUserExist.pin)
  // console.log('pin', pin)

  if (
    isUserExist.pin &&
    !(await User.isPasswordMatched(pin, isUserExist.pin))
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Pin is incorrect')
  }

  console.log('isUserExist', isUserExist);
  
  //create access token & refresh token
  const { phoneNo: contactNo, role } = isUserExist
  const accessToken = jwtHelpers.createToken(
    { contactNo, role },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  )

  const refreshToken = jwtHelpers.createToken(
    { contactNo, role },
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

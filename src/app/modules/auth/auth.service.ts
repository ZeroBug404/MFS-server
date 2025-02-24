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

  console.log(data)

  const result = await User.create(data)
  console.log(result)

  return result
}

const loginUser = async (payload: ILoginUser): Promise<ILoginUserResponse> => {
  const { phoneNo, pin } = payload
  // creating instance of User
  // const user = new User();
  //  // access to our instance methods
  //   const isUserExist = await user.isUserExist(id);

  const isUserExist = await User.isUserExist(phoneNo)

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist')
  }

  if (
    isUserExist.pin &&
    !(await User.isPasswordMatched(pin, isUserExist.pin))
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Pin is incorrect')
  }

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

  // tumi delete hye gso  kintu tumar refresh token ase
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

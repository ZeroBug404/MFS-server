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

const insertIntoDB = async (data: any) => {
  const userData = {
    phoneNo: data.phoneNo,
    password: data.password,
    role: data.role,
  }

  const roleData = {
    firstName: data.firstName,
    lastName: data.lastName,
    profileImage: data.profileImage,
    email: data.email,
    contactNo: data.contactNo,
  }
  console.log(data)

  const result = await User.create(data)
  console.log(result)

  // // Step 3: Determine Role
  // if (userData.role === 'instructor') {
  //   // Step 4: Create Instructor
  //   const createdInstructor = await prisma.instructor.create({
  //     data: {
  //       ...roleData,
  //       name: `${roleData.firstName} ${roleData.lastName}`,
  //     },
  //   });

  //   // Step 5: Associate User with Instructor
  //   await prisma.user.update({
  //     where: { id: createdUser.id },
  //     data: { instructorId: createdInstructor.id },
  //   });
  // } else if (userData.role === 'student') {
  //   // Step 4: Create Student
  //   const createdStudent = await prisma.student.create({
  //     data: roleData,
  //   });

  //   // Step 5: Associate User with Student
  //   await prisma.user.update({
  //     where: { id: createdUser.id },
  //     data: { studentId: createdStudent.id },
  //   });
  // }

  // const { password, ...userData } = result;

  return result
}

const loginUser = async (payload: ILoginUser): Promise<ILoginUserResponse> => {
  const { phoneNo, password } = payload
  // creating instance of User
  // const user = new User();
  //  // access to our instance methods
  //   const isUserExist = await user.isUserExist(id);

  const isUserExist = await User.isUserExist(phoneNo)

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist')
  }

  if (
    isUserExist.password &&
    !(await User.isPasswordMatched(password, isUserExist.password))
  ) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is incorrect')
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

  const { userId } = verifiedToken

  // tumi delete hye gso  kintu tumar refresh token ase
  // checking deleted user's refresh token

  const isUserExist = await User.isUserExist(userId)
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
  insertIntoDB,
  loginUser,
  refreshToken,
}

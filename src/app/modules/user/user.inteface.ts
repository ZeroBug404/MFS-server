import { Model } from "mongoose";

export type IUser = {
  role: string
  phoneNo: string
  password: string
  email: string;
}

export type UserModel = {
    isUserExist(
        phoneNo: string
    ): Promise<Pick<IUser, 'phoneNo' | 'password' | 'role' >>;
    isPasswordMatched(
      givenPassword: string,
      savedPassword: string
    ): Promise<boolean>;
  } & Model<IUser>;
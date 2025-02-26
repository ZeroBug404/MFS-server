import { Model } from "mongoose";

// export type IUser = {
//   role: string
//   phoneNo: string
//   password: string
//   email: string;
// }

export type IUser = {
  name: string;
  phoneNo: string;
  email: string;
  pin: string;
  role: 'user' | 'agent' | 'admin';
  nid: string;
  balance: number;
  income?: number; // For agents
  isApproved?: boolean;
  isActive?: boolean;
  sessions: string[];
}

export type UserModel = {
    isUserExist(
        phoneNo: string,
        // pin: string
    ): Promise<Pick<IUser, 'phoneNo' | 'pin' | 'role' >>;
    isPasswordMatched(
      givenPassword: string,
      savedPassword: string
    ): Promise<boolean>;
  } & Model<IUser>;
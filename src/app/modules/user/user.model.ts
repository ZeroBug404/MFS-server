/* eslint-disable @typescript-eslint/no-this-alias */
import { Schema, model } from 'mongoose'
import { IUser } from './user.inteface'
import bcrypt from 'bcrypt';
import config from '../../../config';

const UserSchema = new Schema<IUser, Record<string, never>>(
  {
    role: {
      type: String,
      required: true,
    },
    phoneNo: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
)

UserSchema.statics.isUserExist = async function (
    phoneNo: string
  ): Promise<IUser | null> {
    return await User.findOne(
      { phoneNo },
      { phoneNo: 1, password: 1, role: 1 }
    );
  };
  
  UserSchema.statics.isPasswordMatched = async function (
    givenPassword: string,
    savedPassword: string
  ): Promise<boolean> {
    return await bcrypt.compare(givenPassword, savedPassword);
  };
  
  UserSchema.methods.changedPasswordAfterJwtIssued = function (
    jwtTimestamp: number
  ) {
    console.log({ jwtTimestamp }, 'hi');
  };
  
  // User.create() / user.save()
  UserSchema.pre('save', async function (next) {
    // hashing user password
    const user = this;
    user.password = await bcrypt.hash(
      user.password,
      Number(config.bcrypt_salt_rounds)
    );
  
    next();
  });

export const User = model<IUser>('User', UserSchema)

/* eslint-disable @typescript-eslint/no-this-alias */
import { Schema, model } from 'mongoose'
import { IUser, UserModel } from './user.inteface'
import bcrypt from 'bcrypt'
import config from '../../../config'

const UserSchema = new Schema<IUser, UserModel>(
  {
    name: {
      type: String,
      required: true,
    },
    phoneNo: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    pin: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'agent', 'admin'],
      required: true,
    },
    nid: {
      type: String,
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    income: {
      type: Number,
      default: 0,
    }, // For agents
    isApproved: {
      type: Boolean,
      default: false,
    }, // For agents
    isActive: {
      type: Boolean,
      default: true,
    },
    sessions: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

UserSchema.statics.isUserExist = async function (
  phoneNo: string
): Promise<Pick<IUser, 'phoneNo' | 'pin' | 'role'> | null> {
  return await User.findOne({ phoneNo }, { phoneNo: 1, password: 1, role: 1 })
}

UserSchema.statics.isPasswordMatched = async function (
  givenPassword: string,
  savedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(givenPassword, savedPassword)
}

// User.create() / user.save()
UserSchema.pre('save', async function (next) {
  // hashing user password
  const user = this
  user.pin = await bcrypt.hash(user.pin, Number(config.bcrypt_salt_rounds))
  next()
})

export const User = model<IUser, UserModel>('User', UserSchema)

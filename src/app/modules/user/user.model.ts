/* eslint-disable @typescript-eslint/no-this-alias */
import bcrypt from 'bcrypt'
import { Schema, model } from 'mongoose'
import config from '../../../config'
import { IUser, UserModel } from './user.inteface'

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
  phoneNo: string,
  pin: string
): Promise<Pick<IUser, 'phoneNo' | 'pin' | 'role'> | null> {
  return await User.findOne({ phoneNo }, { phoneNo: 1, pin: 1, role: 1 })
}

UserSchema.statics.isPasswordMatched = async function (
  givenPassword: string,
  savedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(givenPassword, savedPassword)
}

// User.create() / user.save()
UserSchema.pre('save', async function (next) {
  // hashing user password only if it's modified
  const user = this
  if (user.isModified('pin')) {
    user.pin = await bcrypt.hash(user.pin, Number(config.bcrypt_salt_rounds))
  }
  next()
})

export const User = model<IUser, UserModel>('User', UserSchema)

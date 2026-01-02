import httpStatus from 'http-status'
import { ApiError } from '../../../errors/ApiErrors'
import { User } from './user.model'

const getPendingAgents = async () => {
  return User.find({ role: 'agent', isApproved: false })
}

const approveAgent = async (agentId: string) => {
  const agent = await User.findByIdAndUpdate(
    agentId,
    { isApproved: true },
    { new: true }
  )
  if (!agent) throw new Error('Agent not found')
  return agent
}

const getBalance = async (data: any) => {
  const user = await User.findById(data.userId).select('balance income')

  if (data.role === 'admin') {
    const totalSystemBalance = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$balance' } } },
    ])

    return totalSystemBalance[0]
  }

  return user?.balance
}

const getAllUsers = async (search?: string) => {
  const query = search
    ? {
        $or: [
          { mobile: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      }
    : {}

  return User.find(query)
}

const blockUser = async (userId: string) => {
  const alreadyIsBlocked = await User.findById(userId).select('isActive')

  if (alreadyIsBlocked?.isActive === false) {
    return User.findByIdAndUpdate(userId, { isActive: true }, { new: true })
  }

  return User.findByIdAndUpdate(userId, { isActive: false }, { new: true })
}

const getMyProfile = async (phoneNo: string) => {
  const user = await User.findOne({ phoneNo }).select('-pin')
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found')
  return user
}

const updateMyProfile = async (
  phoneNo: string,
  data: { name?: string; email?: string }
) => {
  const updateData: any = {}
  if (data.name) updateData.name = data.name
  if (data.email) updateData.email = data.email

  if (Object.keys(updateData).length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No fields to update')
  }

  const user = await User.findOneAndUpdate({ phoneNo }, updateData, {
    new: true,
    runValidators: true,
  }).select('-pin')

  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found')
  return user
}

const changePin = async (phoneNo: string, oldPin: string, newPin: string) => {
  const user = await User.findOne({ phoneNo })
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found')

  // Verify old PIN
  const isPinMatched = await User.isPasswordMatched(oldPin, user.pin)
  if (!isPinMatched) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Current PIN is incorrect')
  }

  // Update to new PIN
  user.pin = newPin
  await user.save()

  return { success: true }
}

export const UserService = {
  getPendingAgents,
  approveAgent,
  getBalance,
  getAllUsers,
  blockUser,
  getMyProfile,
  updateMyProfile,
  changePin,
}

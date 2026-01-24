import httpStatus from 'http-status'
import { ApiError } from '../../../errors/ApiErrors'
import { EmailService } from '../../../services/email.service'
import { User } from './user.model'

const getPendingAgents = async () => {
  return User.find({ role: 'agent', isApproved: false })
}

const approveAgent = async (agentId: string) => {
  const agent = await User.findByIdAndUpdate(
    agentId,
    { $set: { isApproved: true } },
    { new: true }
  )
  if (!agent) throw new Error('Agent not found')

  // Send approval email
  try {
    await EmailService.sendAgentApprovalEmail(agent.email, agent.name)
  } catch (error) {
    console.error('Failed to send agent approval email:', error)
  }

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

  // Return structure consistent with frontend expectations
  return {
    total: user?.balance,
    availableBalance: user?.balance,
    income: user?.income
  }
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
  const user = await User.findById(userId).select('isActive email name')

  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found')

  const newStatus = user.isActive === false

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: { isActive: newStatus } },
    { new: true }
  )

  // Send status change email
  try {
    await EmailService.sendAccountStatusEmail(
      user.email,
      user.name,
      newStatus ? 'unblocked' : 'blocked'
    )
  } catch (error) {
    console.error('Failed to send account status email:', error)
  }

  return updatedUser
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

  const user = await User.findOneAndUpdate(
    { phoneNo },
    { $set: updateData },
    {
      new: true,
      runValidators: true,
    }
  ).select('-pin')

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

  // Send PIN change confirmation email
  try {
    await EmailService.sendPinChangeEmail(user.email, user.name)
  } catch (error) {
    console.error('Failed to send PIN change email:', error)
  }

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

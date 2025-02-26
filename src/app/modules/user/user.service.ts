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

export const UserService = {
  getPendingAgents,
  approveAgent,
  getBalance,
  getAllUsers,
  blockUser,
}

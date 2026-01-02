/* eslint-disable @typescript-eslint/no-non-null-assertion */
import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { Transaction } from '../transaction/transaction.model'
import { User } from '../user/user.model'

const sendMoney = async (
  senderId: string,
  recipientPhone: string,
  amount: number
) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const sender = await User.findById(senderId).session(session)

    const recipient = await User.findOne({ phoneNo: recipientPhone }).session(
      session
    )

    // Validation and fee calculation
    if (amount < 50) throw new Error('Minimum amount is 50 Taka')
    const fee = amount > 100 ? 5 : 0
    const totalDeduct = amount + fee

    // Update balances
    sender!.balance -= totalDeduct
    recipient!.balance += amount

    // Update admin earnings
    const admin = await User.findOne({ role: 'admin' }).session(session)
    admin!.balance += fee

    // Create transaction
    const transaction = new Transaction({
      from: senderId,
      to: recipient!._id,
      amount,
      fee,
      adminEarnings: fee,
      type: 'send',
      transactionId: uuidv4(),
    })

    await Promise.all([
      sender!.save(),
      recipient!.save(),
      admin!.save(),
      transaction.save(),
    ])

    await session.commitTransaction()
    return transaction
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

const cashIn = async (agentId: string, userPhone: string, amount: number) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const agent = await User.findById(agentId).session(session)
    const user = await User.findOne({ phoneNo: userPhone }).session(session)

    if (!agent || !user) throw new Error('Invalid agent or user')
    if (agent.balance < amount) throw new Error('Agent insufficient balance')

    // Update balances
    agent.balance -= amount
    user.balance += amount

    // Create transaction
    const transaction = new Transaction({
      from: agentId,
      to: user._id,
      amount,
      fee: 0,
      adminEarnings: 0,
      type: 'cash-in',
      transactionId: uuidv4(),
    })

    await Promise.all([agent.save(), user.save(), transaction.save()])

    await session.commitTransaction()
    return transaction
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

const agentCashIn = async (
  adminId: string,
  userPhone: string,
  amount: number
) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const user = await User.findOne({ phoneNo: userPhone }).session(session)

    if (!user) throw new Error('Invalid agent or user')

    user.balance += amount

    // Create transaction
    const transaction = new Transaction({
      from: adminId,
      to: user._id,
      amount,
      fee: 0,
      adminEarnings: 0,
      type: 'cash-in',
      transactionId: uuidv4(),
    })

    await Promise.all([user.save(), transaction.save()])

    await session.commitTransaction()
    return transaction
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

const cashOut = async (userId: string, agentPhone: string, amount: number) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const user = await User.findById(userId).session(session)

    // console.log(agentPhone, userId, amount);

    const agent = await User.findOne({
      phoneNo: agentPhone,
      role: 'agent',
      isApproved: true,
    }).session(session)

    console.log(agent, 'agent')

    if (!user || !agent) throw new Error('Invalid user or agent')

    const fee = amount * 0.015
    const totalDeduct = amount + fee

    if (user.balance < totalDeduct) throw new Error('Insufficient balance')

    // Update balances
    user.balance -= totalDeduct
    agent.balance += amount - amount * 0.01 // Agent keeps 99%
    agent.income = (agent.income || 0) + amount * 0.01 // Agent earns 1%

    // Update admin
    const admin = await User.findOne({ role: 'admin' }).session(session)
    if (!admin) throw new Error('Admin not found')
    admin.balance += amount * 0.005 + 5 // 0.5% + fixed 5 Taka

    // Create transaction
    const transaction = new Transaction({
      from: userId,
      to: agent._id,
      amount,
      fee,
      adminEarnings: amount * 0.005 + 5,
      type: 'cash-out',
      transactionId: uuidv4(),
    })

    await Promise.all([
      user.save(),
      agent.save(),
      admin.save(),
      transaction.save(),
    ])

    await session.commitTransaction()
    return transaction
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

const getTransactions = async (data: any, limit = 100) => {
  const userId = data.userId

  if (!userId) {
    return []
  }

  return Transaction.find({
    $or: [{ from: userId }, { to: userId }],
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('from to', 'name phoneNo role')
}

export const TransactionService = {
  sendMoney,
  cashIn,
  agentCashIn,
  cashOut,
  getTransactions,
}

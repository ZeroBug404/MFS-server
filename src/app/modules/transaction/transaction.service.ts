/* eslint-disable @typescript-eslint/no-non-null-assertion */
import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import { EmailService } from '../../../services/email.service'
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

    // Update admin earnings
    const admin = await User.findOne({ role: 'admin' }).session(session)
    if (!admin) throw new Error('Admin not found')

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

    const [updatedSender, updatedRecipient] = await Promise.all([
      User.findByIdAndUpdate(
        senderId,
        { $inc: { balance: -totalDeduct } },
        { session, new: true }
      ),
      User.findByIdAndUpdate(
        recipient!._id,
        { $inc: { balance: amount } },
        { session, new: true }
      ),
      User.findByIdAndUpdate(
        admin._id,
        { $inc: { balance: fee } },
        { session, new: true }
      ),
      transaction.save({ session }),
    ])

    await session.commitTransaction()

    // Send email notifications (don't block if email fails)
    try {
      const currentDate = new Date().toLocaleString()

      // Email to sender
      await EmailService.sendTransactionEmail(sender!.email, sender!.name, {
        type: 'send',
        amount,
        recipientName: recipient!.name,
        fee,
        newBalance: updatedSender!.balance,
        transactionId: transaction.transactionId,
        date: currentDate,
      })

      // Email to recipient
      await EmailService.sendTransactionEmail(
        recipient!.email,
        recipient!.name,
        {
          type: 'receive',
          amount,
          senderName: sender!.name,
          newBalance: updatedRecipient!.balance,
          transactionId: transaction.transactionId,
          date: currentDate,
        }
      )
    } catch (error) {
      console.error('Failed to send transaction emails:', error)
    }

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

    await Promise.all([
      User.findByIdAndUpdate(
        agentId,
        { $inc: { balance: -amount } },
        { session, new: true }
      ),
      User.findByIdAndUpdate(
        user._id,
        { $inc: { balance: amount } },
        { session, new: true }
      ),
      transaction.save({ session }),
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
    if (user.role !== 'agent') throw new Error('Cash In to an Agent only')

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

    await Promise.all([
      User.findByIdAndUpdate(
        user._id,
        { $inc: { balance: amount } },
        { session, new: true }
      ),
      transaction.save({ session }),
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

    // Update admin
    const admin = await User.findOne({ role: 'admin' }).session(session)
    if (!admin) throw new Error('Admin not found')

    const agentIncome = amount * 0.01 // Agent earns 1%
    const agentAmount = amount + agentIncome // Agent gets Principal + Commission
    const adminEarnings = fee - agentIncome // Admin gets breakdown (0.5%)

    // Create transaction
    const transaction = new Transaction({
      from: userId,
      to: agent._id,
      amount,
      fee,
      adminEarnings,
      type: 'cash-out',
      transactionId: uuidv4(),
    })

    await Promise.all([
      User.findByIdAndUpdate(
        userId,
        { $inc: { balance: -totalDeduct } },
        { session, new: true }
      ),
      User.findByIdAndUpdate(
        agent._id,
        { $inc: { balance: agentAmount, income: agentIncome } },
        { session, new: true }
      ),
      User.findByIdAndUpdate(
        admin._id,
        { $inc: { balance: adminEarnings, income: adminEarnings } }, // Admin income also updated clearly
        { session, new: true }
      ),
      transaction.save({ session }),
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

const getStatement = async (userId: string,  startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  return Transaction.find({
    $and: [
      { $or: [{ from: userId }, { to: userId }] },
      { createdAt: { $gte: start, $lte: end } }
    ]
  })
    .sort({ createdAt: 1 }) // Sorted by date ascending for statement
    .populate('from to', 'name phoneNo role');
}

export const TransactionService = {
  sendMoney,
  cashIn,
  agentCashIn,
  cashOut,
  getTransactions,
  getStatement,
}

import { User } from '../user/user.model';
import { Transaction } from '../transaction/transaction.model';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const sendMoney = async (senderId: string, recipientPhone: string, amount: number) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sender = await User.findById(senderId).session(session);
    
    const recipient = await User.findOne({ phoneNo: recipientPhone }).session(session);

    // Validation and fee calculation
    if (amount < 50) throw new Error('Minimum amount is 50 Taka');
    const fee = amount > 100 ? 5 : 0;
    const totalDeduct = amount + fee;

    // Update balances
    sender!.balance -= totalDeduct;
    recipient!.balance += amount;

    // Update admin earnings
    // const admin = await User.findOne({ role: 'admin' }).session(session);
    // admin!.balance += fee;

    // Create transaction
    const transaction = new Transaction({
      from: senderId,
      to: recipient!._id,
      amount,
      fee,
      adminEarnings: fee,
      type: 'send',
      transactionId: uuidv4()
    });

    await Promise.all([
      sender!.save(),
      recipient!.save(),
    //   admin!.save(),
      transaction.save()
    ]);

    await session.commitTransaction();
    return transaction;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const TransactionService = { sendMoney };
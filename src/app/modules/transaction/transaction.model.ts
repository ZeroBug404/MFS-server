import { Schema, model } from 'mongoose'
import { ITransaction } from './transaction.interface'

const TransactionSchema = new Schema<ITransaction>(
  {
    from: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    fee: {
      type: Number,
      default: 0,
    },
    adminEarnings: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum: ['send', 'cash-in', 'cash-out'],
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
)

export const Transaction = model<ITransaction>('Transaction', TransactionSchema)

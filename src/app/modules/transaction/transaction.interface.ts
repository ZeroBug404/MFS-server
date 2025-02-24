import { Schema } from 'mongoose'

export type ITransaction = {
  from: Schema.Types.ObjectId
  to: Schema.Types.ObjectId
  amount: number
  fee: number
  adminEarnings: number
  type: 'send' | 'cash-in' | 'cash-out'
  transactionId: string
}

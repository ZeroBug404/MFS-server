// main.ts
import mongoose, { Document, Model, Schema } from 'mongoose'
import { State } from './state.interface'

const objectId = mongoose.Schema.Types.ObjectId

const stateSchema = new Schema<State>({
  stateName: {
    type: String,
  },
  abbreviation: {
    type: String,
  },
  capital: {
    type: String,
  },
})

const States: Model<Document & State> = mongoose.model('State', stateSchema)
export default States

// State.ts
import { Document } from 'mongoose'

export type State = {
  stateName: string
  abbreviation: string
  capital: string
} & Document

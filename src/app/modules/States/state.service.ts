import { State } from './state.interface'
import States from './state.model'

const getStates = async (): Promise<State[]> => {
  const result: State[] = await States.find({})
  return result
}

export const stateServices = { getStates }

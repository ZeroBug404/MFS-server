import mongoose from 'mongoose'
import { IErrorSources, IGenericErrorResponse } from '../interfaces/error'

const handleCastError = (
  err: mongoose.Error.CastError
): IGenericErrorResponse => {
  const errorSources: IErrorSources = [
    {
      path: err.path,
      message: err.message,
    },
  ]

  const statusCode = 400

  return {
    statusCode,
    message: 'Invalid ID',
    errorSources,
  }
}

export default handleCastError

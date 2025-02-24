import { ErrorRequestHandler } from 'express'
import configs from '../config'
import { IErrorSources } from '../interfaces/error'
import { ApiError } from './ApiErrors'
import handleCastError from './handleCastError'
// import handleDuplicateError from './handleDuplicateError'
import handleValidationError from './handlevadiationErrors'

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (configs.env === 'development') console.log(err)
  //setting default values
  let statusCode = 500
  let message = 'Something went wrong!'
  let errorSources: IErrorSources = [
    {
      path: '',
      message: 'Something went wrong',
    },
  ]

  if (err?.name === 'ValidationError') {
    const simplifiedError = handleValidationError(err)
    statusCode = simplifiedError?.statusCode
    message = simplifiedError?.message
    errorSources = simplifiedError?.errorSources
  } else if (err?.name === 'CastError') {
    const simplifiedError = handleCastError(err)
    statusCode = simplifiedError?.statusCode
    message = simplifiedError?.message
    errorSources = simplifiedError?.errorSources
  } 
  // else if (err?.code === 11000) {
  //   const simplifiedError = handleDuplicateError(err)
  //   statusCode = simplifiedError?.statusCode
  //   message = simplifiedError?.message
  //   errorSources = simplifiedError?.errorSources
  // }
   else if (err instanceof ApiError) {
    statusCode = err?.statusCode
    message = err.message
    errorSources = [
      {
        path: '',
        message: err?.message,
      },
    ]
  } else if (err instanceof Error) {
    message = err.message
    errorSources = [
      {
        path: '',
        message: err?.message,
      },
    ]
  }

  //ultimate return
  return res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    err,
    stack: configs.env === 'development' ? err?.stack : null,
  })
}

export default globalErrorHandler

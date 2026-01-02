/* eslint-disable @typescript-eslint/no-explicit-any */

import { IErrorSources, IGenericErrorResponse } from '../interfaces/error'

const handleDuplicateError = (err: any): IGenericErrorResponse => {
  // Extract field name and value from error message
  const match = err.message.match(/"([^"]*)"/)
  const extractedValue = match && match[1]

  // Extract field name from error keyPattern
  const fieldName = err.keyPattern ? Object.keys(err.keyPattern)[0] : 'field'

  // Create user-friendly field names
  const fieldDisplayNames: Record<string, string> = {
    phoneNo: 'Phone number',
    email: 'Email address',
    nid: 'National ID (NID)',
  }

  const displayName = fieldDisplayNames[fieldName] || fieldName

  const errorSources: IErrorSources = [
    {
      path: fieldName,
      message: `${displayName} "${extractedValue}" is already registered. Please use a different ${displayName.toLowerCase()}.`,
    },
  ]

  const statusCode = 409

  return {
    statusCode,
    message: `${displayName} already exists`,
    errorSources,
  }
}

export default handleDuplicateError

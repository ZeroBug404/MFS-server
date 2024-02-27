// /* eslint-disable @typescript-eslint/no-explicit-any */

// import { IErrorSources, IGenericErrorResponse } from '../interfaces/error'

// const handleDuplicateError = (err: any): IGenericErrorResponse => {
//   // Extract value within double quotes using regex
//   const match = err.message.match(/"([^"]*)"/)

//   // The extracted value will be in the first capturing group
//   const extractedMessage = match && match[1]

//   const errorSources: IErrorSources = [
//     {
//       path: '',
//       message: `${extractedMessage} is already exists`,
//     },
//   ]

//   const statusCode = 400

//   return {
//     statusCode,
//     message: 'Invalid ID',
//     errorSources,
//   }
// }

// export default handleDuplicateError

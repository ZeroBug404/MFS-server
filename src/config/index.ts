import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(process.cwd(), '.env') })

// // Validate required environment variables
// const requiredEnvVars = [
//   'JWT_SECRET',
//   'JWT_REFRESH_SECRET',
//   'DATABASE_URL',
// ];

// const missingEnvVars = requiredEnvVars.filter(
//   (varName) => !process.env[varName]
// );

// if (missingEnvVars.length > 0) {
//   throw new Error(
//     `Missing required environment variables: ${missingEnvVars.join(', ')}\n` +
//     'Please create a .env file in the root directory with the required variables.'
//   );
// }

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 5000,
  database_url: process.env.DATABASE_URL,
  default_admin_pass: process.env.DEFAULT_ADMIN_PASSWORD,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS || 10,
  jwt: {
    secret: process.env.JWT_SECRET,
    refresh_secret: process.env.JWT_REFRESH_SECRET,
    expires_in: process.env.JWT_EXPIRES_IN || '30d',
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
}

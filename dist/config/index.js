"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), '.env') });
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
exports.default = {
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
    email: {
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || '587',
        secure: process.env.EMAIL_SECURE || 'false',
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
        from_name: process.env.EMAIL_FROM_NAME || 'AmarCash',
        from_email: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    },
};

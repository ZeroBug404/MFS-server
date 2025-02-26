"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.errorLog = void 0;
const path_1 = __importDefault(require("path"));
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const log = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    transports: [],
});
exports.log = log;
const errorLog = winston_1.default.createLogger({
    level: 'error',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    transports: [],
});
exports.errorLog = errorLog;
// If not in production, log to files
if (process.env.NODE_ENV !== 'production') {
    log.add(new winston_daily_rotate_file_1.default({
        filename: path_1.default.join(process.cwd(), 'logs', 'winston', 'success', 'success-%DATE%.log'),
        datePattern: 'YYYY-MM-DD-HH',
        level: 'info',
    }));
    errorLog.add(new winston_daily_rotate_file_1.default({
        filename: path_1.default.join(process.cwd(), 'logs', 'winston', 'error', 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD-HH',
        level: 'error',
    }));
    // Also log to the console in non-production environments
    log.add(new winston_1.default.transports.Console());
    errorLog.add(new winston_1.default.transports.Console({ stderrLevels: ['error'] }));
}

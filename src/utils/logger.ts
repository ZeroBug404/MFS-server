import path from 'path'
import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'

const log = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [],
})

const errorLog = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [],
})

// If not in production, log to files
if (process.env.NODE_ENV !== 'production') {
  log.add(
    new DailyRotateFile({
      filename: path.join(
        process.cwd(),
        'logs',
        'winston',
        'success',
        'success-%DATE%.log'
      ),
      datePattern: 'YYYY-MM-DD-HH',
      level: 'info',
    })
  )

  errorLog.add(
    new DailyRotateFile({
      filename: path.join(
        process.cwd(),
        'logs',
        'winston',
        'error',
        'error-%DATE%.log'
      ),
      datePattern: 'YYYY-MM-DD-HH',
      level: 'error',
    })
  )

  // Also log to the console in non-production environments
  log.add(new winston.transports.Console())
  errorLog.add(new winston.transports.Console({ stderrLevels: ['error'] }))
}

export { errorLog, log }

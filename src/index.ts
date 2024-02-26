import { app } from './app'
import config from './config/index'
import { errorLog, log } from './utils/logger'
const startServer = async () => {
  try {
    app.listen(config.port, () => {
      log.info(`🌐 Server running on port ${config.port} 🔥`)
    })
  } catch (error) {
    errorLog.error(error)
  }
}

startServer()

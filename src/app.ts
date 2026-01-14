import cors from 'cors'
import 'dotenv/config'
import express, { Application, NextFunction, Request, Response } from 'express'
import * as path from 'path'
import routes from './app/routes'

// import routes here
import globalErrorHandler from './errors/globalErrorHandler'
import { dbConnect } from './utils/dbConnect'
const app: Application = express()

const corsOptions = {
  origin: [
    'http://localhost:8080',
    'http://localhost:5173',
    'http://localhost:3000',
    'https://wallet-waves.vercel.app',
    'https://amar-cash.vercel.app',
  ],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}

app.use(cors(corsOptions))

// Additional CORS headers for Vercel
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin
  if (origin && corsOptions.origin.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS'
  )
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With'
  )

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})

// Set EJS as the view engine
app.set('view engine', 'ejs')

// Set the path to the views directory
app.set('views', path.join(__dirname, '../views'))

//parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Database connection
dbConnect()

// Application routes
app.use('/api/v1', routes)

//Welcome route
app.get('/', async (req: Request, res: Response, next: NextFunction) => {
  res.json({
    message: 'Welcome to AmarCash',
  })
})

// Error handling
app.use(globalErrorHandler)

export { app }

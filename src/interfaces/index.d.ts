/* eslint-disable @typescript-eslint/consistent-type-definitions */
import { JwtPayload } from 'jsonwebtoken'

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload | null
    }
  }
}

declare global {
  namespace Express {
    interface Request {
      s3File?: {
        location: string
        key: string
      }
    }

    interface MulterFile {
      buffer: Buffer
      fieldname: string
      originalname: string
      encoding: string
      mimetype: string
      size: number
    }
  }
}

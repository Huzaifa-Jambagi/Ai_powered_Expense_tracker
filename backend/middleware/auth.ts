import { getAuth } from '@clerk/express'
import { Request,Response ,NextFunction} from 'express'

export const auth = (req:Request, res:Response, next:NextFunction) => {
  const auth = getAuth(req)

  if (!auth.isAuthenticated) {
    return res.status(401).json({ error: 'Unauthorized access' })
  }

  next()
}

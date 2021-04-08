import { RequestHandler } from 'express'
import { errorResponse } from '../utils/errorResponse'
import { verifyToken } from '../utils/jwt'

export const authCheck: RequestHandler = (req, res, next) => {
  const token = req.headers['x-auth-token']
  if (!token) {
    errorResponse(res, 401, 'Wrong token')
    return
  }
  const accountId = verifyToken(token as string)
  if (!accountId) {
    errorResponse(res, 401, 'Wrong token')
    return
  }
  res.locals['accountId'] = accountId
  next()
}

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import jwt from 'jsonwebtoken'
import { encrypt } from './encryption'
import { randomBytes } from 'crypto'

const SECRET = process.env.JWT_SECRET || 'sfdfvsbsfdvrevds'

export const createToken = (accountId: string) => {
  const expiery = dayjs.extend(utc).utc().add(10, 'minutes').unix()
  const refreshToken = randomBytes(16).toString('hex')
  const token = jwt.sign(
    {
      account: encrypt(accountId)
    },
    SECRET,
    {
      expiresIn: '10m'
    }
  )
  return {
    token,
    expiery,
    refreshToken
  }
}

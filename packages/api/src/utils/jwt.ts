import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import jwt from 'jsonwebtoken'
import { decrypt, encrypt } from './encryption'
import { randomBytes } from 'crypto'

// INFO: ideally use AWS KMS or Azure key vault to manage these keys
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

export const verifyToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, SECRET)
    return decrypt((decoded as { account: string })['account'])
  } catch (error) {
    return null
  }
}

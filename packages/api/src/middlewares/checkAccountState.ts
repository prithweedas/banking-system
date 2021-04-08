import { redis } from '@banking/db'
import { AuthLocal, CustomRequestHandler } from '../types/requests'
import { errorResponse } from '../utils/errorResponse'

export const checkAccountState: CustomRequestHandler<
  unknown,
  AuthLocal
> = async (_, res, next) => {
  try {
    const {
      locals: { accountId }
    } = res
    const accountState = await redis.getAccountStatus(accountId)
    if (accountState !== 'ACTIVE') {
      errorResponse(res, 401, 'Account not active')
      return
    }
    next()
  } catch (error) {
    errorResponse(res)
  }
}

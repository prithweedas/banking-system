import { Router } from 'express'
import { mongo, redis } from '@banking/db'
import { requestvalidator } from '../middlewares/requestValidator'
import {
  createAccountRequestValidator,
  loginAccountRequestValidator
} from '../utils/validators'
import { AuthLocal, CustomRequestHandler } from '../types/requests'
import { decrypt, encrypt } from '../utils/encryption'
import { errorResponse } from '../utils/errorResponse'
import { createToken } from '../utils/jwt'
import { submitPanVerification } from '../utils/kafka'
import { Account } from '@banking/types'
import { authCheck } from '../middlewares/authCHeck'

const SECURE_COOKIE = process.env.NODE_ENV === 'production'

const router = Router()

const createAccountHandler: CustomRequestHandler<Omit<Account, 'id'>> = async (
  req,
  res
) => {
  try {
    const {
      body: { email, pan, address, username, password, type }
    } = req
    const account = await mongo.account.getAccountByUsername(username)
    if (account) {
      errorResponse(res, 400, 'Username not available')
      return
    }
    const crypt = encrypt(pan, password)

    const accountId = await mongo.account.addAccount({
      email: email,
      // INFO: pan number can not be used without the user's consent
      pan: crypt,
      username: username,
      address: encrypt(JSON.stringify(address)),
      type
    })
    await redis.setAccountStatus(accountId, 'PENDING')
    await submitPanVerification(accountId, pan)
    res
      .json({
        success: true,
        accountId
      })
      .end()
  } catch (error) {
    errorResponse(res)
  }
}

const loginAccountHandler: CustomRequestHandler<
  Pick<Account, 'password' | 'username'>
> = async (req, res) => {
  try {
    const {
      body: { username, password }
    } = req
    const account = await mongo.account.getAccountByUsername(username)
    if (!account) {
      // INFO: account doesn't exist
      errorResponse(res, 400, "Account doesn't exist")
      return
    }
    // INFO: is successfull that means password is correct
    decrypt(account.pan, password)
    const { token, expiery, refreshToken } = createToken(account.id)
    await redis.setRefreshToken(refreshToken, account.id)
    res
      .cookie('x-refresh-token', refreshToken, {
        httpOnly: true,
        secure: SECURE_COOKIE,
        sameSite: 'strict'
      })
      .json({
        success: true,
        token,
        expiery
      })
      .end()
  } catch (error) {
    if (error instanceof mongo.account.MongoError) {
      errorResponse(res)
      return
    }
    errorResponse(res, 401, 'Wrong Password')
  }
}

const refreshAuthToken: CustomRequestHandler<unknown> = async (req, res) => {
  try {
    const refreshToken = req.cookies['x-refresh-token']
    const accountId = await redis.getAccountFromRefreshToken(refreshToken)
    if (!accountId) {
      errorResponse(res, 401, 'Token expired')
      return
    }
    const { token, expiery, refreshToken: newRefreshToken } = createToken(
      accountId
    )
    await redis.setRefreshToken(newRefreshToken, accountId)
    res
      .cookie('x-refresh-token', newRefreshToken, {
        httpOnly: true,
        secure: SECURE_COOKIE,
        sameSite: 'strict'
      })
      .json({
        success: true,
        token,
        expiery
      })
      .end()
  } catch (error) {
    errorResponse(res)
  }
}

const accountOverview: CustomRequestHandler<unknown, AuthLocal> = async (
  req,
  res
) => {
  try {
    const {
      locals: { accountId }
    } = res
    res.json({
      success: true,
      account: await mongo.account.getAccountOverview(accountId)
    })
  } catch (error) {
    errorResponse(res)
  }
}

router.post(
  '/create',
  requestvalidator(createAccountRequestValidator),
  createAccountHandler
)
router.post(
  '/login',
  requestvalidator(loginAccountRequestValidator),
  loginAccountHandler
)
router.get('/refresh', authCheck, refreshAuthToken)
router.get('/overview', authCheck, accountOverview)

export const accountRouter = router

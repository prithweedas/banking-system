import { mongo, redis } from '@banking/db'
import { Transaction, TransactionCheckData } from '@banking/types'
import { Router } from 'express'
import { authCheck } from '../middlewares/authCHeck'
import { checkAccountState } from '../middlewares/checkAccountState'
import { requestvalidator } from '../middlewares/requestValidator'
import { AuthLocal, CustomRequestHandler } from '../types/requests'
import { errorResponse } from '../utils/errorResponse'
import { submitTransaction } from '../utils/kafka'
import { createTransactionRequestValidator } from '../utils/validators'

const router = Router()

const createTransaction: CustomRequestHandler<Transaction, AuthLocal> = async (
  req,
  res
) => {
  try {
    const {
      body: { amount, type }
    } = req
    const {
      locals: { accountId }
    } = res
    const transactionId = await mongo.transaction.addTransaction({
      account: accountId,
      amount,
      type
    })

    const transactionData: TransactionCheckData = {
      accountId,
      amount,
      transactionId,
      type
    }
    // INFO: increase the count by one
    const count = await redis.increaseTransactionLock(accountId)

    if (count > 1) {
      // INFO: if updated count is more than one there are pending transactions for this account
      //        so add this transaction to list
      await redis.addTransactionToList(transactionData)
    } else {
      // INFO: otherwise push this transaction to kafka for processing
      await submitTransaction(transactionData)
    }
    res.json({
      success: true,
      transactionId
    })
  } catch (error) {
    errorResponse(res)
  }
}

const getTransactions: CustomRequestHandler<unknown, AuthLocal> = async (
  _,
  res
) => {
  try {
    const {
      locals: { accountId }
    } = res
    const transactions = await mongo.transaction.getAllTransactions(accountId)
    res.json({
      success: true,
      transactions
    })
  } catch (error) {
    errorResponse(res)
  }
}
const getTransaction: CustomRequestHandler<
  unknown,
  AuthLocal,
  { transactionId: string }
> = async (req, res) => {
  try {
    const {
      locals: { accountId }
    } = res
    const {
      params: { transactionId }
    } = req
    const transaction = await mongo.transaction.getTransaction(
      transactionId,
      accountId
    )

    if (!transaction) {
      errorResponse(res, 400, 'Invalid transactionId')
      return
    }
    res.json({
      success: true,
      transaction
    })
  } catch (error) {
    errorResponse(res)
  }
}

router.get(
  '/',
  authCheck,
  // checkAccountState,
  getTransactions
)
router.get(
  '/:transactionId',
  authCheck,
  // checkAccountState,
  getTransaction
)
router.post(
  '/create',
  requestvalidator(createTransactionRequestValidator),
  authCheck,
  checkAccountState,
  createTransaction
)

export const transactionRouter = router

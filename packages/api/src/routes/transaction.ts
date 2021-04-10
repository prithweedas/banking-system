import { mongo } from '@banking/db'
import { Transaction, TransactionCheckOneData } from '@banking/types'
import { Router } from 'express'
import { MongoError } from 'mongodb'
import { authCheck } from '../middlewares/authCHeck'
import { checkAccountState } from '../middlewares/checkAccountState'
import { AuthLocal, CustomRequestHandler } from '../types/requests'
import { errorResponse } from '../utils/errorResponse'
import { submitTransaction } from '../utils/kafka'

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

    const transactionData: TransactionCheckOneData = {
      accountId,
      amount,
      transactionId,
      type
    }

    await submitTransaction(transactionData)

    res.json({
      success: true,
      transactionId
    })
  } catch (error) {
    if (error instanceof MongoError) {
    }
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

router.get('/', authCheck, checkAccountState, getTransactions)
router.get('/:transactionId', authCheck, checkAccountState, getTransaction)
router.post('/create', authCheck, checkAccountState, createTransaction)

export const transactionRouter = router

import { Transaction } from '@banking/types'
import { db } from '../client'
import { getNextId } from './counter'

type TransactionModel = Transaction & {
  account: string
  id: string
  state: 'PENDING' | 'FAILED' | 'COMPLETE'
}

type AddTransaction = (
  transaction: Omit<TransactionModel, 'id' | 'state'>
) => Promise<string>
type GetAllTransactions = (
  accountId: string
) => Promise<ReadonlyArray<Omit<TransactionModel, 'account'>>>
type GetTransaction = (
  transactionId: string,
  accountId: string
) => Promise<Omit<TransactionModel, 'account'> | null>
type UpdateTransactionState = (
  transactionId: string,
  state: TransactionModel['state']
) => Promise<void>

export const addTransaction: AddTransaction = async transaction => {
  const id = await getNextId('TXN')
  await db.collection<TransactionModel>('transaction').insertOne({
    id,
    state: 'PENDING',
    ...transaction
  })
  return id
}

export const getAllTransactions: GetAllTransactions = accountId => {
  return db
    .collection<TransactionModel>('transaction')
    .find(
      { account: accountId },
      {
        projection: {
          _id: 0,
          account: 1,
          amount: 1,
          id: 1,
          state: 1,
          type: 1
        }
      }
    )
    .toArray()
}

export const getTransaction: GetTransaction = (transactionId, accountId) => {
  return db.collection<TransactionModel>('transaction').findOne({
    account: accountId,
    id: transactionId
  })
}

export const updateTransactionState: UpdateTransactionState = async (
  transactionId,
  state
) => {
  await db
    .collection<TransactionModel>('transaction')
    .updateOne({ id: transactionId }, { state })
}

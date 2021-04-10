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
  account: string
) => Promise<ReadonlyArray<Omit<TransactionModel, 'account'>>>
type GetTransaction = (
  transaction: string,
  account: string
) => Promise<Omit<TransactionModel, 'account'> | null>

export const addTransaction: AddTransaction = async transaction => {
  const id = await getNextId('TXN')
  await db.collection<TransactionModel>('transaction').insertOne({
    id,
    state: 'PENDING',
    ...transaction
  })
  return id
}

export const getAllTransactions: GetAllTransactions = account => {
  return db
    .collection<TransactionModel>('transaction')
    .find(
      { account },
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

export const getTransaction: GetTransaction = (transaction, account) => {
  return db.collection<TransactionModel>('transaction').findOne({
    account,
    id: transaction
  })
}

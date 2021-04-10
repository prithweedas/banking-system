import { Account, AccountStates } from '@banking/types'
export { MongoError } from 'mongodb'
import { db } from '../client'
import { getNextId } from './counter'

type AccountModel = Omit<Account, 'address' | 'password'> & {
  address: string
  state: AccountStates
  balance: number
  id: string
}

type AddAccount = (
  account: Omit<AccountModel, 'id' | 'state' | 'balance'>
) => Promise<string>

type GetAccountByUsername = (username: string) => Promise<AccountModel | null>

type GetAccountOverview = (
  accountId: string
) => Promise<Pick<AccountModel, 'id' | 'state' | 'type' | 'balance'>>

export const addAccount: AddAccount = async account => {
  const id = await getNextId('ACC')
  await db.collection<AccountModel>('account').insertOne({
    id,
    state: 'PENDING',
    balance: 0,
    ...account
  })
  return id
}

export const getAccountByUsername: GetAccountByUsername = async username => {
  const account = await db.collection<AccountModel>('account').findOne({
    username
  })
  return account
}

export const getAccountOverview: GetAccountOverview = async accountId => {
  return (await db
    .collection<AccountModel>('account')
    .findOne<Pick<AccountModel, 'id' | 'state' | 'type' | 'balance'>>(
      {
        id: accountId
      },
      {
        projection: {
          _id: 0,
          balance: 1,
          state: 1,
          type: 1,
          id: 1
        }
      }
    )) as Pick<AccountModel, 'id' | 'state' | 'type' | 'balance'>
}

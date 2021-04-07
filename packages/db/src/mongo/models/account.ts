import { Account } from '@banking/types'
export { MongoError } from 'mongodb'
import { db } from '../client'
import { getNextId } from './counter'
type AccountStates = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'FREEZED'
type AccountModel = Omit<Account, 'address' | 'password'> & {
  address: string
  state: AccountStates
}

type AddAccount = (
  account: Omit<AccountModel, 'id' | 'state'>
) => Promise<string>

type GetAccountByUsername = (username: string) => Promise<AccountModel | null>

export const addAccount: AddAccount = async account => {
  const id = await getNextId('ACC')
  await db.collection<AccountModel>('account').insertOne({
    id,
    state: 'PENDING',
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

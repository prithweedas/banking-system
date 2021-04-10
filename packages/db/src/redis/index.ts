import { Account, AccountStates, TransactionCheckData } from '@banking/types'
import { Tedis } from 'tedis'
const REDIS_HOST = process.env.REDIS_HOST || 'localhost'
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379')

const REFRESH_TOKEN_TIMEOUT = 10 * 60

export const client = new Tedis({
  host: REDIS_HOST,
  port: REDIS_PORT
})

export const setRefreshToken = async (token: string, accountId: string) => {
  await client.setex(`refresh:${token}`, REFRESH_TOKEN_TIMEOUT, accountId)
}
export const getAccountFromRefreshToken = async (token: string) => {
  return (await client.get(`refresh:${token}`)) as string | null
}

export const setAccountState = async (
  accountId: string,
  state: AccountStates
) => {
  await client.set(`account-state:${accountId}`, state)
}
export const getAccountState = async (accountId: string) => {
  return (await client.get(`account-state:${accountId}`)) as AccountStates
}
export const setAccountType = async (
  accountId: string,
  type: Account['type']
) => {
  await client.set(`account-type:${accountId}`, type)
}
export const getAccountType = async (accountId: string) => {
  return (await client.get(`account-type:${accountId}`)) as Account['type']
}

export const increaseTransactionLock = async (
  accountId: string
): Promise<number> => {
  return await client.incrby(`transaction-lock:${accountId}`, 1)
}

export const decreaseTransactionLock = async (
  accountId: string
): Promise<number> => {
  return await client.incrby(`transaction-lock:${accountId}`, -1)
}

export const addTransactionToList = async (
  data: TransactionCheckData
): Promise<void> => {
  await client.lpush(
    `transaction-pending:${data.accountId}`,
    JSON.stringify(data)
  )
}
export const getTransactionFromList = async (
  data: TransactionCheckData
): Promise<string> => {
  return (await client.rpop(`transaction-pending:${data.accountId}`)) as string
}

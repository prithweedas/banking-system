import { Account, AccountStates } from '@banking/types'
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

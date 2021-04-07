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

import { Tedis } from 'tedis'
const REDIS_HOST = process.env.REDIS_HOST || 'localhost'
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379')

export const client = new Tedis({
  host: REDIS_HOST,
  port: REDIS_PORT
})

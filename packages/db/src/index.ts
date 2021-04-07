import * as redis from './redis'
import * as mongo from './mongo'

export const connect = async () => {
  // INFO: add other connection methods in the array if needed
  await Promise.all([mongo.db.connect({})])
}
export const disconnect = async () => {
  // INFO: add other connection methods in the array if needed
  await Promise.all([mongo.db.close()])
}

export { redis, mongo }

// INFO: all operations related to counters
import padStart from 'lodash/padStart'
import { db } from '../client'

export type Counter = {
  name: CounterTypes
  value: number
}
type CounterTypes = 'ACC' | 'TXN'

// INFO: even if the underlying mechanism changes will work as long as the function type matches
type CounterFunction = (name: CounterTypes) => Promise<string>

export const getNextId: CounterFunction = async name => {
  const { value } = await db.collection<Counter>('counter').findOneAndUpdate(
    {
      name
    },
    {
      $inc: { value: 1 }
    },
    {
      returnOriginal: false,
      projection: { value: 1, _id: 0 }
    }
  )

  return `${name}${padStart(String(value?.value), 12, '0')}`
}

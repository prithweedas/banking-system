import {
  KafkaTopics,
  TransactionCheckData,
  TransactionFinalizeData
} from '@banking/types'
import { sleep } from './utils/sleep'
import { Kafka } from 'kafkajs'
import { mongo } from '@banking/db'

const brokers = (process.env.KAFKA_BROKERS || '').split(',')

const main = async () => {
  const client = new Kafka({
    brokers,
    clientId: 'TRANSACTION_TASK'
  })
  const consumer = client.consumer({
    groupId: 'transaction_check_one'
  })
  const producer = client.producer()
  try {
    await Promise.all([
      consumer.connect(),
      producer.connect(),
      mongo.db.connect({})
    ])
    await consumer.subscribe({
      topic: KafkaTopics.TRANSACTION_CHECK_ONE
    })
    await consumer.run({
      partitionsConsumedConcurrently: 3,
      eachMessage: async ({ message: { value }, partition }) => {
        const data = JSON.parse(
          value?.toString() as string
        ) as TransactionCheckData
        // INFO: mocking that this process takes 5 sec
        await sleep(5)
        // INFO: just a mock pan verification check with 70% success probability
        let chance = Math.random() < 0.7
        const { balance } = await mongo.account.getAccountOverview(
          data.accountId
        )
        chance = data.type === 'DEBIT' && data.amount > balance ? false : chance
        if (chance) {
          // INFO: success scenario
          console.log(
            `[${partition}]: Transaction check one success for ${data.transactionId}`
          )
          await producer.send({
            topic: KafkaTopics.TRANSACTION_CHECK_TWO,
            messages: [{ value: JSON.stringify(data) }]
          })
        } else {
          // INFO: fail scenario
          console.log(
            `[${partition}]: Transaction check one failed for ${data.transactionId}`
          )
          const transactionFinalizeData: TransactionFinalizeData = {
            checked: false,
            ...data
          }
          await producer.send({
            topic: KafkaTopics.TRANSACTION_FINALIZE,
            messages: [{ value: JSON.stringify(transactionFinalizeData) }]
          })
        }
      }
    })
  } catch (error) {
    console.error(error)
    await Promise.all([
      consumer.disconnect(),
      producer.disconnect(),
      mongo.db.close()
    ])
    process.exit()
  }
}

main()

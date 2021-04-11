import {
  KafkaTopics,
  TransactionCheckData,
  TransactionFinalizeData
} from '@banking/types'
import { sleep } from './utils/sleep'
import { Kafka } from 'kafkajs'

const brokers = (process.env.KAFKA_BROKERS || '').split(',')

const main = async () => {
  const client = new Kafka({
    brokers,
    clientId: 'TRANSACTION_TASK'
  })
  const consumer = client.consumer({
    groupId: 'transaction_check_two'
  })
  const producer = client.producer()
  try {
    await Promise.all([consumer.connect(), producer.connect()])
    await consumer.subscribe({
      topic: KafkaTopics.TRANSACTION_CHECK_TWO
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
        const chance = Math.random() < 0.7

        if (chance) {
          // INFO: success scenario
          console.log(
            `[${partition}]: Transaction check two success for ${data.transactionId}`
          )
          const transactionFinalizeData: TransactionFinalizeData = {
            checked: true,
            ...data
          }
          await producer.send({
            topic: KafkaTopics.TRANSACTION_FINALIZE,
            messages: [{ value: JSON.stringify(transactionFinalizeData) }]
          })
        } else {
          // INFO: fail scenario
          console.log(
            `[${partition}]: Transaction check two failed for ${data.transactionId}`
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
    await Promise.all([consumer.disconnect(), producer.disconnect()])
    process.exit()
  }
}

main()

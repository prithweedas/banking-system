import {
  KafkaTopics,
  SendCallbackData,
  SendEmailData,
  TransactionFinalizeData
} from '@banking/types'
import { Kafka } from 'kafkajs'
import { mongo, redis } from '@banking/db'
import { sleep } from './utils/sleep'

const brokers = (process.env.KAFKA_BROKERS || '').split(',')

const main = async () => {
  const client = new Kafka({
    brokers,
    clientId: 'TRANSACTION_TASK'
  })
  const consumer = client.consumer({
    groupId: 'transaction_finalize'
  })
  const producer = client.producer()
  try {
    await Promise.all([
      consumer.connect(),
      producer.connect(),
      mongo.db.connect({})
    ])
    await consumer.subscribe({
      topic: KafkaTopics.TRANSACTION_FINALIZE
    })
    await consumer.run({
      partitionsConsumedConcurrently: 3,
      eachMessage: async ({ message: { value }, partition }) => {
        const data = JSON.parse(
          value?.toString() as string
        ) as TransactionFinalizeData
        // INFO: mocking that this process takes 5 sec
        await sleep(5)
        if (data.checked) {
          const mailData: SendEmailData = {
            template: 'TRANSACTION_COMPLETE',
            ...data
          }
          const callbackData: SendCallbackData = {
            type: 'TRANSACTION_COMPLETE',
            tries: 1,
            transactionId: data.transactionId
          }

          await Promise.all([
            mongo.account.updateAccountBalance(
              data.accountId,
              data.amount * (data.type === 'CREDIT' ? 1 : -1)
            ),
            mongo.transaction.updateTransactionState(
              data.transactionId,
              'COMPLETE'
            ),
            producer.send({
              topic: KafkaTopics.SEND_EMAIL,
              messages: [{ value: JSON.stringify(mailData) }]
            }),
            producer.send({
              topic: KafkaTopics.SEND_CALLBACK,
              messages: [{ value: JSON.stringify(callbackData) }]
            })
          ])
        } else {
          const mailData: SendEmailData = {
            template: 'TRANSACTION_FAILED',
            ...data
          }
          const callbackData: SendCallbackData = {
            type: 'TRANSACTION_FAILED',
            tries: 1,
            transactionId: data.transactionId
          }
          await Promise.all([
            mongo.transaction.updateTransactionState(
              data.transactionId,
              'FAILED'
            ),
            producer.send({
              topic: KafkaTopics.SEND_EMAIL,
              messages: [{ value: JSON.stringify(mailData) }]
            }),
            producer.send({
              topic: KafkaTopics.SEND_CALLBACK,
              messages: [{ value: JSON.stringify(callbackData) }]
            })
          ])
        }

        // INFO: decrease the lock count after completion
        const count = await redis.decreaseTransactionLock(data.accountId)
        if (count > 0) {
          // INFO: there are some pending transaction for this account
          const transaction = await redis.getTransactionFromList(data.accountId)
          console.log(
            `[${partition}]: next transaction added to kafka topic. ${transaction}`
          )
          await producer.send({
            topic: KafkaTopics.TRANSACTION_CHECK_ONE,
            messages: [{ value: transaction }]
          })
        }
        console.log(
          `[${partition}]: completed processin of transaction ${data.transactionId}`
        )
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

import { DelayData, KafkaTopics, SendCallbackData } from '@banking/types'
import { Kafka } from 'kafkajs'
import { retryConfigs } from './utils/retryConfigs'
import { sleep } from './utils/sleep'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

const MAX_TRIES = 3

const brokers = (process.env.KAFKA_BROKERS || '').split(',')

const main = async () => {
  const client = new Kafka({
    brokers,
    clientId: 'CALLBACK_TASK'
  })
  const consumer = client.consumer({
    groupId: 'send_callback'
  })
  const producer = client.producer()
  try {
    await Promise.all([consumer.connect(), producer.connect()])
    await consumer.subscribe({
      topic: KafkaTopics.SEND_CALLBACK
    })
    await consumer.run({
      partitionsConsumedConcurrently: 3,
      eachMessage: async ({ message: { value }, partition, topic }) => {
        const data = JSON.parse(value?.toString() as string) as SendCallbackData
        // INFO: mocking that this process takes 5 sec
        await sleep(5)
        // INFO: mock 70% chance of success
        const chance = Math.random() < 0.7
        if (chance) {
          console.log(
            `[${partition}]: sent ${data.type} callback for ${data.transactionId}`
          )
          switch (data.type) {
            // TODO: send callback dependending on template
            case 'TRANSACTION_COMPLETE': {
            }
            case 'TRANSACTION_FAILED': {
            }
          }
        } else {
          if (data.tries <= MAX_TRIES) {
            // INFO: send it to the delay queue
            const retry = data.tries + 1
            const config = retryConfigs[retry]
            const nextExecution = dayjs
              .extend(utc)
              .utc()
              .add(config.delay, 'minutes')
              .unix()

            const retryData: DelayData = {
              topic,
              nextExecution,
              message: JSON.stringify({ ...data, tries: retry })
            }
            await producer.send({
              topic: config.topic,
              messages: [{ value: JSON.stringify(retryData) }]
            })
            console.log(
              `[${partition}]: delay ${data.type} mail for ${data.transactionId} by ${config.delay} minutes`
            )
          } else {
            // INFO: max retries exceeded
            console.log(
              `[${partition}]: discarding ${data.type} mail for ${data.transactionId} as max retries exceeded`
            )
          }
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

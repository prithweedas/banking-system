import { DelayData, KafkaTopics } from '@banking/types'
import { Kafka } from 'kafkajs'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

const brokers = (process.env.KAFKA_BROKERS || '').split(',')

const main = async () => {
  const client = new Kafka({
    brokers,
    clientId: 'DELAY_TASK'
  })
  const consumer = client.consumer({
    groupId: 'delay_task'
  })
  const producer = client.producer()
  try {
    await Promise.all([consumer.connect(), producer.connect()])
    await Promise.all([
      consumer.subscribe({
        topic: KafkaTopics.DELAY_FIVE
      }),
      consumer.subscribe({
        topic: KafkaTopics.DELAY_TEN
      })
    ])
    await consumer.run({
      eachMessage: async ({ message: { value }, topic: subscribedTopic }) => {
        const { message, nextExecution, topic } = JSON.parse(
          value?.toString() as string
        ) as DelayData
        const current = dayjs.extend(utc).utc().unix()
        const delay = nextExecution - current
        if (delay <= 0) {
          // INFO: tme already exceeded, no need to wait
          console.log(
            `Sending delayed message to ${topic}, message -> ${message}`
          )
          await producer.send({
            topic,
            messages: [{ value: message }]
          })
        } else {
          consumer.pause([{ topic: subscribedTopic }])
          setTimeout(async () => {
            console.log(
              `Sending delayed message to ${topic}, message -> ${message}`
            )
            await producer.send({
              topic,
              messages: [{ value: message }]
            })
            consumer.resume([{ topic: subscribedTopic }])
          }, delay * 1000)
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

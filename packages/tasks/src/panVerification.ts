import { KafkaTopics, PanVerificationData, SendEmailData } from '@banking/types'
import { mongo, redis } from '@banking/db'
import { sleep } from './utils/sleep'
import { Kafka } from 'kafkajs'

const brokers = (process.env.KAFKA_BROKERS || '').split(',')

const main = async () => {
  const client = new Kafka({
    brokers,
    clientId: 'PAN_TASK'
  })
  const consumer = client.consumer({
    groupId: 'pan_verification',
    sessionTimeout: 60 * 1000
  })
  const producer = client.producer()
  try {
    await Promise.all([
      consumer.connect(),
      producer.connect(),
      mongo.db.connect({})
    ])
    await consumer.subscribe({
      topic: KafkaTopics.PAN_VERIFICATION
    })
    await consumer.run({
      partitionsConsumedConcurrently: 3,
      eachMessage: async ({ message: { value }, partition }) => {
        const data = JSON.parse(
          value?.toString() as string
        ) as PanVerificationData
        // INFO: mocking that this process takes 30 sec
        await sleep(30)
        // INFO: just a mock pan verification check with 85% success probability
        const chance = Math.random() < 0.85
        if (chance) {
          // INFO: success scenario
          client.logger().info(`sdvsdvsdv ${partition}`)
          console.log(
            `[${partition}]: Account verified ${data.accountId} with pan ${data.pan}`
          )
          const mailData: SendEmailData = {
            template: 'ACCOUNT_VERIFIED',
            ...data
          }
          await Promise.all([
            redis.setAccountState(data.accountId, 'ACTIVE'),
            mongo.account.updateAccountState(data.accountId, 'ACTIVE'),
            producer.send({
              topic: KafkaTopics.SEND_EMAIL,
              messages: [{ value: JSON.stringify(mailData) }]
            })
          ])
        } else {
          // INFO: fail scenario
          console.log(
            `[${partition}]: Account rejected ${data.accountId} with pan ${data.pan}`
          )
          const mailData: SendEmailData = {
            template: 'ACCOUNT_REJECTED',
            ...data
          }
          await Promise.all([
            redis.setAccountState(data.accountId, 'REJECTED'),
            mongo.account.updateAccountState(data.accountId, 'REJECTED'),
            producer.send({
              topic: KafkaTopics.SEND_EMAIL,
              messages: [{ value: JSON.stringify(mailData) }]
            })
          ])
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

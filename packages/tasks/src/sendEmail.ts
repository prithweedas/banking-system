import { KafkaTopics, SendEmailData } from '@banking/types'
import { Kafka } from 'kafkajs'
import { sleep } from './utils/sleep'

const brokers = (process.env.KAFKA_BROKERS || '').split(',')

const main = async () => {
  const client = new Kafka({
    brokers,
    clientId: 'MAIL_TASK'
  })
  const consumer = client.consumer({
    groupId: 'send_mail',
    sessionTimeout: 60 * 1000
  })
  try {
    await Promise.all([consumer.connect()])
    await consumer.subscribe({
      topic: KafkaTopics.SEND_EMAIL
    })
    await consumer.run({
      partitionsConsumedConcurrently: 3,
      eachMessage: async ({ message: { value }, partition }) => {
        const data = JSON.parse(value?.toString() as string) as SendEmailData
        // INFO: mocking that this process takes 5 sec
        await sleep(5)
        console.log(
          `[${partition}]: sent ${data.template} mail to ${data.accountId}`
        )
        switch (data.template) {
          // TODO: send mail dependending on template
          case 'ACCOUNT_REJECTED': {
          }
          case 'ACCOUNT_VERIFIED': {
          }
          case 'TRANSACTION_COMPLETE': {
          }
          case 'TRANSACTION_FAILED': {
          }
        }
      }
    })
  } catch (error) {
    console.error(error)
    await Promise.all([consumer.disconnect()])
    process.exit()
  }
}

main()

import { KafkaTopics } from '@banking/types'
import { Kafka } from 'kafkajs'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
const argv = yargs(hideBin(process.argv)).argv

const brokers = ((argv.brokers as string) || '').split(',')

const client = new Kafka({
  brokers,
  clientId: 'SETUP_SCRIPT'
})

const admin = client.admin()

const main = async () => {
  try {
    await admin.connect()
    await admin.createTopics({
      topics: [
        {
          topic: KafkaTopics.PAN_VERIFICATION,
          numPartitions: 3
        },
        {
          topic: KafkaTopics.SEND_CALLBACK,
          numPartitions: 3
        },
        {
          topic: KafkaTopics.SEND_EMAIL,
          numPartitions: 3
        },
        {
          topic: KafkaTopics.TRANSACTION_CHECK_ONE,
          numPartitions: 3
        },
        {
          topic: KafkaTopics.TRANSACTION_CHECK_TWO,
          numPartitions: 3
        },
        {
          topic: KafkaTopics.TRANSACTION_FINALIZE,
          numPartitions: 3
        },
        {
          topic: KafkaTopics.DELAY_FIVE,
          numPartitions: 1
        },
        {
          topic: KafkaTopics.DELAY_TEN,
          numPartitions: 1
        }
      ]
    })
    console.log('topics created')
  } catch (error) {
    console.log(error)
  } finally {
    await admin.disconnect()
  }
}

main()

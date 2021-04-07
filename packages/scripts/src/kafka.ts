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
          topic: 'pan-verification',
          numPartitions: 3
        },
        {
          topic: 'send-email',
          numPartitions: 4
        },
        {
          topic: 'send-callback',
          numPartitions: 2
        },
        {
          topic: 'check-transaction',
          numPartitions: 5
        },
        {
          topic: 'process-transaction',
          numPartitions: 5
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

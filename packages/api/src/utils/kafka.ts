import { KafkaTopics } from '@banking/types'
import { Kafka } from 'kafkajs'

const brokers = (process.env.KAFKA_BROKERS || '').split(',')
const CLIENT_ID = 'banking-apis'
const kafka = new Kafka({
  brokers,
  clientId: CLIENT_ID
})

export const producer = kafka.producer()

const getPanVerificationPartition = (accountId: string) => {
  const id = parseInt(accountId.slice(3))
  return id % 3
}

export const submitPanVerification = async (accountId: string, pan: string) => {
  const partition = getPanVerificationPartition(accountId)
  await producer.send({
    topic: KafkaTopics.PAN_VERIFICATION_TOPIC,
    messages: [{ value: JSON.stringify({ accountId, pan }), partition }]
  })
}

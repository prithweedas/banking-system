import {
  KafkaTopics,
  PanVerificationData,
  TransactionCheckData
} from '@banking/types'
import { Kafka } from 'kafkajs'

const brokers = (process.env.KAFKA_BROKERS || '').split(',')
const CLIENT_ID = 'banking-apis'
const kafka = new Kafka({
  brokers,
  clientId: CLIENT_ID
})

export const producer = kafka.producer()

export const submitPanVerification = async (data: PanVerificationData) => {
  await producer.send({
    topic: KafkaTopics.PAN_VERIFICATION,
    messages: [{ value: JSON.stringify(data) }]
  })
}

export const submitTransaction = async (data: TransactionCheckData) => {
  await producer.send({
    topic: KafkaTopics.TRANSACTION_CHECK_ONE,
    messages: [{ value: JSON.stringify(data) }]
  })
}

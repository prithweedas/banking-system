import {
  KafkaTopics,
  PanVerificationData,
  TransactionCheckOneData
} from '@banking/types'
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

export const submitPanVerification = async (data: PanVerificationData) => {
  const partition = getPanVerificationPartition(data.accountId)
  await producer.send({
    topic: KafkaTopics.PAN_VERIFICATION,
    messages: [{ value: JSON.stringify(data), partition }]
  })
}

export const submitTransaction = async (data: TransactionCheckOneData) => {
  await producer.send({
    topic: KafkaTopics.TRANSACTION_CHECK_ONE,
    messages: [{ value: JSON.stringify(data) }]
  })
}

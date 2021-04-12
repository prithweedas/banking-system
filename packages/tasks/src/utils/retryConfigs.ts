import { KafkaTopics } from '@banking/types'

export const retryConfigs: {
  [retry: string]: {
    topic: string
    delay: number
  }
} = {
  2: { delay: 5, topic: KafkaTopics.DELAY_FIVE },
  3: { delay: 10, topic: KafkaTopics.DELAY_TEN }
}

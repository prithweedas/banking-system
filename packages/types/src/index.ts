export type Account = {
  id: string
  username: string
  email: string
  address: {
    pincode: string
    state: string
    street: string
  }
  pan: string
  password: string
}

export enum KafkaTopics {
  PAN_VERIFICATION_TOPIC = 'pan-verification'
}

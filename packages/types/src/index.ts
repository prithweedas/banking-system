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
  type: 'CURRENT' | 'SAVINGS'
}

export type AccountStates = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'FREEZED'

export enum KafkaTopics {
  PAN_VERIFICATION = 'pan-verification'
}

export type Account = {
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

export type Transaction = {
  type: 'CREDIT' | 'DEBIT'
  amount: number
}

export type AccountStates = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'FREEZED'

export enum KafkaTopics {
  PAN_VERIFICATION = 'pan-verification',
  TRANSACTION_CHECK_ONE = 'transaction-check-one'
}

// INFO: kafka tasks input data

export type PanVerificationData = {
  accountId: string
  pan: string
}
export type TransactionCheckOneData = {
  transactionId: string
  accountId: string
  amount: number
  type: Transaction['type']
}

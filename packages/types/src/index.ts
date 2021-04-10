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
  ACCOUNT_VERIFIED = 'account-verified',
  ACCOUNT_REJECTED = 'account-rejected',
  TRANSACTION_CHECK_ONE = 'transaction-check-one',
  TRANSACTION_CHECK_TWO = 'transaction-check-two',
  TRANSACTION_EXECUTE = 'transaction-execute',
  TRANSACTION_COMPLETE = 'transaction-complete',
  TRANSACTION_FAILED = 'transaction-failed'
}

// INFO: kafka tasks input data

export type PanVerificationData = {
  accountId: string
  pan: string
}

export type TransactionCheckData = {
  transactionId: string
  accountId: string
  amount: number
  type: Transaction['type']
}

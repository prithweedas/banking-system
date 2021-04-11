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
  TRANSACTION_CHECK_ONE = 'transaction-check-one',
  TRANSACTION_CHECK_TWO = 'transaction-check-two',
  TRANSACTION_FINALIZE = 'transaction-finalize',
  SEND_EMAIL = 'send-email',
  SEND_CALLBACK = 'send-callback'
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
export type TransactionFinalizeData = TransactionCheckData & {
  checked: boolean
}

export type SendEmailData =
  | (TransactionCheckData & {
      template: 'TRANSACTION_FAILED' | 'TRANSACTION_COMPLETE'
    })
  | (PanVerificationData & {
      template: 'ACCOUNT_VERIFIED' | 'ACCOUNT_REJECTED'
    })

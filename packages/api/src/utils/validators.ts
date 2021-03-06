import Ajv, { JSONSchemaType } from 'ajv'
import addFormats from 'ajv-formats'
import { Account, Transaction } from '@banking/types'

export const ajv = new Ajv()
addFormats(ajv, ['email'])

const createAccountRequestSchema: JSONSchemaType<Account> = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['CURRENT', 'SAVINGS']
    },
    password: {
      type: 'string',
      maxLength: 20,
      minLength: 8
    },
    pan: {
      type: 'string',
      pattern: '^([a-zA-Z]){3}([PpFfCc])([A-z])([0-9]){4}([a-zA-Z])$'
    },
    email: {
      type: 'string',
      format: 'email'
    },
    address: {
      type: 'object',
      properties: {
        pincode: {
          type: 'string',
          maxLength: 6,
          minLength: 6,
          pattern: '^[0-9]{6}$'
        },
        state: {
          type: 'string',
          minLength: 3,
          pattern: '^[a-zA-Z0-9 ]*$'
        },
        street: {
          type: 'string',
          minLength: 3,
          pattern: '^[a-zA-Z0-9 ]*$'
        }
      },
      required: ['pincode', 'state', 'street']
    },
    username: {
      type: 'string',
      minLength: 6,
      maxLength: 16,
      pattern: '^[a-zA-Z0-9_]*$'
    }
  },
  required: ['address', 'email', 'pan', 'username', 'password', 'type']
}

const loginAccountRequestSchema: JSONSchemaType<
  Pick<Account, 'username' | 'password'>
> = {
  type: 'object',
  properties: {
    password: {
      type: 'string',
      maxLength: 20,
      minLength: 8
    },
    username: {
      type: 'string',
      minLength: 6,
      maxLength: 16,
      pattern: '^[a-zA-Z0-9]*$'
    }
  },
  required: ['username', 'password']
}

const createTransactionRequestSchema: JSONSchemaType<Transaction> = {
  type: 'object',
  properties: {
    amount: {
      type: 'number',
      minimum: 1
    },
    type: {
      type: 'string',
      enum: ['CREDIT', 'DEBIT']
    }
  },
  required: ['amount', 'type']
}

// INFO: compile all schemas during startup
export const createAccountRequestValidator = ajv.compile(
  createAccountRequestSchema
)
export const loginAccountRequestValidator = ajv.compile(
  loginAccountRequestSchema
)

export const createTransactionRequestValidator = ajv.compile(
  createTransactionRequestSchema
)

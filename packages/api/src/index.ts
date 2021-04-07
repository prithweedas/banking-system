import express from 'express'
import { connect, disconnect } from '@banking/db'
import { authRouter } from './routes/auth'
import { transactionRouter } from './routes/transaction'
import { accountRouter } from './routes/account'

const PORT = parseInt(process.env.PORT || '3000')

const app = express()

const cleanup = (code = 1) => {
  disconnect()
  process.exit(code)
}

process.on('SIGTERM', cleanup)
process.on('SIGINT', cleanup)
process.on('uncaughtException', cleanup)

const main = async () => {
  try {
    await connect()
    app.use(express.json())
    app.use('/auth', authRouter)
    app.use('/transaction', transactionRouter)
    app.use('/account', accountRouter)

    app.listen(PORT, () => {
      console.log('server started')
    })
  } catch (error) {
    console.error(error)
    cleanup()
  }
}

main()

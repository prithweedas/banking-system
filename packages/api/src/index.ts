import express from 'express'
import { connect, disconnect } from '@banking/db'
import { transactionRouter } from './routes/transaction'
import { accountRouter } from './routes/account'
import { producer } from './utils/kafka'
import { errorResponse } from './utils/errorResponse'
import cookieParser from 'cookie-parser'

const PORT = parseInt(process.env.PORT || '3000')

const app = express()

const cleanup = (code = 1) => {
  disconnect()
  producer.disconnect()
  process.exit(code)
}

process.on('SIGTERM', cleanup)
process.on('SIGINT', cleanup)
process.on('uncaughtException', cleanup)

const main = async () => {
  try {
    await Promise.all([connect(), producer.connect()])
    app.use(express.json())
    app.use(cookieParser())

    app.use('/transaction', transactionRouter)
    app.use('/account', accountRouter)
    app.use('*', (_, res) => {
      errorResponse(res, 400, 'Not Found')
    })
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log('server started')
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error)
    cleanup()
  }
}

main()

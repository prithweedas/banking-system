import { mongo } from '@banking/db'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
const argv = yargs(hideBin(process.argv)).argv

const main = async () => {
  try {
    await mongo.db.connect({
      connectionString: argv.connection as string,
      dbName: argv.db as string
    })
    // INFO: counter
    await mongo.db.collection('counter').createIndex(
      {
        name: 1
      },
      { unique: true }
    )

    // INFO: account
    await Promise.all([
      // INFO: creating index on account id
      mongo.db.collection('account').createIndex(
        {
          id: 1
        },
        { unique: true }
      ),
      // INFO: creating index on username
      mongo.db.collection('account').createIndex(
        {
          username: 1
        },
        { unique: true }
      )
    ])

    // INFO: transaction
    await Promise.all([
      // INFO: creating index on account id
      mongo.db.collection('transaction').createIndex(
        {
          id: 1
        },
        { unique: true }
      ),
      // INFO: creating index on username
      mongo.db.collection('transaction').createIndex(
        {
          account: 1
        },
        { unique: true }
      )
    ])
  } catch (error) {
    console.log(error)
  } finally {
    mongo.db.close()
  }
}

main()

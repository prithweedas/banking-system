import { MongoClient, Db, Collection } from 'mongodb'

type DbHelper = {
  client: MongoClient
  connect: (options: {
    connectionString?: string
    dbName?: string
  }) => Promise<void>
  instance: (dbName?: string) => Db
  close: () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  collection: <TSchema = any>(name: string) => Collection<TSchema>
}

const dbConfig = {
  connectionString: process.env.MONGO_CONNECTION_STRING || '',
  dbName: process.env.MONGO_DB_NAME || ''
}

const client = new MongoClient(dbConfig.connectionString, {
  useUnifiedTopology: true,
  useNewUrlParser: true
})
// INFO: create a connection pool at startup and use the same throughout the application life cycle
export const db: DbHelper = {
  client: client,
  async connect({
    connectionString,
    dbName
  }: {
    connectionString?: string
    dbName?: string
  }) {
    // INFO: default connection string and db name will come from environment
    //        exposing alternate api to pass connection and dbName
    if (!!connectionString) {
      this.client = new MongoClient(connectionString, {
        useUnifiedTopology: true,
        useNewUrlParser: true
      })
    }
    if (!!dbName) {
      dbConfig.dbName = dbName
    }
    if (!this.client.isConnected()) {
      await this.client.connect()
    }
  },
  instance(dbName: string = dbConfig.dbName) {
    return this.client.db(dbName)
  },
  close() {
    this.client.close()
  },
  collection<Tschema>(name: string) {
    return this.instance().collection<Tschema>(name)
  }
}

# Mini Banking System


## Tech Stack
  - Node.js
  - MongoDB
  - Kafka
  - Redis

## Steps to run the project

### Install lerna
```bash
yarn global add lerna
```

### Bootstrap the project
```bash
lerna bootstrap
```

### Build the project
```bash
yarn build
```

### Run the init scripts for MongoDB and Kafka
```bash
yarn script:mongo --connection=<MONGO_CONNECTION_STRING> --db=<MONGO_DB_NAME>

yarn script:kafka --brokers=<KAFKA_BROKERS>
```

### Set needed env variables
The following env variables need t be set

```
REDIS_HOST=<redis host>
REDIS_PORT=<redis port>
MONGO_CONNECTION_STRING=<connection string>
MONGO_DB_NAME=<db name>
PORT=<port to run the api on, default 3000>
KAFKA_BROKERS=<comma seperated kafka broker address>
INTERNAL_PASSWORD=<some password to generate encryption key, Ideally would use AWS KMS or Azure Key Vault>
```

### Run the kafka tasks
> NOTE: these tasks can have multiple instances to devide the work. Number of instances should be <= No of Partitions
> We can use PM2 (internally uses node's cluster module) to fork multiple instaneces
```bash
yarn task:panverification // max no of instances = 3
yarn task:transactioncheckone // max no of instances = 3
yarn task:transactionchecktwo // max no of instances = 3
yarn task:transactionfinalize // max no of instances = 3
yarn task:sendemail // max no of instances = 3
yarn task:sendcallback // max no of instances = 3
yarn task:delaytasks // max no of instances = 1
```


### Start the api
```bash
yarn api
```


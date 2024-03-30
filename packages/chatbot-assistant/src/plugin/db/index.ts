import { DataSource as Connection } from 'typeorm'
import type { EntityManager, LoggerOptions, DataSourceOptions as ConnectionOptions } from 'typeorm'
import config from '../config'
import { Container } from 'typedi'
import { entities } from './entities'
import path from 'path'
import { InstanceSettings } from '../utils/InstanceSettings'

let connection: Connection

export const getConnection = () => connection!

type ConnectionState = {
  connected: boolean
}

export const connectionState: ConnectionState = {
  connected: false
}

let pingTimer: NodeJS.Timer | any

export async function transaction<T>(fn: (entityManager: EntityManager) => Promise<T>): Promise<T> {
  return await connection.transaction(fn)
}

export function getConnectionOptions(): ConnectionOptions {
  const entitiesDir = path.resolve(__dirname, 'entities')
  const entityPrefix = config.get('database.tablePrefix')

  const query = {
    entityPrefix,
    entities: Object.values(entities),
    cli: { entitiesDir },
    database: path.resolve(
      Container.get(InstanceSettings).chatBotFolder,
      config.get('database.sqlite.database')
    ),
    enableWAL: config.get('database.sqlite.enableWAL')
  }
  return {
    type: 'sqlite',
    ...query
  }
}

export async function init(): Promise<void> {
  if (connectionState.connected) return

  const connectionOptions = getConnectionOptions()

  let loggingOption: LoggerOptions = config.get('database.logging.enabled')

  if (loggingOption) {
    const optionsString = config.get('database.logging.options').replace(/\s+/g, '')

    if (optionsString === 'all') {
      loggingOption = optionsString
    } else {
      loggingOption = optionsString.split(',') as LoggerOptions
    }
  }

  const maxQueryExecutionTime = config.get('database.logging.maxQueryExecutionTime')

  Object.assign(connectionOptions, {
    entities: Object.values(entities),
    synchronize: true,
    logging: loggingOption,
    maxQueryExecutionTime,
    name: 'chatbox'
  })
  connection = new Connection(connectionOptions)
  Container.set(Connection, connection)
  await connection.initialize()
  connectionState.connected = true
}

export const close = async () => {
  if (pingTimer) {
    clearTimeout(pingTimer)
    pingTimer = undefined
  }
  if (connection.isInitialized) await connection.destroy()
}

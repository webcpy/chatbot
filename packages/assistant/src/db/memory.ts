import { DataSource as Connection1, } from 'typeorm'
import type {  DataSourceOptions as ConnectionOptions } from 'typeorm'
import { Container } from 'typedi'
import { entities } from './memory/index'

let memoryconnection: Connection1

export const getMemoryConnection = () => memoryconnection!

type ConnectionState = {
  connected: boolean
}

export const memoryconnectionState: ConnectionState = {
  connected: false
}

export async function memoryInit(): Promise<void> {
  if (memoryconnectionState.connected) return

  const memoryconnectionOptions: ConnectionOptions = {
    entities: Object.values(entities),
    type: 'sqlite',
    database: ':memory:', // 使用内存数据库
    synchronize: true, // 自动同步实体定义和数据库结构
  }

  memoryconnection = new Connection1(memoryconnectionOptions)
  Container.set(Connection1, memoryconnection)
  await memoryconnection.initialize()
  memoryconnectionState.connected = true
}

export const close = async () => {
  if (memoryconnection.isInitialized) await memoryconnection.destroy()
}


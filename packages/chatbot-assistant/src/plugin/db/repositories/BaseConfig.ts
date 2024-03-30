import { Service } from 'typedi'
import { DataSource, Repository } from 'typeorm'
import { BotConfig } from '../memory/bot'
import config from '../../config'

@Service()
export class BaseConfig extends Repository<BotConfig> {
  constructor(dataSource: DataSource) {
    super(BotConfig, dataSource.manager)
  }
  async addRssConfig(query: any) {
    try {
      const data = await this.save(query)
      return data
    } catch (error) {
      log.fail(['插入数据错误', error])
    }
  }

  async getAllConfig(_query?: {}) {
    try {
      let search = await this.findOneBy({
        userId: config.get('chatbot.userId')
      })
      return search
    } catch (error) {
      log.fail(["查询数据错误", error])
    }
  }

  async getConfigById(id: number) {
    try {
      let search = await this.findBy({ id })
      return search[0]
    } catch (error) {
      log.fail(["查询数据错误", error])
    }
  }

  async updateAllConfig(infos: any) {
    try {
      for (const item of infos) {
        await this.update({ id: item.id }, { ...item })
      }
    } catch (error) {
      log.fail(['更新失败', error])
    }
  }

  async updateOneBaseConfig( info: any) {
    try {
      let search = await this.update({ userId: config.get('chatbot.userId')
    }, { ...info })
      return search
    } catch (error) {
      log.fail(["查询数据错误", error])
    }
  }

  async resetBaseData() {
    await this.clear()
  }
}

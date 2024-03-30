import { Service } from 'typedi'
import { Repository } from 'typeorm'
import { RssData } from '../entities/rssConfig'
import config from '../../config'
import { getConnection } from '../index'

@Service()
export class Rss extends Repository<RssData> {
  constructor() {
    super(RssData, getConnection().manager)
  }
  async addRssConfig(query: any) {
    try {
      const data = await this.save(query)
      return data
    } catch (error) {
      log.fail(['插入数据错误', error])
    }
  }

  async getAllRssConfig() {
    try {
      let search = await this.findBy({
        userId: config.get('chatbot.userId')
      });
      return search || [];
    } catch (error) {
      log.fail(["查询数据错误", error]);
    }
  }

  async getRssConfigById(id: number) {
    try {
      let search = await this.findBy({ id });
      return search[0];
    } catch (error) {
      log.fail(["查询数据错误", error]);
    }
  }

  async updateAllRssConfig(infos: any) {
    try {
      for(const item of infos) {
        await this.update({id: item.id}, {...item})
      }
    } catch (error) {
      log.fail(['更新失败', error])
    }
  }

  async updateOneRssConfig(id: number, info: any) {
    try {
      let search = await this.update({id}, { ...info });
      return search;
    } catch (error) {
      log.fail(["查询数据错误", error]);
    }
  }

  async resetRssData() {
    await this.delete({ userId: config.get('chatbot.userId') });
  }
}

import { Service } from 'typedi'
import { Repository } from 'typeorm'
import { GptConfig } from '../entities/gptConfig'
import { getConnection } from '../index'

@Service()
export class GptConfigs extends Repository<GptConfig> {
  constructor() {
    super(GptConfig, getConnection().manager)
  }
  async addGptConfig(query: any) {
    try {
      const data = await this.save(query)
      return data
    } catch (error) {
      log.fail('插入数据错误', error)
    }
  }

  async getAllGptConfig() {
    try {
      let search = await this.find({});
      return search;
    } catch (error) {
      log.fail(["查询数据错误", error]);
    }
  }

  async getGptConfigById(id: any) {
    try {
      let search = await this.findOneBy({id});
      return search;
    } catch (error) {
      log.fail(["查询数据错误", error]);
    }
  }

  async updateAllGptConfig(infos: any) {
    try {
      for(const item of infos) {
        await this.update({id: item.id}, item)
      }
    } catch (error) {
      log.fail('更新失败', error)
    }
  }

  async updateOneGptConfig(id: any, info: any) {
    try {
      let search = await this.update({id}, { ...info });
      return search;
    } catch (error) {
      log.fail(["查询数据错误", error]);
    }
  }

  async resetData() {
    await this.clear()
  }

}

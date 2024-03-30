import { Service } from 'typedi'
import {  Repository } from 'typeorm'
import { AiChat } from '../entities/aichat'
import { getConnection } from '../index'

@Service()
export class aiChat extends Repository<AiChat> {
  constructor() {
    super(AiChat, getConnection().manager)
  }
  async addAichatRecord(query: any) {
    try {
      const data = await this.save(query)
      return data
    } catch (error) {
      log.fail(['插入数据错误', error])
    }
  }

  async getAichatRecord(query: any) {
    try {
      let search = await this.find(query);
      return search;
    } catch (error) {
      log.fail(["查询数据错误", error]);
    }
  }
  

  async removeRecord(query: any) {
    try {
      let search = await this.delete(query);
      return search;
    } catch (e) {
      log.fail(["error", e]);
    }
  }

  async getAichatQuestion(query: any, day: number) {
    try {
      let list: any = await this.getAichatRecord(query);
      list = list.filter((item: { time: number }) => {
        return item.time >= new Date().getTime() - day * 24 * 60 * 60 * 1000;
      });
      let question = "";
      list.forEach((item: { input: string }) => {
        question = question + "|" + item.input;
      });
      return question;
    } catch (e) {
      log.fail("error", e);
    }
  }
  

  async updateOneBaseConfig(id: number, info: any) {
    try {
      let search = await this.update({ id }, { ...info })
      return search
    } catch (error) {
      log.fail(["查询数据错误", error])
    }
  }

  async resetBaseData() {
    await this.clear()
  }
}

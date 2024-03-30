import { Service } from 'typedi'
import {  Repository } from 'typeorm'
import { RssHistory } from '../entities/rsshisttory'
import { getConnection } from '../index'

@Service()
export class RssHistorys extends Repository<RssHistory> {
  constructor() {
    super(RssHistory, getConnection().manager)
  }
  async addRssHistory(query: any) {
    try {
      const data = await this.save(query)
      return data
    } catch (error) {
      log.fail(['插入数据错误', error])
    }
  }

  async getRssHistory(query: any) {
    try {
      let search = await this.findOneBy(query);
      return search;
    } catch (error) {
      log.fail(["查询数据错误", error]);
    }
  }

  async getRssHistoryById(id: any) {
    try {
      let search = await this.findBy({ id });
      return search[0];
    } catch (error) {
      log.fail(["查询数据错误", error]);
    }
  }

  async updateRssHistory(id: any, info: any) {
    try {
      let search = await this.update({id}, { ...info });
      return search;
    } catch (error) {
      log.success("更新数据错误", error);
    }
  }

  async removeRssRecord(query: any) {
    try {
      let search = await this.delete(query);
      return search;
    } catch (e) {
      log.success("error", e);
    }
  }
}

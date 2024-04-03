import { Service } from 'typedi'
import {  Repository } from 'typeorm'
import { Room } from '../entities/room'
import { getConnection } from '../index'

@Service()
export class Rooms extends Repository<Room> {
  constructor() {
    super(Room, getConnection().manager)
  }
  async addRoomRecord(query: any) {
    try {
      const data = await this.save(query)
      return data
    } catch (error) {
      log.fail(['插入数据错误', error])
    }
  }

  async getRoomRecord(roomName: any) {
    try {
      let search = await this.findOneBy({roomName});
      return search;
    } catch (error) {
      log.success(["查询数据错误", error]);
    }
  }

  async removeRecord(roomName: any) {
    try {
      let search = await this.delete({roomName})
      return search
    } catch (e) {
      log.fail(["error", e]);
    }
  }

  
  async getRoomRecordContent(rooName: any, day: number) {
    try {
      let list: any = await this.getRoomRecord(rooName)
      list = list.filter((item: { time: number })=> {
        return item.time >= new Date().getTime() - day * 24 * 60 * 60 * 1000
      })
      let word = ''
      list.forEach((item: { content: string })=> {
        word = word + item.content
      })
      return word
    } catch (e) {
      log.fail(["error", e]);
    }
  }
}

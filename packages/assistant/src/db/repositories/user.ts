import { Service } from 'typedi'
import { DataSource, Repository, } from 'typeorm'
import { UserInfo } from '../memory/userinfo'
// import { UserInfo } from '../entities/userinfo'
import config from '../../config'

@Service()
export class User extends Repository<UserInfo> {
  constructor(dataSource: DataSource) {
    super(UserInfo, dataSource.manager)
  }
  async saved(query: any) {
    return await this.save(query)
  }
  async getUser() {
    const data = this.findOneBy({userId: config.get('chatbot.userId')})
    return data
  }
}

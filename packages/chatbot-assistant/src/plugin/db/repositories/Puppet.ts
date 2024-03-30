import { Service } from 'typedi'
import { DataSource, Repository } from 'typeorm'
import { Puppet } from '../memory/puppet'

@Service()
export class PuppetConfig extends Repository<Puppet> {
  constructor(dataSource: DataSource) {
    super(Puppet, dataSource.manager)
  }
  async saved(query: any) {
    const data = await this.save(query)
    return data
  }
  async updated(query: { id: number; name: string }){
    const res = await this.find()
    if (res[0]) {
      const data: any = await this.findBy({
        id: query.id
      })
      data.name = query.name
      await this.save(data)
    } else {
      this.saved(query)
    }
  }

  async getPuppetInfo() {
    const res = await this.find()
    if (res[0]) {
      return res[0]
    }
  }
}

import {  Flags} from '@oclif/core'
import { BaseCommand } from '../BaseCommand'

export default class InitGet extends BaseCommand {

  static description = '查看配置'

  static flags = {
    env: Flags.string({char: 'e', description: '获取配置信息' }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse()
    if (flags && flags.env) {
      await super.init()
      console.log(this.setting[flags.env])
    } else {
      await super.init()
      console.log(this.setting)
    }
  }
}

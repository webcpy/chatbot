import { BaseCommand } from '../BaseCommand'
import { initWechat } from '../../start'
export default class Start extends BaseCommand {

  static description = '启动'

  private initConfig = {}
  
  async init() {
    await super.init()
    this.initConfig = {
      ...this.setting,
    }
    if (!this.initConfig['CHATBOT_API_KEY']) {
      throw new Error('未设置apikey')
    }
  }

  async run(): Promise<void> {
    initWechat(this.initConfig)
  }
}

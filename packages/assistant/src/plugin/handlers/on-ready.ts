import common from '../utils/index'
import { delay } from '../lib/index'
import { getConfig, sendHeartBeat, asyncData } from "../proxy/chetbot";
import { Container } from 'typedi'
import { BaseConfig } from '../db/repositories/BaseConfig'

import { User } from '../db/repositories/user'
import { initAllSchedule, initMultiTask } from "../task/index";
import { PuppetConfig } from '../db/repositories/Puppet'
import { initRssTask } from "../task/rss";

/**
 * 准备好的事件
 */
async function onReady() {
  try {
    const updatePuppetConfig = Container.get(PuppetConfig)
    await updatePuppetConfig.saved({ puppetType: this.puppet.constructor.name })
    await getConfig() // 获取配置文件
    initAllSchedule(this) // 初始化任务
    await initMultiTask(this) // 初始化批量定时任务
    await Container.get(BaseConfig).getAllConfig()
    initRssTask(this) // 初始化rss 任务

    log.success(`所有数据准备完毕`)
    sendHeartBeat('live')
    if(this.puppet.syncContact) {
      await this.puppet.syncContact()
    }
    await delay(3000)
    const contactSelf: any = await Container.get(User).getUser()
    await asyncData(contactSelf.robotId, 1)
    common.updateContactInfo(this)
    await delay(3000)
    await asyncData(contactSelf.robotId, 2)
    common.updateRoomInfo(this)
  } catch (e) {
    log.fail(['on ready error:', e])
  }
}
export default onReady

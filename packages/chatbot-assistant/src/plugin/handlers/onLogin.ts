import { getConfig, sendRobotInfo, setQrCode, updatePanelVersion, getPanelVersion, clearVerifyCode } from '../proxy/chetbot'
import { initMqtt } from '../proxy/mqtt'
import { PUPPET_MAP } from '../const/puppet-type'
import configEnv from '../config';
import { PuppetConfig } from '../db/repositories/Puppet'
import { Container } from 'typedi'
// import { BaseConfig } from '../db/repositories/BaseConfig'
import log from '../utils/npmlog'
// import { BaseConfig } from '../db/repositories/BaseConfig'
import { init } from '../db/index';
import { User } from '../db/repositories/user'
import { memoryInit } from '../db/memory';

/**
 * 登录成功监听事件
 * @param {*} user 登录用户
 */
async function onLogin(user: any) {
  try {
    await init()
    await memoryInit()
    const lastVersion = await getPanelVersion()
    const updatePuppetConfig = Container.get(PuppetConfig)
    const version = configEnv.get('chatbot.version')
    log.success(`
      ==========================================================
       贴心AI助理${user}登录了
       你正在使用的是: ${PUPPET_MAP[this.puppet.constructor.name]}!
       最新插件版本: ${lastVersion}
       你的插件版本: ${version}
       ${lastVersion !== version ? '请及时更新插件，才能体验最新功能' : ''}
      ==========================================================
    `)
    await updatePuppetConfig.saved({ puppetType: this.puppet.constructor.name })
    await updatePanelVersion()
    await setQrCode('', 4)
    await getConfig() // 获取配置文件
    void clearVerifyCode()
    // const config: any = await Container.get(BaseConfig).getAllConfig({
    //   userId: configEnv.get('chatbot.userId')
    // })
    const payload = user.payload || user._payload
    const userInfo = {
      ...payload,
      userId: configEnv.get('chatbot.userId'),
      robotId: payload.wxid || payload.id || user.id,
    }
    await Container.get(User).saved({
      ...userInfo
    }) // 全局存储登录用户信息
  
    let file: any = ''
    let avatarUrl = ''
    if(payload.avatar) {
      file = await user.avatar()
      if(file) {
        const base = await file.toDataURL()
        avatarUrl = base
      } else {
        log.info('头像未获取到，不影响项目正常使用')
      }
    }
    await sendRobotInfo(avatarUrl, user.name(), userInfo.robotId) // 更新用户头像
    await initMqtt(this) // 初始化mqtt任务
  } catch (e) {
    log.fail(['登录后初始化失败', e])
  }
}
export default onLogin

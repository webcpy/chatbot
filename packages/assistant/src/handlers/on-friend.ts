import { delay } from '../lib/index'
import { Container } from 'typedi'
import { BaseConfig } from '../db/repositories/BaseConfig'
import { contactSay } from "../utils/index";
/**
 * 好友添加
 */
async function onFriend(friendship: any) {
  try {
    const config = await Container.get(BaseConfig).getAllConfig()
    let logMsg, hello
    let name = friendship.contact().name()
    hello = friendship.hello()
    logMsg = name + '，发送了好友请求'
    log.success(logMsg)
    if (config && config.autoAcceptFriend) {
      switch (friendship.type()) {
        case 2:
          if (config.acceptFriendKeyWords.length === 0) {
            log.success('无认证关键词,10秒后将会自动通过好友请求')
            await delay(10000)
            await friendship.accept()
          } else if (config.acceptFriendKeyWords.length > 0 && config.acceptFriendKeyWords.includes(hello)) {
            log.success(`触发关键词${hello},10秒后自动通过好友请求`)
            await delay(10000)
            await friendship.accept()
          } else {
            log.success('未触发任何关键词，好友自动添加失败')
          }
          break
        case 1:
          logMsg = '已确认添加好友：' + name
          log.success(`新添加好友：${name}，默认回复`)
          if(config.newFriendReplys && config.newFriendReplys.length) {
            for (let reply of config.newFriendReplys) {
              await delay(1000);
              await contactSay.call(this, friendship.contact(), reply);
            }
          }
          break
        case 0:
          logMsg = '未知错误' + name
          log.success(logMsg)
          break
        case 3:
          logMsg = '开启了验证' + name
          log.success(logMsg)
          break
      }
    } else {
      log.success('未开启自动添加好友功能，忽略好友添加')
    }
  } catch (e) {
    log.success('添加好友出错：', e)
  }
}
export default onFriend

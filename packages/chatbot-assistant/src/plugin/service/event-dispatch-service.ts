import api from '../proxy/api'
import { getConfig, getMeiNv, getWordCloudConfig, getCustomEvents } from '../proxy/chetbot'
import { getConstellation, msgArr, getNewsType } from '../lib/index.js'
import { initTaskLocalSchedule, initTimeSchedule, initMultiTask } from "../task/index.js";
import { updateContactAndRoom, updateContactOnly, updateRoomOnly } from '../utils/index'
import { getTencentOpenReply } from '../proxy/tencent-open'
import { Rooms } from '../db/repositories/room'
// import { removeRecord } from "../db/roomDb.js";
import { getGptOfficialReply, reset as officialReset } from "../proxy/openAi";
import { getGptUnOfficialReply, reset } from "../proxy/openAiHook";
import { getDifyReply, reset as difyReset } from "../proxy/difyAi";
import { outApi } from '../proxy/outapi'
import { BinaryLike } from 'crypto';
import { Container } from 'typedi'

/**
 * 根据事件名称分配不同的api处理，并获取返回内容
 * @param {string} eName 事件名称
 * @param {string} msg 消息内容
 * @param name
 * @param id
 * @param avatar
 * @returns {string} 内容
 */
// @ts-ignore
async function dispatchEventContent(that, eName, msg, name, id, avatar, room, roomName, sourceMsg) {
  try {
    let content: any = '',
      type = 1,
      url = ''

    if((eName || '').includes('event-')) {
      const res = await getCustomEvents({ msg: msg || '', sourceMsg: sourceMsg || '', wxid: id, name, eventId: eName, roomName: roomName || '' })
      return res;
    }
    /**
     * 扩展 api
     */
    if((eName || '').includes('outapi-')) {
      const res = await outApi({ msg: msg || '', sourceMsg: sourceMsg || '', wxid: id, name, eventId: eName, roomName: roomName || '' })
      return res;
    }
    switch (eName) {
      case 'rubbish':
        content = await api.getRubbishType(msg)
        break
      case 'mingyan':
        content = await api.getMingYan()
        break
      case 'sweetword':
        content = await api.getSweetWord()
        break
      case 'star':
        let xing = getConstellation(msg)
        content = await api.getStar(xing)
        break
      case 'news':
        let newsId = getNewsType(msg)
        content = await api.getNews(newsId)
        break
      case 'xing':
        content = await api.getXing(msg)
        break
      case 'skl':
        content = await api.getSkl()
        break
      case 'lunar':
        content = await api.getLunar(msg)
        break
      case 'goldreply':
        content = await api.getGoldReply()
        break
      case 'xhy':
        content = await api.getXhy()
        break
      case 'rkl':
        content = await api.getRkl()
        break
      case 'emo':
        url = await api.getEmo(msg)
        type = 2
        break
      case 'meinv':
        url = await getMeiNv()
        type = 2
        break
      case 'cname':
        content = await api.getCname()
        break
      case 'removeRecord': {
        const roomName = await room.topic() // 获取群名
        const config = await getWordCloudConfig(roomName)
        if (config.authList) {
          if(config.authList.length) {
            if (config.authList.includes(name)) {
              await Container.get(Rooms).removeRecord(roomName)
              content = '清除成功'
            } else {
              content = '很抱歉，你没有权限清楚记录'
            }
          } else {
            await Container.get(Rooms).removeRecord(roomName)
            content = '清除成功'
          }
        } else {
          content = '本群暂未开通群词云功能，无需清楚记录'
        }
        break
      }
      case 'reloadFriendOnly':
        await updateContactOnly(that)
        content = '更新好友列表成功，请稍等两分钟后生效'
        break
      case 'reloadRoomOnly':
        await updateRoomOnly(that)
        content = '更新群列表成功，请稍等两分钟后生效'
        break
      case 'reloadFriend':
        await updateContactAndRoom(that)
        content = '更新好友群消息成功，请稍等两分钟后生效'
        break
      case 'updateConfig':
        await getConfig()
        await initTaskLocalSchedule(that)
        await initTimeSchedule(that)
        await initMultiTask(that)
        reset();
        officialReset();
        difyReset();
        content = '更新配置成功，请稍等一分钟后生效'
        break
      default:
        break
    }
    return msgArr(type, content, url)
  } catch (e) {
    log.success('事件处理异常', e)
    return []
  }
}
/**
 * 派发不同的机器人处理回复内容
 * @param {*} bot 机器人类别 0 天行机器人 1 天行的图灵机器人 2 图灵机器人 3 腾讯闲聊机器人
 * @param {*} msg 消息内容
 * @param {*} name 发消息人
 * @param {*} id 发消息人id
 */
async function dispatchAiBot(bot: any, msg: any, name: any, id: BinaryLike) {
  try {
    let res, replys
    switch (bot) {
      case 0:
        // 天行机器人
        res = await api.getResByTX(msg, id)
        replys = [{ type: 1, content: res }]
        break
      case 1:
        // 天行图灵机器人
        res = await api.getResByTXTL(msg, id)
        replys = [{ type: 1, content: res }]
        break
      case 2:
        // 图灵机器人
        res = await api.getResByTL(msg, id)
        replys = [{ type: 1, content: res }]
        break
      case 3:
        // 微信闲聊
        replys = [{ type: 1, content: '微信闲聊已下线，建议使用微信对话开放平台: https://openai.weixin.qq.com' }]
        break
      case 5:
        // 微信开放对话平台
        res = await getTencentOpenReply({ msg, id, userInfo: { name } })
        replys = res
        break
      case 6:
        // ChatGPT-api
        res = await getGptOfficialReply(msg, id, false)
        replys = res
        break
      case 7:
        // ChatGPT-hook
        res = await getGptUnOfficialReply(msg, id)
        replys = res
        break
      case 8:
        // dify ai
        res = await getDifyReply(msg, id)
        replys = res
        break
      case 9:
        // fast gpt
        res = await getGptOfficialReply(msg, id, true)
        replys = res
        break
      default:
        replys = [{ type: 1, content: '' }]
        break
    }
    return replys
  } catch (e) {
    log.success('机器人接口信息获取失败', e)
    return ''
  }
}
export { dispatchEventContent }
export { dispatchAiBot }
export default {
  dispatchEventContent,
  dispatchAiBot,
}

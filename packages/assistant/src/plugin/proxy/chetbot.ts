import { aiBotReq, req , newTxReq} from './superagent'
import { getPuppetEol } from "../const/puppet-type.js";
import globalConfig from '../config'
import { Container } from 'typedi';
import { BaseConfig } from '../db/repositories/BaseConfig'
import { Rss } from '../db/repositories/rssConfig'
import log from '../utils/npmlog'
import { get } from 'lodash'
import { service } from './superagent'

/**
 * 获取美女图片
 */
async function getMeiNv() {
  try {
    let option = {
      method: 'GET',
      url: '/meinv',
      params: {},
    }
    let content: any = await aiBotReq(option)
    let pics = content.data.pics || []
    if (pics.length) {
      let url = pics[0]
      return url.includes('.jpg') ? url : 'https://tva2.sinaimg.cn/large/0072Vf1pgy1foxkcsx9rmj31hc0u0h9k.jpg'
    }
  } catch (e) {
    log.success('获取美女图片失败', e)
    return 'https://tva2.sinaimg.cn/large/0072Vf1pgy1foxkcsx9rmj31hc0u0h9k.jpg'
  }
}


/**
 * 获取配置词云的所有群名
 */
export async function getWordCloudRoom() {
  try {
    let option = {
      method: 'get',
      url: '/wordcloudroom',
      params: {},
    }
    let content: any = await aiBotReq(option)
    const roomNames = content.data.map((item: { roomName: any; })=> item.roomName)
    return roomNames  || []
  } catch (e) {
    log.success('群词云配置拉取失败', e)
    return []
  }
}
/**
 * 获取群合影配置
 */
export async function getWordCloudConfig(roomName: any) {
  try {
    let option = {
      method: 'get',
      url: '/roomCloud',
      params: { name: roomName },
    }
    let content: any = await aiBotReq(option)
    return content.data || ''
  } catch (e) {
    log.success('群词云配置拉取失败', e)
  }
  return ''
}

/**
 * 获取词云图片
 */
export async function getWordCloud(wordcontent: any, background: any, border: any) {
  try {
    let option = {
      method: 'POST',
      url: '/wordcloud',
      params: {
        content: wordcontent,
        background,
        border
      },
    }
    let content: any = await aiBotReq(option)
    let pics = decodeURIComponent(content.data.img)
    return pics
  } catch (e) {
    log.fail(['获取词云图片失败', e])
  }
  return ''
}
/**
 * 获取每日一句
 */
async function getOne() {
  try {
    let option = {
      method: 'GET',
      url: '/one/index',
      params: {},
    }
    let content: any = await newTxReq(option)
    let word = content.result.word || '今日一句似乎已经消失'
    return word
  } catch (e) {
    log.fail('获取每日一句失败', e)
    return '今日一句似乎已经消失'
  }
}
/**
 * 获取火灾新闻
 */
async function getFireNews(id: string | number, num: any) {
  try {
    let option = {
      method: 'GET',
      url: '/firenews',
      params: {
        id,
        num
      },
    }
    let content: any = await aiBotReq(option)
    let newList = content.data || []
    let news = ''
    const eol = await getPuppetEol();
    for (let i in newList) {
      let num = parseInt(i) + 1
      const url = newList[i].shortUrl?newList[i].shortUrl:newList[i].url
      news = `${news}${eol}${num}.${newList[i].title}${url?`${eol}${url}${eol}`:`${eol}`}`
    }
    const endMap: any = {
      1001: '您可以 @消防小助手+新闻标题，通过ChatGPT为您分析时事新闻！',
      1002: '您可以 @消防小助手+新闻标题，通过ChatGPT为您分析今日消防行业招标信息！',
    }
    return `${news}…………………………${eol}${eol}${endMap[id] || ''}`
  } catch (e) {
    log.success('获取每日一句失败', e)
    return '今日一句似乎已经消失'
  }
}

/**
 * 获取自定义内容
 * @param id
 * @returns {Promise<[{type: number, content: string}]|*[]>}
 */
export async function getCustomNews(id: any) {
  try {
    let option = {
      method: 'GET',
      url: '/customnews',
      params: {
        id
      },
    }
    let content: any = await aiBotReq(option)
    let newContent = content.data || []

    return newContent
  } catch (e) {
    log.success('定制内容获取失败', e)
    return [{ type: 1, content: '定制内容获取失败' }]
  }
}

/**
 * 获取自定义api
 * @param id
 * @returns {Promise<[{type: number, content: string}]|*[]>}
 */
export async function getCallbackApi(id: any) {
  try {
    let option = {
      method: 'GET',
      url: `/detailGlobalTask/${id}`,
    }
    let content: any = await aiBotReq(option)
    let apiData = content.data || {}
    const data: any = {
    }
    const moreData = get(apiData, 'moreData', []);
    moreData.length &&
    moreData.forEach((mItem: { key: string; value: any }) => {
      if (mItem.key !== 'uid' && mItem.key !== 'uname' && mItem.key !== 'word' && mItem.key !== 'roomId' && mItem.key !== 'roomName') {
        data[mItem.key] = mItem.value
      }
    })
    const timeout = get(apiData, 'timeout', 60)
    const customUrl = get(apiData, 'customUrl', '');
    const methods: any = get(apiData, 'methods', 'GET').toLowerCase();      
    let res: any = await (service as any)[methods](customUrl, data, { timeout: timeout * 1000 })
    return res.data || []

  } catch (e) {
    log.fail('获取回调配置失败', e)
    return [{ type: 1, content: '获取回调配置失败' }]
  }
}

/**
 * 获取自定义技能
 * @param params
 * @returns {Promise<[{type: number, content: string}]|*[]>}
 */
export async function getCustomEvents(params: any) {
  try {
    let option = {
      method: 'POST',
      url: '/customevent',
      params,
    }
    let content: any = await aiBotReq(option)
    let newContent = content.data || []

    return newContent
  } catch (e) {
    log.success('自定义技能获取失败', e)
    return [{ type: 1, content: '自定义技能获取失败' }]
  }
}
/**
 * 获取配置文件
 * @returns {Promise<*>}
 */
async function getConfig() {
  try {
    let option = {
      method: 'GET',
      url: '/wechat/config',
      params: {},
    }
    let content: any = await aiBotReq(option)
    const config = content.data.config
    let cloudRoom: any = []
    await getGptConfig()
    await getTasks()
    await getRssConfig()
    // cloudRoom = await getWordCloudRoom()
    globalConfig.set('chatbot.userId', config.userId)
    const updateConfig = Container.get(BaseConfig)
    let cres = await updateConfig.save({
      puppetType: 'wechaty-puppet-wechat',
      botScope: 'all',
      parseMini: false,
      openaiSystemMessage: '',
      showQuestion: true,
      openaiTimeout: 60,
      openaiAccessToken: '',
      openaiDebug: false,
      openaiModel:'gpt-3.5-turbo',
      dify_token: '',
      dify_baseUrl: '',
      proxyUrl: '',
      proxyPassUrl: '',
      difyAgent: false,
      chatFilter: 0,
      filterType: 1, // 过滤引擎类型 1 百度文本审核
      filterAppid: '',
      filterApiKey: '',
      filterSecretKey: '',
      countDownTaskSchedule: [],
      parseMiniRooms: [],
      preventLength: 1000,
      preventWords: '',
      customBot: null,
      roomAt: 1,
      friendNoReplyInRoom: 0,
      defaultReply: '',
      ...config,
      cloudRoom
    })
    return cres
  } catch (e) {
    log.fail(['获取配置文件失败:' + e])
  }
}

/**
 * 获取gpt配置
 * @return {Promise<*>}
 */
export async function getGptConfig() {
  try {
    let option = {
      method: 'GET',
      url: '/gpt/config',
      params: {},
    }
    let content: any = await aiBotReq(option)
    if(content.data.list) {
      const list = content.data.list.map((item: { id: any; })=> ({...item, _id: item.id}))
      globalConfig.set('chatbot.gptconfig', list)
    }
  } catch (error) {
    log.fail(['获取gpt配置文件失败:' + error])
  }
}
/**
 * 获取关键词进群
 * @return {Promise<*>}
 */
export async function getRoomJoinKeywords() {
  try {
    let option = {
      method: 'GET',
      url: '/getRoomJoinKeywords',
      params: {},
    }
    let content: any = await aiBotReq(option)
    if(content.data) {
      const updateConfig = Container.get(BaseConfig)
      await updateConfig.updateOneBaseConfig({
        roomJoinKeywords: content.data
      })
    }
  } catch (error) {
    log.fail(['关键词进群:' + error])
  }
}

/**
 * 更新配置
 * @return {Promise<*>}
 */
export async function updateBaseConfig(type: any) {
  try {
    let option = {
      method: 'GET',
      url: '/wechat/config',
      params: {},
    }
    let content: any = await aiBotReq(option)
    const data = get(content.data, `config.${type}`, [])

    const updateConfig = Container.get(BaseConfig)
    await updateConfig.updateOneBaseConfig({
      [`${type}`]: data
    })
  } catch (error) {
    log.fail(['关键词进群:' + error])
  }
}
/**
 * 获取简单回答
 * @return {Promise<*>}
 */
export async function openApiGetKeywords() {
  try {
    let option = {
      method: 'GET',
      url: '/wechat/getKeywords',
      params: {},
    }
    let content: any = await aiBotReq(option)
    if(content.data) {
      const updateConfig = Container.get(BaseConfig)
      await updateConfig.updateOneBaseConfig({
        replyKeywords: content.data
      })
    }
  } catch (error) {
    log.fail(['获取简单回答:' + error])
  }
}

/**
 * 获取技能中心
 * @return {Promise<*>}
 */
export async function openApiGetEventKeywords() {
  try {
    let option = {
      method: 'GET',
      url: '/wechat/getEventKeywords',
      params: {},
    }
    let content: any = await aiBotReq(option)
    if(content.data) {
      const updateConfig = Container.get(BaseConfig)
      await updateConfig.updateOneBaseConfig({
        eventKeywords: content.data
      })
    }
  } catch (error) {
    log.fail(['获取技能中心:' + error])
  }
}

/**
 * 获取批量任务
 * @return {Promise<*>}
 */
export async function getTasks() {
  try {
    let option = {
      method: 'GET',
      url: '/user/task',
      params: {},
    }
    let content: any = await aiBotReq(option)
    if(content.list) {
      const list = content.list.map((item: { id: any; })=> ({...item, _id: item.id}))
      globalConfig.set('chatbot.allTasks', list)
    }
  } catch (error) {
    log.fail(['获取批量任务失败:' + error])
  }
}

/**
 * 获取rss配置
 * @return {Promise<*>}
 */
export async function getRssConfig() {
  try {
    let option = {
      method: 'GET',
      url: '/rss/config',
      params: {},
    }
    let content: any = await aiBotReq(option)
    if(content.data) {
      const list = content.data.map((item: { id: any; })=> ({...item, _id: item.id}))
      const rssConfig: any = Container.get(Rss)
      await rssConfig.resetRssData()
      await rssConfig.updateAllRssConfig(list)
    }
  } catch (error) {
    log.fail('获取rss配置文件失败:' + error)
  }
}

/**
 * 更新对话次数
 * @param id
 * @param num
 * @return {Promise<*>}
 */
async function updateChatRecord(id: any, num: any) {
  try {
    let option = {
      method: 'POST',
      url: '/gpt/updateConfig',
      params: {
        id,
        limitWord: num
      },
    }
    let content: any = await aiBotReq(option)
    return content.data
  } catch (error) {
    log.fail('更新对话次数' + error)
  }
}

/**
 * 获取promotion信息
 * @param id
 * @return {Promise<*>}
 */
async function getPromotInfo(id: any) {
  try {
    let option = {
      method: 'get',
      url: `/promot/info/${id}`,
    }
    let content: any = await aiBotReq(option)
    return content.data
  } catch (e) {
    log.success("catch error:" + e);
  }
}

/**
 * 获取输入的验证码
 * @param id
 * @return {Promise<*>}
 */
async function getVerifyCode() {
  try {
    let option = {
      method: 'get',
      url: '/worker/verifycode',
    }
    let content: any = await aiBotReq(option)
    log.success(['获取微秘书平台输入的验证码', JSON.stringify(content.data.verifyCode)])
    if(content.data.code) {
      globalConfig.set('chatbot.verifyCode', content.data.verifyCode)
    }
  } catch (e) {
    log.fail(`catch error: ${e}`)
  }
}

/**
 * 清除使用过的验证码
 * @returns {Promise<*>}
 */
async function clearVerifyCode() {
  try {
    let option = {
      method: 'get',
      url: '/worker/clearverifycode',
    }
    await aiBotReq(option)
    globalConfig.set('chatbot.verifyCode', '')
  } catch (e) {
    log.success("catch error:" + e);
  }
}
/**
 * 获取定时提醒任务列表
 */
async function getScheduleList() {
  try {
    let option = {
      method: 'GET',
      url: '/task',
      params: {},
    }
    let content: any = await aiBotReq(option)
    let scheduleList = content.data
  
    log.success('获取定时提醒任务成功:' + scheduleList)
    return scheduleList
  } catch (error) {
    log.fail('获取定时任务失败:' + error)
  }
}
/**
 * 设置定时提醒任务
 * @param {*} obj 任务详情
 * @returns {*} 任务详情
 */
async function setSchedule(obj: any) {
  try {
    let option = {
      method: 'POST',
      url: '/task',
      params: obj,
    }
    let content: any = await aiBotReq(option)
    return content.data
  } catch (error) {
    log.success('添加定时任务失败', error)
  }
}
/**
 * 更新定时提醒任务
 */
async function updateSchedule(id: any) {
  try {
    let option = {
      method: 'GET',
      url: '/task/update',
      params: { id: id },
    }
    await aiBotReq(option)
    log.success('更新定时任务成功')
  } catch (error) {
    log.success('更新定时任务失败', error)
  }
}
/**
 * 登录二维码推送
 * @param url
 * @param status
 * @returns {Promise<void>}
 */
async function setQrCode(url: any, status: any) {
  try {
    let option = {
      method: 'GET',
      url: '/wechat/qrcode',
      params: { qrUrl: url, qrStatus: status },
    }
    let content = await aiBotReq(option)
    if (content) {
      log.success('推送二维码成功.')
    } else {
      log.fail('推送登录二维码失败')
    }
  } catch (error) {
    log.fail(['推送登录二维码失败', error])
  }
}
/**
 * 推送登录状态的心跳
 * @param heart
 * @returns {Promise<void>}
 */
async function sendHeartBeat(heart: any) {
  try {
    let option = {
      method: 'GET',
      url: '/wechat/heart',
      params: { heartBeat: heart },
    }
    await aiBotReq(option)
  } catch (error) {
    log.fail('推送心跳失败', error)
  }
}
/**
 * 更新头像
 * @returns {Promise<void>}
 * @param url
 * @param info 用户基本信息
 */
async function sendRobotInfo(url: any, name: any, id: any) {
  try {
    let option = {
      method: 'POST',
      url: '/wechat/info',
      params: { avatar: url, robotName: name, robotId: id },
    }
    await aiBotReq(option)
  } catch (error) {
    log.fail(['推送头像失败', error])
  }
}
/**
 * 更新好友
 * @returns {Promise<void>}
 * @param url
 */
async function sendFriend(friend: any) {
  try {
    let option = {
      method: 'POST',
      url: '/wechat/friend',
      params: { friend: friend },
    }
    let content: any = await aiBotReq(option)
    if (content.code !== 200) {
      log.fail(['推送失败', content.msg])
    }
  } catch (error) {
    log.fail('推送好友列表失败')
  }
}
/**
 * 更新群
 * @returns {Promise<void>}
 * @param url
 */
async function sendRoom(room: any) {
  try {
    let option = {
      method: 'POST',
      url: '/wechat/room',
      params: { room: room },
    }
    let content: any = await aiBotReq(option)
    if (content.code !== 200) {
      log.success('推送失败', content.msg)
    }
  } catch (error) {
    log.success('推送群列表失败', error)
  }
}
/**
 * 同步群和好友列表
 * type： 1 好友 2 群组
 */
async function asyncData(robotId: any, type: any) {
  try {
    let option = {
      method: 'get',
      url: '/wechat/asyncData',
      params: { type, robotId },
    }
    await aiBotReq(option)
  } catch (error) {
    log.fail('同步好友列表失败', error)
  }
}
/**
 * 获取上传token
 * @returns {Promise<*>}
 */
async function getQiToken() {
  try {
    let option = {
      method: 'GET',
      url: '/wechat/qitoken',
      params: {},
      platform: 'qi',
    }
    let content: any = await aiBotReq(option)
    return content.data.token
  } catch (e) {
    log.success('token error', e)
  }
}
/**
 * 上传base64图片到七牛云
 * @param base
 * @param name
 * @returns {Promise<void>}
 */
async function putqn(base: any, name: WithImplicitCoercion<ArrayBuffer | SharedArrayBuffer>) {
  try {
    const token = await getQiToken()
    const namebase = Buffer.from(name).toString('base64').replace(/=/g, '')
    let filename = 'wechat/avatar/' + namebase + '.jpeg'
    let base_file_name = Buffer.from(filename).toString('base64').replace('+', '-').replace('/', '_')
    let options = {
      method: 'POST',
      url: 'http://upload.qiniup.com/putb64/-1/key/' + base_file_name,
      contentType: 'application/octet-stream',
      authorization: 'UpToken ' + token,
      params: base,
      platform: 'chuan',
    }
    let content: any = await req(options)
    log.success('上传结果', content.key)
    return 'https://img.aibotk.com/' + content.key
  } catch (e) {
    log.success('上传失败', e.Error)
  }
  return ''
}
/**
 * 更新插件版本信息
 * @param {*} version
 */
async function updatePanelVersion() {
  try {
    let option = {
      method: 'POST',
      url: '/webPanel/version',
      params: { version: globalConfig.get('chatbot.version') },
    }
    log.success(['更新插件版本号', globalConfig.get('chatbot.version')])
    let content: any = await aiBotReq(option)
    return content.data
  } catch (error) {
    log.fail('error', error)
  }
}
/**
 * 更新插件版本信息
 * @param {*} version
 */
export async function getPanelVersion() {
  try {
    let option = {
      method: 'GET',
      url: '/webPanel/version',
    }
    let content: any = await aiBotReq(option)
    return content.data
  } catch (error) {
    log.fail(['error', error])
  }
}
/**
 * 获取mqtt信息
 * @param {*} version
 */
async function getMqttConfig() {
  try {
    let option = {
      method: 'GET',
      url: '/mqtt/config',
      params: {},
    }
    let content: any = await aiBotReq(option)
    return content.data
  } catch (error) {
    log.fail(['获取mqtt配置错误', error])
  }
}
/**
 * 获取实时素材
 * @param {*} version
 */
async function getMaterial(id: any) {
  
  try {
    let option = {
      method: 'GET',
      url: `/wechat/material/${id}`,
      params: {}
    }
    let content: any = await aiBotReq(option)
    return content.data
  } catch (error) {
    log.fail(['获取mqtt配置错误', error])
  }
}
export { getVerifyCode }
export { clearVerifyCode }
export { getConfig }
export { getScheduleList }
export { setSchedule }
export { updateSchedule }
export { setQrCode }
export { sendHeartBeat }
export { sendRobotInfo }
export { putqn }
export { sendFriend }
export { sendRoom }
export { asyncData }
export { updatePanelVersion }
export { getMqttConfig }
export { getMeiNv }
export { getOne }
export { getMaterial }
export { getFireNews }
export { updateChatRecord }
export {  getPromotInfo }
export default {
  getConfig,
  getScheduleList,
  setSchedule,
  updateSchedule,
  setQrCode,
  sendHeartBeat,
  sendRobotInfo,
  putqn,
  sendFriend,
  sendRoom,
  asyncData,
  updatePanelVersion,
  getMqttConfig,
  getMeiNv,
  getOne,
  getMaterial,
  getFireNews,
  clearVerifyCode,
  getVerifyCode
}

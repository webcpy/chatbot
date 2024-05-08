import { getNews, getTXweather, getSweetWord } from '../proxy/api'
import { sendFriend, sendRoom, asyncData, getOne, getMaterial, gettts, getCustomNews } from '../proxy/chetbot'
import { User } from '../db/repositories/user'
import { formatDate, getDay, groupArray, delay } from '../lib/index.js'
import { FileBox } from 'file-box'
import { Container } from 'typedi'
// import { BaseConfig } from '../db/repositories/BaseConfig'
// import configEnv from '../config'
import { getPuppetEol, isWindowsPlatform } from "../const/puppet-type.js";
import sharp from 'sharp'
import { Dayjs } from 'dayjs'
import { getCustomConfig } from '../service/msg-filters'
import { get } from 'lodash'

async function formatContent(text: string) {
  text = text.replaceAll('\\n', '\n');
  const isWin = await isWindowsPlatform()
  if (isWin) {
    return text.replaceAll(/\n/g, "\r").replaceAll(/\n/g, "\r");
  }
  return text;
}

/**
 * 获取每日新闻内容
 * @param {*} sortId 新闻资讯分类Id
 * @param {*} endWord 结尾备注
 */
async function getNewsContent(sortId: any, endWord = '', num = 10) {
  const eol = await getPuppetEol();
  let today = formatDate(new Date()) //获取今天的日期
  let news = await getNews(sortId, num)
  let content = `${today}${eol}${news}${eol}${endWord ? '————————' : ''}${endWord}`
  return content
}

/**
 * 获取自定义定制内容
 * @param {*} sortId 定制Id
 */
export async function getCustomContent(sortId: any) {
  let news = await getCustomNews(sortId)
  return news
}
/**
 * 获取每日说内容
 * @param {*} date 与朋友的纪念日
 * @param {*} city 朋友所在城市
 * @param {*} endWord 结尾备注
 */
async function getEveryDayContent(date: string | number | Date | Dayjs | null | undefined, city: any, endWord: any) {
  const eol = await getPuppetEol();
  let one = await getOne() //获取每日一句
  let weather: any = await getTXweather(city) //获取天气信息
  let today = formatDate(new Date()) //获取今天的日期
  let memorialDay = getDay(date) //获取纪念日天数
  let sweetWord = await getSweetWord() // 土味情话
  let str = `${today}${eol}我们在一起的第${memorialDay}天${eol}${eol}元气满满的一天开始啦,要开心噢^_^${eol}${eol}今日天气${eol}${weather.weatherTips}${eol}${weather.todayWeather}${eol}每日一句:${eol}${one}${eol}${eol}情话对你说:${eol}${sweetWord}${eol}${eol}————————${endWord}`
  return str
}

async function getRoomEveryDayContent(date: string | number | Date | Dayjs | null | undefined, city: any, endWord: any) {
  const eol = await getPuppetEol();
  let one = await getOne() //获取每日一句
  let weather: any = await getTXweather(city) //获取天气信息
  let today = formatDate(new Date()) //获取今天的日期
  let memorialDay = getDay(date) //获取纪念日天数
  let str = `${today}${eol}家人们相聚在一起的第${memorialDay}天${eol}${eol}元气满满的一天开始啦,家人们要努力保持活跃啊^_^${eol}${eol}今日天气${eol}${weather.weatherTips}${eol}${weather.todayWeather}${eol}每日一句:${eol}${one}${eol}${eol}————————${endWord}`
  return str
}

/**
 * 获取倒计时内容
 * @param date
 * @param prefix
 * @param suffix
 * @param endWord
 * @return {string}
 */
async function getCountDownContent(date: string | number | Date | Dayjs | null | undefined, prefix: any, suffix: any, endWord: any) {
  const eol = await getPuppetEol();
  let countDownDay = getDay(date) //获取倒计时天数
  let today = formatDate(new Date()) //获取今天的日期

  let str = `${today}${eol}距离${prefix}还有${eol}${eol}${countDownDay}天${eol}${eol}${suffix}${endWord ? `${eol}${eol}————————${endWord}` : ''}`
  return str;
}
/**
 * 更新用户信息
 */
async function updateContactInfo(that: any, noCache = false) {
  try {
    if (noCache && that.puppet.syncContact) {
      await that.puppet.syncContact()
      await delay(3000)
    }
    const contactSelf: any = await Container.get(User).getUser()
    const contactList = await that.Contact.findAll() || []
    let res = []
    const notids = ['filehelper', 'fmessage']
    let realContact = contactList.filter((item: { payload: any; _payload: any }) => {
      const payload = item.payload || item._payload
      return payload.friend && !notids.includes(payload.id) && !payload.id.includes('gh_')
    })
    for (let i of realContact) {
      let contact = i.payload || i._payload
      let obj = {
        robotId: contactSelf.robotId,
        contactId: contact.id,
        wxid: contact.id,
        name: contact.name || '',
        alias: contact.alias || '',
        gender: contact.gender,
        avatar: contact.avatar || '',
        friend: contact.friend,
        type: contact.type || '',
        weixin: contact.weixin || '',
      }
      res.push(obj)
    }
    await updateFriendInfo(res, 80)
  } catch (e) {
    log.fail(['e', e])
  }
}
/**
 * 分批次更新好友信息
 * @param {*} list 好友列表
 * @param {*} num 每次发送数据
 */
async function updateFriendInfo(list: string | any[], num: number) {
  const arr = groupArray(list, num)
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i]
    await sendFriend(item)
    await delay(500)
  }
}
/**
 * 更新群列表
 */
async function updateRoomInfo(that: any, noCache = false) {
  try {
    if (noCache && that.puppet.syncContact) {
      await that.puppet.syncContact()
      await delay(3000)
    }
    const contactSelf: any = await Container.get(User).getUser()
    const roomList = await that.Room.findAll() || []
    let res = []
    for (let i of roomList) {
      let room = i.payload || i._payload
      let obj = {
        robotId: contactSelf.robotId,
        wxid: room.id,
        roomId: room.id,
        topic: room.topic,
        avatar: room.avatar || '',
        ownerId: room.ownerId || '',
        adminIds: room.adminIdList.toString(),
        memberCount: room.memberIdList.length,
      }
      res.push(obj)
    }
    await updateRoomsInfo(res, 80)
  } catch (e) {
    log.fail(['e', e])
  }
}
/**
 * 更新群信息
 * @param {*} list 好友列表
 * @param {*} num 每次发送数据
 */
async function updateRoomsInfo(list: string | any[], num: number) {
  const arr = groupArray(list, num)
  for (let i = 0; i < arr.length; i++) {
    const item = arr[i]
    await sendRoom(item)
    await delay(500)
  }
}
/**
 * 统一触发加群欢迎词
 * @param room 群
 * @param roomName 群名
 * @param contactName 进群人
 * @param msg 消息
 */
async function addRoomWelcomeSay(room: any, roomName: any, contactName: any, msg: any) {
  if (msg.type === 1 && msg.content !== '') {
    // 文字
    log.info(['回复内容', msg.content])
    await room.say(`${roomName}：欢迎新朋友 @${contactName}，\n${msg.content}`)
  } else if (msg.type === 2 && msg.url !== '') {
    // url文件
    let obj = FileBox.fromUrl(msg.url)
    log.info(['回复内容', obj])
    await room.say(obj)
  }
}
/**
 * 群关键词回复
 * @param {*} contact
 * @param {*} msg
 * @param {*} isRoom
 */
async function roomSay(room: any, contact: any, msg: any) {
  // const config: any = await Container.get(BaseConfig).getAllConfig({
  //   userId: configEnv.get('chatbot.userId')
  // })
  if (msg.materialId) {
    const res = await getMaterial(msg.materialId)
    if (res.materialId) {
      msg = res
    }
  }
  try {
    if (msg.type === 1 && msg.content) {
      const content = await formatContent(msg.content)
      // 文字
      contact ? await room.say(content, contact) : await room.say(content)
    } else if (msg.type == 2 && msg.url) {
      // url文件
      let obj = FileBox.fromUrl(msg.url)
      if (obj.mediaType == 'image/webp') {
        const buffer = await obj.toBuffer()
        sharp(buffer).png().toBuffer(async (_err, buffer) => {
          const file = FileBox.fromBuffer(buffer, 'send.png')
          contact ? await room.say('', contact) : ''
          await room.say(file)
        });
        return
      }
      // contact ? await room.say('', contact) : ''
      await delay(500)
      await room.say(obj)
    } else if (msg.type == 3 && msg.url) {
      // bse64文件
      let obj = FileBox.fromDataURL(msg.url, msg.fileName ? msg.fileName : 'room-avatar.jpg')
      contact ? await room.say('', contact) : ''
      await delay(500)
      await room.say(obj)
    } else if (msg.type == 4 && msg.url && msg.title && msg.description) {
      const description = await formatContent(msg.description)
      const title = await formatContent(msg.title)
      let url = new this.UrlLink({
        description: description,
        thumbnailUrl: msg.thumbUrl,
        title: title,
        url: msg.url,
      })
      await room.say(url)
    } else if (msg.type == 5 && msg.appid && msg.title && msg.pagePath && msg.description && msg.thumbUrl) {
      let miniProgram = new this.MiniProgram({
        appid: msg.appid,
        title: msg.title,
        pagePath: msg.pagePath,
        description: msg.description,
        thumbUrl: msg.thumbUrl,
        thumbKey: msg.thumbKey,
        username: msg.username || ''
      })
      await room.say(miniProgram)
    } else if (msg.type == 8 && msg.url && msg.voiceLength) {
      const fileBox = FileBox.fromUrl(msg.url);
      fileBox.mimeType = "audio/silk";
      // fileBox.mediaType = "audio/silk";
      fileBox.metadata = {
        voiceLength: msg.voiceLength,
      };
      await room.say(fileBox)
    }
  } catch (e) {
    log.fail(['群回复错误', e])
  }
}

/**
 * 私聊发送消息
 * @param contact
 * @param msg
 * @param _isRoom
 *  type 1 文字 2 图片url 3 图片base64 4 url链接 5 小程序  6 名片 7 富文本 8 语音
 */
async function contactSay(contact: any, msg: any, _isRoom = false) {
  // const config: any = await Container.get(BaseConfig).getAllConfig({
  //   userId: configEnv.get('chatbot.userId')
  // })
  // const { role } = config.userInfo

  const name = await contact.name()
  let result: any = await getCustomConfig({ name, id: contact.id, roomName: '', roomId: '', room: false, type: 'tts' })

  let noTagContent = (msg.content || '').replace(/\s/g, '')
  if (result.tts && get(result, 'botConfig.robotType', '') == 11 && !!msg.textToSil) {
    if ( noTagContent.length < 280 ) {
      msg.type = 8
      msg = {
        voice: result.botConfig.voice,
        token: result.botConfig.token,
        proxyPass: result.botConfig.proxyPass,
        ...msg
      }
    }
    
  }

  if (msg.materialId) {
    const res = await getMaterial(msg.materialId)
    if (res.materialId) {
      msg = res
    }
  }
  log.info(['回复内容：', msg.type == 3 ? {
    ...msg,
    url: 'base64'
  } : msg])
  try {
    if (msg.type == 1 && msg.content) {
      const content = await formatContent(msg.content)
      // 文字
      await contact.say(content)
    } else if (msg.type == 2 && msg.url) {
      // url文件
      let obj = FileBox.fromUrl(msg.url)
      await obj.ready()
      if (obj.mediaType === 'image/webp') {
        const buffer = await obj.toBuffer()
        sharp(buffer).png().toBuffer(async (_err, buffer) => {
          const file = FileBox.fromBuffer(buffer, 'send.png')
          await contact.say(file)
        });
        return
      }
      await contact.say(obj)
    } else if (msg.type == 3 && msg.url) {
      // bse64文件
      let obj = FileBox.fromDataURL(msg.url, msg.fileName ? msg.fileName : 'user-avatar.jpg')
      await contact.say(obj)
    } else if (msg.type == 4 && msg.url && msg.title && msg.description) {
      const description = await formatContent(msg.description)
      const title = await formatContent(msg.title)
      let url = new this.UrlLink({
        description: description,
        thumbnailUrl: msg.thumbUrl,
        title: title,
        url: msg.url,
      })
      await contact.say(url)
    } else if (msg.type == 5 && msg.appid && msg.title && msg.pagePath && msg.description && msg.thumbUrl) {
      let miniProgram = new this.MiniProgram({
        appid: msg.appid,
        title: msg.title,
        pagePath: msg.pagePath,
        description: msg.description,
        thumbUrl: msg.thumbUrl,
        thumbKey: msg.thumbKey,
        username: msg.username || ''
      })
      await contact.say(miniProgram)
    } else if (msg.type == 8) {
      const data = await gettts(msg)
      if (data.voiceLength > 60 * 1000) {
        await contact.say(msg.content)
      } else {
        const fileBox = FileBox.fromBase64(data.base, data.name);
        fileBox.mimeType = "audio/silk";
        fileBox.metadata = {
          voiceLength: data.voiceLength,
        };
        await contact.say(fileBox)
      }
      
    }
  } catch (e) {
    log.success(e)
    log.fail(['私聊发送消息失败', e])
  }
}
/**
 * 统一邀请加群
 * @param that
 * @param contact
 */
async function addRoom(that: any, contact: any, roomName: any, replys: any) {
  let room = await that.Room.find({ topic: roomName })
  if (room) {
    try {
      for (const item of replys) {
        await delay(2000)
        await contactSay.call(that, contact, item)
      }
      await room.add(contact)
    } catch (e) {
      log.fail('加群报错', e)
    }
  } else {
    log.success(`不存在此群：${roomName}`)
  }
}
/**
 * 发送群公告
 * @param roomIds
 * @param content
 * @return {Promise<void>}
 */
async function sendRoomNotice(room: any, content: any) {
  if (room && content) {
    await room.announce(content)
  }
}
/**
 * 重新同步好友和群组
 * @param that
 * @returns {Promise<void>}
 */
async function updateContactAndRoom(that: any) {
  const contactSelf: any = await Container.get(User).getUser()
  await asyncData(contactSelf.robotId, 1)
  await delay(2000)
  await asyncData(contactSelf.robotId, 2)
  await delay(2000)
  await updateRoomInfo(that, true)
  await delay(2000)
  await updateContactInfo(that)
}
/**
 * 重新同步好友
 * @param that
 * @returns {Promise<void>}
 */
async function updateContactOnly(that: any) {
  const contactSelf: any = await Container.get(User).getUser()
  await asyncData(contactSelf.robotId, 1)
  await delay(2000)
  await updateContactInfo(that, true)
}
/**
 * 重新同步群
 * @param that
 * @returns {Promise<void>}
 */

async function updateRoomOnly(that: any) {
  const contactSelf: any = await Container.get(User).getUser()
  await asyncData(contactSelf.robotId, 2)
  await delay(2000)
  await updateRoomInfo(that, true)
}
export { updateRoomOnly }
export { updateContactOnly }
export { getEveryDayContent }
export { getNewsContent }
export { updateContactInfo }
export { updateRoomInfo }
export { addRoom }
export { contactSay }
export { roomSay }
export { addRoomWelcomeSay }
export { updateContactAndRoom }
export { getRoomEveryDayContent }
export { getCountDownContent }
export { sendRoomNotice }
export default {
  updateRoomOnly,
  updateContactOnly,
  getEveryDayContent,
  getNewsContent,
  updateContactInfo,
  updateRoomInfo,
  addRoom,
  contactSay,
  roomSay,
  addRoomWelcomeSay,
  updateContactAndRoom,
  getCountDownContent
}

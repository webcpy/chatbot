import { contactSay, roomSay } from '../utils/index'
import { getContactTextReply, getRoomTextReply } from '../utils/reply'
import { delay } from '../lib/index'
import { dispatchAsync } from '../service/room-async-service'
import { privateForward } from '../utils/hook'
import { Container } from 'typedi'
import { BaseConfig } from '../db/repositories/BaseConfig'
import { Rooms } from '../db/repositories/room'
import globalConfig from '../config'

import { getPuppetEol } from '../const/puppet-type'
import { getGpt4vChat } from '../service/gpt4vService'
import { getVoiceText, getAudioText } from '../proxy/multimodal'
import { getCustomConfig } from '../service/msg-filters'

const ignoreRecord = [
  { type: 'include', word: '加入了群聊' },
  { type: 'include', word: '与群里其他人都不是朋友关系' },
  { type: 'include', word: '收到一条暂不支持的消息类型' }
]

/**
 * 检测是否属于忽略的消息
 * @param msg 用户信息
 * @param list 需要忽略的列表
 */
function checkIgnore(msg: string, list: string | any[]) {
  if (!list.length) return false
  for (let item of list) {
    const word = item.word
    const type = item.type
    if ((type === 'start' && msg.startsWith(word)) || (type === 'end' && msg.endsWith(word)) || (type === 'equal' && msg === word) || (type === 'include' && msg.includes(word))) {
      return true
    }
  }
  return false;
}

async function handleFriendText(content: string, contact: any, name: any, that: any) {
  const isIgnore = checkIgnore(content.trim(), globalConfig.get('chatbot.ignoreMessages'));
  if (content.trim() && !isIgnore) {
    const gpt4vReplys = await getGpt4vChat({
      that,
      room: false,
      roomId: '',
      uniqueId: contact.id,
      id: contact.id,
      roomName: '',
      isMention: false,
      name,
      msgContent: { type: 1, content }
    })

    if (gpt4vReplys.length) {
      for (let reply of gpt4vReplys) {
        await contactSay.call(that, contact, {
          ...reply,
        })
      }
      return
    }
    let replys = await getContactTextReply(that, contact, content.trim())
   
    for (let reply of replys) {
      await delay(1000)
      await contactSay.call(that, contact, {
        ...reply,
      })
    }
  }
}
/**
 * 根据消息类型过滤私聊消息事件
 * @param {*} that bot实例
 * @param {*} msg 消息主体
 */
async function dispatchFriendFilterByMsgType(that: any, msg: any) {
  try {
    const eol = await getPuppetEol()
    const config: any = await Container.get(BaseConfig).getAllConfig()
    const type = msg.type()
    const contact = msg.talker() // 发消息人
    const name = await contact.name()
    const isOfficial = contact.type() === that.Contact.Type.Official
    let content = ''
    let replys: any = []
    const res = await privateForward({ that, msg, name, config })
    if (res) {
      return
    }
    switch (type) {
      case that.Message.Type.Text:
        content = msg.text()
        if (!isOfficial) {
          log.success(`发消息人${name}:${content}`)
          await handleFriendText(content, contact, name, that)
        } else {
          log.success('公众号消息')
        }
        break
      case that.Message.Type.Audio:
        let finalConfig: any = await getCustomConfig({ name, id: contact.id, roomName: '', roomId: '', room: false, type: 'openWhisper' })
        if (finalConfig) {
          const audioFileBox: any = await msg.toFileBox()
          const text = await getAudioText(audioFileBox)
          log.success('语音解析结果', text)
          const keyword = finalConfig.botConfig.whisperConfig?.keywords?.length ? finalConfig.botConfig?.whisperConfig.keywords?.find((item: any) => text.includes(item)) : true;
          const isIgnore = checkIgnore(content.trim(), globalConfig.get('chatbot.ignoreMessages'))
          if (text.trim() && !isIgnore && keyword) {
            const gpt4vReplys = await getGpt4vChat({
              that,
              room: false,
              roomId: '',
              uniqueId: contact.id,
              id: contact.id,
              roomName: '',
              isMention: false,
              name,
              msgContent: { type: 1, content: text }
            })
            if (gpt4vReplys.length) {
              for (let reply of gpt4vReplys) {
                await contactSay.call(that, contact, reply)
              }
              return
            }
            replys = await getContactTextReply(that, contact, text.trim())
            for (let reply of replys) {
              await delay(1000)
              await contactSay.call(that, contact, reply)
            }
          } else {
            log.success('语音解析结果没有匹配到需要回复的关键词')
          }
        } else {
          const audioFileBox: any = await msg.toFileBox()
          log.success(`发消息人${name}:语音解析中`)
          const text = await getAudioText(audioFileBox)
          log.success(`发消息人${name}:语音解析成功`, text)
          await handleFriendText(text, contact, name, that)
        }
        break
      case that.Message.Type.Emoticon:
        log.success(`发消息人${await contact.name()}:发了一个表情`)
        break
      case that.Message.Type.Image:
        log.success(`发消息人${await contact.name()}:发了一张图片`)
        let imgOpen: any = await getCustomConfig({ name, id: contact.id, roomName: '', roomId: '', room: false, type: 'open4v' })
        if (imgOpen) {
          const imgGpt4vReplys = await getGpt4vChat({
            that,
            room: false,
            roomId: '',
            id: contact.id,
            uniqueId: contact.id,
            roomName: '',
            isMention: false,
            name,
            msgContent: { type: 3, id: msg.id }
          })
          if (imgGpt4vReplys.length) {
            for (let reply of imgGpt4vReplys) {
              await contactSay.call(that, contact, reply)
            }
            return
          }
        } else {
          // const imgFileBox: any = await msg.toFileBox()
          // const text = await getImageText(imgFileBox)
          // log.success('图片解析结果', text)
          // await handleFriendText(text, contact, name, that)
        }
        break
      case that.Message.Type.Video:
        log.success(`发消息人${await contact.name()}:发了一个视频`)
        break
      case that.Message.Type.Audio:
        log.success(`发消息人${await contact.name()}:发了一个视频`)
        break
      case that.Message.Type.MiniProgram:
        log.success(`发消息人${await contact.name()}:发了一个小程序`)
        const miniProgram = await msg.toMiniProgram()
        if (config.parseMini && miniProgram.payload) {
          const miniParse = `【小程序解析】${eol}${eol}appid：${miniProgram.appid()}${eol}username：${miniProgram.username().replace('@app', '')}${eol}标题：${miniProgram.title()}${eol}描述：${miniProgram.description()}${eol}路径：${decodeURIComponent(miniProgram.pagePath())}`
          contact.say(miniParse)
        }
        log.success('mini', miniProgram)
        break
      case that.Message.Type.Url:
        log.success(`发消息人${await contact.name()}:发了一个h5链接`)
        const urlLink = await msg.toUrlLink()
        if (config.parseMini && urlLink.payload) {
          const urlParse = `【链接解析】${eol}${eol}标题：${urlLink.title()}${eol}描述：${urlLink.description()}${eol}链接：${urlLink.url()}${eol}缩略图：${urlLink.thumbnailUrl()}`
          contact.say(urlParse)
        }
        log.success('urlLink', urlLink)
        break
      case that.Message.Type.Transfer:
        log.success(`发消息人${await contact.name()}: 发起一个转账，请在手机接收`)
        log.success('内容', msg.payload)
        break
      default:
        break
    }
  } catch (error) {
    log.fail('监听消息错误', error)
  }
}
async function handelRoomText(that: any, content: any, room: any, receiver: any, contactId: any, contact: any, contactAvatar: any, isFriend: any, userSelfName: any, roomName: any, contactName: any, msg: any) {
  const config: any = await Container.get(BaseConfig).getAllConfig()
  const mentionSelf = await msg.mentionSelf() || content.includes(`@${userSelfName}`)
  const receiverName = receiver?.name()
  content = content.replace('@' + receiverName, '').replace('@' + userSelfName, '').replace(/@[^,，：:\s@]+/g, '').trim()
  log.success(`群名: ${roomName} 发消息人: ${contactName} 内容: ${content} | 机器人被@：${mentionSelf ? '是' : '否'}`)
  // 检测是否需要这条消息
  const isIgnore = checkIgnore(content, globalConfig.get('chatbot.ignoreMessages'))
  if (isIgnore) return
  const gpt4vReplys = await getGpt4vChat({
    that,
    room,
    roomId: room.id,
    id: contactId,
    uniqueId: `${room.id}-${contactId}`,
    roomName,
    isMention: mentionSelf,
    name: contactName,
    msgContent: { type: 1, content }
  })
  if (gpt4vReplys.length) {
    for (let reply of gpt4vReplys) {
      await delay(1000)
      await roomSay.call(that, room, contact, reply)
    }
    return
  }
  let replys: any = await getRoomTextReply({
    that,
    content,
    isFriend,
    name: contactName,
    id: contactId,
    roomId: room.id,
    avatar: contactAvatar,
    room,
    roomName,
    isMention: mentionSelf
  })
  for (let reply of replys) {
    await delay(1000)
    await roomSay.call(that, room, contact, reply)
  }

  const cloudRoom = config.cloudRoom
  if (cloudRoom.includes(roomName) && !checkIgnore(content, ignoreRecord)) {
    const regex = /(<([^>]+)>)/ig
    content = content.replace(regex, '')
    void Container.get(Rooms).addRoomRecord({
      roomName,
      roomId: room.id,
      content,
      contact: contactName,
      wxid: contactId,
      time: new Date().getTime()
    })
  }
}
/**
 * 根据消息类型过滤群消息事件
 * @param {*} that bot实例
 * @param {*} room room对象
 * @param {*} msg 消息主体
 */
async function dispatchRoomFilterByMsgType(that: any, room: any, msg: any) {
  const config: any = await Container.get(BaseConfig).getAllConfig()
  try {
    const eol = await getPuppetEol()
    const contact = msg.talker() // 发消息人
    const contactName = contact.name()
    const roomName = await room.topic()
    const isFriend = contact.friend()
    const type = msg.type()
    const receiver = msg.to()
    let content = ''
    let replys: any = ''
    let contactId = contact.id
    let contactAvatar = await contact.avatar()
    const userSelfName = that.currentUser?.name() || that.userSelf()?.name()

    switch (type) {
      case that.Message.Type.Text:
        content = msg.text()
        await handelRoomText(that, content, room, receiver, contactId, contact, contactAvatar, isFriend, userSelfName, roomName, contactName, msg)
        break
      case that.Message.Type.Emoticon:
        content = msg.text()
        log.success(`群名: ${roomName} 发消息人: ${contactName} 发了一个表情 ${content}`)
        break
      case that.Message.Type.Image:
        log.success(`群名: ${roomName} 发消息人: ${contactName} 发了一张图片`)
        let finalConfigs: any = await getCustomConfig({ name: contactName, id: contactId, roomName, roomId: room.id, room, type: 'open4v' })
        if (!finalConfigs) {
          // const imgFileBox: any = await msg.toFileBox()
          // const text = await getImageText(imgFileBox)
          // log.success(['图片解析结果', text])
          // await handelRoomText( that, text, room, receiver, contactId, contact, contactAvatar, isFriend, userSelfName, roomName, contactName, msg)
        } else {
          const imgGpt4vReplys = await getGpt4vChat({
            that,
            room,
            roomId: room.id,
            id: contactId,
            uniqueId: `${room.id}-${contactId}`,
            roomName,
            isMention: false,
            name: contactName,
            msgContent: { type: 3, id: msg.id }
          })
          if (imgGpt4vReplys.length) {
            for (let reply of imgGpt4vReplys) {
              await roomSay.call(that, room, contact, reply)
            }
            return
          }
        }

        break
      case that.Message.Type.Video:
        log.success(`群名: ${roomName} 发消息人: ${contactName} 发了一个视频`)
        break
      case that.Message.Type.Audio:
        log.success(`群名: ${roomName} 发消息人: ${contactName} 发了一个语音`)
        let finalConfig: any = await getCustomConfig({ name: contactName, id: contactId, roomName, roomId: room.id, room, type: 'openWhisper' })
        if (finalConfig) {
          const audioFileBox = await msg.toFileBox()
          const text = await getVoiceText(audioFileBox, finalConfig.botConfig.whisperConfig)
          log.success(['语音解析结果', text])
          const keyword = finalConfig.botConfig.whisperConfig?.keywords?.length ? finalConfig.botConfig?.whisperConfig?.keywords?.find((item: any) => text.includes(item)) : true;
          const isIgnore = checkIgnore(content.trim(), globalConfig.get('chatbot.ignoreMessages'))
          if (text.trim() && !isIgnore && keyword) {
            const gpt4vReplys = await getGpt4vChat({
              that,
              room,
              roomId: room.id,
              id: contactId,
              uniqueId: `${room.id}-${contactId}`,
              roomName,
              isMention: true,
              name: contactName,
              msgContent: { type: 1, content: text }
            })
            if (gpt4vReplys.length) {
              for (let reply of gpt4vReplys) {
                await roomSay.call(that, room, contact, reply)
              }
              return
            }
            replys = await await getRoomTextReply({
              that,
              content: text,
              isFriend,
              name: contactName,
              id: contactId,
              roomId: room.id,
              avatar: contactAvatar,
              room,
              roomName,
              isMention: true
            })
            for (let reply of replys) {
              await delay(1000)
              await roomSay.call(that, room, contact, reply)
            }
          } else {
            log.success('语音解析结果没有匹配到需要回复的关键词')
          }
        } else {
          // const audioFileBox: any = await msg.toFileBox()
          // log.success(`群名${roomName} 发消息人: ${contactName}:语音解析中`)
          // const text = await getAudioText(audioFileBox)
          // log.success(`群名${roomName} 发消息人: ${contactName}:语音解析成功`, text)
          // await handelRoomText(that, text, room, receiver, contactId, contact, contactAvatar, isFriend, userSelfName, roomName, contactName, msg)
        }
        break
      case that.Message.Type.MiniProgram:
        log.success(`群名: ${roomName} 发消息人: ${contactName} 发了一个小程序`)
        const miniProgram = await msg.toMiniProgram()
        if (config.parseMiniRooms.find((it: { name: any }) => it.name == roomName) && miniProgram.payload) {
          const miniParse = `【小程序解析】${eol}${eol}appid:${miniProgram.appid()}${eol}username：${miniProgram.username().replace('@app', '')}${eol}标题：${miniProgram.title()}${eol}描述：${miniProgram.description()}${eol}路径：${decodeURIComponent(miniProgram.pagePath())}${eol}`
          room.say(miniParse)
        }
        log.success('mini', miniProgram)
        break
      case that.Message.Type.Url:
        log.success(`群名: ${roomName} 发消息人: ${contactName} 发了一个h5链接`)
        const urlLink = await msg.toUrlLink()
        if (config.parseMiniRooms.find((it: { name: any }) => it.name == roomName) && urlLink.payload) {
          const urlParse = `【链接解析】${eol}${eol}标题：${urlLink.title()}${eol}描述：${urlLink.description()}${eol}链接：${urlLink.url()}${eol}缩略图：${urlLink.thumbnailUrl()}`
          room.say(urlParse)
        }
        log.success('urlLink', urlLink)
        break
      case that.Message.Type.Transfer:
        log.success(`群名: ${roomName} 发消息人: ${contactName} 发起了转账，请在手机查看`)
        log.success(['内容', msg.payload])
        break
      default:
        break
    }
  } catch (e) {
    log.fail(['error', e])
  }
}

// 判断联系人是否为公众号
function isOfficialAccount(contact: { id: string }) {
  // 例如，可以根据联系人的微信号、昵称等特征来判断是否为公众号
  // 这里假设公众号的微信号以 'gh_' 开头
  return contact.id.startsWith('gh_');
}

async function onMessage(msg: any) {
  try {
    const config: any = await Container.get(BaseConfig).getAllConfig()
    const room = msg.room() // 是否为群消息
    const contact = msg.talker();
    const msgSelf = msg.self() // 是否自己发给自己的消息
    if (msgSelf) return
    if (room) {
      const roomName = await room.topic()
      const contact = msg.talker() // 发消息人
      const contactName = contact.name()
      await dispatchRoomFilterByMsgType(this, room, msg)

      if (roomName !== contactName) {
        const roomAsyncList = config.roomAsyncList || []
        if (roomAsyncList.length) {
          await dispatchAsync(this, msg, roomAsyncList)
        }
      }
    } else if (!isOfficialAccount(contact)) {
      await dispatchFriendFilterByMsgType(this, msg)
    }
  } catch (e) {
    log.fail('监听消息失败', e)
  }
}

export default onMessage

import * as mqtt from 'mqtt'
import { Container } from 'typedi'
import { BaseConfig } from '../db/repositories/BaseConfig'
import configEnv from '../config';
import { contactSay, roomSay, sendRoomNotice } from '../utils/index'
import { getMqttConfig, getGptConfig, getRssConfig, getVerifyCode, getTasks, updateBaseConfig, } from "./chetbot";
import { dispatchEventContent } from '../service/event-dispatch-service'
import { sendTaskMessage, initMultiTask, sendMultiTaskMessage, initTaskLocalSchedule } from "../task/index";
import { delay, randomRange } from "../lib/index.js";
import { reset } from './bot/chatgpt.js'
import { reset as webReset } from './bot/chatgpt-web'
import { reset as difyReset } from './bot/dify'
import { initRssTask, sendRssTaskMessage } from "../task/rss";
import globalConfig from '../config'
import { resetScanTime } from '../handlers/onScan'

let mqttclient: any = null


async function sendRoomSay(that: any, room: { name: any; roomId: any; }, messages: string | any[]) {
  log.info(`收到群：${room.name}批量发送消息请求， 消息数量【${messages.length}】`)
  // const finalRoom = await that.Room.find({ id: room.id, topic: room.name });
  let finalRoom: any = null
  if (that.puppet.constructor.name == 'PuppetWechat4u') {
    finalRoom = await that.Room.find({  topic: room.name })
  } else {
    finalRoom = await that.Room.find({ id: room.roomId });

    // finalRoom = await that.Room.find({ id: room.id, topic: room.name });
  }
  if (!finalRoom) {
    log.info(`查找不到群：${room.name}，请检查群名是否正确`)
    return
  } else {
    for (let message of messages) {
      await roomSay.call(that,finalRoom, '', message)
      await delay(500)
    }
  }
}

async function sendContactSay(that: any, contact: any, messages: any) {
  log.info(`收到好友：${contact.name}批量发送消息请求， 消息数量【${messages.length}】`)
  let finalContact: any = null
  if (that.puppet.constructor.name == 'PuppetWechat4u') {
    finalContact = await that.Contact.find({  name: contact.name })
  } else {
    // finalContact = await that.Contact.find({ id: contact.id || '', name: contact.name, alias: contact.alias || '',   weixin: contact.weixin || '' })
    finalContact = await that.Contact.find({ id: contact.wxid  })
  }
  if (!finalContact) {
    log.info(`查找不到好友：${contact.name}，请检查好友名称是否正确`)
    return
  } else {
    for (let message of messages) {
      
      await contactSay.call(that, finalContact, message)
      await delay(500)
    }
  }
}

async function sendRoomsNotice(that: any, room: { name: any; roomId: any; }, messages: string | any[]) {
  log.info(`收到群：${room.name}批量发送群公告请求， 公告数量【${messages.length}】`)
  let finalRoom: any = null
  if (that.puppet.constructor.name == 'PuppetWechat4u') {
    finalRoom = await that.Room.find({ topic: room.name })
  } else {
    finalRoom = await that.Room.find({ id: room.roomId });

    // finalRoom = await that.Room.find({ id: room.id, topic: room.name })
  }
  if (!finalRoom) {
    log.info(`查找不到群：${room.name}，请检查群名是否正确`)
    return
  } else {
    for (let message of messages) {
      await sendRoomNotice.call(that, finalRoom, message.content)
      await delay(500)
    }
  }
}

async function initMqtt(that: any) {
  try {
    const config: any = await Container.get(BaseConfig).getAllConfig({
      userId: configEnv.get('chatbot.userId')
    })
    const { userId } = config

    if (userId) {
      const config = await getMqttConfig()
      const { host, port, username, password } = config
      if(!mqttclient) {
        mqttclient = host
          ? mqtt.connect(`mqtt://${host}:${port}`, {
            username: username,
            password: password,
            clientId: userId +  randomRange(1, 10000),
          })
          : null
      }
      if (mqttclient) {
        mqttclient.on('connect', function () {
          log.success('connect to Wechaty mqtt----------')
          mqttclient.subscribe(`aibotk/${userId}/+`, function (err: any) {
            if (err) {
              log.fail(err)
            }
          })
        })
        mqttclient.on('reconnect', function () {
          log.success('subscriber on reconnect')
        })
        mqttclient.on('disconnect', function (e: any) {
          log.success(['disconnect--------', e])
        })
        mqttclient.on('error', function (e: any) {
          log.fail(['error----------', e])
        })
        mqttclient.on('message', async function (topic: string, message: any) {
          const content = JSON.parse(message.toString())
          if (topic === `aibotk/${userId}/say`) {
            if (content.target === 'Room') {
              log.info(`收到群：${content.roomName}发送消息请求： ${content.message.content || content.message.url}`)
              let room: any = null
              if (that.puppet.constructor.name == 'PuppetWechat4u') {
                 room =  await that.Room.find({ topic: content.roomName }) || content.wxid && await that.Room.find({ id: content.wxid })
              } else {
                 room =  content.wxid && await that.Room.find({ id: content.wxid }) || await that.Room.find({ topic: content.roomName })
              }
              if (!room) {
                log.fail(`查找不到群：${content.roomName}，请检查群名是否正确`)
                return
              } else {
                await roomSay.call(that,room, '', content.message)
              }
            } else if (content.target === 'Contact') {
              log.info(`收到联系人：${content.alias || content.name}发送消息请求： ${content.message.content || content.message.url}`)
              let contact: any = null
              if (that.puppet.constructor.name == 'PuppetWechat4u') {
                contact = (await that.Contact.find({ name: content.name })) || (await that.Contact.find({ alias: content.alias })) || (await that.Contact.find({ weixin: content.weixin })) || (content.wxid && await that.Contact.load(content.wxid)) // 获取你要发送的联系人
              } else {
                contact = (content.wxid && await that.Contact.load(content.wxid)) || (await that.Contact.find({ name: content.name })) || (await that.Contact.find({ alias: content.alias })) || (await that.Contact.find({ weixin: content.weixin })) // 获取你要发送的联系人
              }
              if (!contact) {
                log.fail(`查找不到联系人：${content.name || content.alias}，请检查联系人名称是否正确`)
                return
              } else {
                await contactSay.call(that, contact, content.message)
              }
            }
          } if (topic === `aibotk/${userId}/multisay`) {
            log.info(['触发批量发送消息请求', content.target]);
            if (content.target === 'Room') {
              for(let room of content.groups) {
                await sendRoomSay(that, room, content.messages)
                await delay(600)
              }
            } else if (content.target === 'Contact') {
              for(let contact of content.groups) {
                await sendContactSay(that, contact, content.messages)
                await delay(600)
              }
            } else if(content.target === 'RoomNotice') {
              for(let room of content.groups) {
                await sendRoomsNotice(that, room, content.messages)
                await delay(600)
              }
            }
          } else if (topic === `aibotk/${userId}/event`) {
            if (content.target === 'system') {
              log.info('触发了内置事件')
              const eventName = content.event
              // @ts-ignore
              const res = await dispatchEventContent(that, eventName)
              log.info(['事件处理结果', res[0].content])
            } else if (content.target === 'Room') {
              log.info('触发了群事件')
              await sendTaskMessage(that, content)
            } else if (content.target === 'Contact') {
              log.info('触发了好友事件')
              await sendTaskMessage(that, content)
            } else if (content.target === 'Rss') {
              log.info('触发了rss立即更新事件')
              await sendRssTaskMessage(that, content)
            }  else if (content.target === 'Tasks') {
              log.info('触发了批量任务立即发送')
              await sendMultiTaskMessage(that, content.task)
            } else if (content.target === 'refreshCode') {
              log.info('强制更新二维码')
              await this.refreshQrCode()
            } else if (content.target === 'getNewQrCode') {
              log.info('获取最新二维码')
              resetScanTime()
            } else if (content.target === 'roomJoinKeywords') {
              log.info('更新关键词进群')
              await updateBaseConfig(content.target)
            } else if (content.target === 'replyKeywords') {
              log.info('更新简单回答')
              await updateBaseConfig(content.target)
            }  else if (content.target === 'eventKeywords') {
              log.info('更新技能中心')
              await updateBaseConfig(content.target)
            } else if (content.target === 'privateForwards') {
              log.info('更新转发助手')
              await updateBaseConfig(content.target)
            } else if (content.target === 'roomAsyncList') {
              log.info('更新多消息同步')
              await updateBaseConfig(content.target)
            } else if (content.target === 'callBackEvents') {
              log.info('更新回调事件')
              await updateBaseConfig(content.target)
            }  else if (content.target === 'updateSchedule') {
              log.info('更新定时任务')
              await updateBaseConfig(content.query)
              await initTaskLocalSchedule(that)
            }  else if (content.target === 'updateScheduleCustom') {
              log.info('更新定制内容')
              await updateBaseConfig(content.query)
              await initMultiTask(that)
            } else if (content.target === 'verifyCode') {
              log.info('触发了输入验证码事件')

              if (globalConfig.get('chatbot.verifyId') === globalConfig.get('chatbot.qrcodeKey')) {
                await getVerifyCode();
                if(globalConfig.get('chatbot.verifyCode')) {
                  log.info(`获取到输入的验证码:${globalConfig.get('chatbot.verifyCode')}，正在填入`)
                  const verifyCode = globalConfig.get('chatbot.verifyCode') // 通过一些途径输入验证码
                  try {
                    await that.enterVerifyCode(globalConfig.get('chatbot.verifyId'), verifyCode) // 如果没抛错，则说明输入成功，会推送登录事件
                  } catch (e) {
                    log.fail(['验证码校验错误：', e.message])
                    // 如果抛错，请根据 message 处理，目前发现可以输错3次，超过3次错误需要重新扫码。
                    // 错误关键词: 验证码错误输入错误，请重新输入
                    // 错误关键词：验证码错误次数超过阈值，请重新扫码'
                    // 目前不会推送 EXPIRED 事件，需要根据错误内容判断
                  }
                }
              }
            }
          } else if(topic === `aibotk/${userId}/gptconfig`) {
            await getGptConfig()
            log.info('更新最新自定义对话配置')
            if(content.event === 'update' || content.event === 'delete') {
              log.info('更新自定义对话配置，重置对话')
              reset(content.updateId)
              webReset(content.updateId)
              difyReset(content.updateId)
            }
          } else if(topic === `aibotk/${userId}/rssconfig`) {
            log.info('更新rss配置')
            await getRssConfig()
            void initRssTask(that)
          } else if(topic === `aibotk/${userId}/tasks`) {
            log.info('更新批量定时任务')
            await getTasks()
            await initMultiTask(that)
          }
        })
      }
    } else {
      return false
    }
  } catch (e) {
    log.fail(['mqtt 创建链接失败', e])
  }
}
export function closeMqtt() {
  if(mqttclient && mqttclient.connected) {
    mqttclient.end()
    mqttclient = null
  }
}
export { initMqtt }
export default {
  initMqtt,
}

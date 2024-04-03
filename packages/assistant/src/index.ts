import config from './config'
import onScan from './handlers/onScan'
import onLogin from './handlers/onLogin'
import onLogout from './handlers/on-logout'
import onFriend from './handlers/on-friend'
import onRoomjoin from './handlers/on-roomjoin'
import onMessage from './handlers/on-message'
import onReady from './handlers/on-ready'
import onHeartbeat from './handlers/on-heartbeat'
import onError from './handlers/on-error'
import onRoomtopic from './handlers/on-roomtopic'
import onRoomleave from './handlers/on-roomleave'
import onVerifyCode from './handlers/on-verifycode'
import { init } from './db/index';
import { memoryInit } from './db/memory';
import log from './utils/npmlog'
let apiKeyEnv = config.get('chatbot.apiKey')

interface Event {
  type: string;
  word: string;
}

// 声明数组类型
type EventMessage = Event[];

function ChatbotPugin({ apiKey }: any) {

  const initConfig = {
    apiKey: apiKey || apiKeyEnv,
    ignoreMessages: config.get('chatbot.ignoreMessages') as EventMessage,
    ignoreEvents: config.get('chatbot.ignoreEvents'),
    scanTimes: config.get('chatbot.scanTimes')
  }
  init()
  memoryInit()
  return function (bot: any) {
    const ignoreEvents = initConfig.ignoreEvents as string[];
    if (!ignoreEvents.includes('scan')) bot.on('scan', onScan);
    if (!ignoreEvents.includes('login')) bot.on('login', onLogin)
    if (!ignoreEvents.includes('logout')) bot.on('logout', onLogout)
    if (!ignoreEvents.includes('friendship')) bot.on('friendship', onFriend)
    if (!ignoreEvents.includes('room-join')) bot.on('room-join', onRoomjoin)
    if (!ignoreEvents.includes('room-topic')) bot.on('room-topic', onRoomtopic)
    if (!ignoreEvents.includes('room-leave')) bot.on('room-leave', onRoomleave)
    if (!ignoreEvents.includes('message')) bot.on('message', onMessage)
    if (!ignoreEvents.includes('ready')) bot.on('ready', onReady)
    if (!ignoreEvents.includes('heartbeat')) bot.on('heartbeat', onHeartbeat)
    if (!ignoreEvents.includes('error')) bot.on('error', onError)
    if (!ignoreEvents.includes('verify-code')) bot.on('verify-code', onVerifyCode)
  }
}
export {
  ChatbotPugin,
  config,
  log
}

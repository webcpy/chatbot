import { BotManage } from '../utils/multiReply'
import { getCustomConfig } from './msg-filters'
import { updateChatRecord } from '../proxy/chetbot'
// import globalConfig from '../db/global.js'
import globalConfig from '../config'

let gpt4vRes: any = ''

export async function getGpt4vChat({
  room,
  roomId,
  roomName,
  isMention,
  msgContent,
  name,
  id,
  uniqueId,
  that
}: any) {
  if (!gpt4vRes) {
    gpt4vRes = new BotManage(100, that)
  }
  let finalConfig: any = await getCustomConfig({ name, id, roomName, roomId, room, type: 'open4v' })
  if (finalConfig) {
    const isRoom = finalConfig.type === 'room'
    if (msgContent.type === 1) {
      let msg = msgContent.content
      if (
        (isRoom && finalConfig.needAt === 1 && isMention) ||
        (isRoom && !finalConfig.needAt) ||
        !isRoom
      ) {
        const keyword = (finalConfig?.keywords || [])?.find((item: any) => msg.includes(item)) || ''
        if (keyword != null  || !finalConfig?.keywords?.length) {
          console.log('open4v')
          msg = keyword ? msg.replace(keyword, '') : msg
          if (finalConfig.limitNum > 0 && finalConfig.limitNum <= finalConfig.limitWord) {
            return []
          }
          const config = {
            ...finalConfig.botConfig,
            robotType: finalConfig.botConfig?.open4vConfig?.type || finalConfig.robotType,
            proxyPass:
              finalConfig.botConfig?.open4vConfig?.baseUrl || finalConfig.botConfig?.proxyPass,
            apiKey: finalConfig.botConfig?.open4vConfig?.token || finalConfig.botConfig?.token
          }
          const res = await gpt4vRes.run(uniqueId, { type: 1, content: msg }, config)
          if (res.length) {
            const gptConfig: any = globalConfig
              .get('chatbot.gptconfig')
              .find((item: any) => item.id === finalConfig.id)
            void updateChatRecord(finalConfig.id, gptConfig.limitWord + 1)
            const allConfig: any = globalConfig.get('chatbot.gptconfig')

            globalConfig.set(
              'chatbot.gptconfig',
              allConfig.map((item: any) => {
                if (item.id === finalConfig.id) {
                  item.limitWord =  item.limitWord + 1
                }
                return item
              })
            )
          }
          return res
        }
      }
    } else if (msgContent.type === 3) {

      const res = await gpt4vRes.run(uniqueId, { type: 3, id: msgContent.id })
      return res
    }
  }
  return []
}

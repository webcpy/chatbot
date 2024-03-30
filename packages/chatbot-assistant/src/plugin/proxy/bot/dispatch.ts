import { getChatGPTReply } from "./chatgpt"
import { getChatGPTWebReply } from "./chatgpt-web"
import { getDifyAiReply } from "./dify"
import { updateChatRecord } from "../chetbot"
import globalConfig from '../../config'

/**
 * 消息转发
 * @param {botType: 机器人类别, content: 消息内容, uid: 说话的用户id, updateId: 更新的用户id, adminId: 对话实例id，用于分割不同配置, config: 机器人配置}
 * @returns
 */
// @ts-ignore
export async function dispatchBot({botType, content, uid, adminId, config}) {
   log.success('进入定制机器人回复');
    try {
      const allConfig: any = globalConfig.get('chatbot.gptconfig')
      const gptConfig: any = globalConfig.get('chatbot.gptconfig').find((item: any)=> item.id === adminId)
      let res, replys;

      switch (botType * 1) {
        case 6:
          // ChatGPT api
          res = await getChatGPTReply(content, uid, adminId, config, false)
          replys = res
          break
        case 7:
          // ChatGPT web
          log.success('进入聊天');
          res = await getChatGPTWebReply(content, uid, adminId, config)
          replys = res
          break
        case 8:
          // dify ai
          log.success('进入Dify聊天');
          res = await getDifyAiReply(content, uid, adminId, config)
          replys = res
          break
        case 9:
          // fastGPT api
          res = await getChatGPTReply(content, uid, adminId, config, true)
          replys = res
          break
        case 11:
            // 国内大模型 api
            res = await getChatGPTReply(content, uid, adminId, config, false)
            replys = res
          break
        default:

          replys = []
          break
      }
      if(replys.length) {
        void updateChatRecord(adminId, gptConfig.limitWord + 1)
        // 使用限制
        globalConfig.set('chatbot.gptconfig', allConfig.map((item: any)=> {
          if(item.id === adminId) {
            item.limitWord = item.limitWord + 1
          }
          return item
      }))
      }
      return replys
    } catch (e) {
      log.success('机器人接口信息获取失败', e)
      return []
    }
  }

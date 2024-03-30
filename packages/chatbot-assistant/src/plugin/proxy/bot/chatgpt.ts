import OfficialOpenAi from "../../botInstance/officialOpenAi.js";
import { getPromotInfo } from "../chetbot";

let chatGPT: any = {}

export function reset(adminId: string | number) {
  if(!chatGPT[adminId]) return
  chatGPT[adminId].reset();
  chatGPT[adminId] = null;
}

export function resetAll() {
  Object.keys(chatGPT).forEach(key => {
    if(chatGPT[key]) {
      chatGPT[key].reset()
    }
  })
  chatGPT = {}
}
export async function getChatGPTReply(content: string, uid: any, adminId: string | number, config: any, isFastGPT: boolean) {
    if (!config.token) {
      log.fail('请到微语智能管家平台配置Openai apikey参数方可使用')
      return [{ type: 1, content: '请到平台配置Openai apikey参数方可使用' }]
    }
    if(!chatGPT[adminId]) {
      chatGPT[adminId] = new OfficialOpenAi(config)
    }
    let systemMessage = ''
    if(config.keywordSystemMessages && config.keywordSystemMessages.length) {
      const finalSystemMsg: any = config.keywordSystemMessages.find((item: any)=> content.startsWith(item.keyword))
      if(finalSystemMsg && finalSystemMsg.promotId) {
        const promotInfo = await getPromotInfo(finalSystemMsg.promotId.id)
        log.success(`触发关键词角色功能，使用对应预设角色:${promotInfo.name}`);
        if (config.robotType == 11) {
          await chatGPT[adminId].updateSystemMba(promotInfo, uid, config.model)
        } else {
          await chatGPT[adminId].updateSystemMessage(finalSystemMsg.promotId, promotInfo.promot)
          // systemMessage = promotInfo.promot
        }
        // systemMessage = promotInfo.promot
        content = content.replace(finalSystemMsg.keyword, '')
      }
    }
    return await chatGPT[adminId].getReply(content, uid, adminId, systemMessage, isFastGPT)
}

// import { allConfig } from "../db/configDb.js";
import OfficialOpenAi from "../botInstance/officialOpenAi.js";
import { BinaryLike } from "crypto";
import { Container } from 'typedi'
import { BaseConfig } from '../db/repositories/BaseConfig.js'

let chatGPT: OfficialOpenAi | null = null;
/**
 * 重置实例
 */
export function reset() {
  if(chatGPT) {
    chatGPT.reset();
    chatGPT = null
  }
}

export async function getGptOfficialReply(content: any, uid: BinaryLike, isFastGPT: boolean) {
    const config: any = await Container.get(BaseConfig).getAllConfig()
    if (!config.gpttoken) {
      log.success('请到微语智能管家平台配置Openai apikey参数方可使用')
      return [{ type: 1, content: '请到平台配置Openai apikey参数方可使用' }]
    }
    const chatConfig: any = {
      token: config.gpttoken, // token
      debug: config.openaiDebug,  // 开启调试
      proxyPass: config.proxyPassUrl, // 反向代理地址
      proxyUrl: config.proxyUrl, // 代理地址
      showQuestion: config.showQuestion, // 显示原文
      timeoutMs: config.openaiTimeout, // 超时时间 s
      model: config.openaiModel, // 模型
      systemMessage: config.openaiSystemMessage, // 预设promotion
      filter: config.chatFilter,
      filterConfig: {
        type: 1,
        appId: config.filterAppid,
        apiKey: config.filterApiKey,
        secretKey: config.filterSecretKey
      }
    }
    if(!chatGPT) {
      chatGPT = new OfficialOpenAi(chatConfig)
    }
    return await chatGPT.getReply(content, uid, '', '', isFastGPT)
}

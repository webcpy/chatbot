import { Container } from 'typedi'
import { BaseConfig } from '../db/repositories/BaseConfig'
import DifyAi from "../botInstance/dify";
import { BinaryLike } from "crypto";

let difyAi: any = null;
/**
 * 重置实例
 */
export function reset() {
  if(difyAi) {
    difyAi.reset();
    difyAi = null
  }
}

export async function getDifyReply(content: any, uid: BinaryLike) {
    const config: any = await Container.get(BaseConfig).getAllConfig()
    if (!config.dify_token) {
      log.success('请到微语智能管家平台配置difyAi apikey参数方可使用')
      return [{ type: 1, content: '请到平台配置difyAi apikey参数方可使用' }]
    }
    const chatConfig: any = {
      token: config.dify_token, // token
      debug: config.openaiDebug,  // 开启调试
      proxyPass: config.dify_baseUrl, // 反向代理地址
      showQuestion: config.showQuestion, // 显示原文
      timeoutMs: config.openaiTimeout, // 超时时间 s
      systemMessage: config.openaiSystemMessage, // 预设promotion
      filter: config.chatFilter,
      isAiAgent: config?.difyAgent || false,
      filterConfig: {
        type: 1,
        appId: config.filterAppid,
        apiKey: config.filterApiKey,
        secretKey: config.filterSecretKey
      }
    }
    if(!difyAi) {
      difyAi = new DifyAi(chatConfig)
    }
    return await difyAi.getReply(content, uid)
}

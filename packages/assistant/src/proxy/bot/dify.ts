import DifyAi from "../../botInstance/dify";
import { getPromotInfo } from "../chetbot";

let difyAi: any = {}

export function reset(adminId: string | number) {
  if(!difyAi[adminId]) return
  difyAi[adminId].reset();
  difyAi[adminId] = null;
}

export function resetAll() {
  Object.keys(difyAi).forEach(key => {
    if(difyAi[key]) {
      difyAi[key].reset()
    }
  })
  difyAi = {}
}
export async function getDifyAiReply(content: string, uid: any, adminId: string | number, config: any) {
  if (!config.token) {
    log.success('请到微语智能管家平台配置Dify的 api秘钥方可使用')
    return [{ type: 1, content: '请到微语智能管家平台配置Dify的 api秘钥方可使用' }]
  }

  if(!difyAi[adminId]) {
    difyAi[adminId] = new DifyAi(config)
  }
  let systemMessage = ''
  if(config.keywordSystemMessages && config.keywordSystemMessages.length) {
    const finalSystemMsg: any = config.keywordSystemMessages.find((item: { keyword: string; })=> content.startsWith(item.keyword))

    if(finalSystemMsg && finalSystemMsg.promotId) {
      const promotInfo = await getPromotInfo(finalSystemMsg.promotId.id)
      log.info(`触发关键词角色功能，使用对应预设角色:${promotInfo.name}`);
      systemMessage = promotInfo.promot
      content = content.replace(finalSystemMsg.keyword, '')
    }
  }
  return await difyAi[adminId].getReply(content, uid, adminId, systemMessage)
}

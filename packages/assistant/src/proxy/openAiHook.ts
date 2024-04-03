import { Container } from 'typedi';
import { BaseConfig } from '../db/repositories/BaseConfig';
import UnOfficialOpenAi from '../botInstance/unOfficialOpenAi';
import { BinaryLike } from 'crypto';

let chatGPT: any = null;

export function reset() {
	if (chatGPT) {
		chatGPT.reset();
		chatGPT = null;
	}
}

export async function getGptUnOfficialReply(content: any, uid: BinaryLike) {
	const config: any = await Container.get(BaseConfig).getAllConfig();
	if (!config.openaiAccessToken) {
		log.success('请到微语智能管家平台配置Openai openaiAccessToken参数方可使用');
		return [{ type: 1, content: '请到平台配置Openai openaiAccessToken参数方可使用' }];
	}
	const chatConfig: any = {
		token: config.openaiAccessToken,
		debug: config.openaiDebug,
		proxyPass: config.proxyPassUrl, // 反向代理地址
		proxyUrl: config.proxyUrl, // 代理地址
		showQuestion: config.showQuestion, // 显示原文
		timeoutMs: config.openaiTimeout, // 超时时间 s
		systemMessage: config.openaiSystemMessage,
		filter: config.chatFilter,
		filterConfig: {
			type: 1,
			appId: config.filterAppid,
			apiKey: config.filterApiKey,
			secretKey: config.filterSecretKey,
		},
	};
	if (!chatGPT) {
		chatGPT = new UnOfficialOpenAi(chatConfig);
	}

	return await chatGPT.getReply(content, uid);
}

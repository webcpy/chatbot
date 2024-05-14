import { WechatyBuilder } from 'wechaty';
import { ChatbotPugin, config, log } from '@chat-bot/assistant';

const name = 'chatbot';
let bot = '';
let padLocalToken = config.get('token.local'); // 如果申请了ipadlocal的token,可以直接填入
let workProToken = config.get('token.work'); // 如果申请了企业微信的token 可以直接填入
if (padLocalToken) {
	log.success('读取到环境变量中的ipadLocalToken');
	log.success('读取到环境变量中的ipad token 使用ipad协议启动');
	bot = WechatyBuilder.build({
		name,
		puppetOptions: {
			token: padLocalToken,
		},
		puppet: 'wechaty-puppet-padlocal',
	});
} else if (workProToken) {
	log.success('读取到环境变量中的企微token');
	log.success('读取到环境变量中的企微 token 使用企业微信协议启动');
	bot = WechatyBuilder.build({
		name, // generate xxxx.memory-card.json and save login data for the next login
		puppet: 'wechaty-puppet-service',
		puppetOptions: {
			authority: 'token-service-discovery-test.juzibot.com',
			tls: { disable: true },
			token: workProToken,
		},
	});
} else {
	log.success('默认使用wechat4u协议启动');

	bot = WechatyBuilder.build({
		name,
		puppet: 'wechaty-puppet-wechat4u',
	});
}

bot.use(
	ChatbotPugin({
		apiKey: '',
	}),
);
bot.start().catch((e: any) => log.fail(e));

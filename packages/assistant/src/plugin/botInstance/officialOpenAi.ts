// @ts-nocheck
import proxy from "https-proxy-agent";
import nodeFetch from "node-fetch";
import {ChatGPTAPI} from "./sdk/chatGPT";
import { aiChat } from '../db/repositories/aichat'
import { Container } from 'typedi'
import { getPromotInfo } from "../proxy/chetbot";
import { ContentCensor } from "../lib/contentCensor";
import { getPuppetEol, isWindowsPlatform } from '../const/puppet-type'
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import { extractImageLinks } from '../lib/index'
let chatGPT = null


class OfficialOpenAi {
  constructor(config = {
    token: '', // token
    debug: 0,  // 开启调试
    proxyPass: '', // 反向代理地址
    proxyUrl: '', // 代理地址
    showQuestion: true, // 显示原文
    timeoutMs: 60, // 超时时间 s
    model: '', // 模型
    promotId: '',
    showDownloadUrl: false,
    systemMessage: '', // 预设promotion
  }) {
    this.chatGPT = null;
    this.config = {
      showDownloadUrl: false,
      ...config
    };
    this.contentCensor = null
    this.chatOption = {};
    this.eol = '\n'
    this.iswindows = false;
  }


  async updateSystemMessage(promotInfo) {
    this.config.promotId = promotInfo.id
    this.config.systemMessage = promotInfo.promot
    await this.init(false)
  }

  async updateSystemMba(promotInfo, uid, model) {
    if (promotInfo.isAiMba) {
      this.config.promotId = ''
      this.config.systemMessage = ''
      this.config.model = promotInfo.promot
      this.chatOption[uid] = {}
      await this.init(false)
    } else {
      this.config.model = model
      await this.updateSystemMessage(promotInfo)
    }
  }

  async init(flag=true) {
    this.eol = await getPuppetEol();
    this.iswindows = await isWindowsPlatform()
    if(this.config.promotId && flag) {
      const promotInfo = await getPromotInfo(this.config.promotId)
      if(promotInfo) {
        this.config.systemMessage = promotInfo.promot
      }
    }
    if(this.config.filter) {
        this.contentCensor = new ContentCensor(this.config.filterConfig)
    }
    const baseOptions = {
      apiKey: this.config.token,
      completionParams: { model: this.config.model },
      debug: this.config.debug,
      systemMessage: this.config.systemMessage || '',
    }
    // increase max token limit if use gpt-4
    if (this.config.model.toLowerCase().includes('gpt-4')) {
      // if use 32k model
      if (this.config.model.toLowerCase().includes('32k')) {
        baseOptions.maxModelTokens = 32768
        baseOptions.maxResponseTokens = 8192
      }// if use GPT-4 Turbo
      else if (this.config.model.toLowerCase().includes('1106-preview')) {
        baseOptions.maxModelTokens = 128000
        baseOptions.maxResponseTokens = 4096
      }
      else {
        baseOptions.maxModelTokens = 8192
        baseOptions.maxResponseTokens = 2048
      }
    }
    if (this.config.model.toLowerCase().includes('gpt-3.5')) {
      if (this.config.model.toLowerCase().includes('16k') || this.config.model.toLowerCase().includes('turbo-1106')) {
        baseOptions.maxModelTokens = 16385
        baseOptions.maxResponseTokens = 4096
      } else {
        baseOptions.maxResponseTokens = 1000
      }
    }
    if(this.config.proxyUrl) {
      log.success(`启用代理请求:${this.config.proxyUrl}`);
      this.chatGPT = new ChatGPTAPI({
        ...baseOptions,
        fetch: (url, options = {}) => {
          const defaultOptions = {
            agent: proxy(this.config.proxyUrl),
          };
          const mergedOptions = {
            ...defaultOptions,
            ...options,
          };
          return nodeFetch(url, mergedOptions);
        },
      });
    } else if(this.config.proxyPass) {
      log.success(`启用反向代理请求:${this.config.proxyPass}`);
      this.chatGPT = new ChatGPTAPI({
        ...baseOptions,
        apiBaseUrl: this.config.proxyPass,
        fetch: (url, options = {}) => {
          const mergedOptions = {
            ...options,
          };
          return nodeFetch(url, mergedOptions);
        },
      });
    } else {
      log.success('未启用代理请求，可能会失败');
      this.chatGPT = new ChatGPTAPI({
        ...baseOptions,
        fetch: (url, options = {}) => {
          const mergedOptions = {
            ...options,
          };
          return nodeFetch(url, mergedOptions);
        },
      });
    }
  }
  /**
   * 重置apikey
   * @return {Promise<void>}
   */
  reset () {
    this.chatGPT = null
  }


  async getReply(content, uid, adminId = '', systemMessage = '', isFastGPT) {
    try {
      if(!this.chatGPT) {
        log.success(isFastGPT ? '看到此消息说明启用了FastGPT' : '看到此消息说明已启用ChatGPT');
        await this.init()
      }
      if(this.config.filter) {
        const censor = await this.contentCensor.checkText(content)
        if(!censor) {
          log.success(`问题:${content},包含违规词，已拦截`);
          return [{ type: 1, content: '这个话题不适合讨论，换个话题吧。' }]
        }
      }
      const resetWord = ['reset', '重置', '重置对话', '忽略上下文', '重置上下文', '重新开始', '清除对话', '清除上下文']
      if(systemMessage || resetWord.includes(content)) {
        log.success('重新更新上下文对话');
        this.chatOption[uid] = null
        if(content === 'reset' || content === '重置') {
          return [{type: 1, content: '上下文已重置'}]
        }
      }

      if(isFastGPT && !this.chatOption[uid]) {
        this.chatOption[uid] = {
          chatId: uuidv4()
        }
      }

      const sendParams = { ...this.chatOption[uid], timeoutMs: this.config.timeoutMs * 1000 || 80 * 1000 }
      if(systemMessage) {
        sendParams.systemMessage = systemMessage;
      }

      const { conversationId, text, id } = await this.chatGPT.sendMessage(content, sendParams);
      if(this.config.filter) {
        const censor = await this.contentCensor.checkText(text)
        if(!censor) {
          log.success(`回复: ${text},包含违规词，已拦截`);
          return [{ type: 1, content: '这个话题不适合讨论，换个话题吧。' }]
        }
      }
      if(this.config.record) {
        void Container.get(aiChat).addAichatRecord({ contactId: uid, adminId, input: content, output: text, time: dayjs().format('YYYY-MM-DD HH:mm:ss') })
      }
      if(isFastGPT) {
        this.chatOption[uid] = {
          chatId: this.chatOption[uid].chatId
        }
      } else {
        this.chatOption[uid] = {
            conversationId,
            parentMessageId: id,
        };
      }

      let replys = []
      let message;
      if(this.config.showQuestion) {
        message = `${content}${this.eol}-----------${this.eol}` + (this.iswindows ? text.replaceAll('\n', this.eol) : text);
      } else {
        message = this.iswindows ? text.replaceAll('\n', this.eol): text;
      }
      const imgs = extractImageLinks(message)
      log.success(['imgs', imgs])
      while (message.length > 1500) {
        replys.push(message.slice(0, 1500));
        message = message.slice(1500);
      }
      replys.push(message);
      replys = replys.map(item=> {
        return {
          type: 1,
          content: item.trim()
        }
      })
      if(imgs.length && this.config.showDownloadUrl) {
        log.success(['提取到内容中的图片', JSON.stringify(imgs)])
        replys = replys.concat(imgs)
      }
      return replys
    } catch (e) {
      log.fail('chat gpt报错：'+ e);
      return []
    }
  }
}

export default OfficialOpenAi;

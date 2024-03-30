// @ts-nocheck
import proxy from "https-proxy-agent";
import nodeFetch from "node-fetch";
import { ChatGPTUnofficialProxyAPI }  from './sdk/chatGPT'
import { aiChat } from '../db/repositories/aichat'
import { Container } from 'typedi'
import dayjs from "dayjs";
import { getPromotInfo } from "../proxy/chetbot";
import { getPuppetEol } from "../const/puppet-type";

class UnOfficialOpenAi {
  constructor(config = {
    token: '', // token
    debug: true,  // 开启调试
    proxyPass: '', // 反向代理地址
    proxyUrl: '', // 代理地址
    showDownloadUrl: false, // 显示文件下载链接
    showQuestion: false, // 显示原文
    systemMessage: '', // 预设promotion
    timeoutMs: 60 // 超时时间 s
  }) {
    this.chatGPT = null;
    this.config = {
      showDownloadUrl: false,
      ...config
    };
    this.chatOption = {};
    this.eol = '\n'
  }

  async init(flag = true) {
    this.eol = await getPuppetEol();
    if(this.config.promotId && flag) {
      const promotInfo = await getPromotInfo(this.config.promotId)
      if(promotInfo) {
        this.config.systemMessage = promotInfo.promot
      }
    }
    const baseOptions = {
      accessToken: this.config.token,
      debug: this.config.debug,
      apiReverseProxyUrl: 'https://bypass.churchless.tech/api/conversation'
    }

    if(this.config.proxyUrl) {
      log.success(`启用代理请求:${this.config.proxyUrl}`);
      this.chatGPT = new ChatGPTUnofficialProxyAPI({
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
      return
    } else if(this.config.proxyPass) {
      log.success(`启用反向代理:${this.config.proxyPass}`);
      baseOptions.apiReverseProxyUrl = this.config.proxyPass
    }

    this.chatGPT = new ChatGPTUnofficialProxyAPI({
      ...baseOptions,
      fetch: (url, options = {}) => {
        const mergedOptions = {
          ...options,
        };
        return nodeFetch(url, mergedOptions);
      },
    });
  }

  /**
   * 重置实例
   * @return {Promise<void>}
   */
  reset() {
    this.chatGPT = null
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
  async getReply(content, uid, adminId = '', systemMessage =  '') {
    try {
      if(!this.chatGPT) {
        log.success('看到此消息说明已启用chatGPT 网页hook版');
        await this.init()
      }
      let question = this.config.systemMessage ? this.config.systemMessage + content : content;
      if(systemMessage || content === 'reset' || content === '重置') {
        question = systemMessage + content
        log.success('重新更新上下文对话');
        this.chatOption[uid] = {}
        if(content === 'reset' || content === '重置') {
          return [{type: 1, content: '上下文已重置'}]
        }
      }

      const { conversationId, text, id } = systemMessage  ?
        await this.chatGPT.sendMessage(question, { ...this.chatOption[uid], systemMessage, timeoutMs: this.config.timeoutMs * 1000 || 80 * 1000 })
        : await this.chatGPT.sendMessage(question, { ...this.chatOption[uid], timeoutMs: this.config.timeoutMs * 1000 || 80 * 1000 });
      if(this.config.record) {
        void Container.get(aiChat).addAichatRecord({
          contactId: uid,
          adminId,
          input: content,
          output: text,
          time: dayjs().format('YYYY-MM-DD HH:mm:ss')
        })
      }
      this.chatOption[uid] = {
          conversationId,
          parentMessageId: id,
      };
      let replys = []
      let message;
      if(this.config.showQuestion) {
        message = `${content}${this.eol}----------${this.eol}` + text.replaceAll('\n', this.eol);
      } else {
        message = text.replaceAll('\n', this.eol);
      }
      while (message.length > 1000) {
        replys.push(message.slice(0, 1000));
        message = message.slice(1000);
      }
      replys.push(message);
      replys = replys.map(item=> {
        return {
          type: 1,
          content: item.trim()
        }
      })
      return replys
    } catch (e) {
      log.fail('chat gpt报错：'+ e);
      return []
    }
  }
}

export default UnOfficialOpenAi;


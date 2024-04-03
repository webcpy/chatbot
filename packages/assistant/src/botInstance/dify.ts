// @ts-nocheck
import { ChatClient } from "chatbot-core";
import { aiChat } from '../db/repositories/aichat'
import { Container } from 'typedi'
import { getPromotInfo } from "../proxy/chetbot";
import { ContentCensor } from "../lib/contentCensor";
import { getPuppetEol, isWindowsPlatform } from '../const/puppet-type'
import dayjs from "dayjs";
import { extractImageLinks } from '../lib/index'


class DifyAi {
  constructor(config = {
    isAiAgent: false, // 是否为 ai agent 模式
    showDownloadUrl: false, // 显示文件下载链接
    token: '', // api 秘钥
    proxyPass: '', // 请求地址
    showQuestion: true, // 显示原文
    timeoutMs: 60, // 超时时间 s
    promotId: '',
    systemMessage: '', // 预设promotion
  }) {
    this.difyChat = null;
    this.config = { showDownloadUrl: false, isAiAgent: false, ...config };
    this.contentCensor = null
    this.chatOption = {};
    this.eol = '\n'
    this.iswindows = false;
  }


  async init() {
    this.eol = await getPuppetEol();
    this.iswindows = await isWindowsPlatform()
    if (this.config.promotId) {
      const promotInfo = await getPromotInfo(this.config.promotId)
      if (promotInfo) {
        this.config.systemMessage = promotInfo.promot
      }
    }
    if (this.config.filter) {
      this.contentCensor = new ContentCensor(this.config.filterConfig)
    }
    const baseOptions = {
      apiKey: this.config.token,
      stream: this.config.isAiAgent,
      debug: !!this.config.debug,
      systemMessage: this.config.systemMessage || '',
    }

    log.success(`api请求地址:${this.config.proxyPass}`);
    this.difyChat = new ChatClient({
      ...baseOptions,
      baseUrl: this.config.proxyPass,
    });
  }
  /**
   * 重置apikey
   * @return {Promise<void>}
   */
  reset() {
    this.difyChat = null
  }


  async getReply(content, uid, adminId = '', systemMessage = '') {
    try {
      if (!this.difyChat) {
        log.success('启用Dify对话平台');
        await this.init()
      }
      if (this.config.filter) {
        const censor = await this.contentCensor.checkText(content)
        if (!censor) {
          log.success(`问题:${content},包含违规词，已拦截`);
          return [{ type: 1, content: '这个话题不适合讨论，换个话题吧。' }]
        }
      }
      if (systemMessage || content === 'reset' || content === '重置') {
        log.success('重新更新上下文对话');
        this.chatOption[uid] = {}
        if (content === 'reset' || content === '重置') {
          return [{ type: 1, content: '上下文已重置' }]
        }
      }
      const { conversationId, text, files } = systemMessage ? await this.difyChat.sendMessage(content, { ...this.chatOption[uid], systemMessage, timeoutMs: this.config.timeoutMs * 1000 || 80 * 1000, user: uid }) : await this.difyChat.sendMessage(content, { ...this.chatOption[uid], timeoutMs: this.config.timeoutMs * 1000 || 80 * 1000, user: uid });
      if (this.config.filter) {
        const censor = await this.contentCensor.checkText(text)
        if (!censor) {
          log.success(`回复: ${text},包含违规词，已拦截`);
          return [{ type: 1, content: '这个话题不适合讨论，换个话题吧。' }]
        }
      }
      if (this.config.record) {
        void Container.get(aiChat).addAichatRecord({ contactId: uid, adminId, input: content, output: text, time: dayjs().format('YYYY-MM-DD HH:mm:ss') })
      }
      // 保存对话id 对于同一个用户的对话不更新conversationId
      if (!this.chatOption[uid]?.conversationId) {
        this.chatOption[uid] = {
          conversationId
        };
      }
      let replys = []
      let message;
      if (this.config.showQuestion) {
        message = `${content}${this.eol}-----------${this.eol}` + (this.iswindows ? text.replaceAll('\n', this.eol) : text);
      } else {
        message = this.iswindows ? text.replaceAll('\n', this.eol) : text;
      }
      const imgs = extractImageLinks(message)

      while (message.length > 1500) {
        replys.push(message.slice(0, 1500));
        message = message.slice(1500);
      }
      replys.push(message);
      replys = replys.map(item => {
        return {
          type: 1,
          content: item.trim()
        }
      })

      if (!imgs.length && files.length && this.config.showDownloadUrl) {
        let downLoadUrl = `----------------${this.eol}`
        files.forEach((item, index) => {
          downLoadUrl += `[下载${index + 1}]:${item}${this.eol}`
        })
        replys[replys.length - 1].content = `${replys[replys.length - 1].content}${this.eol}${this.eol}${downLoadUrl}`
      }
      if (imgs.length) {
        log.success(['提取到内容中的图片', imgs])
        replys = replys.concat(imgs)
      }

      if (files.length) {
        log.success(['回复内容带文件', files])
        files.forEach(item => {
          replys.push({ type: 2, url: item })
        })
      }
      return replys
    } catch (e) {
      log.fail(['Dify 请求报错：' + e]);
      return []
    }
  }
}

export default DifyAi;

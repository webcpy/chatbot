// @ts-nocheck
import { getImageVision } from "chatbot-core";
import { getPuppetEol, isWindowsPlatform } from '../const/puppet-type'
import { ChatClient } from 'chatbot-core'
import { extractImageLinks } from '../lib/index'
import FormData from 'form-data'
export async function get4vReply(images, question, config) {
  try {
    const iswindows = await isWindowsPlatform()
    const eol = await getPuppetEol();
    const finalConfig = {
      ...config,
      baseUrl: config.proxyPass || ''
    }
    const { text } = await getImageVision(images, question, finalConfig);
    let replys = [];
    let message = iswindows ? text.replaceAll("\n", eol) : text;
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
      };
    });
    if (imgs.length && config.showDownloadUrl) {
      log.fail(['提取到内容中的图片', imgs])
      replys = replys.concat(imgs)
    }
    return replys;
  } catch (e) {
    log.fail(["gpt4v报错：" + e]);
    return [{ type: 1, content: '图像识别失败，请确保你的账号有GPT-4V权限' }];
  }
}

export async function getDify4vReply(images, question, config, userId) {
  try {
    const iswindows = await isWindowsPlatform()
    const eol = await getPuppetEol();
    const sendFiles = []
    const difyClient = new ChatClient({ apiKey: config.apiKey, baseUrl: config.proxyPass, debug: config.debug })
    log.success('进入Dify图像识别模式')
    for (const file of images) {
      try {
        const base64 = await file.toBase64()
        const readable = Buffer.from(base64, 'base64')
        const formData = new FormData();
        formData.append('file', readable, { contentType: file.mediaType, filename: file.name });
        formData.append('user', userId)
        const res = await difyClient.fileUpload(formData)
        if (res.data.id) {
          sendFiles.push({ type: 'image', transfer_method: 'local_file', upload_file_id: res.data.id })
        }
      } catch (e) {
        log.fail(`Dify 上传文件失败:${e}`)
      }
    }
    const { text, files } = await difyClient.sendMessage(question, { user: userId, timeoutMs: config.timeoutMs * 1000, files: sendFiles });
    let replys = [];
    let message = iswindows ? text.replaceAll("\n", eol) : text;
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
      };
    });
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
    return replys;
  } catch (e) {
    log.fail("Dify 图像识别报错：" + e);
    return [{ type: 1, content: '图像识别失败，请确保你的账号有GPT-4V权限' }];
  }
}

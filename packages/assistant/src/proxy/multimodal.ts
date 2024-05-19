import axios from 'axios'
import FormData from 'form-data'
import globalConfig from '../config'

/**
 * 语音转换文字
 * @param file
 * @param aiConfig
 * @returns {Promise<*|string>}
 */
export async function getVoiceText(file: any, aiConfig?: any) {
  try {
    const apiKey = globalConfig.get('chatbot.apiKey')
    const base64 = await file.toBase64()
    const readable = Buffer.from(base64, 'base64')
    const formData = new FormData();
    formData.append('file', readable, { contentType: file.mediaType, filename: file.name });
    aiConfig && formData.append('aiConfig', JSON.stringify(aiConfig))
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      timeout: 30000,
      url: globalConfig.get('api.chatbot') + '/voice/text',
      headers: {
        ...formData.getHeaders(),
        // Authorization: `Bearer ${apiKey}`,
        CHATBOT_API_KEY: apiKey
      },
      data: formData
    };

    const result = await axios.request(config)
    if (result.data.code === 200) {
      return result.data.data
    } else {
      log.fail('语音转换出错', result.data.message)
      return '';
    }
  } catch (e) {
    log.fail(`语音转换出错: ${e}`)
    return '';
  }
}

/**
 * 语音转换文字
 * @param file
 * @param aiConfig
 * @returns {Promise<*|string>}
 */
export async function getAudioText(file: any, form: any = {}) {
  try {
    const apiKey = globalConfig.get('chatbot.apiKey')

    // const audioTextApi = globalConfig.get('api.audioTextApi')
    const base64 = await file.toBuffer()
    const buffer: any = Buffer.from(base64, 'base64')
    const formData = new FormData();
    formData.append('file', buffer, { contentType: file.mediaType, filename: file.name });
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      timeout: 30000,
      url: globalConfig.get('api.chatbot') + '/audio/text',
      headers: {
        'accept': 'application/json',
        ...formData.getHeaders(),
        CHATBOT_API_KEY: apiKey
        // Authorization: `Bearer ${apiKey}`,
      },
      data: formData,
      params: form
    };

    const result = await axios.request(config)
    if (result.data.code === 200) {
      return result.data.data
    } else {
      log.fail('语音转换出错', result.data.message)
      return '';
    }

  } catch (e) {
    log.fail(`语音转换出错: ${e}`)
    return '';
  }
}

/**
 * 识别图像
 * @param images
 * @param question
 * @param config
 * @returns {Promise<*|[{type: number, content: string}]>}
 */
export async function getImageVision(images: any, question: any, config: any) {
  try {
    const apiKey = globalConfig.get('chatbot.apiKey')
    const reqConfig = {
      method: 'post',
      maxBodyLength: Infinity,
      timeout: 30000,
      url: globalConfig.get('api.chatbot') + '/image/vision',
      headers: {
        // Authorization: `Bearer ${apiKey}`,
        CHATBOT_API_KEY: apiKey
      },
      data: {
        images,
        question,
        config
      }
    };
    const result = await axios.request(reqConfig)
    if (result.data.code === 200) {
      return result.data.data
    } else {
      log.fail('识别图像出错', result.data.message)
      return [{ type: 1, content: '' }];
    }
  } catch (e) {
    log.fail('识别图像出错', e)
    return [{ type: 1, content: '' }];
  }
}

/**
 * 识别图像文字
 * @param images
 * @param question
 * @param config
 * @returns {Promise<*|[{type: number, content: string}]>}
 */
export async function getImageText(file: any) {
  try {
    const apiKey = globalConfig.get('chatbot.apiKey')

    // const audioTextApi = globalConfig.get('api.audioTextApi')
    const base64 = await file.toBuffer()

    const buffer: any = Buffer.from(base64, 'base64')
    const formData = new FormData();
    formData.append('file', buffer, { contentType: file.mediaType, filename: file.name });
    let config = {
      method: 'post',
      maxBodyLength: Infinity,
      timeout: 30000,
      url: globalConfig.get('api.chatbot') + '/img/text',
      headers: {
        'accept': 'application/json',
        ...formData.getHeaders(),
        CHATBOT_API_KEY: apiKey
        // Authorization: `Bearer ${apiKey}`,
      },
      data: formData,
    };

    const result = await axios.request(config)
    if (result.data.code === 200) {
      return result.data.data
    } else {
      log.fail('图片转换出错', result.data.message)
      return '';
    }
  } catch (e) {
    log.fail(`图片转换出错: ${e}`)
    return '';
  }
}

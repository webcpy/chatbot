import superagent from 'superagent'
import { BaseConfig } from '../db/repositories/BaseConfig'
import config from '../config/index'
import axios from 'axios'
import { Container } from 'typedi'
import { data } from 'cheerio/lib/api/attributes'

const CHATBOT_API = config.get('api.chatbot')
const TX_API = config.get('api.txApi')
const NEW_TX_API = config.get('api.newTxApi')

const service = axios.create({
  // 定义统一的请求头部
  headers: {
    'Content-Type': 'application/json',
    'chatbot_api_key': config.get('chatbot.apiKey'),
  },
  // 配置请求超时时间

  timeout: 60000,
  withCredentials: false
})
// 请求拦截
service.interceptors.request.use((config) => {
  return config
})
// 返回拦截
service.interceptors.response.use(
  (response) => {
    if (response.status === 200) {
      // 获取接口返回结果
      const res = response.data
      // code为0，直接把结果返回回去，这样前端代码就不用在获取一次data.
      if (res.code === 200) {
        if (Array.isArray(res.data)) {
          return Promise.resolve(res.data)
        } else {
          const result = [{ type: 1, content: '回调函数返回参数错误：' + JSON.stringify(res.data) }]
          return Promise.resolve(result)
        }
      } else {
        const result = [{ type: 1, content: res.msg }]
        return Promise.resolve(result)
      }
    }
    const res = [{ type: 1, content: '回调接口网络错误：' + response.status }]
    return Promise.resolve(res)
  },
  (err) => {
    log.success('err', err)
    const res = [{ type: 1, content: '网络错误，请稍后重试' }]
    return Promise.resolve(res)
  }
)
/**
 * 封装get请求
 * @param {*} url 地址
 * @param {*} params 参数
 * @param {*} contentType 发送请求数据类型
 */
function get({
  url = '',
  params = {},
  contentType = 'application/json',
  platform = 'tx',
  authorization = '',
  spider = false
}) {
  return new Promise((resolve, reject) => {
    superagent
      .get(url)
      .query(params)
      .set('Content-Type', contentType)
      .set('chatbot_api_key', config.get('chatbot.apiKey'))
      .set('Authorization', authorization)
      .end((err, res: any) => {
        if (err) {
          log.fail(`请求出错${err}`)

          reject(err)
        } else {
          if (spider) {
            // 如果是爬取内容，直接返回页面html
            resolve(res.text)
          } else {
            // 如果是非爬虫，返回格式化后的内容
            res = (res && res.text && JSON.parse(res.text)) || {}
            if (platform !== 'chuan') {
              if (
                (res.code !== 200 && platform === 'tx') ||
                (res.code !== 200 && platform === 'aibot') ||
                (res.code !== 0 && platform === 'qi') ||
                (res.code !== 100000 && platform === 'tl')
              ) {
                log.fail(`接口${url}请求失败 ${res.msg || res.text}`)
                // console.error(`接口${url}请求失败`, res.msg || res.text)
              }
            }
            resolve(res)
          }
        }
      })
  })
}
/**
 * 封装post请求
 * @param {*} url 地址
 * @param {*} params 参数
 * @param {*} contentType 发送请求数据类型
 * @param authorization
 */
function post({
  url,
  params,
  contentType = 'application/json',
  authorization = '',
  platform = 'tx',
  spider = false
}: any) {
  return new Promise((resolve, reject) => {
    superagent
      .post(url)
      .send(params)
      .set('Content-Type', contentType)
      .set('Authorization', authorization)
      .set('CHATBOT_API_KEY', config.get('chatbot.apiKey'))
      .end((err, res: any) => {
        if (err) {
          log.fail(`请求出错${err}`)
          log.success(err)
          reject(err)
        } else {
          if (spider) {
            // 如果是爬取内容，直接返回页面html
            resolve(res.text)
          } else {
            // 如果是非爬虫，返回格式化后的内容
            res = (res && res.text && JSON.parse(res.text)) || {}
            if (platform !== 'chuan') {
              if (
                (res.code !== 200 && platform === 'tx') ||
                (res.code !== 200 && platform === 'aibot') ||
                (res.code !== 100000 && platform === 'tl')
              ) {
                console.error([`接口请求失败${url}`, res.msg || res.text || res.error])
              }
            }
            resolve(res)
          }
        }
      })
  })
}
function req(option: any) {
  if (!option) return
  if (option.method === 'POST') {
    return post(option)
  } else {
    return get(option)
  }
}
async function txReq(option: any) {
  const config: any = await Container.get(BaseConfig).getAllConfig()
  if (!option) return
  const params = {
    key: config.txApiKey,
    ...option.params
  }
  if (option.method === 'POST') {
    return post({ url: TX_API + option.url, params, contentType: option.contentType })
  } else {
    return get({ url: TX_API + option.url, params, contentType: option.contentType })
  }
}

export async function newTxReq(option: any) {
  const config: any = await Container.get(BaseConfig).getAllConfig()
  if (!option) return
  const params = {
    key: config.txApiKey,
    ...option.params
  }
  if (option.method === 'POST') {
    return post({ url: NEW_TX_API + option.url, params, contentType: option.contentType })
  } else {
    return get({ url: NEW_TX_API + option.url, params, contentType: option.contentType })
  }
}
async function aiBotReq(option: any) {
  const apiKey = config.get('chatbot.apiKey')
  if (!option) return
  if (!apiKey) {
    log.warn('未设置apikey')
    return
  }
  let params = option.params;
  if (option.method === 'POST') {
    return post({
      url: CHATBOT_API + option.url,
      params,
      contentType: 'application/json;charset=utf-8',
      platform: option.platform || 'aibot'
    })
  } else {
    return get({
      url: CHATBOT_API + option.url,
      params,
      contentType: option.contentType,
      platform: option.platform || 'aibot'
    })
  }
}
async function callbackAibotApi(url: string, data: {} | undefined, timeout = 60) {
  const apiKey = config.get('chatbot.apiKey');
  if (!apiKey) {
    log.warn('未设置apikey')
    return []
  }
  let res = await service.post(url, data, { timeout: timeout * 1000 })
  return res
}
export { req }
export { txReq }
export { aiBotReq }
export { service }
export { callbackAibotApi }
export default {
  req,
  txReq,
  aiBotReq,
  service,
  callbackAibotApi
}

import Qrterminal from 'qrcode-terminal'
import { throttle } from '../lib'
import { setQrCode, getVerifyCode } from '../proxy/chetbot'
import log from '../utils/npmlog'
import config from '../config';
import { Container } from 'typedi'
import { PuppetConfig } from '../db/repositories/Puppet'
import { init } from '../db/index';
import { memoryInit } from '../db/memory';

// 限制推送二维码的次数，防止掉线后，无限推送二维码到服务器
let scanTime = 0

export function resetScanTime () {
  scanTime = 0
}

function getQrcodeKey(qrcode: string) {
  if(!qrcode || !qrcode.startsWith('http')) return
  let url = new URL(qrcode);
  let searchParams = new URLSearchParams(url.search.slice(1));
  if(searchParams.get('key')) {
    log.success('获取到二维码信息中的key')
    config.set('chatbot.qrcodeKey', searchParams.get('key') || '')
  } else {
    config.set('chatbot.qrcodeKey', searchParams.get('key') || '')
  }
}
/**
 * 扫描登录，显示二维码
 */
async function onScan(qrcode: any, status: any) {
  try {
    await init()
    await memoryInit()
    const updatePuppetConfig = Container.get(PuppetConfig)
    await updatePuppetConfig.saved({ puppetType: this.puppet.constructor.name })
    const scanTimes = config.get('chatbot.scanTimes')
    await getVerifyCode();
    getQrcodeKey(qrcode)
    Qrterminal.generate(qrcode)
    log.success([`扫描状态:`, status])
    if(scanTime >= scanTimes) {
  
      log.fail(`长时间推送登录状态，平台二维码不再更新，请重启服务，或直接在终端扫码登录`,)
    } else {
      scanTime++
      // setQrCode(qrcode, status)
      //@ts-ignore
      throttle(setQrCode(qrcode, status), 15000)
    }
    const qrImgUrl = ['http://192.168.0.101:7001/wechat/create-qr-code?url=', encodeURIComponent(qrcode)].join('')

    log.success(qrImgUrl)
  } catch (e) {
    log.fail('二维码推送报错')
    log.success(e)
  }
}
export default onScan

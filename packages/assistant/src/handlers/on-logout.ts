import { setQrCode } from '../proxy/chetbot'
import { closeMqtt } from '../proxy/mqtt'
/**
 * 登出事件
 */
async function onLogout(user: any) {
  try {
    await setQrCode('qrcode', '6')
    log.success(`用户${user}已登出`)
    closeMqtt()
  } catch (e){
    log.fail(['登出报错', e])
  }

}
export default onLogout

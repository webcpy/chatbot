import { sendHeartBeat } from "../proxy/chetbot";
import { throttle } from '../lib/index'

async function onHeartBeat(str: any) {
  try {
    if (!str) {
      await sendHeartBeat('dead')
    } else if (str.type === 'scan') {
      await sendHeartBeat('scan')
    } else if(str.includes('heartbeat')) {
      throttle(sendHeartBeat('live'), 30000)
    }
  } catch (e) {
    log.fail('心跳更新失败', e)
  }

}
export default onHeartBeat

import { updateRoomOnly } from '../utils/index'
import { delay } from '../lib/index'

async function onRoomtopic(_room: any, newTopic: any, oldTopic: any, _changer: any, _date: any) {
  try {
    log.success(`【${oldTopic}】群名更新为：${newTopic}`)
    await delay(3000)
    log.success('正在更新群组')
    await updateRoomOnly(this)
  } catch (e) {
    log.fail(['群名更新报错', e])
  }
}
export default onRoomtopic

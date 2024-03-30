import { addRoomWelcomeSay } from '../utils/index'
import { Container } from 'typedi'
import { BaseConfig } from '../db/repositories/BaseConfig'
/**
 * 判断配置中是否存在此群
 * @param {*} arr 配置的群组
 * @param {*} name 有新人的群名
 * @return {*} 配置中此群的下标，不存在此群返回-1
 */
function roomHasConfig(arr: any, name: any) {
  if (arr.length == 0) return -1
  for (let i in arr) {
    if (arr[i].roomName == name) return i
  }
  return -1
}
/**
 * 群中有新人进入
 */
async function onRoomjoin(room: { topic: () => any }, inviteeList: any[], inviter: any, _date: any) {
  try {
    const config: any = await Container.get(BaseConfig).getAllConfig()
    const nameList = inviteeList.map((c) => c.name()).join(',')
    const roomName = await room.topic()
    const roomIndex: any = config && roomHasConfig(config.roomJoinKeywords, roomName)

    log.success(['进群', roomName, roomIndex, nameList])
    if (roomIndex > -1) {
      const { welcomes } = config.roomJoinKeywords[roomIndex]
      log.success(`群名： ${roomName} ，加入新成员： ${nameList}, 邀请人： ${inviter}`)
      for (const item of welcomes) {
        await addRoomWelcomeSay(room, roomName, nameList, item)
      }
    }
  } catch (e) {
    log.fail(['on room join error: ', e])
  }
}
export default onRoomjoin

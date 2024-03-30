async function onRoomleave(room: { topic: () => any }, leaverList: any[], remover: any, _date: any) {
  try {
    const nameList = leaverList.map((c) => c.name()).join(',')
    log.success(`群： 【${await room.topic()}】 离开了成员【 ${nameList}】,移除人【 ${remover}】`)
  } catch (e) {
    log.fail(['群成员离开报错', e])
  }
}
export default onRoomleave

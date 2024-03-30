import { delay } from "../lib/index";
import { get } from 'lodash'

/**
 * 指定用户消息转发到群或好友 如果被拦截成功 则不进行其他回复操作
 * @returns {Promise<boolean>}
 */
export async function privateForward({ that, msg, name, config }: any) {
  const privateForwards = config.privateForwards
  if(!privateForwards || !privateForwards.length || msg.text().includes('请在手机上查看]')) return false
  let result = false
  try {
    if(privateForwards.length) {
      for(let item of privateForwards) {
        const itemName = get(item, 'names.name', '')
        if(itemName === name) {
          result = true
          for(let roomName of item.rooms) {
            await delay(500)
            const room = await that.Room.find({ topic: roomName.name })
            if (!room) {
              log.fail(`查找不到群：${roomName.name}，请检查群名是否正确`)
            }
            // 只转发文字
            if(item.type === 1 && msg.type() === 7) {
                room && msg && msg.forward(room)
                log.success(`转发消息用户 ${itemName} 转发给群：${roomName.name}`)

            } else {
                room && msg && msg.forward(room)
                log.success(`转发消息用户 ${itemName} 转发给群：${roomName.name}`)

            }
          }
          for(let contactName of item.contacts) {
            await delay(500)
            const contact = await that.Contact.find({ name: contactName.name })
            if (!contact) {
              log.fail(`查找不到用户：${contactName.name}，请检查用户昵称是否正确`)
            }
            // 只转发文字
            if(item.type === 1 && msg.type() === 7) {
              contact && msg && msg.forward(contact)
              log.success(`转发消息用户 ${itemName} 转发给用户：${contactName.name}`)

            } else {
              contact && msg && msg.forward(contact)
              log.success(`转发消息用户 ${itemName} 转发给用户：${contactName.name}`)

            }

          }
        }
      }
    }
    return result
  } catch (e) {
    log.fail(["error", e]);
  }
}

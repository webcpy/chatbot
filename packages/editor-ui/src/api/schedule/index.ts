import request from '@/axios'

export const saveDayTaskSchedule = (data: any) => {
  return request.post({ url: '/wechat/saveDayTaskSchedule', data })
}

export const getDayTaskSchedule = (params: any) => {
  return request.get({ url: '/wechat/getDayTaskSchedule', params })
}

export const delDayTaskSchedule = (ids: any) => {
  return request.get({ url: `/wechat/delDayTaskSchedule/${ids}` })
}

export const detailDayTaskSchedule = (ids: any) => {
  return request.get({ url: `/wechat/detailDayTaskSchedule/${ids}` })
}

export const updateDayTaskSchedule = (data: any) => {
  return request.post({ url: `/wechat/updateDayTaskSchedule`, data })
}

export const saveCountDownTaskSchedule = (data: any) => {
  return request.post({ url: '/wechat/saveCountDownTaskSchedule', data })
}

export const getCountDownTaskSchedule = (params: any) => {
  return request.get({ url: '/wechat/getCountDownTaskSchedule', params })
}

export const delCountDownTaskSchedule = (ids: any) => {
  return request.get({ url: `/wechat/delCountDownTaskSchedule/${ids}` })
}

export const detailCountDownTaskSchedule = (ids: any) => {
  return request.get({ url: `/wechat/detailCountDownTaskSchedule/${ids}` })
}

export const updateCountDownTaskSchedule = (data: any) => {
  return request.post({ url: `/wechat/updateCountDownTaskSchedule`, data })
}

export const saveRoomNewsSchedule = (data: any) => {
  return request.post({ url: '/wechat/saveRoomNewsSchedule', data })
}

export const getRoomNewsSchedule = (params: any) => {
  return request.get({ url: '/wechat/getRoomNewsSchedule', params })
}

export const delRoomNewsSchedule = (ids: any) => {
  return request.get({ url: `/wechat/delRoomNewsSchedule/${ids}` })
}

export const detailRoomNewsSchedule = (ids: any) => {
  return request.get({ url: `/wechat/detailRoomNewsSchedule/${ids}` })
}

export const updateRoomNewsSchedule = (data: any) => {
  return request.post({ url: `/wechat/updateRoomNewsSchedule`, data })
}

export const saveRoomTaskSchedule = (data: any) => {
  return request.post({ url: '/wechat/saveRoomTaskSchedule', data })
}

export const getRoomTaskSchedule = (params: any) => {
  return request.get({ url: '/wechat/getRoomTaskSchedule', params })
}

export const delRoomTaskSchedule = (ids: any) => {
  return request.get({ url: `/wechat/delRoomTaskSchedule/${ids}` })
}

export const detailRoomTaskSchedule = (ids: any) => {
  return request.get({ url: `/wechat/detailRoomTaskSchedule/${ids}` })
}

export const updateRoomTaskSchedule = (data: any) => {
  return request.post({ url: `/wechat/updateRoomTaskSchedule`, data })
}

export const saveCustomContent = (data: any) => {
  return request.post({ url: '/wechat/saveCustomContent', data })
}

export const getCustomContent = (params: any) => {
  return request.get({ url: '/wechat/getCustomContent', params })
}

export const delCustomContent = (ids: any) => {
  return request.get({ url: `/wechat/delCustomContent/${ids}` })
}

export const detailCustomContent = (ids: any) => {
  return request.get({ url: `/wechat/detailCustomContent/${ids}` })
}

export const updateCustomContent = (data: any) => {
  return request.post({ url: `/wechat/updateCustomContent`, data })
}

import request from '@/axios'

export const saveBatchSend = (data: any) => {
  return request.post({ url: '/wechat/saveBatchSend', data })
}

export const batchsend = (data: any) => {
  return request.post({ url: '/wechat/batch/send', data })
}

export const eventSend = (data: any) => {
  return request.post({ url: '/wechat/event/send', data })
}

export const getBatchSend = (params: any) => {
  return request.get({ url: '/wechat/getBatchSend', params })
}

export const delBatchSend = (ids: any) => {
  return request.get({ url: `/wechat/delBatchSend/${ids}` })
}

export const detailBatchSend = (ids: any) => {
  return request.get({ url: `/wechat/detailBatchSend/${ids}` })
}

export const updateBatchSend = (data: any) => {
  return request.post({ url: `/wechat/updateBatchSend`, data })
}

export const savePrivateForwards = (data: any) => {
  return request.post({ url: '/wechat/savePrivateForwards', data })
}

export const getPrivateForwards = (params: any) => {
  return request.get({ url: '/wechat/getPrivateForwards', params })
}

export const delPrivateForwards = (ids: any) => {
  return request.get({ url: `/wechat/delPrivateForwards/${ids}` })
}

export const detailPrivateForwards = (ids: any) => {
  return request.get({ url: `/wechat/detailPrivateForwards/${ids}` })
}

export const updatePrivateForwards = (data: any) => {
  return request.post({ url: `/wechat/updatePrivateForwards`, data })
}

export const saveRoomAsyncList = (data: any) => {
  return request.post({ url: '/wechat/saveRoomAsyncList', data })
}

export const getRoomAsyncList = (params: any) => {
  return request.get({ url: '/wechat/getRoomAsyncList', params })
}

export const delRoomAsyncList = (ids: any) => {
  return request.get({ url: `/wechat/delRoomAsyncList/${ids}` })
}

export const detailRoomAsyncList = (ids: any) => {
  return request.get({ url: `/wechat/detailRoomAsyncList/${ids}` })
}

export const updateRoomAsyncList = (data: any) => {
  return request.post({ url: `/wechat/updateRoomAsyncList`, data })
}

export const saveCallBackEvents = (data: any) => {
  return request.post({ url: '/wechat/saveCallBackEvents', data })
}

export const getCallBackEvents = (params: any) => {
  return request.get({ url: '/wechat/getCallBackEvents', params })
}

export const delCallBackEvents = (ids: any) => {
  return request.get({ url: `/wechat/delCallBackEvents/${ids}` })
}

export const detailCallBackEvents = (ids: any) => {
  return request.get({ url: `/wechat/detailCallBackEvents/${ids}` })
}

export const updateCallBackEvents = (data: any) => {
  return request.post({ url: `/wechat/updateCallBackEvents`, data })
}

export const saveGlobalTask = (data: any) => {
  return request.post({ url: '/wechat/saveGlobalTask', data })
}

export const getGlobalTask = (params: any) => {
  return request.get({ url: '/wechat/getGlobalTask', params })
}

export const delGlobalTask = (ids: any) => {
  return request.get({ url: `/wechat/delGlobalTask/${ids}` })
}

export const detailGlobalTask = (ids: any) => {
  return request.get({ url: `/wechat/detailGlobalTask/${ids}` })
}

export const updateGlobalTask = (data: any) => {
  return request.post({ url: `/wechat/updateGlobalTask`, data })
}

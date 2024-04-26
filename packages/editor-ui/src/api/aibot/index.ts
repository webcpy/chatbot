import request from '@/axios'

export const saveAiBotPromot = (data: any) => {
  return request.post({ url: '/wechat/saveAiBotPromot', data })
}

export const copyAiBotPromot = (data: any) => {
  return request.post({ url: '/wechat/copyAiBotPromot', data })
}

export const getAiBotPromot = (params: any) => {
  return request.get({ url: '/wechat/getAiBotPromot', params })
}

export const delAiBotPromot = (ids: any) => {
  return request.get({ url: `/wechat/delAiBotPromot/${ids}` })
}

export const detailAiBotPromot = (ids: any) => {
  return request.get({ url: `/wechat/detailAiBotPromot/${ids}` })
}

export const updateAiBotPromot = (data: any) => {
  return request.post({ url: `/wechat/updateAiBotPromot`, data })
}

export const saveAiBotCustomchat = (data: any) => {
  return request.post({ url: '/wechat/saveAiBotCustomchat', data })
}

export const getAiBotCustomchat = (params: any) => {
  return request.get({ url: '/wechat/getAiBotCustomchat', params })
}

export const delAiBotCustomchat = (ids: any) => {
  return request.get({ url: `/wechat/delAiBotCustomchat/${ids}` })
}

export const detailAiBotCustomchat = (ids: any) => {
  return request.get({ url: `/wechat/detailAiBotCustomchat/${ids}` })
}

export const reseveAiBotCustomchat = (ids: any) => {
  return request.get({ url: `/wechat/reseveAiBotCustomchat/${ids}` })
}

export const copyAiBotCustomchat = (data: any) => {
  return request.post({ url: `/wechat/copyAiBotCustomchat`, data })
}

export const updateAiBotCustomchat = (data: any) => {
  return request.post({ url: `/wechat/updateAiBotCustomchat`, data })
}

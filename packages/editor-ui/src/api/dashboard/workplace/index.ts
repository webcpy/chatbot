import request from '@/axios'
import type { WorkplaceTotal, Project, Dynamic, Team, RadarData } from './types'
import { da } from 'element-plus/es/locale'

export const getAppkeyApi = (): Promise<IResponse<WorkplaceTotal>> => {
  return request.get({ url: '/user/appid' })
}

export const refreshAppKeyAPi = () => {
  return request.get({ url: '/user/refreshAppKey' })
}

export const saveCode = (data: any) => {
  return request.post({ url: '/wechat/worker/setverifycode', data })
}
export const deldata = () => {
  return request.post({ url: '/wechat/deldata', data: {}} )
}

export const findCode = () => {
  return request.get({ url: '/wechat/config' })
}

export const statusCode = () => {
  return request.get({ url: '/wechat/status' })
}

export const saveKeywords = (data: any) => {
  return request.post({ url: '/wechat/saveKeywords', data })
}

export const getKeywords = (params: any) => {
  return request.get({ url: '/wechat/getKeywords', params })
}

export const delKeywords = (ids: any) => {
  return request.get({ url: `/wechat/delKeywords/${ids}` })
}

export const detailKeywords = (ids: any) => {
  return request.get({ url: `/wechat/detailKeywords/${ids}` })
}

export const updateKeywords = (data: any) => {
  return request.post({ url: `/wechat/updateKeywords`, data })
}

export const saveEventKeywords = (data: any) => {
  return request.post({ url: '/wechat/saveEventKeywords', data })
}

export const getEventKeywords = (params: any) => {
  return request.get({ url: '/wechat/getEventKeywords', params })
}

export const delEventKeywords = (ids: any) => {
  return request.get({ url: `/wechat/delEventKeywords/${ids}` })
}

export const detailEventKeywords = (ids: any) => {
  return request.get({ url: `/wechat/detailEventKeywords/${ids}` })
}

export const updateEventKeywords = (data: any) => {
  return request.post({ url: `/wechat/updateEventKeywords`, data })
}

export const getFriend = (params: any) => {
  return request.get({ url: `/wechat/friend`, params })
}

export const getFriends = (params: any) => {
  return request.get({ url: `/wechat/friends`, params })
}

export const getRoom = (params: any) => {
  return request.get({ url: `/wechat/room`, params })
}

export const synchronize = (data: any) => {
  return request.post({ url: `/wechat/synchronize`, data })
}

export const sayApi = (data: any) => {
  return request.post({ url: `/wechat/contact/say`, data })
}

export const saveRoomJoinKeywords = (data: any) => {
  return request.post({ url: '/wechat/saveRoomJoinKeywords', data })
}

export const getRoomJoinKeywords = (params: any) => {
  return request.get({ url: '/wechat/getRoomJoinKeywords', params })
}

export const delRoomJoinKeywords = (ids: any) => {
  return request.get({ url: `/wechat/delRoomJoinKeywords/${ids}` })
}

export const detailRoomJoinKeywords = (ids: any) => {
  return request.get({ url: `/wechat/detailRoomJoinKeywords/${ids}` })
}

export const updateRoomJoinKeywords = (data: any) => {
  return request.post({ url: `/wechat/updateRoomJoinKeywords`, data })
}

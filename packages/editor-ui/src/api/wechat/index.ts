import request from '@/axios'

export const detailBaseConfig = () => {
  return request.get({ url: `/wechat/detailBaseConfig` })
}

export const updateBaseConfig = (data: any) => {
  return request.post({ url: `/wechat/updateBaseConfig`, data })
}
export const saveBaseConfig = (data: any) => {
  return request.post({ url: '/wechat/saveBaseConfig', data })
}

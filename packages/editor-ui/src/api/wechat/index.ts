import request from '@/axios'

export const detailBaseConfig = () => {
  console.log(3333)
  return request.get({ url: `/wechat/detailBaseConfig` })
}

export const updateBaseConfig = (data: any) => {
  return request.post({ url: `/wechat/updateBaseConfig`, data })
}
export const saveBaseConfig = (data: any) => {
  return request.post({ url: '/wechat/saveBaseConfig', data })
}

import request from '@/axios'

export const materialList = (params: any) => {
  return request.get({
    url: '/material/list',
    params
  })
}

export const materialDetail = (id: any) => {
  return request.get({
    url: `/material/detail/${id}`
  })
}

export const materialRemove = (id: any) => {
  return request.get({
    url: `/material/remove/${id}`
  })
}

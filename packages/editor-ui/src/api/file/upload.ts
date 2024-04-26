import request from '@/axios'
import { PATH_URL } from '@/axios/service'
interface RoleParams {
  roleName: string
}

export const fileUploadApi = PATH_URL + 'file/upload'
export const ImgPath = import.meta.env.VITE_QIUN_PATH

export const delFile = (params: any) => {
  return request.delete({
    url: '/file/del',
    params
  })
}

export const saveMaterial = (data: any) => {
  return request.post({
    url: '/material/rich/add/',
    data
  })
}

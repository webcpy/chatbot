// useLoading.js
import { getCurrentInstance } from 'vue'

export default function useLoading() {
  const instance: any = getCurrentInstance()
  const globalVueInstance = instance.appContext.config.globalProperties

  const showLoading = (options = { text: '上传中...' }) => {
    globalVueInstance.$loading(options)
  }

  const hideLoading = () => {
    globalVueInstance.$loading().close()
  }

  return { showLoading, hideLoading }
}

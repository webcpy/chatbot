<template>
  <ElUpload
    :action="fileUploadApi"
    :accept="accept"
    :onError="onError"
    :onSuccess="onSuccess"
    :beforeUpload="beforeUpload"
    :withCredentials="true"
    :showFileList="showFileList"
    :on-progress="progress"
    :disabled="!!modelValue"
  >
    <div
      class="rounded-2xl border border-green-500/50 border-dashed w-20 h-20 flex items-center justify-center"
    >
      <Icon v-if="!modelValue && state == 'start'" icon="ant-design:cloud-upload-outlined" />
      <div v-if="modelValue && state == 'start'" class="relative rounded-2xl w-full h-full">
        <img :src="modelValue" class="absolute w-full h-full" />
        <div
          class="absolute w-full h-full hover:bg-black hover:bg-opacity-40 flex items-center justify-center"
        >
          <Icon
            color="#409eff"
            @click="open"
            hoverColor="#fff"
            icon="ant-design:search-outlined"
            class="mr-2"
          />
          <Icon @click="del" color="#409eff" hoverColor="#fff" icon="ep:delete" />
        </div>
      </div>
      <div class="flex items-center justify-center" v-if="state != 'start'">
        <ElProgress :width="78" type="circle" :striped-flow="true" :percentage="percentage" />
      </div>
    </div>
  </ElUpload>
</template>
<script lang="ts" setup>
import { ref, getCurrentInstance, defineModel, defineEmits } from 'vue'
import { ElUpload, ElMessage, ElProgress } from 'element-plus'
import { Icon } from '@/components/Icon'
import { fileUploadApi, delFile } from '@/api/file/upload'
import type { UploadFile } from 'element-plus'

import useLoading from '@/hooks/web/useLoading'
const { showLoading, hideLoading } = useLoading()
import { createImageViewer } from '@/components/ImageViewer'
import { emit } from 'process'

const emit = defineEmits(['update:modelValue'])

const state = ref('start')

const percentage = ref(0)

const props = defineProps({
  accept: {
    type: String,
    default: 'image/png, image/jpeg'
  },
  action: {
    type: String,
    default: fileUploadApi
  },
  showFileList: {
    type: Boolean,
    default: false
  },
  modelValue: {
    type: String,
    default: ''
  }
})

const beforeUpload = (rawFile: UploadFile) => {
  const chineseRegex = /[\u4e00-\u9fa5]/
  if (chineseRegex.test(rawFile.name)) {
    ElMessage.error('文件名称不呢带中文呢!')
    return false
  }
  state.value = 'pending'
  return true
}
const onError = (_response) => {
  ElMessage.error(_response?.data?.message)
}
const open = () => {
  createImageViewer({
    urlList: [props.modelValue]
  })
}
const onSuccess = (_response: any) => {
  percentage.value = 100
  const { data } = _response
  emit('update:modelValue', data.key)
  state.value = 'start'
  percentage.value = 0
}

const progress = (evt) => {
  percentage.value = evt.percent / 2
}

const del = async () => {
  try {
    state.value = 'pending'
    if (percentage.value < 96) {
      percentage.value = percentage.value + 2
    }

    await delFile({
      key: props.modelValue
    })
    state.value = 'start'
    emit('update:modelValue', '')
  } catch (ex) {}
}
</script>

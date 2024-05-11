<script setup lang="ts">
import {
  ElRow,
  ElCol,
  ElSkeleton,
  ElCard,
  ElDivider,
  ElLink,
  ElTag,
  ElMessage,
  ElTooltip,
  ElButton,
  ElMessageBox,
  ElInput
} from 'element-plus'
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  getAppkeyApi,
  saveCode,
  refreshAppKeyAPi,
  findCode,
  statusCode,
  deldata
} from '@/api/dashboard/workplace'
import { throttle } from 'lodash-es'

import { useClipboard } from '@/hooks/web/useClipboard'
const { copy } = useClipboard()
const code = ref('')
const version = ref('')

let botState = ref({
  avatar: null,
  heartBeat: null,
  qrError: null,
  qrStatus: null,
  qrUrl: ''
})

const loading = ref(true)
const appkey = ref('')
const timer = ref(null)

const init = async () => {
  const data = await findCode()
  code.value = data.verifyCode
  version.value = data.version
}

const getCodeSattus = async () => {
  const data = await statusCode()
  botState.value = {
    ...data
  }
}

onMounted(() => {
  init()
  getCodeSattus()
  timer.value = setInterval(() => {
    getCodeSattus()
  }, 5000)
})

onBeforeUnmount(() => {
  clearInterval(timer.value)
})
const valiterCode = async () => {
  if (!code.value) {
    ElMessage.error('请先输入验证码')
    return
  }
  await saveCode({
    verifyCode: code.value
  })
}

const delValue = async () => {
  try {
    await ElMessageBox.confirm('此操作将删除好友和群列表数据，并退出机器人登录状态?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deldata()
    await getCodeSattus()
    ElMessage.success('操作成功')
  } catch (ex) {}
}

const copyAppkey = () => {
  copy(appkey.value)
  ElMessage.success('复制成功')
}

const refreshAppKey = async () => {
  const data = await refreshAppKeyAPi()
  appkey.value = data
  ElMessage.success('重置成功')
}

const getAppkey = async () => {
  const data = await getAppkeyApi()
  appkey.value = data
}
const getAllApi = async () => {
  await Promise.all([getAppkey()])
  loading.value = false
}

getAllApi()
</script>

<template>
  <div>
    <ElCard shadow="never">
      <ElSkeleton :loading="loading" animated>
        <ElRow :gutter="20" justify="space-between">
          <ElCol :xl="12" :lg="12" :md="12" :sm="24" :xs="24">
            <div class="flex items-center">
              <img
                src="@/assets/imgs/avatar.jpg"
                alt=""
                class="w-70px h-70px rounded-[50%] mr-20px"
              />
              <div>
                <div class="text-20px"> 早安，Archer，祝你开心每一天! </div>
                <div class="mt-10px text-14px text-gray-500"> 20℃ - 32℃！ </div>
              </div>
            </div>
          </ElCol>
          <ElCol :xl="12" :lg="12" :md="12" :sm="24" :xs="24">
            <div class="flex h-70px items-center justify-end lt-sm:mt-20px">
              <div class="px-8px text-right">
                <div class="text-14px text-gray-400 mb-20px">33333</div>
                <!-- <CountTo
                  class="text-20px"
                  :start-val="0"
                  :end-val="totalSate.project"
                  :duration="2600"
                /> -->
              </div>
              <ElDivider direction="vertical" />
              <div class="px-8px text-right">
                <div class="text-14px text-gray-400 mb-20px">2222</div>
              </div>
              <ElDivider direction="vertical" border-style="dashed" />
              <div class="px-8px text-right">
                <div class="text-14px text-gray-400 mb-20px">1111</div>
              </div>
            </div>
          </ElCol>
        </ElRow>
      </ElSkeleton>
    </ElCard>
  </div>

  <ElRow class="mt-20px" :gutter="20" justify="space-between">
    <ElCol :xl="8" :lg="8" :md="24" :sm="24" :xs="24" class="mb-20px">
      <ElCard class="h-70" shadow="never">
        <template #header>
          <div class="flex justify-between">
            <span
              >智能管家状态
              <ElTag type="info" v-if="botState.qrStatus == '1'">已掉线</ElTag>
              <ElTag type="info" v-if="botState.qrStatus == '2'">扫码登录</ElTag>
              <ElTag type="success" v-if="botState.qrStatus == '3'">已扫描</ElTag>
              <ElTag type="success" v-if="botState.qrStatus == '4'">已登录</ElTag>
            </span>
            <span
              v-if="!!botState.qrStatus"
              @click="delValue"
              class="text-[#3F9EFF] text-sm cursor-pointer"
              >删除数据</span
            >
          </div>
        </template>
        <ElSkeleton :loading="loading" animated>
          <div class="flex">
            <div v-if="botState.qrStatus != '1' || !botState.qrStatus">
              <img
                v-if="botState.qrStatus == '2'"
                width="100"
                height="100"
                :src="botState.qrUrl"
                alt=""
              />
              <img
                v-if="botState.qrStatus == '4'"
                width="100"
                height="100"
                class="rounded-[50%]"
                :src="botState.avatar"
                alt=""
              />
              <p v-if="botState.qrStatus == '2'" class="text-xs text-[#666] mt-0 text-center"
                >扫码登录</p
              >
              <div
                v-if="botState.qrStatus == '3'"
                class="w-24 h-full flex justify-center items-center flex-col mt-2"
              >
                <Icon
                  size="30"
                  color="#67c23a"
                  class="animate-spin"
                  icon="ant-design:loading-3-quarters-outlined"
                />
                <p v-if="botState.qrStatus == '3'" class="text-xs text-[#67c23a] mt-2 text-center"
                  >已扫描</p
                >
              </div>

              <p v-if="botState.qrStatus == '4'" class="text-xs text-[#67c23a] mt-0 text-center"
                >已登录</p
              >
            </div>
            <div class="text-xs ml-4 text-[#666] px-3">
              <div v-if="botState.qrStatus != '3' && botState.qrStatus != '4'">
                <p>由于部分企微登录时需要验证码，可在此输入(非企微请忽略)</p>
                <ElInput v-model="code" placeholder="企微如需验证码，在此输入">
                  <template #append>
                    <ElButton @click="valiterCode" type="success">确认</ElButton>
                  </template>
                </ElInput>
              </div>
              <p class="pt-6">当前panel插件版本：{{ version ? version : '1.0.0'}} </p>
              <!-- <p>最新插件版本：1.6.42 </p>
              <p class="text-red-600"
                >请更新最新版插件，体验最新功能 <span class="text-[#3F9EFF]">如何更新?</span></p
              > -->
            </div>
          </div>
        </ElSkeleton>
      </ElCard>
    </ElCol>
    <ElCol :xl="8" :lg="8" :md="24" :sm="24" :xs="24">
      <ElCard class="h-70" shadow="never">
        <template #header>
          <div class="flex justify-between">
            <span>秘钥</span>
            <ElTooltip class="box-item" effect="dark" content="重置密钥" placement="top-start">
              <Icon
                @click="refreshAppKey"
                color="#3F9EFF"
                icon="tdesign:refresh"
                class="mr-[5px] cursor-pointer"
              />
            </ElTooltip>
          </div>
        </template>
        <ElSkeleton :loading="loading" animated>
          <div class="flex mt-10 text-[#666] text-sm justify-center items-center flex-shrink-0">
            <span class="">APIKEY：</span>
            <span class="w-40 overflow-hidden text-ellipsis">{{ appkey }}</span>
            <ElTooltip class="box-item" effect="dark" content="复制密钥" placement="top-start">
              <Icon
                @click="copyAppkey"
                color="#3F9EFF"
                icon="ep:document-copy"
                class="mr-[5px] cursor-pointer"
              />
            </ElTooltip>
          </div>
        </ElSkeleton>
      </ElCard>
    </ElCol>
    <ElCol :xl="8" :lg="8" :md="24" :sm="24" :xs="24">
      <ElCard class="h-70" shadow="never">
        <template #header>
          <span>平台介绍</span>
        </template>
        <ElSkeleton :loading="loading" animated>
          <div class="text-sm text-[#666]">
            《微语智能管家》是一款智能机器人配置管理平台，能够一键接入ChatGPT对话系统，无缝适配Dify和FastGPT知识库！支持群组和个人，用户可根据需求定义不同的角色，享有丰富多样的技能。该平台同时支持企微、个微、公众号、5G消息、WhatsApp等通讯协议。
          </div>
          <div class="text-[#999] text-sm mt-4">
            声明：平台不存储任何敏感信息，也不记录聊天记录，只存储好友昵称和群名等基础的信息，不会造成任何信息泄露，请放心使用
          </div>
        </ElSkeleton>
      </ElCard>
    </ElCol>
  </ElRow>
</template>

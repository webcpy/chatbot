<script setup lang="ts">
import Write from './write.vue'
import { ContentDetailWrap } from '@/components/ContentDetailWrap'
import { ref, unref, defineProps, nextTick } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { useRouter, useRoute } from 'vue-router'
import {
  saveAiBotCustomchat,
  updateAiBotCustomchat,
  detailAiBotCustomchat,
  copyAiBotCustomchat
} from '@/api/aibot/index'
import { TableData } from '@/api/table/types'
import { useEventBus } from '@/hooks/event/useEventBus'
import { omit } from 'lodash-es'

const props = defineProps({
  type: {
    type: String,
    default: 'add'
  },
  id: {
    type: Number,
    default: 0
  }
})

const { emit } = useEventBus()

const { push, go } = useRouter()

const { query } = useRoute()

const { t } = useI18n()

const currentRow = ref<Nullable<TableData>>(null)

const getTableDet = async () => {
  if (props.type == 'add') {
    return
  }
  const res = await detailAiBotCustomchat(props.id)
  if (res) {
    currentRow.value = res
    if (res.type != 'contact') {
      currentRow.value.roomList = res.targets || []
    } else {
      currentRow.value.friendList = res.targets || []
    }
    nextTick(() => {
      const write = unref(writeRef)
      write?.init(currentRow.value)
    })
  }
}

getTableDet()

const writeRef = ref<ComponentRef<typeof Write>>()

const loading = ref(false)

const save = async () => {
  const write = unref(writeRef)
  const formData = await write?.submit()
  if (formData) {
    loading.value = true
    let res: any = null

    let targets = []
    if (formData.type != 'contact') {
      targets = formData.roomList || []
    } else {
      targets = formData.friendList || []
    }
    const query = omit(
      {
        ...formData,
        targets
      },
      ['roomList', 'friendList']
    )
    if (props.type == 'edit') {
      res = await updateAiBotCustomchat({
        ...query
      })
        .catch(() => {})
        .finally(() => {
          loading.value = false
        })
    } else if (props.type == 'copy') {
      res = await copyAiBotCustomchat(omit(query, ['id']))
        .catch(() => {})
        .finally(() => {
          loading.value = false
        })
    } else {
      res = await saveAiBotCustomchat(query)
        .catch(() => {})
        .finally(() => {
          loading.value = false
        })
    }

    if (res) {
      emit('getList', props.type)
      push('/aibot/customchat')
    }
  }
}
</script>

<template>
  <ContentDetailWrap :title="t('exampleDemo.edit')" @back="push('/example/example-page')">
    <Write ref="writeRef" :current-row="currentRow" />

    <template #header>
      <BaseButton @click="go(-1)"> 返回 </BaseButton>
      <BaseButton type="primary" :loading="loading" @click="save"> 保存 </BaseButton>
    </template>
  </ContentDetailWrap>
</template>
@/hooks/event/useEventBus

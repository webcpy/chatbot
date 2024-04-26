<script setup lang="ts">
import Write from './write.vue'
import { ContentDetailWrap } from '@/components/ContentDetailWrap'
import { ref, unref, defineProps } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { useRouter, useRoute } from 'vue-router'

import { saveGlobalTask, updateGlobalTask, detailGlobalTask } from '@/api/vip'
import { TableData } from '@/api/table/types'
import { useEventBus } from '@/hooks/event/useEventBus'

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
  const res = await detailGlobalTask(props.id)
  if (res) {
    currentRow.value = res
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
    console.log(formData)
    if (props.type == 'edit') {
      res = await updateGlobalTask(formData)
        .catch(() => {})
        .finally(() => {
          loading.value = false
        })
    } else {
      res = await saveGlobalTask(formData)
        .catch(() => {})
        .finally(() => {
          loading.value = false
        })
    }

    if (res) {
      emit('getList', props.type)
      push('/globalTask/list')
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

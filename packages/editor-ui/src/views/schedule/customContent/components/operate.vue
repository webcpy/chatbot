<script setup lang="ts">
import Write from './write.vue'
import { ContentDetailWrap } from '@/components/ContentDetailWrap'
import { ref, unref, defineProps } from 'vue'
import { useI18n } from '@/hooks/web/useI18n'
import { useRouter, useRoute } from 'vue-router'
import { omit, get } from 'lodash-es'
import { saveCustomContent, updateCustomContent, detailCustomContent } from '@/api/schedule/index'
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

const { t } = useI18n()

const currentRow = ref<Nullable<TableData>>(null)

const getTableDet = async () => {
  if (props.type == 'add') {
    return
  }
  const res = await detailCustomContent(props.id)
  if (res) {
    currentRow.value = res
    currentRow.value.api = res.api.id
    if (res.type != 'contact') {
      currentRow.value.roomNames = res.names || []
    } else {
      currentRow.value.friendNames = res.names || []
    }
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
    let names = formData.roomNames
    if (formData.type == 'contact') {
      names = formData.friendNames
    }
    if (props.type == 'edit') {
      res = await updateCustomContent(
        omit(
          {
            ...formData,
            names
          },
          ['friendNames', 'roomNames']
        )
      )
        .catch(() => {})
        .finally(() => {
          loading.value = false
        })
    } else {
      res = await saveCustomContent({
        ...formData,
        names
      })
        .catch(() => {})
        .finally(() => {
          loading.value = false
        })
    }

    if (res) {
      emit('getList', props.type)
      push('/schedule/customContent')
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

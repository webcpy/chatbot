<template>
  <ElSelectV2
    v-if="!initLoading"
    v-model="model"
    :loading="loading"
    filterable
    v-bind:="$attrs"
    value-key="id"
    :props="prop"
    :options="options"
  />
</template>
<script lang="ts" setup>
import { ref, unref, defineEmits, nextTick, defineModel, useAttrs } from 'vue'
import { ElSelectV2 } from 'element-plus'
import { getAiBotPromot } from '@/api/aibot/index'

const props = defineProps({
  formModel: {
    type: Object,
    default: () => ({})
  },
  modelValue: {
    type: Object || Array
  },
  label: {
    type: String,
    default: 'name'
  }
})

const prop = {
  label: 'tag'
}
const options = ref<any[]>([])
const loading = ref(false)
const initLoading = ref(false)
// eslint-disable-next-line vue/require-prop-types
let model: any = defineModel()

const querySearchAsync = () => {
  initLoading.value = true
  getAiBotPromot({})
    .then((res: { list: any }) => {
      const data = (res.list || []).map((it: any) => {
        return {
          tag: it.tag,
          value: {
            id: it.id,
            tag: it.tag
          }
        }
      })
      options.value = data
    })
    .catch((_error: any) => {
      options.value = []
    })
    .finally(() => {
      initLoading.value = false
    })
}
querySearchAsync()
</script>

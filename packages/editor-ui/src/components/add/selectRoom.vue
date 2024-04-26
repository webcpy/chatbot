<template>
  <ElSelectV2
    v-if="!initLoading"
    v-model="model"
    :loading="loading"
    filterable
    remote
    v-bind:="$attrs"
    value-key="name"
    :options="options"
    :remote-method="querySearchAsync"
  />
</template>
<script lang="ts" setup>
import { ref, onMounted, defineEmits, nextTick, defineModel, useAttrs } from 'vue'
import { ElSelectV2, ElOption, ListItem } from 'element-plus'
import { getRoom } from '@/api/dashboard/workplace'
import { isArray } from 'lodash-es'

const props = defineProps({
  formModel: {
    type: Object,
    default: () => ({})
  }
})

const options = ref<any[]>([])
const loading = ref(false)
const initLoading = ref(false)

// eslint-disable-next-line vue/require-prop-types
let model: any = defineModel()

const init = () => {
  initLoading.value = false
  if (!isArray(model.value)) {
    return
  }
  options.value = (model.value || []).map((it) => {
    return {
      label: it.name,
      value: it
    }
  })
}
onMounted(() => {
  initLoading.value = true
  setTimeout(() => {
    init()
  }, 300)
})
const querySearchAsync = (_queryString: string, cb: (arg: any) => void) => {
  loading.value = true
  getRoom({
    name: _queryString
  })
    .then((res) => {
      loading.value = false

      const data = (res.list || []).map((it: any) => {
        return {
          label: it.name,
          value: {
            uniqueId: it.uniqueId,
            name: it.name,
            roomId: it.roomId
          }
        }
      })
      options.value = data
    })
    .catch((_error) => {
      loading.value = false
      options.value = []
    })
}

// eslint-disable-next-line vue/require-prop-types
</script>

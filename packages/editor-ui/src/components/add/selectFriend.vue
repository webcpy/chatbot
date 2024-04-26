<template>
  <ElSelectV2
    v-if="!initLoading"
    v-model="model"
    :loading="loading"
    filterable
    remote
    v-bind:="$attrs"
    value-key="aliasName"
    :options="options"
    :remote-method="querySearchAsync"
  />
</template>
<script lang="ts" setup>
import { ref, unref, defineEmits, nextTick, defineModel, useAttrs } from 'vue'
import { ElSelectV2, ElOption, ListItem } from 'element-plus'
import { getFriends } from '@/api/dashboard/workplace'
import { isArray } from 'lodash'

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

const options = ref<any[]>([])
const loading = ref(false)
const initLoading = ref(false)
// eslint-disable-next-line vue/require-prop-types
let model: any = defineModel()

const init = () => {
  if (!isArray(model.value)) {
    return
  }
  initLoading.value = true
  setTimeout(() => {
    options.value = model.value.map((it) => {
      return {
        label: it.aliasName,
        value: it
      }
    })
    initLoading.value = false
  }, 200)
}
init()

const querySearchAsync = (_queryString: string, cb: (arg: any) => void) => {
  loading.value = true
  getFriends({
    name: _queryString,
    alias: _queryString
  })
    .then((res) => {
      loading.value = false

      const data = (res.list || []).map((it: any) => {
        return {
          label: it.name + '-' + it.alias,
          value: {
            wxid: it.wxid,
            name: it.name,
            alias: it.alias,
            aliasName: it.name + '-' + it.alias
          }
        }
      })
      console.log(data)
      options.value = data
    })
    .catch((_error) => {
      loading.value = false
      options.value = []
    })
}
</script>

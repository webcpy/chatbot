<template>
  <ElAutocomplete v-bind="$attrs" v-model="model" :fetch-suggestions="querySearchAsync" clearable />
</template>
<script lang="ts" setup>
import { ref, unref, defineEmits, nextTick, defineModel, useAttrs } from 'vue'
import { ElAutocomplete } from 'element-plus'
import { getRoom, sayApi, getFriend, synchronize } from '@/api/dashboard/workplace'

const props = defineProps({
  formModel: {
    type: Object,
    default: () => ({})
  }
})

const querySearchAsync = (_queryString: string, cb: (arg: any) => void) => {
  getRoom({
    name: _queryString
  })
    .then((res) => {
      const data = (res.list || []).map((it) => {
        return {
          value: it.name,
          link: it.link
        }
      })
      cb(data)
    })
    .catch((_error) => {
      cb([])
    })
}
// const select = (val: any) => {
//   console.log(val)
// }
// eslint-disable-next-line vue/require-prop-types
let model: any = defineModel()
</script>

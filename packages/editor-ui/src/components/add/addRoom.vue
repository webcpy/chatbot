<template>
  <div class="flex flex-wrap"
    ><ElTag
      v-for="tag in model"
      :key="tag.id"
      closable
      size="large"
      class="mr-4 mb-3"
      :disable-transitions="false"
      @close="handleClose(tag)"
    >
      {{ tag.name }}
    </ElTag>
    <ElSelect
      v-if="inputVisible"
      v-model="value"
      filterable
      remote
      @change="select"
      reserve-keyword
      :remote-method="querySearchAsync"
      :loading="loading"
      style="width: 150px"
    >
      <ElOption v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
    </ElSelect>
    <ElButton v-else class="button-new-tag" @click="showInput"> + 添加群名 </ElButton>
  </div>
</template>
<script lang="ts" setup>
import { ref, unref, defineEmits, nextTick, defineModel, useAttrs } from 'vue'
import { ElButton, ElSelect, ElOption, ListItem, ElTag } from 'element-plus'
import { getRoom } from '@/api/dashboard/workplace'

const props = defineProps({
  formModel: {
    type: Object,
    default: () => ({})
  }
})

const options = ref<ListItem[]>([])
const value = ref<string[]>([])
const loading = ref(false)
const inputVisible = ref(false)

const handleClose = (tag: string) => {
  model.value.splice(model.value.indexOf(tag), 1)
}

const showInput = () => {
  inputVisible.value = true
  value.value = []
  nextTick(() => {})
}

const select = (val: any) => {
  if (val) {
    if (model.value.find((it: any) => it.id == val)) {
      inputVisible.value = false
      value.value = []
      return
    }
    const data: any = options.value.find((it) => it.value == val)
    model.value = [
      ...model.value,
      {
        name: data.label,
        id: data.value
      }
    ]
  }
  inputVisible.value = false
}

const querySearchAsync = (_queryString: string) => {
  loading.value = true
  getRoom({
    name: _queryString
  })
    .then((res) => {
      loading.value = false

      const data = (res.list || []).map((it: any) => {
        return {
          value: it.uniqueId,
          label: it.name
        }
      })
      options.value = data
    })
    .catch((_error) => {
      loading.value = false
      options.value = []
    })
}
// const select = (val: any) => {
//   console.log(val)
// }
// eslint-disable-next-line vue/require-prop-types
let model: any = defineModel()
</script>

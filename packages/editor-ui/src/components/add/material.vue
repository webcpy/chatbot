<template>
  <div class="flex flex-wrap flex-shrink-0"
    ><ElTag
      v-for="(tag, index) in model"
      :key="index"
      closable
      size="large"
      class="mr-4 mb-3"
      :disable-transitions="false"
      @close="handleClose(tag)"
    >
      {{ tag.name }} - {{ tag.tag }}
    </ElTag>
    <Dialog style="width: 70% !important" v-model="inputVisible" title="选择素材">
      <check ref="child" :model="model" />

      <template #footer>
        <BaseButton type="primary" :loading="saveLoading" @click="save"> 保存 </BaseButton>
        <BaseButton @click="inputVisible = false">关闭</BaseButton>
      </template>
    </Dialog>
    <ElButton v-if="!inputVisible" class="button-new-tag" @click="showInput"> + 选择素材 </ElButton>
  </div>
</template>
<script lang="ts" setup>
import { ref, unref, defineEmits, nextTick, defineModel } from 'vue'
import { ElTag, ElButton, ElInput, ElMessage } from 'element-plus'
import { Dialog } from '@/components/Dialog'
import check from './check.vue'
import { uniqBy } from 'lodash-es'

const props = defineProps({
  formModel: {
    type: Object,
    default: () => ({})
  },
  onchange: {
    type: Function,
    default: () => {}
  },
  flag: {
    type: Boolean,
    default: true
  }
})

const child = ref(null)

// eslint-disable-next-line vue/require-prop-types
let model: any = defineModel()
const inputValue = ref('')
const inputVisible = ref(false)
const saveLoading = ref(false)

const handleClose = (tag: string) => {
  model.value.splice(model.value.indexOf(tag), 1)
}

const showInput = () => {
  inputVisible.value = true
}

const save = async () => {
  const data = await child.value.getSelect()
  const newData = uniqBy([...data, ...model.value], 'materialId')
  model.value = [...newData]
  inputVisible.value = false
}
const handleInputConfirm = () => {
  if (inputValue.value) {
    if (model.value.includes(inputValue.value)) {
      ElMessage.error('关键词已经存在')
      return
    }
    model.value = [...model.value, inputValue.value]
  }
  inputVisible.value = false
  inputValue.value = ''
}
</script>

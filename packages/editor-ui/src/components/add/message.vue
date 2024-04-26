<template>
  <div class="flex flex-wrap"
    ><ElTag
      v-for="tag in model"
      :key="tag"
      closable
      size="large"
      class="mr-4 mb-3"
      :disable-transitions="false"
      @close="handleClose(tag)"
    >
      {{ tag }}
    </ElTag>
    <ElInput
      v-if="inputVisible"
      ref="InputRef"
      v-model="inputValue"
      class="mb-3"
      style="width: 114px"
      @keyup.enter="handleInputConfirm"
      @blur="handleInputConfirm"
    />
    <ElButton v-else class="button-new-tag" @click="showInput"> + 添加关键词 </ElButton>
  </div>
</template>
<script lang="ts" setup>
import { ref, unref, defineEmits, nextTick, defineModel } from 'vue'
import { ElTag, ElButton, ElInput, ElMessage } from 'element-plus'

const props = defineProps({
  formModel: {
    type: Object,
    default: () => ({})
  },
  onchange: {
    type: Function,
    default: () => {}
  }
})

// eslint-disable-next-line vue/require-prop-types
let model: any = defineModel()
const inputValue = ref('')
const inputVisible = ref(false)
const InputRef = ref<InstanceType<typeof ElInput>>()
const handleClose = (tag: string) => {
  model.value.splice(model.value.indexOf(tag), 1)
}

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    InputRef.value!.input!.focus()
  })
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

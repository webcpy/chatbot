<script setup lang="tsx">
import { Form, FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { PropType, reactive, watch, ref, unref, nextTick, defineModel, markRaw } from 'vue'
import { useValidator } from '@/hooks/web/useValidator'
import Friend from '@/components/add/selectFriend.vue'
import Room from '@/components/add/selectRoom.vue'

const { required } = useValidator()

const loadingInstance = ref<any>(null)

const props = defineProps({
  currentRow: {
    type: Object as PropType<any>,
    default: () => null
  }
})

const formSchema = ref<FormSchema[]>([
  {
    field: 'name',
    label: '预设角色',
    component: 'Input',
    colProps: {
      span: 24
    }
  },
  {
    field: 'tag',
    label: '标签',
    component: 'Input',
    colProps: {
      span: 24
    }
  },
  {
    field: 'promot',
    label: '提示词',
    component: 'Input',
    value: '',
    colProps: {
      span: 24
    },
    componentProps: {
      type: 'textarea',
      rows: '5'
    }
  },
  {
    field: 'isAiMba',
    label: '是否是智能体',
    component: 'Switch',
    value: false,
    colProps: {
      span: 24
    }
  },
  {
    field: 'desc',
    label: '备注',
    component: 'Input',
    colProps: {
      span: 24
    }
  }
])

const rules = reactive({
  name: [required()],
  thumbUrl: [required()],
  title: [required()],
  tag: [required()],
  promot: [required()]
})

const { formRegister, formMethods } = useForm()
const { setValues, getFormData, getElFormExpose, setSchema } = formMethods
const submit = async () => {
  const elForm = await getElFormExpose()
  const valid = await elForm?.validate().catch((err: any) => {
    console.log(err)
  })
  if (valid) {
    const formData = await getFormData()
    return formData
  }
}

watch(
  () => props.currentRow,
  (currentRow) => {
    if (!currentRow) return
    setValues(currentRow)
  },
  {
    deep: true,
    immediate: true
  }
)

defineExpose({
  submit
})
</script>

<template>
  <Form
    :rules="rules"
    :auto-set-placeholder="false"
    @register="formRegister"
    :schema="formSchema"
  />
</template>
<style lang="less"></style>

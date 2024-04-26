<script setup lang="tsx">
import { Form, FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { PropType, reactive, watch, ref, unref, nextTick, defineModel, markRaw } from 'vue'
import { useValidator } from '@/hooks/web/useValidator'

const { required } = useValidator()

const props = defineProps({
  currentRow: {
    type: Object as PropType<any>,
    default: () => null
  }
})

const formSchema = ref<FormSchema[]>([
  {
    field: 'topic',
    label: '群名',
    component: 'Input',
    colProps: {
      span: 24
    },
    componentProps: {
      disabled: true
    }
  },
  {
    field: 'type',
    label: '消息类型',
    component: 'RadioGroup',
    value: 1,
    colProps: {
      span: 24
    },
    componentProps: {
      disabled: true,
      options: [
        {
          label: '文字',
          value: 1
        },
        {
          label: '文件',
          value: 2
        },
        {
          label: 'h5链接',
          value: 4
        },
        {
          label: '小程序',
          value: 5
        }
      ]
    }
  },
  {
    field: 'content',
    label: '内容',
    colProps: {
      span: 24
    },
    component: 'Input',
    componentProps: {
      type: 'textarea',
      rows: '3'
    }
  },
  {
    field: 'weixin',
    componentProps: {
      hidden: true
    }
  }
])

const rules = reactive({})

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

<script setup lang="tsx">
import { Form, FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { PropType, reactive, watch, ref, unref, nextTick, defineModel, markRaw } from 'vue'
import { useValidator } from '@/hooks/web/useValidator'
import Upload from '@/components/Upload/index.vue'

const { required } = useValidator()

const loadingInstance = ref<any>(null)

const props = defineProps({
  currentRow: {
    type: Object as PropType<any>,
    default: () => null
  }
})

const treeRef = ref<typeof ElTree>()

const model = ref({
  name: 123
})

const formSchema = ref<FormSchema[]>([
  {
    field: 'name',
    label: '素材别名',
    component: 'Input',
    colProps: {
      span: 24
    }
  },
  {
    field: 'tag',
    label: '素材标签',
    component: 'Input',
    colProps: {
      span: 24
    }
  },
  {
    field: 'type',
    label: '素材类型',
    component: 'RadioGroup',
    value: 2,
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
    field: 'fileType',
    hidden: true
  },
  {
    field: 'url',
    label: '文件',
    asyncComponent: markRaw(Upload),
    colProps: {
      span: 24
    },
    value: '',
    componentProps: {
      accept: '.jpg,.jpeg,.png,.txt,.zip',
      isType: false,
      onchange: (val: any) => {
        setValues({
          fileType: val.fileType
        })
      }
    }
  }
])

const rules = reactive({
  description: [required()],
  name: [required()],
  thumbUrl: [required()],
  title: [required()],
  type: [required()],
  url: [required()]
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

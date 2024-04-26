<script setup lang="tsx">
import { Form, FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { PropType, reactive, watch, ref, unref, nextTick, defineModel, markRaw } from 'vue'
import { useValidator } from '@/hooks/web/useValidator'
import SelectFriend from '@/components/add/selectFriend.vue'
import SelectRoom from '@/components/add/selectRoom.vue'

const { required } = useValidator()

const props = defineProps({
  currentRow: {
    type: Object as PropType<any>,
    default: () => null
  }
})

const change = (val: number) => {
  if (val == 3) {
    setSchema([
      {
        field: 'ones',
        path: 'hidden',
        value: true
      }
    ])
  } else {
    setSchema([
      {
        field: 'ones',
        path: 'hidden',
        value: false
      }
    ])
  }
}
const formSchema = ref<FormSchema[]>([
  {
    field: 'model',
    label: '同步模式',
    component: 'RadioGroup',
    colProps: {
      span: 24
    },
    value: 1,
    componentProps: {
      options: [
        {
          value: 1,
          label: '一对多模式'
        },
        {
          value: 2,
          label: '多对一模式'
        },
        {
          value: 3,
          label: '多对多模式'
        }
      ],
      on: {
        change: (val) => {
          change(val)
        }
      }
    }
  },
  {
    field: 'ones',
    label: '主群名',
    colProps: {
      span: 24
    },
    value: null,
    formItemProps: {
      slots: {
        default: (data) => {
          return <SelectRoom vModel={data.ones} />
        }
      }
    }
  },
  {
    field: 'manys',
    label: '子群添加',
    colProps: {
      span: 24
    },
    value: [],
    formItemProps: {
      slots: {
        default: (data) => {
          return <SelectRoom multiple={true} vModel={data.manys} />
        }
      }
    }
  },
  {
    field: 'forward',
    label: '转发消息类型',
    component: 'RadioGroup',
    value: 1,
    colProps: {
      span: 24
    },
    componentProps: {
      options: [
        {
          value: 1,
          label: '只转发文字'
        },
        {
          value: 2,
          label: '转发文字和图片'
        }
      ]
    }
  }
])

const rules = reactive({
  name: [required()]
})

const { formRegister, formMethods } = useForm()
const { setValues, getFormData, getElFormExpose, setSchema } = formMethods
const submit = async () => {
  console.log(999999)
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
  submit,
  change
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

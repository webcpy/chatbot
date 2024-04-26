<script setup lang="tsx">
import { Form, FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { PropType, reactive, watch } from 'vue'
import { TableData } from '@/api/table/types'
import { useValidator } from '@/hooks/web/useValidator'
import AddMessage from '@/components/add/message.vue'
import Addmaterial from '@/components/add/material.vue'
import Room from '@/components/add/room.vue'

const { required } = useValidator()

const props = defineProps({
  currentRow: {
    type: Object as PropType<Nullable<TableData>>,
    default: () => null
  }
})

const { formRegister, formMethods } = useForm()
const { setValues, getFormData, getElFormExpose, setSchema } = formMethods

const schema = reactive<FormSchema[]>([
  {
    field: 'roomName',
    label: '群名称',
    colProps: {
      span: 16,
      push: 4
    },
    value: [],
    formItemProps: {
      slots: {
        default: (formData) => {
          return (
            <div class="w-[100%] flex">
              <Room vModel={formData.roomName} />
            </div>
          )
        }
      }
    }
  },
  {
    field: 'reg',
    label: '匹配方式',
    formItemProps: {
      rules: [required()]
    },
    colProps: {
      span: 16,
      push: 4
    },
    component: 'RadioGroup',
    value: 1,
    componentProps: {
      options: [
        {
          label: '模糊匹配',
          value: 1
        },
        {
          label: '精确匹配',
          value: 2
        }
      ]
    }
  },
  {
    field: 'keywords',
    label: '进群关键词',
    component: 'Input',
    value: [],
    formItemProps: {
      rules: [required()],
      slots: {
        default: (formData) => {
          return (
            <div class="w-[100%] flex">
              <AddMessage vModel={formData.keywords} />
            </div>
          )
        }
      }
    },
    colProps: {
      span: 16,
      push: 4
    }
  },
  {
    field: 'replys',
    label: '回复内容',
    colProps: {
      span: 16,
      push: 4
    },
    value: [],
    formItemProps: {
      slots: {
        default: (formData) => {
          return (
            <div class="w-[100%] flex">
              <Addmaterial vModel={formData.replys} />
            </div>
          )
        }
      }
    }
  },
  {
    field: 'welcomes',
    label: '群欢迎词',
    colProps: {
      span: 16,
      push: 4
    },
    value: [],
    formItemProps: {
      slots: {
        default: (formData) => {
          return (
            <div class="w-[100%] flex">
              <Addmaterial vModel={formData.welcomes} />
            </div>
          )
        }
      }
    }
  }
])

const rules = reactive({
  title: [required()],
  author: [required()],
  importance: [required()],
  pageviews: [required()],
  display_time: [required()],
  content: [required()]
})

const submit = async () => {
  const elForm = await getElFormExpose()
  const valid = await elForm?.validate().catch((err) => {
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
  <Form :rules="rules" @register="formRegister" :schema="schema" />
</template>

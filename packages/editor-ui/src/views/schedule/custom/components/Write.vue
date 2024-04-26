<script setup lang="tsx">
import { Form, FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { PropType, reactive, watch, ref, unref, nextTick, defineModel, markRaw } from 'vue'
import { useValidator } from '@/hooks/web/useValidator'
import Friend from '@/components/add/selectFriend.vue'
import Room from '@/components/add/selectRoom.vue'
import Corn from '@/components/add/Corn.vue'
import dayjs from 'dayjs'
import Addmaterial from '@/components/add/material.vue'

const { required } = useValidator()

const props = defineProps({
  currentRow: {
    type: Object as PropType<any>,
    default: () => null
  }
})

const change = (val: string) => {
  if (val == 'contact') {
    setSchema([
      {
        field: 'roomNames',
        path: 'hidden',
        value: true
      },
      {
        field: 'friendNames',
        path: 'hidden',
        value: false
      }
    ])
  } else {
    setSchema([
      {
        field: 'roomNames',
        path: 'hidden',
        value: false
      },
      {
        field: 'friendNames',
        path: 'hidden',
        value: true
      }
    ])
  }
}

const daysUntil = (targetDate: any) => {
  if (!targetDate) {
    return ''
  }
  // 当前日期
  const currentDate = dayjs().startOf('day')

  // 给定日期
  const targetDateObj = dayjs(targetDate)

  // 计算距离天数
  const daysDiff = targetDateObj.diff(currentDate, 'day')

  return daysDiff
}
const formSchema = ref<FormSchema[]>([
  {
    field: 'type',
    label: '发送对象',
    component: 'Select',
    value: 'contact',
    colProps: {
      span: 24
    },
    componentProps: {
      clearable: false,
      on: {
        change: (val: any) => {
          change(val)
        }
      },
      options: [
        {
          value: 'contact',
          label: '好友'
        },
        {
          value: 'room',
          label: '群组'
        }
      ]
    }
  },
  {
    field: 'roomNames',
    label: '群名',
    colProps: {
      span: 24
    },
    value: '',
    formItemProps: {
      slots: {
        default: (formData) => {
          return (
            <div class="w-[100%]">
              <Room vModel={formData.roomNames} />
            </div>
          )
        }
      }
    },
    hidden: true
  },
  {
    field: 'friendNames',
    label: '好友名称',
    colProps: {
      span: 24
    },
    value: null,
    hidden: false,
    formItemProps: {
      slots: {
        default: (formData) => {
          return (
            <div class="w-[100%] flex">
              <Friend vModel={formData.friendNames} />
            </div>
          )
        }
      }
    }
  },
  {
    field: 'contents',
    label: '素材选择',
    component: 'Select',
    colProps: {
      span: 24
    },
    value: [],
    formItemProps: {
      slots: {
        default: (formData) => {
          return (
            <div class="w-[100%] flex">
              <Addmaterial vModel={formData.contents} />
            </div>
          )
        }
      }
    }
  },
  {
    field: 'endWord',
    label: '结尾备注',
    component: 'Input',
    colProps: {
      span: 24
    }
  },
  {
    field: 'cronDate',
    label: '周期',
    colProps: {
      span: 24
    },
    value: {
      type: 'day',
      date: '',
      cron: '',
      month: '',
      day: ''
    },
    formItemProps: {
      slots: {
        default: (formData) => {
          return (
            <div class="w-[100%] flex">
              <Corn vModel={formData.cronDate} />
            </div>
          )
        }
      }
    }
  }
])

const rules = reactive({
  // roomNames: [required()],
  name: [required()],
  endWord: [required()],
  city: [required()],
  memorialDay: [required()],
  friendNames: [required()]
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

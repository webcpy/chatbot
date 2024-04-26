<script setup lang="tsx">
import { Form, FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { PropType, reactive, watch, ref, unref, nextTick, defineModel, markRaw } from 'vue'
import { useValidator } from '@/hooks/web/useValidator'
import Friend from '@/components/add/selectFriend.vue'
import Room from '@/components/add/selectRoom.vue'
import Corn from '@/components/add/Corn.vue'
import dayjs from 'dayjs'
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
    field: 'none',
    label: '内容示例（根据填写变动）',
    colProps: {
      span: 24
    },
    value: '',
    formItemProps: {
      slots: {
        default: (formData) => {
          return (
            <div class="w-[100%]">
              距离{formData.prefix}还有：✦✦✦✦ {daysUntil(formData.memorialDay)}天 ✦✦✦✦
            </div>
          )
        }
      }
    }
  },
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
    value: null,
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
    field: 'memorialDay',
    label: '未来日期',
    component: 'DatePicker',
    colProps: {
      span: 24
    },
    componentProps: {
      valueFormat: 'YYYY-MM-DD',
      disabledDate: (val) => {
        console.log(val.getTime(), dayjs().startOf('day').valueOf())
        return val.getTime() < dayjs().startOf('day').valueOf()
      }
    }
  },
  {
    field: 'prefix',
    label: '倒计时说明',
    component: 'Input',
    colProps: {
      span: 24
    },
    componentProps: {
      placeholder: '倒计时说明，例如：女友生日'
    }
  },
  {
    field: 'suffix',
    label: '后缀说明',
    component: 'Input',
    colProps: {
      span: 24
    },
    componentProps: {
      placeholder: '后缀说明，例如：不要忘记买礼物'
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

const friendRule = {
  validator: (_, val, callback) => {
    getFormData().then((_res: any) => {
      const { alias, friendName, type } = _res
      if (!alias && !friendName && type != 'room') {
        callback(new Error('好友名称和好友备注至少选择一个'))
      } else {
        callback()
      }
    })
  }
}
const rules = reactive({
  roomNames: [required()],
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

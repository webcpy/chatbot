<script setup lang="tsx">
import { Form, FormSchema } from '@/components/Form'
import { useForm } from '@/hooks/web/useForm'
import { PropType, reactive, watch, ref, unref, nextTick, defineModel, markRaw } from 'vue'
import { useValidator } from '@/hooks/web/useValidator'
import Friend from '@/components/add/selectFriend.vue'
import Room from '@/components/add/selectRoom.vue'
import CustomUrlApi from '@/components/add/customUrlApi.vue'
import AddCron from './addCron.vue'

const { required, isUrl } = useValidator()

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

const formSchema = ref<FormSchema[]>([
  {
    field: 'type',
    label: '发送对象',
    component: 'Select',
    value: 'contact',
    colProps: {
      span: 16,
      push: 4
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
      span: 16,
      push: 4
    },
    value: [],
    formItemProps: {
      slots: {
        default: (formData) => {
          return (
            <div class="w-[100%]">
              <Room multiple={true} vModel={formData.roomNames} />
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
      span: 16,
      push: 4
    },
    value: [],
    hidden: false,
    formItemProps: {
      slots: {
        default: (formData) => {
          return (
            <div class="w-[100%] flex">
              <Friend multiple={true} vModel={formData.friendNames} />
            </div>
          )
        }
      }
    }
  },
  {
    label: '定时规则:',
    value: '',
    field: 'cron',
    formItemProps: {
      rules: [required()],
      slots: {
        default: (formData) => {
          return <AddCron vModel={formData.cron} />
        }
      }
    },
    colProps: {
      span: 16,
      push: 4
    }
  },
  {
    field: 'api',
    label: '回调地址',
    component: 'Input',
    value: '',
    colProps: {
      span: 16,
      push: 4
    },
    formItemProps: {
      slots: {
        default: (data) => {
          return <CustomUrlApi vModel={data.api}></CustomUrlApi>
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
  customUrl: [required(), isUrl()],
  name: [required()],
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
